import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // 1. Hidden test account (required by platform)
  const testHash = await bcrypt.hash("T*Vq3AreHf", 10);
  await prisma.user.upsert({
    where: { email: "abacus-2cbcb434@example.com" },
    update: {},
    create: {
      email: "abacus-2cbcb434@example.com",
      password: testHash,
      name: "Test Admin",
    },
  });

  // 2. User-facing admin account
  const adminHash = await bcrypt.hash("Admin@2024", 10);
  await prisma.user.upsert({
    where: { email: "admin@cardapio.com" },
    update: {},
    create: {
      email: "admin@cardapio.com",
      password: adminHash,
      name: "Administrador",
    },
  });

  // 3. Default store
  const existingStore = await prisma.store.findFirst();
  if (!existingStore) {
    const store = await prisma.store.create({
      data: {
        name: "Meu Negócio",
        phone: "5500000000000",
        address: "Endereço do Estabelecimento",
        themeColor: "#ea580c",
        deliveryMode: "fixed",
        deliveryFee: 5.0,
      },
    });

    // Business hours: Mon-Sat 10-22, Sun closed
    const daysConfig = [
      { dayOfWeek: 0, openTime: "10:00", closeTime: "22:00", isClosed: true },
      { dayOfWeek: 1, openTime: "10:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: 2, openTime: "10:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: 3, openTime: "10:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: 4, openTime: "10:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: 5, openTime: "10:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: 6, openTime: "10:00", closeTime: "23:00", isClosed: false },
    ];

    for (const day of daysConfig) {
      await prisma.businessHour.create({
        data: { storeId: store.id, ...day },
      });
    }

    console.log("Loja padrão criada com horários de funcionamento.");

    // Sample categories and products
    const bebidas = await prisma.category.create({
      data: { name: "Bebidas", sortOrder: 0 },
    });
    const acai = await prisma.category.create({
      data: { name: "Açaí", sortOrder: 1 },
    });

    await prisma.product.createMany({
      data: [
        { name: "Coca Cola 350ml", categoryId: bebidas.id, price: 5.99, imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300" },
        { name: "Fanta Laranja 350ml", categoryId: bebidas.id, price: 5.99, imageUrl: "https://i5.walmartimages.com/seo/Fanta-Orange-Soda-Can-Drink-350ml-Refreshing-Citrus-Burst-in-a-Convenient-Can_87b0acce-8bf9-417e-a611-a6636ae0f202.df0c0eea77188ae0da839ea164494478.jpeg" },
        { name: "Açaí 300ml", categoryId: acai.id, price: 14.99, imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300" },
        { name: "Açaí 500ml", categoryId: acai.id, price: 19.99, imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300" },
      ],
    });

    // Sample coupon
    await prisma.coupon.create({
      data: { code: "PROMO10", type: "percentage", value: 10, active: true },
    });

    console.log("Dados de exemplo criados.");
  } else {
    console.log("Loja já existe, pulando criação de dados de exemplo.");
  }

  console.log("Seed concluído!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
