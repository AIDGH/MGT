import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
async function main() {
  const db=new PrismaClient();
  const defaults=JSON.parse(readFileSync(join(__dirname,'default-content.json'),'utf8'));
  try {
    await db.$transaction(async tx=>{
      if(await tx.siteContent.findUnique({where:{id:'main'}})) return;
      await tx.siteContent.create({data:{id:'main',data:defaults.content}});
      await tx.slide.createMany({data:defaults.slides});
      for(const [i,slug] of ['engine-parts','braking-system','suspension-steering','electrical-parts'].entries()) {
        await tx.category.create({data:{slug,nameFa:defaults.slides[i].titleFa,nameEn:defaults.slides[i].titleEn}});
      }
    });
    console.log('Default site content ready (existing content preserved).');
  } finally {await db.$disconnect();}
}
main().catch(e=>{console.error(e);process.exit(1);});
