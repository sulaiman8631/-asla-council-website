require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ── Admin ──────────────────────────────────────────────────────
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@2026";

  let admin = await prisma.admin.findUnique({ where: { username: adminUsername } });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.admin.create({
      data: { username: adminUsername, passwordHash, role: "admin" },
    });
    console.log(`✓ Admin "${adminUsername}" created`);
  } else {
    console.log(`✓ Admin "${adminUsername}" already exists`);
  }

  // ── Town Info ──────────────────────────────────────────────────
  await prisma.townInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "عسلة",
      tagline: "بلدة عريقة في قلب محافظة قلقيلية",
      about:
        "تقع بلدة عسلة في وسط محافظة قلقيلية، شرق مدينة قلقيلية وغرب قرية عزون وجنوب قرية عزبة الطبيب، على بعد 7 كيلومترات من مركز المحافظة. ترتفع البلدة 650 متراً عن سطح البحر وتتميز بطبيعتها الجبلية والسهلية الخلابة. تبلغ مساحتها الإجمالية 100 دونم، وتُعدّ من التجمعات السكانية المتماسكة ذات الهوية الراسخة والحضور الاجتماعي المتميز في المنطقة.",
      history:
        "تحدّ بلدة عسلة من الشمال قرية عزبة الطبيب، ومن الجنوب قرية كفر ثلث، ومن الشرق قرية عزون، ومن الغرب مستوطنة ألفي منشه. يبلغ عدد سكانها نحو 1,250 نسمة موزعين على 260 أسرة في 280 وحدة سكنية. يشكّل الشباب دون سن الخامسة عشرة 40% من إجمالي السكان، مما يعكس مجتمعاً حيوياً فتياً يحمل آفاق التنمية والبناء. تبلغ نسبة الحاصلين على مؤهلات ما بعد الثانوية 15%، ونسبة الأمية 10%، وتوزّع العاملون بين القطاع الحكومي بنسبة 5% والقطاع الخاص بنسبة 10%.",
      population: 1256,
      area: "100 دونم",
      established: "1995",
      mayorName: "سليمان عثمان سليمان سليمان",
      statistics: {
        create: [
          { label: "عدد السكان",         value: "1,256 نسمة", sortOrder: 0 },
          { label: "عدد الأسر",          value: "260 أسرة",   sortOrder: 1 },
          { label: "الوحدات السكنية",    value: "280 وحدة",   sortOrder: 2 },
          { label: "المساحة الكلية",     value: "100 دونم",   sortOrder: 3 },
          { label: "الارتفاع عن البحر",  value: "650 متراً",  sortOrder: 4 },
          { label: "البعد عن المحافظة",  value: "7 كم",       sortOrder: 5 },
          { label: "الشباب (أقل من 15)", value: "40%",        sortOrder: 6 },
          { label: "التعليم العالي",     value: "15%",        sortOrder: 7 },
        ],
      },
    },
  });
  console.log("✓ Town info + statistics");

  // ── Contact Info ───────────────────────────────────────────────
  await prisma.contactInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      address: "بلدة عسلة، محافظة قلقيلية، فلسطين",
      phone: "0594272308",
      email: "eslastar@outlook.com",
      workingHours: "السبت - الخميس: 8:30 صباحًا - 13:30 مساءً",
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13508.807655487242!2d35.032959000000005!3d32.171829499999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d3b49fa2060ab%3A0xfc74be52c7355ec3!2z2K7Ysdob2Kkg2LnYs9mE2Kk!5e0!3m2!1sar!2s!4v1780953285765!5m2!1sar!2s",
      lat: 32.1718295,
      lng: 35.032959,
      facebook: "https://www.facebook.com/profile.php?id=100063726772548",
    },
  });
  console.log("✓ Contact info");

  // ── Categories ─────────────────────────────────────────────────
  for (const cat of [
    { name: "عام",    kind: "news"   },
    { name: "صحة",   kind: "news"   },
    { name: "تنمية", kind: "news"   },
    { name: "مالي",  kind: "report" },
    { name: "إداري", kind: "report" },
  ]) {
    await prisma.category.upsert({
      where: { name_kind: { name: cat.name, kind: cat.kind } },
      update: {},
      create: cat,
    });
  }
  console.log("✓ Categories");

  // ── News ───────────────────────────────────────────────────────
  const devCat = await prisma.category.findFirst({ where: { name: "تنمية", kind: "news" } });

  const newsCount = await prisma.news.count();
  if (newsCount === 0) {
    const n1 = await prisma.news.create({
      data: {
        title: "مشاركة رئيس مجلس قروي عسلة في إقرار الخطة التنموية 2026–2027",
        body: "شارك رئيس مجلس قروي عسلة في اللقاء الخاص بإقرار الخطة التنموية للأعوام 2026–2027، والذي نظمته مؤسسة الرؤيا العالمية في أريحا، بمشاركة ممثلين عن 33 هيئة محلية من ثلاث محافظات.\nويأتي هذا اللقاء في إطار تعزيز التخطيط التنموي ودعم جهود الهيئات المحلية في تحديد أولوياتها واحتياجاتها التنموية، بما يسهم في تحسين الخدمات المقدمة للمواطنين وتحقيق التنمية المستدامة في المجتمعات المحلية.",
        categoryId: devCat?.id ?? null,
        createdBy: admin.id,
        isPublished: true,
        publishedAt: new Date("2026-06-08T21:53:16.602Z"),
      },
    });

    await prisma.news.create({
      data: {
        title: "بكل فخرٍ واعتزاز، يشارك مجلس قروي عسله بتخريج فوج المستقبل",
        body: "بكل فخرٍ واعتزاز، يشارك مجلس قروي عسله بتخريج فوج المستقبل من أطفال روضة عسله، الذين أضاءوا أيامنا ببراءتهم واجتهادهم، وها هم يخطون أولى خطواتهم نحو مستقبلٍ مشرق مليء بالعلم والنجاح.\nنبارك لأطفالنا الأعزاء هذا الإنجاز الجميل، ونتمنى لهم دوام التفوق والتميز في مسيرتهم التعليمية القادمة.\nكما نتقدم بجزيل الشكر والتقدير للهيئة التدريسية على جهودها المباركة، ولأولياء الأمور الكرام على دعمهم ومتابعتهم المستمرة لأبنائهم.\nفوج المستقبل 2026 – روضة عسله.",
        categoryId: devCat?.id ?? null,
        createdBy: admin.id,
        isPublished: true,
        publishedAt: new Date("2026-06-08T21:56:35.229Z"),
      },
    });
    console.log("✓ News (2 articles)");
  } else {
    console.log("✓ News already exists — skipped");
  }

  // ── Jobs ───────────────────────────────────────────────────────
  const jobsCount = await prisma.job.count();
  if (jobsCount === 0) {
    await prisma.job.create({
      data: {
        title: "موظف/ة استقبال",
        description: "يعلن المجلس القروي عن حاجته لموظف/ة استقبال للعمل في مقر المجلس.",
        requirements: "خبرة لا تقل عن سنتين، إجادة استخدام الحاسوب.",
        type: "دوام كامل",
        location: "عسلة",
        deadline: new Date("2026-07-08"),
        status: "open",
        createdBy: admin.id,
      },
    });
    console.log("✓ Jobs");
  } else {
    console.log("✓ Jobs already exist — skipped");
  }

  // ── Tenders ────────────────────────────────────────────────────
  const tendersCount = await prisma.tender.count();
  if (tendersCount === 0) {
    await prisma.tender.create({
      data: {
        referenceNo: "T-2026-001",
        title: "عطاء توريد مواد بناء لمشروع ترميم مبنى المجلس",
        description: "يعلن المجلس القروي عن طرح عطاء لتوريد مواد بناء لمشروع ترميم مبنى المجلس القروي.",
        publishDate: new Date("2026-06-08"),
        deadline: new Date("2026-06-29"),
        status: "open",
        createdBy: admin.id,
      },
    });
    console.log("✓ Tenders");
  } else {
    console.log("✓ Tenders already exist — skipped");
  }

  console.log("\n✅ Seed complete!");
  console.log("⚠️  Images need to be re-uploaded via the admin panel.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
