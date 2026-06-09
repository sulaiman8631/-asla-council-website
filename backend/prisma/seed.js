require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me";

  let admin = await prisma.admin.findUnique({ where: { username: adminUsername } });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.admin.create({
      data: { username: adminUsername, passwordHash, role: "admin" },
    });
    console.log(`Created admin user "${adminUsername}"`);
  } else {
    console.log(`Admin user "${adminUsername}" already exists`);
  }

  await prisma.townInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "عسلة",
      tagline: "بلدة عسلة .. أصالة وعراقة",
      about: "عسلة بلدة فلسطينية تقع في محافظة نابلس، تشتهر بتاريخها العريق وطبيعتها الجميلة.",
      history: "تأسس المجلس القروي لخدمة أهالي البلدة وتطوير بنيتها التحتية وخدماتها.",
      population: 5000,
      area: "10 كم²",
      established: "1952",
      mayorName: "رئيس المجلس القروي",
      statistics: {
        create: [
          { label: "عدد السكان", value: "5000", sortOrder: 1 },
          { label: "المساحة", value: "10 كم²", sortOrder: 2 },
          { label: "سنة التأسيس", value: "1952", sortOrder: 3 },
        ],
      },
    },
  });
  console.log("Seeded town_info singleton");

  await prisma.contactInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      address: "عسلة - محافظة نابلس - فلسطين",
      phone: "+970-9-000-0000",
      email: "info@asla-council.ps",
      workingHours: "الأحد - الخميس: 8:00 صباحًا - 3:00 مساءً",
      mapEmbedUrl: "https://www.google.com/maps?q=Asla,Palestine&output=embed",
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
    },
  });
  console.log("Seeded contact_info singleton");

  const categoryData = [
    { name: "عام", kind: "news" },
    { name: "صحة", kind: "news" },
    { name: "تنمية", kind: "news" },
    { name: "مالي", kind: "report" },
    { name: "إداري", kind: "report" },
  ];
  for (const c of categoryData) {
    await prisma.category.upsert({
      where: { name_kind: { name: c.name, kind: c.kind } },
      update: {},
      create: c,
    });
  }
  console.log("Seeded categories");

  const newsCount = await prisma.news.count();
  if (newsCount === 0) {
    const generalCategory = await prisma.category.findFirst({ where: { name: "عام", kind: "news" } });
    await prisma.news.createMany({
      data: [
        {
          title: "افتتاح مشروع تعبيد الطرق في عسلة",
          body: "أعلن المجلس القروي عن الانتهاء من مشروع تعبيد الطرق الرئيسية في البلدة، بما يخدم حركة المواطنين والمركبات.",
          categoryId: generalCategory?.id ?? null,
          createdBy: admin.id,
        },
        {
          title: "حملة نظافة شاملة في عسلة",
          body: "نظم المجلس القروي بالتعاون مع المتطوعين حملة نظافة شاملة شملت الشوارع والساحات العامة في البلدة.",
          categoryId: generalCategory?.id ?? null,
          createdBy: admin.id,
        },
        {
          title: "اجتماع المجلس القروي لمناقشة خطة التنمية",
          body: "عقد المجلس القروي اجتماعًا لمناقشة خطة التنمية للعام القادم وأولويات المشاريع الخدماتية.",
          categoryId: generalCategory?.id ?? null,
          createdBy: admin.id,
        },
      ],
    });
    console.log("Seeded sample news");
  }

  const jobsCount = await prisma.job.count();
  if (jobsCount === 0) {
    await prisma.job.create({
      data: {
        title: "موظف/ة استقبال",
        description: "يعلن المجلس القروي عن حاجته لموظف/ة استقبال للعمل في مقر المجلس.",
        requirements: "خبرة لا تقل عن سنتين، إجادة استخدام الحاسوب.",
        type: "دوام كامل",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "open",
        createdBy: admin.id,
      },
    });
    console.log("Seeded sample job");
  }

  const tendersCount = await prisma.tender.count();
  if (tendersCount === 0) {
    await prisma.tender.create({
      data: {
        referenceNo: "T-2026-001",
        title: "عطاء توريد مواد بناء لمشروع ترميم مبنى المجلس",
        description: "يعلن المجلس القروي عن طرح عطاء لتوريد مواد بناء لمشروع ترميم مبنى المجلس القروي.",
        document: "/uploads/sample-tender.pdf",
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: "open",
        createdBy: admin.id,
      },
    });
    console.log("Seeded sample tender");
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
