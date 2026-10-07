import { Body, Controller, Get, Module, Param, Post, Put, UseGuards, ConflictException } from '@nestjs/common';
import { z } from 'zod';
import { Database } from '../database';
import { AuthModule, SessionGuard, AdminGuard } from '../auth/auth.module';
import { imagePath, internalLink, parse } from '../validation';
const localized = z.object({
  title:z.string().trim().min(1).max(180), aboutTitle:z.string().trim().min(1).max(160), belief:z.string().min(1).max(4000),
  directorLabel:z.string().min(1).max(120), directorMessage:z.string().min(1).max(8000),
  contactTitle:z.string().min(1).max(180), contactText:z.string().max(2000), address:z.string().min(1).max(700),
}).strict();
const contentSchema = z.object({ fa:localized,en:localized,
  officePhone:z.string().regex(/^\+[1-9][0-9]{6,14}$/), managementPhone:z.string().regex(/^\+[1-9][0-9]{6,14}$/),
  companyEmail:z.email().max(200), directorEmail:z.email().max(200),
}).strict();
const slideSchema = z.object({titleFa:z.string().trim().min(1).max(180),titleEn:z.string().trim().min(1).max(180),captionFa:z.string().max(1000),captionEn:z.string().max(1000),image:imagePath,href:internalLink,position:z.number().int().min(0).max(999),active:z.boolean()}).strict();
@Controller('public')
class PublicContentController {
  constructor(private readonly db: Database) {}
  @Get('site') async site() {
    const [content,slides]=await this.db.$transaction([
      this.db.siteContent.findUnique({where:{id:'main'}}),
      this.db.slide.findMany({where:{active:true},orderBy:[{position:'asc'},{createdAt:'asc'}]}),
    ]);
    return { content:content?.data || null, slides };
  }
}
@Controller('admin') @UseGuards(SessionGuard,AdminGuard)
class AdminContentController {
  constructor(private readonly db: Database) {}
  @Get('content') content() { return this.db.siteContent.findUnique({where:{id:'main'}}); }
  @Put('content') async save(@Body() body: unknown) {
    const input=parse(z.object({version:z.number().int().positive(),data:contentSchema}).strict(),body);
    const result=await this.db.siteContent.updateMany({where:{id:'main',version:input.version},data:{data:input.data,version:{increment:1}}});
    if(!result.count) throw new ConflictException('محتوا در جای دیگری تغییر کرده است. صفحه را تازه کنید.');
    return this.content();
  }
  @Get('slides') slides() { return this.db.slide.findMany({orderBy:[{position:'asc'},{createdAt:'asc'}]}); }
  @Post('slides') create(@Body() body: unknown) { return this.db.slide.create({data:parse(slideSchema,body)}); }
  @Put('slides/:id') async update(@Param('id') id: string,@Body() body: unknown) {
    const {version,...raw}=parse(z.object({version:z.number().int().positive()}).passthrough(),body);
    const result=await this.db.slide.updateMany({where:{id,version},data:{...parse(slideSchema,raw),version:{increment:1}}});
    if(!result.count) throw new ConflictException('اسلاید تغییر کرده است؛ صفحه را تازه کنید.');
    return this.db.slide.findUnique({where:{id}});
  }
}
@Module({imports:[AuthModule],controllers:[PublicContentController,AdminContentController]})
export class ContentModule {}
