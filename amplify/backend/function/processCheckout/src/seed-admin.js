/**
 * seed-admin.js
 *
 * One-time script that creates the three new DynamoDB tables required for the
 * admin panel (CourseSettings, Reviews, SiteSettings) and seeds them with the
 * current hardcoded data so nothing is lost during the migration.
 *
 * Run from the project root:
 *   node amplify/backend/function/processCheckout/src/seed-admin.js
 *
 * Prerequisites:
 *   - AWS credentials configured (same Amplify profile used for amplify push)
 *   - npm install in the function/src directory so @aws-sdk packages are available
 */

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddb    = DynamoDBDocumentClient.from(client);

// ─── Table definitions ────────────────────────────────────────────────────────

const TABLES = [
  {
    TableName: 'CourseSettings',
    KeySchema:            [{ AttributeName: 'courseId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'courseId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'Reviews',
    KeySchema:            [{ AttributeName: 'reviewId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'reviewId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'SiteSettings',
    KeySchema:            [{ AttributeName: 'settingKey', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'settingKey', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

// ─── CourseSettings seed data (migrated from src/config/courseData.js) ────────

const COURSE_SEED = [
  {
    courseId: 'master-waves',
    courseName: 'Master Waves',
    title: 'MASTER EN WAVES',
    level: 'Principiante/Intermedio',
    materialsRequired: 'Plancha, tubo y cepillo; secadora y productos de cabello',
    dates: '27 DE ENERO - 17 DE FEBRERO',
    instructor: 'NUESTRO TEAM DE PROFESIONALES',
    description: 'El curso más vendido, ya que aprendes desde cero diferentes tipos de waves en tendencia, incluye las famosas retro waves.',
    price: 2200,
    enrollmentFee: 200,
    enrollmentPromo: '*gratis hasta el 15 de Julio',
    installments: 'HASTA 3 CUOTAS SIN RECARGO',
    scheduleOptions: ['Opción 1: 2PM A 4PM', 'Opción 2: 6PM A 8 PM'],
    images: { folder: 'Class_1/Module_1/Hair', count: 3 },
    whatsappLink: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn',
    promoText: '',
    promoActive: false,
    isVisible: true,
  },
  {
    courseId: 'peinado-eventos',
    courseName: 'Peinado para eventos',
    title: 'PEINADO PARA EVENTOS',
    level: 'Intermedio',
    materialsRequired: 'Kit completo de peinado',
    dates: '24 DE FEBRERO - 7 DE ABRIL',
    instructor: 'NUESTRO TEAM DE PROFESIONALES',
    description: 'Realza la belleza de tus clientes con diferentes técnicas de peinados, aprende diferentes tipos de trenzas, coletas, recogidos y semi recogidos',
    price: 3500,
    enrollmentFee: 200,
    installments: 'HASTA 3 CUOTAS SIN RECARGO',
    scheduleOptions: ['Opción 1: 2PM A 4PM', 'Opción 2: 6PM A 8PM'],
    images: { folder: 'Class_1/Module_2/Hair', count: 3 },
    whatsappLink: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn',
    promoText: '',
    promoActive: false,
    isVisible: true,
  },
  {
    courseId: 'maestria-novias',
    courseName: 'Maestrías en novias y tendencias',
    title: 'MAESTRÍAS EN NOVIAS Y TENDENCIAS',
    level: 'Avanzado, Actualización',
    materialsRequired: 'Kit de peinado completo',
    dates: '15 DE ABRIL - 7 DE MAYO',
    instructor: 'ALEH',
    description: 'Ideal para actualizarte en tendencias internacionales y peinado elaborado. ALEH compartirá los tips y productos para impactar a tus clientes y resaltar tu perfil en redes sociales.',
    price: 4000,
    enrollmentFee: 200,
    installments: 'HASTA 3 CUOTAS SIN RECARGO',
    scheduleOptions: ['Miércoles 4PM y Jueves 4PM ó 6PM'],
    images: { folder: 'Class_1/Module_3/Hair', count: 3 },
    whatsappLink: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn',
    promoText: '*DEMO MAKEUP GRATIS',
    promoActive: true,
    isVisible: true,
  },
  {
    courseId: 'master-waves-intensivo',
    courseName: 'Master Waves Intensivo 1 Día',
    title: 'MASTER EN WAVES',
    subtitle: 'INTENSIVO',
    subtitleDate: '1 DÍA',
    level: 'Principiante/Intermedio',
    materialsRequired: 'Plancha, tubo y cepillo; secadora y productos de cabello.',
    dates: '',
    instructor: 'NUESTRO TEAM DE PROFESIONALES',
    description: 'Aprenderás nuestras 4 técnicas de ondas en tendencia en 1 día, necesitarás modelo de cabello largo o cabezote para las prácticas. Agenda tu cita para confirmar fecha',
    price: 2100,
    enrollmentFee: 200,
    installments: 'HASTA 3 CUOTAS SIN RECARGO',
    scheduleOptions: ['9AM a 4PM'],
    images: { folder: 'Class_1/Module_1/Hair', count: 3 },
    whatsappLink: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn',
    promoText: 'Segundo alumno mitad de precio. Incluye materiales para la práctica en clase',
    promoActive: true,
    isVisible: true,
  },
  {
    courseId: 'curso-completo-peinado',
    courseName: 'Curso Completo Peinado',
    title: 'CURSO COMPLETO',
    level: 'Principiante a Avanzado',
    materialsRequired: 'Plancha, tubo, cepillo, secadora, productos de cabello y Kit completo de peinado',
    dates: '27 DE ENERO - 7 DE MAYO',
    instructor: 'NUESTRO TEAM DE PROFESIONALES Y ALEH',
    description: 'Este es un curso completo de peinado profesional, donde hemos resumido para ti los tips, materiales y técnicas actuales a nivel mundial. No necesitas tener experiencia previa.',
    price: 8500,
    enrollmentFee: 200,
    installments: 'HASTA 6 CUOTAS SIN RECARGO',
    scheduleOptions: [
      'Martes y Jueves 2PM a 4PM *a excepción módulo Maestría Miércoles 4PM y Jueves 4PM ó 6PM',
      'Jueves 6PM a 8PM',
    ],
    images: { folder: 'Class_1/Module_4/Hair', count: 3 },
    whatsappLink: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn',
    promoText: 'Incluye: 3 módulos, Book "The Hairstyle guide" y certificado enmarcado.\n*DEMO MAKEUP GRATIS',
    promoActive: true,
    isVisible: true,
  },
  {
    courseId: 'pieles-perfectas',
    courseName: 'Pieles Perfectas',
    title: 'PIELES PERFECTAS',
    level: 'Principiante/Intermedio',
    materialsRequired: 'Kit de piel y cejas completo',
    dates: '28 DE ENERO - 25 DE FEBRERO',
    instructor: 'NUESTRO TEAM DE PROFESIONALES',
    description: 'Aprende desde cero a realizar pieles con diferentes acabados y coberturas. Skin care, Teoría del color y correcciones. Enseñaremos también diseño de cejas.',
    price: 3000,
    enrollmentFee: 200,
    installments: 'HASTA 3 CUOTAS SIN RECARGO',
    scheduleOptions: ['Opción 1: 2PM A 4PM', 'Opción 2: 6PM a 8PM'],
    images: { folder: 'Class_1/Module_1/Makeup', count: 3, extension: 'Mkup' },
    whatsappLink: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn',
    promoText: '',
    promoActive: false,
    isVisible: true,
  },
  {
    courseId: 'maquillaje-social',
    courseName: 'Maquillaje Social',
    title: 'MAQUILLAJE SOCIAL',
    level: 'Intermedio',
    materialsRequired: 'Kit completo de maquillaje, modelo para prácticas',
    dates: '4 DE MARZO - 8 DE ABRIL',
    instructor: 'NUESTRO TEAM DE PROFESIONALES',
    description: 'Realiza la belleza de tus clientes con diferentes técnicas de maquillaje para todo tipo de evento social.',
    price: 3500,
    enrollmentFee: 200,
    installments: 'HASTA 3 CUOTAS SIN RECARGO',
    scheduleOptions: ['Opción 1: 2PM A 4PM', 'Opción 2: 6PM A 8PM'],
    images: { folder: 'Class_1/Module_2/Makeup', count: 3, extension: 'Mkup' },
    whatsappLink: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn',
    promoText: '',
    promoActive: false,
    isVisible: true,
  },
  {
    courseId: 'maestria-novias-makeup',
    courseName: 'Maestría en Novias y Tendencias',
    title: 'MAESTRÍA EN NOVIAS Y TENDENCIAS',
    level: 'Avanzado/Actualización',
    materialsRequired: 'Kit completo de maquillaje, modelo para prácticas',
    dates: '15 DE ABRIL - 7 DE MAYO',
    instructor: 'ALEH',
    description: 'Ideal para actualizarte en tendencias internacionales, ALEH compartirá los tips y productos utilizados por los maquillistas de celebridades para impactar a tus clientes y resaltar tu perfil en redes sociales.',
    price: 4000,
    enrollmentFee: 200,
    installments: 'HASTA 3 CUOTAS SIN RECARGO',
    scheduleOptions: ['Miércoles y Jueves 6PM a 8PM'],
    images: { folder: 'Class_1/Module_3/Makeup', count: 3, extension: 'Mkup' },
    whatsappLink: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn',
    promoText: '*DEMO PEINADO GRATIS',
    promoActive: true,
    isVisible: true,
  },
  {
    courseId: 'curso-completo-maquillaje',
    courseName: 'Curso Completo Maquillaje',
    title: 'CURSO COMPLETO',
    level: 'Principiante a Avanzado',
    materialsRequired: 'Kit completo de maquillaje, modelo para prácticas',
    dates: '28 DE ENERO - 7 DE MAYO',
    instructor: 'NUESTRO TEAM DE PROFESIONALES Y ALEH',
    description: 'Nuestro curso de maquillaje profesional consta de 3 módulos especializados en maquillaje social, donde hemos resumido para ti los tips, materiales y técnicas actuales a nivel mundial.',
    price: 9100,
    enrollmentFee: 200,
    installments: 'HASTA 6 CUOTAS SIN RECARGO',
    scheduleOptions: [
      'Miércoles y Jueves 2PM a 4PM *a excepción módulo Maestría 6 PM A 8PM',
      'Miércoles y Jueves 6PM a 8PM',
    ],
    images: { folder: 'Class_1/Module_4/Makeup', count: 3, extension: 'Mkup' },
    whatsappLink: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn',
    promoText: 'Incluye: 3 módulos, Book "The Makeup guide" y certificado enmarcado.\n*DEMO PEINADO GRATIS',
    promoActive: true,
    isVisible: true,
  },
  {
    courseId: 'curso-en-linea',
    courseName: 'Curso en Línea',
    cartName: 'Curso en Línea',
    sheetTab: 'Curso en Línea',
    title: 'CURSO',
    subtitle: 'EN LÍNEA',
    level: 'Por confirmar',
    materialsRequired: 'Por confirmar',
    description: 'La descripción completa de este curso estará disponible muy pronto. Estamos preparando el mejor contenido para que puedas aprender desde donde estés, a tu propio ritmo y con la calidad que nos caracteriza en Beauty Station.',
    price: 0,
    enrollmentFee: 200,
    installments: 'Por confirmar',
    scheduleOptions: ['Por confirmar'],
    images: { folder: 'cursos-en-linea', count: 3 },
    online: true,
    // lessons array includes s3Key — admin-only field, stripped before public /courses response
    lessons: [
      {
        id: 'lesson-1',
        title: 'Lección 1: Introducción al Curso',
        description: 'Bienvenido/a al curso en línea de Beauty Station. Conocerás los materiales, el flujo del curso y todo lo que aprenderás a lo largo de las próximas lecciones.',
        s3Key: 'Como_moments_Helldivers.mp4',
        duration: '00:00',
      },
    ],
    promoText: '',
    promoActive: false,
    isVisible: true,
  },
];

// ─── Reviews seed data (migrated from src/pages/BeautyStation.js) ─────────────

const REVIEWS_SEED = [
  {
    reviewId: 'g1',
    name: 'Sonya Amirhamzeh',
    rating: 5,
    date: 'Diciembre 2025',
    text: 'I cannot say enough amazing things about Beauty Station Guatemala! They did the hair and makeup for me (the bride), my mom, my mother-in-law, and all of my bridesmaids for our wedding in Antigua — and every single person looked absolutely stunning. Not one person was even slightly unhappy with how they looked. Every hairstyle and makeup look was flawless, unique, and lasted beautifully all day and night.\n\nFrom the moment their team arrived, they brought such a calm, joyful energy to the morning. They worked efficiently but never rushed, and somehow managed to make each person feel special and cared for. I felt so confident and beautiful — exactly how every bride hopes to feel on her wedding day — and my mom still talks about how much she loved her look.\n\nWe scouted several artists before deciding, and I can say without hesitation that Beauty Station Guatemala is the best in town. Their professionalism, skill, and warmth truly set them apart. I would recommend them a thousand times over to any bride getting married in Guatemala. They made our day unforgettable.',
    services: ['Bridal services', 'Makeup services', 'Hairstyling'],
    source: 'google',
    images: [],
    isVisible: true,
    createdAt: Date.now(),
  },
  {
    reviewId: 'g2',
    name: 'Lotte Zoontjens',
    rating: 5,
    date: 'Marzo 2025',
    text: "I hired Aleh and her team for my destination wedding in Antigua, they took care of me and my bridesmaids as well as most of my family members and made sure we all looked spectacular for my wedding day. The team is very experienced and profesional and really provide high quality but personalized makeup and hair services. I did several trials before with other agencies but Aleh's agency really stood out in my opinion. The products they use and their expertise on long wear hair styles that last all day was really exceptional. Highly recommended !",
    services: [],
    source: 'google',
    images: [
      '/images/reviews/lotte-1.webp',
      '/images/reviews/lotte-2.webp',
      '/images/reviews/lotte-3.webp',
    ],
    isVisible: true,
    createdAt: Date.now(),
  },
  {
    reviewId: 'g3',
    name: 'Adriana Cifuentes',
    rating: 5,
    date: 'Marzo 2025',
    text: "I was a bridesmaid for my friend's destination wedding in Antigua, Guatemala. We booked Beauty Station for this important day. My appointment was at 6 a.m., and they finished my hair and makeup by 7:30 a.m. The wedding was at 4 p.m., and the ceremony at 7 p.m. My hair and makeup stayed intact the entire time. I can fully recommend this team of professionals; not only were they very punctual, but they were also very nice to me and to all of us",
    services: ['Bridal services', 'Makeup services'],
    source: 'google',
    images: [
      '/images/reviews/adriana-1.webp',
      '/images/reviews/adriana-2.webp',
    ],
    isVisible: true,
    createdAt: Date.now(),
  },
  {
    reviewId: 'g4',
    name: 'Sydney Smith',
    rating: 5,
    date: 'Julio 2025',
    text: "WOW! I cannot say enough amazing things about Beauty Station and the incredible work of Aleh and her team for my wedding in Antigua! From the moment we connected, Aleh was professional, kind, and genuinely passionate about making me feel beautiful on my special day.\n\nI went to their studio in Guatemala City for a hair trial a year before my wedding & they traveled to Antigua on my wedding day. Their studio is BEAUTIFUL & we had the best time putting my look together.\n\nOn my wedding day, they made getting ready such a joy for myself, bridesmaids, and the moms. Regardless of age, they knew exactly how to make each woman feel their most beautiful!\n\nOur hair & makeup lasted all day and night, through the heat and happy tears, and I still felt flawless by the end of it all!",
    services: ['Makeup services', 'Hairstyling'],
    source: 'google',
    images: [],
    isVisible: true,
    createdAt: Date.now(),
  },
  {
    reviewId: 'g5',
    name: 'Natalia Dial',
    rating: 5,
    date: 'Abril 2025',
    text: 'Aleh and her team at Beauty Station are the best! Beauty Station did my hair and makeup for my wedding day and welcome party as well as my bridesmaids. We loved them so much that my sister hired them for her wedding in May. Aleh and her team were all set up for us before we got to the room to get ready and were exceptional at hair and makeup. Highly recommend them!',
    services: [],
    source: 'google',
    images: ['/images/reviews/natalia-1.webp'],
    isVisible: true,
    createdAt: Date.now(),
  },
  {
    reviewId: 'g6',
    name: 'Carol Benitez',
    rating: 5,
    date: 'Febrero 2025',
    text: "The team at Beauty Station is the best, I hired them for our wedding, it was 15 girls getting makeup done and 13 getting hair. They were at our airbnb promply at 5am, and everyone was ready without a fuss or rush by 9:45am. We had an marathon of a day ahead, mass at 12pm, followed with cocktail hour and reception ending at 10:30pm and after party from 10:30-1am. Adriana did my make up and hair, it came out perfectly and lasted me through a 16 hour day!!! Everyone's hair and makeup cameout beautifull too....I cant recommend the team at beauty station enough, they are the most efficient hair and makeup team I have come across and I have been part of a lot of weddings",
    services: ['Bridal services'],
    source: 'google',
    images: [
      '/images/reviews/carol-1.webp',
      '/images/reviews/carol-2.webp',
      '/images/reviews/carol-3.webp',
      '/images/reviews/carol-4.webp',
      '/images/reviews/carol-5.webp',
    ],
    isVisible: true,
    createdAt: Date.now(),
  },
  {
    reviewId: 'g7',
    name: 'Graciana Zevallos',
    rating: 5,
    date: 'Enero 2025',
    text: "Aleh and her team are so incredibly talented, I can't recommend them enough! Not only did I look and feel like a princess, but my bridesmaids all loved their hair and make up as well! Everyone looked so beautiful. If you're getting married in Antigua or anywhere else in Guatemala, then you need to book Beauty Station for your glam!",
    services: [],
    source: 'google',
    images: ['/images/reviews/graciana-1.webp'],
    isVisible: true,
    createdAt: Date.now(),
  },
  {
    reviewId: 'g8',
    name: 'Jessica Vu',
    rating: 5,
    date: 'Abril 2025',
    text: "Aleh and her team were absolutely amazing for my wedding! Aleh did a flawless job on our makeup, and her team also did a great job styling our hair. They were all professional, punctual, and made the getting-ready process seamless and stress-free. Aleh is now expanding her work to destinations worldwide, and I can confidently say she's worth booking no matter where you are. Highly recommend!",
    services: ['Bridal services', 'Makeup services', 'Hairstyling'],
    source: 'google',
    images: [],
    isVisible: true,
    createdAt: Date.now(),
  },
];

// ─── SiteSettings seed data ───────────────────────────────────────────────────

const SITE_SETTINGS_SEED = [
  { settingKey: 'enrollmentFee',  value: 200,   label: 'Cuota de inscripción (Q)' },
  { settingKey: 'kitPrice',       value: 5900,  label: 'Precio del Kit de Maquillaje (Q)' },
  { settingKey: 'kitAvailability',value: 30,    label: 'Cantidad disponible de Kits' },
  { settingKey: 'siteNotice',     value: '',    label: 'Aviso general del sitio (dejar vacío para ocultar)' },
  { settingKey: 'siteNoticeActive', value: false, label: 'Mostrar aviso general' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function tableExists(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') return false;
    throw err;
  }
}

async function waitForTable(tableName) {
  process.stdout.write(`    Waiting for ${tableName} to become ACTIVE`);
  for (let i = 0; i < 30; i++) {
    const desc = await client.send(new DescribeTableCommand({ TableName: tableName }));
    if (desc.Table.TableStatus === 'ACTIVE') { console.log(' ✓'); return; }
    process.stdout.write('.');
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error(`Table ${tableName} did not become ACTIVE within 60 seconds.`);
}

async function createTableIfMissing(def) {
  if (await tableExists(def.TableName)) {
    console.log(`  [SKIP] Table '${def.TableName}' already exists.`);
    return;
  }
  console.log(`  [CREATE] Creating table '${def.TableName}'...`);
  await client.send(new CreateTableCommand(def));
  await waitForTable(def.TableName);
}

async function seedItems(tableName, items) {
  let ok = 0;
  for (const item of items) {
    try {
      await ddb.send(new PutCommand({ TableName: tableName, Item: item }));
      ok++;
    } catch (err) {
      console.error(`    [ERROR] Failed to seed item in ${tableName}:`, err.message);
    }
  }
  console.log(`  [SEED] ${ok}/${items.length} items written to '${tableName}'.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== Beauty Station — Admin Tables Seed Script ===\n');

  console.log('Step 1: Creating tables...');
  for (const def of TABLES) await createTableIfMissing(def);

  console.log('\nStep 2: Seeding CourseSettings...');
  await seedItems('CourseSettings', COURSE_SEED);

  console.log('\nStep 3: Seeding Reviews...');
  await seedItems('Reviews', REVIEWS_SEED);

  console.log('\nStep 4: Seeding SiteSettings...');
  await seedItems('SiteSettings', SITE_SETTINGS_SEED);

  console.log('\n=== Done! All tables created and seeded successfully. ===\n');
}

main().catch(err => { console.error('Seed failed:', err); process.exit(1); });
