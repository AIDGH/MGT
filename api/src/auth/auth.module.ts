import { Body, CanActivate, Controller, ExecutionContext, ForbiddenException, Get, Injectable, Module, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { Database } from '../database';
import { parse } from '../validation';
import { hashPassword, tokenHash, verifyPassword } from './password';
const production = process.env.NODE_ENV === 'production';
const cookie = production ? '__Host-mgt-session' : 'mgt-session';
const cookieOptions = { httpOnly: true, secure: production, sameSite: 'strict' as const, path: '/' };
export type AuthRequest = Request & { admin: { id: string; username: string; mustChangePassword: boolean }; sessionId: string };
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly db: Database) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const token = req.cookies?.[cookie];
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw new UnauthorizedException('ابتدا وارد پنل شوید.');
    const session = await this.db.session.findUnique({ where: { id: tokenHash(token) }, include: { admin: true } });
    if (!session || session.expiresAt <= new Date()) throw new UnauthorizedException('نشست شما منقضی شده است. دوباره وارد شوید.');
    req.admin = { id: session.admin.id, username: session.admin.username, mustChangePassword: session.admin.mustChangePassword };
    req.sessionId = session.id;
    return true;
  }
}
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    if (context.switchToHttp().getRequest<AuthRequest>().admin.mustChangePassword) throw new ForbiddenException('ابتدا رمز اولیه را تغییر دهید.');
    return true;
  }
}
@Controller('auth')
class AuthController {
  constructor(private readonly db: Database) {}
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const input = parse(z.object({ username: z.string().trim().min(1).max(80), password: z.string().min(1).max(256) }).strict(), body);
    const user = await this.db.admin.findUnique({ where: { username: input.username.toLowerCase() } });
    // Equal-cost password derivation even when the account does not exist.
    const valid = await verifyPassword(input.password, user?.passwordHash || `${'0'.repeat(32)}:${'0'.repeat(128)}`);
    if (!user || !valid) throw new UnauthorizedException('نام کاربری یا رمز عبور درست نیست.');
    const token = randomBytes(32).toString('hex');
    await this.db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    await this.db.session.create({ data: { id: tokenHash(token), adminId: user.id, expiresAt: new Date(Date.now() + 8 * 3600000) } });
    res.cookie(cookie, token, { ...cookieOptions, maxAge: 8 * 3600000 });
    return { username: user.username, mustChangePassword: user.mustChangePassword };
  }
  @Get('me') @UseGuards(SessionGuard)
  me(@Req() req: AuthRequest) { return req.admin; }
  @Post('logout') @UseGuards(SessionGuard)
  async logout(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    await this.db.session.deleteMany({ where: { id: req.sessionId } });
    res.clearCookie(cookie, cookieOptions);
    return { ok: true };
  }
  @Post('password') @UseGuards(SessionGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async password(@Req() req: AuthRequest, @Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const input = parse(z.object({ currentPassword: z.string().max(256), newPassword: z.string().min(12, 'رمز حداقل ۱۲ کاراکتر باشد.').max(128) }).strict(), body);
    const user = await this.db.admin.findUniqueOrThrow({ where: { id: req.admin.id } });
    if (!(await verifyPassword(input.currentPassword, user.passwordHash))) throw new UnauthorizedException('رمز فعلی درست نیست.');
    if (input.currentPassword === input.newPassword) throw new ForbiddenException('رمز جدید باید متفاوت باشد.');
    const passwordHash = await hashPassword(input.newPassword);
    await this.db.$transaction([
      this.db.admin.update({ where: { id: user.id }, data: { passwordHash, mustChangePassword: false } }),
      this.db.session.deleteMany({ where: { adminId: user.id } }),
    ]);
    res.clearCookie(cookie, cookieOptions);
    return { ok: true };
  }
}
@Module({ controllers: [AuthController], providers: [SessionGuard, AdminGuard], exports: [SessionGuard, AdminGuard] })
export class AuthModule {}
