import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
export function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new BadRequestException({ message: 'اطلاعات واردشده معتبر نیست.', fields: result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  return result.data;
}
export const slug = z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'فقط حروف انگلیسی کوچک، عدد و خط تیره');
export const imagePath = z.string().regex(/^\/(?:uploads\/[a-f0-9-]{36}\.webp|images\/auto-parts-showcase\.jpg)$/);
export const internalLink = z.string().max(200).refine(s => s === '' || /^\/(?!\/)[a-zA-Z0-9/#?=&%_-]*$/.test(s), 'لینک باید داخل همین سایت باشد؛ مثلاً /products');
@Catch(Prisma.PrismaClientKnownRequestError)
export class DatabaseErrors implements ExceptionFilter {
  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const conflict = error.code === 'P2002';
    const missing = ['P2025', 'P2003'].includes(error.code);
    host.switchToHttp().getResponse().status(conflict ? 409 : missing ? 404 : 500).json({ message: conflict ? 'این نشانی قبلاً استفاده شده است.' : missing ? 'مورد موردنظر پیدا نشد یا حذف شده است.' : 'ذخیره اطلاعات انجام نشد.' });
  }
}
