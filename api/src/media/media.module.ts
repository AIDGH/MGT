import { BadRequestException, Controller, Get, Module, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { Database } from '../database';
import { AuthModule, SessionGuard, AdminGuard } from '../auth/auth.module';
export const uploadDirectory = resolve(process.env.UPLOAD_DIR || 'uploads');
@Controller('admin/media') @UseGuards(SessionGuard,AdminGuard)
class MediaController {
  constructor(private readonly db: Database) {}
  @Get() list() { return this.db.media.findMany({orderBy:{createdAt:'desc'},take:200}); }
  @Post() @Throttle({default:{limit:20,ttl:60000}})
  @UseInterceptors(FileInterceptor('file',{limits:{fileSize:8*1024*1024,files:1,fields:0}}))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if(!file?.buffer) throw new BadRequestException('یک تصویر انتخاب کنید.');
    let image: Buffer;
    try {
      const source=sharp(file.buffer,{limitInputPixels:25000000,animated:false});
      const meta=await source.metadata();
      if(!['jpeg','png','webp'].includes(meta.format || '')) throw new Error('format');
      image=await source.rotate().resize({width:2200,height:2200,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toBuffer();
    } catch { throw new BadRequestException('تصویر معتبر JPG، PNG یا WebP تا ۸ مگابایت و ۲۵ مگاپیکسل انتخاب کنید.'); }
    const filename=`${randomUUID()}.webp`;
    await mkdir(uploadDirectory,{recursive:true});
    await writeFile(join(uploadDirectory,filename),image,{mode:0o644,flag:'wx'});
    return this.db.media.create({data:{url:`/uploads/${filename}`,name:file.originalname.replace(/[^\p{L}\p{N} ._-]/gu,'').slice(0,180),size:image.length}});
  }
}
@Module({imports:[AuthModule],controllers:[MediaController]})
export class MediaModule {}
