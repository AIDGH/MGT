import { Body, Controller, Get, Module, NotFoundException, Param, Post, Put, Query, UseGuards, ConflictException } from '@nestjs/common';
import { z } from 'zod';
import { Database } from '../database';
import { AdminGuard, AuthModule, SessionGuard } from '../auth/auth.module';
import { imagePath, parse, slug } from '../validation';
const productSchema = z.object({
  slug, sku: z.string().trim().max(100), nameFa: z.string().trim().min(1).max(180), nameEn: z.string().trim().min(1).max(180),
  descriptionFa: z.string().max(12000), descriptionEn: z.string().max(12000), specsFa: z.string().max(8000), specsEn: z.string().max(8000),
  images: z.array(imagePath).max(8), categoryId: z.string().uuid().nullable(), status: z.enum(['DRAFT','PUBLISHED','ARCHIVED']),
}).strict().refine(p => p.status !== 'PUBLISHED' || p.images.length > 0, { message: 'برای انتشار حداقل یک عکس اضافه کنید.', path: ['images'] });
const categorySchema = z.object({ slug, nameFa: z.string().trim().min(1).max(100), nameEn: z.string().trim().min(1).max(100) }).strict();
@Controller('public')
class PublicCatalogController {
  constructor(private readonly db: Database) {}
  @Get('categories') categories() { return this.db.category.findMany({ orderBy: { nameFa: 'asc' } }); }
  @Get('products') async products(@Query() query: unknown) {
    const q = parse(z.object({ q: z.string().trim().max(150).optional(), category: z.string().max(100).optional(), page: z.coerce.number().int().min(1).max(10000).default(1) }), query);
    const term = q.q?.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
    const where = { status: 'PUBLISHED' as const,
      ...(q.category ? { category: { slug: q.category } } : {}),
      ...(term ? { OR: ['nameFa','nameEn','sku','descriptionFa','descriptionEn'].map(field => ({ [field]: { contains: term, mode: 'insensitive' as const } })) } : {}),
    };
    const [items,total] = await this.db.$transaction([
      this.db.product.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (q.page-1)*12, take:12, include:{category:true} }),
      this.db.product.count({ where }),
    ]);
    return { items, total, page:q.page, pages:Math.ceil(total/12) };
  }
  @Get('products/:slug') async product(@Param('slug') key: string) {
    const product = await this.db.product.findFirst({ where:{slug:key,status:'PUBLISHED'}, include:{category:true} });
    if (!product) throw new NotFoundException('محصول پیدا نشد.');
    return product;
  }
}
@Controller('admin') @UseGuards(SessionGuard, AdminGuard)
class AdminCatalogController {
  constructor(private readonly db: Database) {}
  @Get('products') products() { return this.db.product.findMany({ orderBy:{updatedAt:'desc'}, include:{category:true}, take:1000 }); }
  @Post('products') create(@Body() body: unknown) { return this.db.product.create({ data:parse(productSchema,body) }); }
  @Put('products/:id') async update(@Param('id') id: string, @Body() body: unknown) {
    const { version, ...raw } = parse(z.object({ version:z.number().int().positive() }).passthrough(),body);
    const data = parse(productSchema,raw);
    const updated = await this.db.product.updateMany({ where:{id,version}, data:{...data,version:{increment:1}} });
    if (!updated.count) throw new ConflictException('این محصول تغییر کرده است. صفحه را تازه کنید و دوباره ویرایش کنید.');
    return this.db.product.findUnique({where:{id}});
  }
  @Get('categories') categories() { return this.db.category.findMany({orderBy:{nameFa:'asc'}}); }
  @Post('categories') createCategory(@Body() body: unknown) { return this.db.category.create({data:parse(categorySchema,body)}); }
  @Put('categories/:id') async updateCategory(@Param('id') id: string,@Body() body: unknown) {
    const {version,...raw}=parse(z.object({version:z.number().int().positive()}).passthrough(),body);
    const result=await this.db.category.updateMany({where:{id,version},data:{...parse(categorySchema,raw),version:{increment:1}}});
    if(!result.count) throw new ConflictException('دسته‌بندی تغییر کرده است؛ صفحه را تازه کنید.');
    return this.db.category.findUnique({where:{id}});
  }
}
@Module({ imports:[AuthModule], controllers:[PublicCatalogController,AdminCatalogController] })
export class CatalogModule {}
