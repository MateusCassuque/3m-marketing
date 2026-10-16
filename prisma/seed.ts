import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@3mvisa.site";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "trocar-esta-senha-123";

  const passwordHash = await hashPassword(adminPassword);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador Kodeza",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`✔ Admin pronto: ${adminEmail}`);
  console.log("  (defina ADMIN_EMAIL e ADMIN_PASSWORD no .env para usar outras credenciais)");

  // Dados de exemplo — só cria se ainda não houver nenhum cliente,
  // para o `npm run seed` poder ser rodado de novo sem duplicar tudo.
  const existingClients = await prisma.client.count();
  if (existingClients > 0) {
    console.log("✔ Já existem clientes cadastrados, pulando dados de exemplo.");
    return;
  }

  const cliente = await prisma.client.create({
    data: {
      name: "Loja Modelo, Lda.",
      email: "geral@lojamodelo.ao",
      phone: "+244 923 000 000",
      company: "Loja Modelo",
      taxId: "5000000000",
      address: "Rua Exemplo, 100 — Luanda",
      notes: "Cliente de demonstração criado pelo seed.",
    },
  });

  const projeto = await prisma.project.create({
    data: {
      title: "Website institucional + redes sociais",
      description: "Website institucional com 3 e-mails profissionais e gestão mensal de redes sociais.",
      clientId: cliente.id,
      service: "WEBSITE",
      status: "EM_ANDAMENTO",
      priority: "ALTA",
      value: 125000,
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.invoice.create({
    data: {
      number: "FAT-0001",
      projectId: projeto.id,
      amount: 62500,
      status: "PAGA",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
      paymentMethod: "Transferência bancária",
      notes: "Primeira parcela (50%).",
    },
  });

  await prisma.invoice.create({
    data: {
      number: "FAT-0002",
      projectId: projeto.id,
      amount: 62500,
      status: "PENDENTE",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: "Segunda parcela (50%), na entrega.",
    },
  });

  console.log("✔ Cliente, pedido e faturas de exemplo criados.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
