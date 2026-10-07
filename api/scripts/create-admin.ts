import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { hashPassword } from '../src/auth/password';
async function main() {
  const db=new PrismaClient();
  try {
    const username=(process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const output=process.env.ADMIN_CREDENTIAL_FILE;
    if(!output) throw new Error('ADMIN_CREDENTIAL_FILE is required (private output file).');
    if(await db.admin.findUnique({where:{username}})) throw new Error('Account exists; refusing to replace its password.');
    const password=randomBytes(24).toString('base64url');
    // Save credentials first; never print or commit the password.
    await writeFile(output,`Majd Global Trading admin\nURL: https://majdglobaltrading.com/admin\nUsername: ${username}\nInitial password: ${password}\nChange this password on first login.\n`,{mode:0o600,flag:'wx'});
    await db.admin.create({data:{username,passwordHash:await hashPassword(password),mustChangePassword:true}});
    console.log('Admin created. Credentials saved in the private file.');
  } finally {await db.$disconnect();}
}
main().catch(e=>{console.error(e.message);process.exit(1);});
