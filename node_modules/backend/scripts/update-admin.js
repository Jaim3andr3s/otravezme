// backend/scripts/fix-admin.js
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

const USERNAME = 'admin@biblioyene.com';
const PASSWORD = 'Biblioyene1';

async function main() {
  // 1. Verificar el admin
  const admin = await prisma.admin.findUnique({
    where: { username: USERNAME }
  });

  if (!admin) {
    console.log(`❌ No existe admin con username "${USERNAME}"`);
    console.log('👀 Admins existentes:');
    const all = await prisma.admin.findMany();
    console.log(all.map(a => ({ id: a.id, username: a.username })));
    return;
  }

  console.log('👤 Admin encontrado:', { id: admin.id, username: admin.username });

  // 2. Generar nuevo hash
  const newHash = await bcrypt.hash(PASSWORD, 12);
  console.log('🔑 Nuevo hash generado:', newHash);

  // 3. Actualizar
  const updated = await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: newHash }
  });

  console.log('✅ Admin actualizado');

  // 4. Probar el login inmediatamente
  const valid = await bcrypt.compare(PASSWORD, updated.passwordHash);
  console.log(`🔐 Prueba de login: ${valid ? '✅ ÉXITO' : '❌ FALLO'}`);

  if (!valid) {
    console.log('⚠️ La comparación falló. Revisa la contraseña y el hash.');
  }

  await prisma.$disconnect();
}

main().catch(console.error);