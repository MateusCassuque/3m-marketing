/**
 * Cria (ou actualiza a senha de) uma conta do painel.
 *
 *   npm run admin:create -- "Nome" email@dominio.com "senha-forte-aqui" [ADMIN|EDITOR]
 *
 * Substitui o antigo endpoint público /api/admin/register.
 */
import { PrismaClient, type Role } from "@prisma/client";

import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const [name, email, password, roleArg] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error('Uso: npm run admin:create -- "Nome" email@dominio.com "senha" [ADMIN|EDITOR]');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("A senha deve ter pelo menos 10 caracteres.");
    process.exit(1);
  }

  const role: Role = roleArg === "EDITOR" ? "EDITOR" : "ADMIN";
  const passwordHash = await hashPassword(password);

  await prisma.admin.upsert({
    where: { email: email.toLowerCase() },
    update: { name, passwordHash, role },
    create: { name, email: email.toLowerCase(), passwordHash, role },
  });

  console.log(`✔ Conta pronta: ${email} (${role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
