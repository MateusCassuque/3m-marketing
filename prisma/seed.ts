import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@3magencia.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "trocar-esta-senha-123";

  const passwordHash = await hashPassword(adminPassword);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador 3M",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`✔ Admin pronto: ${adminEmail} / ${adminPassword}`);
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
      name: "Loja Modelo Ltda.",
      email: "contato@lojamodelo.com.br",
      phone: "(11) 91234-5678",
      company: "Loja Modelo",
      taxId: "00.000.000/0001-00",
      address: "Rua Exemplo, 100 — São Paulo, SP",
      notes: "Cliente de demonstração criado pelo seed.",
    },
  });

  const projeto = await prisma.project.create({
    data: {
      title: "Campanha de lançamento — coleção verão",
      description: "Estratégia + tráfego pago para o lançamento da nova coleção.",
      clientId: cliente.id,
      service: "TRAFEGO",
      status: "EM_ANDAMENTO",
      priority: "ALTA",
      value: 8500,
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.invoice.create({
    data: {
      number: "FAT-0001",
      projectId: projeto.id,
      amount: 4250,
      status: "PAGA",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
      paymentMethod: "Pix",
      notes: "Primeira parcela (50%).",
    },
  });

  await prisma.invoice.create({
    data: {
      number: "FAT-0002",
      projectId: projeto.id,
      amount: 4250,
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
