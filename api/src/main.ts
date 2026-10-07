import 'reflect-metadata';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { Database, DatabaseModule } from './database';
import { DatabaseErrors } from './validation';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { ContentModule } from './content/content.module';
import { MediaModule, uploadDirectory } from './media/media.module';
@Controller('health')
class HealthController {
  constructor(private readonly db: Database) {}
  @Get() async health() { await this.db.$queryRaw`SELECT 1`;return {ok:true}; }
}
@Module({imports:[DatabaseModule,AuthModule,CatalogModule,ContentModule,MediaModule,ThrottlerModule.forRoot([{ttl:60000,limit:180}])],controllers:[HealthController],providers:[{provide:APP_GUARD,useClass:ThrottlerGuard}]})
class AppModule {}
async function main() {
  if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if(process.env.NODE_ENV==='production' && !process.env.APP_ORIGINS) throw new Error('APP_ORIGINS is required');
  const app=await NestFactory.create<NestExpressApplication>(AppModule,{bodyParser:true});
  app.set('trust proxy','loopback');
  app.use(helmet());app.use(cookieParser());
  const origins=new Set((process.env.APP_ORIGINS || 'http://127.0.0.1:3001,http://localhost:3001').split(','));
  app.use((req:Request,res:Response,next:NextFunction) => {
    if(req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin')) res.setHeader('Cache-Control','no-store');
    if(!['GET','HEAD','OPTIONS'].includes(req.method) && !origins.has(req.headers.origin || '')) {
      return res.status(403).json({message:'درخواست از مبدأ نامعتبر است.'});
    }
    next();
  });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new DatabaseErrors());
  app.useStaticAssets(uploadDirectory,{prefix:'/uploads/',index:false,dotfiles:'deny',maxAge:'7d'});
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT || 4001),'127.0.0.1');
}
main().catch(error=>{console.error(error);process.exit(1);});
