const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: getS3SignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const { Resend } = require('resend');
const { google } = require('googleapis');

const SHEETS_ID = process.env.GOOGLE_SHEETS_ID || '113N1OhuKeVIR9mKy4LBbkEUOn1z6fJ6g6v_RWSHefKA';
const ssmClient = new SSMClient({ region: process.env.REGION || 'us-east-1' });

// Lazy SSM secret fetchers — cached per warm Lambda instance to avoid repeated SSM calls
let _googleServiceAccountJson = null;
let _cloudfrontPrivateKey = null;

async function getGoogleServiceAccountJson() {
  if (_googleServiceAccountJson) return _googleServiceAccountJson;
  const result = await ssmClient.send(new GetParameterCommand({
    Name: '/beauty-station/google-service-account-json',
    WithDecryption: true
  }));
  _googleServiceAccountJson = result.Parameter.Value;
  return _googleServiceAccountJson;
}


// Lazy singleton — reuses the authenticated Sheets client across warm Lambda invocations
let _sheetsClient = null;
async function getSheetsClient() {
  if (_sheetsClient) return _sheetsClient;
  const json = await getGoogleServiceAccountJson();
  const credentials = JSON.parse(json);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  _sheetsClient = google.sheets({ version: 'v4', auth });
  return _sheetsClient;
}

// Automatically loads key from AWS Env Vars, or falls back to your local environment file value
const resend = new Resend(process.env.RESEND_API_KEY || 're_2SaxmUUK_ChhdB66Nqsqd6r3yVVt7JExC');

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS perfectly for the React frontend
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

const client = new DynamoDBClient({ region: process.env.REGION || 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const sesClient = new SESClient({ region: process.env.REGION || 'us-east-1' });
const s3Client = new S3Client({ region: process.env.REGION || 'us-east-1' });
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'beauty-station-videos';

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'g.a.gramirez007@gmail.com';

// ─── Admin Activity Log helper ────────────────────────────────────────────────
// Writes a log entry to the AdminLog DynamoDB table.
// Non-fatal: if the table doesn't exist or the write fails the operation continues.
// Table: AdminLog — partition key: actionId (String)
async function writeActivityLog(staffEmail, action, oldValue, newValue) {
  try {
    const actionId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await ddbDocClient.send(new PutCommand({
      TableName: 'AdminLog',
      Item: {
        actionId,
        staffEmail: staffEmail || 'unknown',
        action,
        oldValue:  oldValue  !== undefined ? String(oldValue)  : null,
        newValue:  newValue  !== undefined ? String(newValue)  : null,
        timestamp: Date.now(),
      }
    }));
  } catch (err) {
    console.warn('AdminLog write failed (table may not exist yet):', err.message);
  }
}

// WhatsApp group info per course (displayName for email button, link for the group)
const courseWhatsappInfo = {
  'Master Waves 2PM a 4PM':                        { displayName: 'Master Waves',                        link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Master Waves 6PM a 8PM':                        { displayName: 'Master Waves',                        link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Peinados Para Eventos 2PM a 4PM':               { displayName: 'Peinado Para Eventos',                link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Peinados Para Eventos 6PM a 8PM':               { displayName: 'Peinado Para Eventos',                link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Maestrías en Novias y Tendencias 2PM a 4PM':    { displayName: 'Maestrías en Novias y Tendencias',    link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Maestrías en Novias y Tendencias 6PM a 8PM':    { displayName: 'Maestrías en Novias y Tendencias',    link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Curso Completo Peinado 2PM a 4PM':              { displayName: 'Curso Completo Peinado',              link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Curso Completo Peinado 6PM a 8PM':              { displayName: 'Curso Completo Peinado',              link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Pieles Perfectas 2PM a 4PM':                    { displayName: 'Pieles Perfectas',                    link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Pieles Perfectas 6PM a 8PM':                    { displayName: 'Pieles Perfectas',                    link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Maquillaje Social 2PM a 4PM':                   { displayName: 'Maquillaje Social',                   link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Maquillaje Social 6PM a 8PM':                   { displayName: 'Maquillaje Social',                   link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Maestría en Novias y Tendencias 2PM a 4PM':     { displayName: 'Maestría en Novias y Tendencias',     link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Maestría en Novias y Tendencias 6PM a 8PM':     { displayName: 'Maestría en Novias y Tendencias',     link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Curso Completo Maquillaje 2PM a 4PM':           { displayName: 'Curso Completo Maquillaje',           link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
  'Curso Completo Maquillaje 6PM a 8PM':           { displayName: 'Curso Completo Maquillaje',           link: 'https://chat.whatsapp.com/JRSFAlseSai0aLaMx4Qmbn' },
};

// Online course catalog — s3Keys live here (backend only, never exposed to the React bundle)
// s3Key is the file path inside the S3 bucket (e.g. "lessons/lesson-1.mp4")
const ONLINE_COURSES = {
  'curso-en-linea': {
    courseName: 'Curso en Línea',
    cartName: 'Curso en Línea',
    sheetTab: 'Curso en Línea',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Lección 1: Introducción al Curso',
        description: 'Bienvenido/a al curso en línea de Beauty Station. Conocerás los materiales, el flujo del curso y todo lo que aprenderás a lo largo de las próximas lecciones.',
        s3Key: 'Como_moments_Helldivers.mp4',
        duration: '00:00'
      }
      // Add more lessons here once each video is uploaded to S3
      // { id: 'lesson-2', title: '...', description: '...', s3Key: 'lessons/lesson-2.mp4', duration: '00:00' }
    ]
  }
};

// Master Course ID Mapping for Database Seat Operations
const moduleIds = {
  'Master Waves 2PM a 4PM': '1Qk3ZTR8Mu9cvxdGGVYER',
  'Master Waves 6PM a 8PM': '2lAsVcE1N0gZl4Iiki3GP',
  'Peinados Para Eventos 2PM a 4PM': '3ASSXgw602WiVe4HpldAP',
  'Peinados Para Eventos 6PM a 8PM': '4rfA37M4cMXl6iO6bSwW4',
  'Maestrías en Novias y Tendencias 2PM a 4PM': '5rHw64GkL6be0GIqiVM17',
  'Maestrías en Novias y Tendencias 6PM a 8PM': '6gh7uXaEGwKGk5Ut2xUOR',
  'Curso Completo Peinado 2PM a 4PM': '7PgoPXqtemmdd1EpAhUMq',
  'Curso Completo Peinado 6PM a 8PM': '8o9SHzxxK9yJVOVds7idf',
  'Pieles Perfectas 2PM a 4PM': '92D9cfiMeVtav2HYhUA9Z',
  'Pieles Perfectas 6PM a 8PM': '931hGzkK3hqpEvLB4C4iSm',
  'Maquillaje Social 2PM a 4PM': '93hiNbQKXTUAUAYdRFeeN3',
  'Maquillaje Social 6PM a 8PM': '94wZBdWsajdmn30YInrflP',
  'Maestría en Novias y Tendencias 2PM a 4PM': '95eyWlva5vbnxaXDuVLmK4',
  'Maestría en Novias y Tendencias 6PM a 8PM': '96xtPAxBtiDBNK01FJbwMl',
  'Curso Completo Maquillaje 2PM a 4PM': '98aq0pkxn574RJGFiIB4CQ',
  'Curso Completo Maquillaje 6PM a 8PM': '991XsOABf2lp5CdSMm21YR3',
  'Kit de pieles perfectas': '992U9kQfUcpxR0FpY9l4mDI',
};

// Maps cart item names (course + schedule) back to their base courseId in CourseSettings
const cartNameToCourseId = {
  'Master Waves 2PM a 4PM': 'master-waves',
  'Master Waves 6PM a 8PM': 'master-waves',
  'Peinados Para Eventos 2PM a 4PM': 'peinado-eventos',
  'Peinados Para Eventos 6PM a 8PM': 'peinado-eventos',
  'Maestrías en Novias y Tendencias 2PM a 4PM': 'maestria-novias',
  'Maestrías en Novias y Tendencias 6PM a 8PM': 'maestria-novias',
  'Curso Completo Peinado 2PM a 4PM': 'curso-completo-peinado',
  'Curso Completo Peinado 6PM a 8PM': 'curso-completo-peinado',
  'Pieles Perfectas 2PM a 4PM': 'pieles-perfectas',
  'Pieles Perfectas 6PM a 8PM': 'pieles-perfectas',
  'Maquillaje Social 2PM a 4PM': 'maquillaje-social',
  'Maquillaje Social 6PM a 8PM': 'maquillaje-social',
  'Maestría en Novias y Tendencias 2PM a 4PM': 'maestria-novias-makeup',
  'Maestría en Novias y Tendencias 6PM a 8PM': 'maestria-novias-makeup',
  'Curso Completo Maquillaje 2PM a 4PM': 'curso-completo-maquillaje',
  'Curso Completo Maquillaje 6PM a 8PM': 'curso-completo-maquillaje',
  'Curso en Línea': 'curso-en-linea',
};

// Admin-only middleware — verifies the caller belongs to the Cognito "admin" group.
//
// Two auth paths are supported:
//   1. Cognito User Pools authorizer — reads cognito:groups from JWT claims
//      (requestContext.authorizer.claims — populated when a Cognito authorizer is attached)
//   2. IAM auth via Cognito Identity Pool — reads the caller's IAM role ARN
//      (requestContext.identity.userArn — Amplify "private" endpoints use this path)
//      Admin group members receive the adminGroupRole from the Identity Pool,
//      so the ARN contains "adminGroupRole" as proof of group membership.
function requireAdmin(req, res, next) {
  try {
    const event    = req.apiGateway?.event || {};
    const reqCtx   = event.requestContext || {};
    const identity = reqCtx.identity || {};

    // ── Path 1: Cognito User Pools JWT claims ──────────────────────────────
    const claims    = reqCtx.authorizer?.claims || {};
    const rawGroups = claims['cognito:groups'] || '';
    const jwtGroups = Array.isArray(rawGroups)
      ? rawGroups
      : rawGroups.split(',').map(g => g.trim()).filter(Boolean);

    if (jwtGroups.includes('admin')) {
      req.adminEmail = claims.email || claims.sub || 'unknown';
      return next();
    }

    // ── Path 2: IAM role ARN check for Cognito Identity Pool admin role ────
    // When a user is in the Cognito "admin" group the Identity Pool assigns
    // them the adminGroupRole. The role ARN is available in identity.userArn
    // and always contains the string "adminGroupRole".
    const callerArn = identity.userArn || identity.caller || '';
    if (callerArn.includes('adminGroupRole')) {
      // Extract user sub from the authentication provider for audit logging
      const provider = identity.cognitoAuthenticationProvider || '';
      const sub = provider.includes(':CognitoSignIn:')
        ? provider.split(':CognitoSignIn:').pop()
        : 'admin';
      req.adminEmail = sub;
      return next();
    }

    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  } catch (err) {
    return res.status(403).json({ error: 'No autorizado.' });
  }
}

// PUBLIC SEAT INVENTORY: Fetches DynamoDB seat counts safely for Public Browsers
app.get('/modulos', async function (req, res) {
  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: 'Modulos' }));
    res.json(data.Items || []);
  } catch (error) {
    console.error("Error fetching Modulos:", error);
    res.status(500).json({ error: 'Hubo un error al buscar asientos.' });
  }
});

// SEARCH SAVED CART: Fetches the user's persistent shopping cart from DynamoDB
app.get('/cart', async function (req, res) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required to fetch cart" });

    const data = await ddbDocClient.send(new GetCommand({
      TableName: 'Carts',
      Key: { email: email }
    }));

    res.json(data.Item || { cartItems: [], includeKit: false });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: 'Hubo un error al recuperar su carrito guardado.' });
  }
});

// PERSIST CART: Saves the user's current shopping cart state to DynamoDB
app.post('/cart', async function (req, res) {
  try {
    const { email, cartItems, includeKit } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required to save cart" });

    const cartData = {
      email: email,
      cartItems: cartItems || [],
      includeKit: includeKit || false,
      Timestamp: Date.now()
    };

    await ddbDocClient.send(new PutCommand({
      TableName: 'Carts',
      Item: cartData
    }));

    res.json({ success: true, message: 'Carrito guardado en la nube.' });
  } catch (error) {
    console.error("Error persisting cart:", error);
    res.status(500).json({ error: 'Hubo un error al guardar su carrito en el servidor AWS.' });
  }
});

// SECURE USER HISTORY: Fetches previously purchased class history from DynamoDB based on User Email
app.get('/my-orders', async function (req, res) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required to fetch history" });
    
    const data = await ddbDocClient.send(new ScanCommand({
      TableName: 'Payments',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    }));
    
    // Sort descending so the most recent purchases show at the top
    const sortedItems = (data.Items || []).sort((a,b) => (b.Timestamp || 0) - (a.Timestamp || 0));
    
    res.json(sortedItems);
  } catch (error) {
    console.error("Error fetching User orders:", error);
    res.status(500).json({ error: 'Hubo un error al buscar el historial de compras.' });
  }
});

app.post('/checkout', async function (req, res) {
  try {
    const { email, Name, userName, DPI, phoneNumber, cartItems, IncludeKit, TotalPrice } = req.body;

    // 1a. PRE-CHECK ONLINE OWNERSHIP: Prevent duplicate purchase of online courses
    const onlineItems = cartItems.filter(item => item.online);
    if (onlineItems.length > 0) {
      const existingData = await ddbDocClient.send(new ScanCommand({
        TableName: 'Payments',
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email }
      }));
      for (const item of onlineItems) {
        const alreadyOwned = (existingData.Items || []).some(order =>
          order.Items && order.Items.toLowerCase().includes(item.name.toLowerCase())
        );
        if (alreadyOwned) {
          return res.status(409).json({
            error: `Ya tienes "${item.name}" en tu cuenta. Ve a "Mi Perfil" para continuar tu curso.`
          });
        }
      }
    }

    // 1aa. PRICE VALIDATION: Verify client-sent total against CourseSettings (Phase 3 — hard reject on mismatch)
    try {
      let expectedTotal = 0;
      let allPricesFound = true;
      for (const item of cartItems) {
        const courseId = cartNameToCourseId[item.name];
        if (courseId) {
          const courseData = await ddbDocClient.send(new GetCommand({ TableName: 'CourseSettings', Key: { courseId } }));
          if (courseData.Item && courseData.Item.price != null) {
            expectedTotal += Number(courseData.Item.price);
          } else {
            allPricesFound = false; // price not in DB yet — skip hard-reject for this item
          }
        } else {
          allPricesFound = false; // item not in the courseId map — cannot validate, skip hard-reject
        }
      }
      if (IncludeKit) {
        const kitSettings = await ddbDocClient.send(new GetCommand({ TableName: 'SiteSettings', Key: { settingKey: 'kitPrice' } }));
        if (kitSettings.Item) expectedTotal += Number(kitSettings.Item.value);
      }
      const enrollmentSettings = await ddbDocClient.send(new GetCommand({ TableName: 'SiteSettings', Key: { settingKey: 'enrollmentFee' } }));
      const enrollmentFee = enrollmentSettings.Item ? Number(enrollmentSettings.Item.value) : 200;
      expectedTotal += enrollmentFee;

      if (allPricesFound && expectedTotal > 0 && Math.abs(Number(TotalPrice) - expectedTotal) > 1) {
        console.warn(`PRICE MISMATCH: Client sent Q${TotalPrice}, expected Q${expectedTotal} for order by ${email}. Rejecting.`);
        return res.status(400).json({
          error: `El precio enviado (Q${TotalPrice}) no coincide con el precio actual (Q${expectedTotal}). Por favor, recarga la página y vuelve a intentarlo.`
        });
      }
    } catch (auditErr) {
      // CourseSettings table not seeded yet — skip validation
      console.info('Price validation skipped (CourseSettings not available):', auditErr.message);
    }

    // 1b. PRE-CHECK INVENTORY: Verify seats exist in DynamoDB 'Modulos' before processing payment
    for (const item of cartItems) {
      const moduleId = moduleIds[item.name];
      if (moduleId) {
        const data = await ddbDocClient.send(new GetCommand({ TableName: 'Modulos', Key: { id: moduleId } }));
        if (!data.Item || data.Item[item.name] <= 0) {
          return res.status(400).json({ error: `No hay más asientos disponibles para ${item.name}.` });
        }
      }
    }

    if (IncludeKit) {
      const kitId = moduleIds['Kit de pieles perfectas'];
      const kitData = await ddbDocClient.send(new GetCommand({ TableName: 'Modulos', Key: { id: kitId } }));
      if (!kitData.Item || kitData.Item['Kit de pieles perfectas'] <= 0) {
        return res.status(400).json({ error: `No hay más kits disponibles.` });
      }
    }

    // 2. DEDUCT INVENTORY: Remove purchased seats securely
    for (const item of cartItems) {
      const moduleId = moduleIds[item.name];
      if (moduleId) {
        // Safe mathematical subtraction isolated in the AWS Cloud
        await ddbDocClient.send(new UpdateCommand({
          TableName: 'Modulos',
          Key: { id: moduleId },
          UpdateExpression: 'SET #name = #name - :inc',
          ExpressionAttributeNames: { '#name': item.name },
          ExpressionAttributeValues: { ':inc': 1 }
        }));
        // 3.3 — Low-seat alert: notify owner when remaining seats reach 2 or fewer
        try {
          const afterDeduct = await ddbDocClient.send(new GetCommand({ TableName: 'Modulos', Key: { id: moduleId } }));
          const remaining = afterDeduct.Item ? Number(afterDeduct.Item[item.name]) : null;
          if (remaining !== null && remaining <= 2) {
            await sesClient.send(new SendEmailCommand({
              Source: OWNER_EMAIL,
              Destination: { ToAddresses: [OWNER_EMAIL] },
              Message: {
                Subject: { Data: `⚠️ Pocos lugares disponibles: ${item.name}` },
                Body: { Text: { Data: `Solo quedan ${remaining} lugar(es) disponible(s) para "${item.name}".\n\nUn estudiante acaba de inscribirse. Considera abrir más cupos o cerrar el registro.\n\n— Beauty Station` } }
              }
            }));
          }
        } catch (alertErr) {
          console.warn('Low-seat alert failed:', alertErr.message);
        }
      }
    }

    if (IncludeKit) {
      const kitId = moduleIds['Kit de pieles perfectas'];
      await ddbDocClient.send(new UpdateCommand({
        TableName: 'Modulos',
        Key: { id: kitId },
        UpdateExpression: 'SET #name = #name - :inc',
        ExpressionAttributeNames: { '#name': 'Kit de pieles perfectas' },
        ExpressionAttributeValues: { ':inc': 1 }
      }));
      // Low-seat alert for kit inventory
      try {
        const afterDeduct = await ddbDocClient.send(new GetCommand({ TableName: 'Modulos', Key: { id: kitId } }));
        const remaining = afterDeduct.Item ? Number(afterDeduct.Item['Kit de pieles perfectas']) : null;
        if (remaining !== null && remaining <= 2) {
          await sesClient.send(new SendEmailCommand({
            Source: OWNER_EMAIL,
            Destination: { ToAddresses: [OWNER_EMAIL] },
            Message: {
              Subject: { Data: `⚠️ Pocos kits disponibles: Kit de pieles perfectas` },
              Body: { Text: { Data: `Solo quedan ${remaining} kit(s) disponible(s).\n\nUn estudiante acaba de comprar un kit. Considera reponer inventario.\n\n— Beauty Station` } }
            }
          }));
        }
      } catch (alertErr) {
        console.warn('Low-kit alert failed:', alertErr.message);
      }
    }

    // 3. PERSIST PAYMENT: Save to Payments Table
    const paymentId = crypto.randomUUID();
    const paymentData = {
      id: paymentId,
      email: email,
      Name: Name,
      userName: userName || '',
      DPI: DPI || '',
      phoneNumber: phoneNumber || '',
      Items: cartItems.map(item => item.name).join(', ') + (IncludeKit ? ', Kit de pieles perfectas' : ''),
      TotalPrice: TotalPrice,
      Timestamp: Date.now()
    };

    await ddbDocClient.send(new PutCommand({ TableName: 'Payments', Item: paymentData }));

    // 4. GOOGLE SHEETS: Log each purchased course into its own sheet tab
    try {
      const sheets = await getSheetsClient();
      const dateStr = new Date(paymentData.Timestamp).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' });
      const receiptId = paymentData.id.split('-')[0].toUpperCase();

      for (const item of cartItems) {
        const info = courseWhatsappInfo[item.name];
        if (!info) continue; // skip items with no course mapping (e.g. kit)

        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEETS_ID,
          range: `'${info.displayName}'!A:H`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              dateStr,
              receiptId,
              paymentData.Name,
              paymentData.email,
              paymentData.phoneNumber || '',
              paymentData.DPI || '',
              item.name,
              `Q${paymentData.TotalPrice}.00`
            ]]
          }
        });
      }
      // Log online course enrollments to their own sheet tab
      for (const item of cartItems) {
        if (!item.online) continue;
        const onlineCourse = Object.values(ONLINE_COURSES).find(c => c.cartName === item.name);
        if (!onlineCourse) continue;
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEETS_ID,
          range: `'${onlineCourse.sheetTab}'!A:G`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              dateStr,
              receiptId,
              paymentData.Name,
              paymentData.email,
              paymentData.phoneNumber || '',
              paymentData.DPI || '',
              `Q${paymentData.TotalPrice}.00`
            ]]
          }
        });
      }

      console.log("Google Sheets: enrollment logged successfully.");
    } catch (sheetsErr) {
      console.error("Google Sheets logging failed:", sheetsErr);
    }

    // 5. DISPATCH EMAIL: Send automated receipt natively via Resend SDK
    const itemsArray = typeof paymentData.Items === 'string' ? paymentData.Items.split(",") : [];

    // Build one WhatsApp entry per purchased course (deduplicated by course name)
    const seenCourses = new Set();
    const whatsappEntries = [];
    for (const item of cartItems) {
      const info = courseWhatsappInfo[item.name];
      if (info && !seenCourses.has(info.displayName)) {
        seenCourses.add(info.displayName);
        whatsappEntries.push(info);
      }
    }

    const customerHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px; color: #111;">
        
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
          <h1 style="color: #000; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">BEAUTY STATION</h1>
          <p style="color: #555; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; margin-top: 5px;">Recibo de Inscripción Oficial</p>
        </div>

        <p style="font-size: 16px; color: #333; line-height: 1.5;">Estimado/a <strong>${paymentData.Name || ""}</strong>,</p>
        <p style="font-size: 16px; color: #333; line-height: 1.5;">Hemos procesado tu inscripción exitosamente. A continuación encontrarás el detalle oficial de tu recibo.</p>
        
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 4px; margin: 25px 0;">
          <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #000; letter-spacing: 1px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">Detalles de Facturación</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #555;"><strong>No. Recibo:</strong></td>
              <td style="padding: 6px 0; text-align: right; color: #000;">${paymentData.id.split('-')[0].toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #555;"><strong>Fecha:</strong></td>
              <td style="padding: 6px 0; text-align: right; color: #000;">${new Date(paymentData.Timestamp).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric'})}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #555;"><strong>Identificación (DPI/Pasaporte):</strong></td>
              <td style="padding: 6px 0; text-align: right; color: #000;">${paymentData.DPI || "No proporcionado"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #555;"><strong>Teléfono Autorizado:</strong></td>
              <td style="padding: 6px 0; text-align: right; color: #000;">${paymentData.phoneNumber || "No proporcionado"}</td>
            </tr>
          </table>
        </div>

        <div style="margin: 30px 0;">
          <h3 style="font-size: 14px; text-transform: uppercase; color: #000; letter-spacing: 1px; border-bottom: 1px solid #000; padding-bottom: 10px;">Módulos Adquiridos</h3>
          <ul style="padding: 0; list-style-type: none; margin: 0;">
            ${itemsArray.map(item => `
              <li style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px; color: #333;">
                <span style="font-weight: bold;">&#8226;</span> ${item.trim()}
              </li>
            `).join("")}
          </ul>
        </div>

        ${whatsappEntries.length > 0 ? `
        <div style="margin: 30px 0; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center;">
          <h3 style="font-size: 14px; text-transform: uppercase; color: #000; letter-spacing: 1px; margin-top: 0; margin-bottom: 8px;">Grupo de WhatsApp</h3>
          <p style="font-size: 14px; color: #555; margin: 0 0 16px 0;">Únete al grupo de WhatsApp de tu curso para recibir avisos, materiales y novedades.</p>
          ${whatsappEntries.map(({ displayName, link }) => `
            <a href="${link}" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 5px; letter-spacing: 0.5px;">
              Unirme — ${displayName}
            </a>
          `).join('')}
        </div>
        ` : ''}

        ${cartItems.some(i => i.online) ? `
        <div style="margin: 30px 0; background-color: #fdf4ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 24px; text-align: center;">
          <h3 style="font-size: 15px; text-transform: uppercase; color: #000; letter-spacing: 1px; margin-top: 0; margin-bottom: 12px;">¿Cómo acceder a tu Curso en Línea?</h3>
          <ol style="text-align: left; display: inline-block; font-size: 14px; color: #444; margin: 0 0 20px 0; padding-left: 20px; line-height: 2;">
            <li>Ingresa a <strong>Beauty Station</strong> con la cuenta que usaste al comprar.</li>
            <li>Ve a <strong>Mi Perfil</strong> en el menú superior.</li>
            <li>Selecciona el botón <strong>"Curso en Línea"</strong> para comenzar a ver tus lecciones.</li>
          </ol>
          <p style="font-size: 13px; color: #777; margin: 0 0 20px 0;">También puedes acceder directamente desde el siguiente enlace:</p>
          <a href="https://master.d121neu4gkwbak.amplifyapp.com/mis-cursos/curso-en-linea" style="display: inline-block; background-color: #000; color: #ffffff; padding: 12px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 0.5px;">
            Ver mi Curso en Línea →
          </a>
        </div>
        ` : ''}

        <div style="text-align: right; margin-top: 20px; background-color: #000; color: #fff; padding: 15px; border-radius: 4px;">
          <h2 style="font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 1px;">TOTAL CANCELADO: Q ${paymentData.TotalPrice || 0}.00</h2>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #777; line-height: 1.5;">
          <p style="margin: 0 0 10px 0;">*Los pagos para este curso son necesarios para asegurar su cupo y no son reembolsables bajo ninguna circunstancia. En caso de cancelación o ausencia, incluyendo enfermedad, no se permite el canje por otros cursos, servicios o productos.</p>
          <p style="margin: 0 0 15px 0;">Si tienes alguna pregunta, por favor contáctanos directamente a través de WhatsApp.</p>
          <p style="margin: 0; font-weight: bold; color: #000; letter-spacing: 2px;">© BEAUTY STATION</p>
        </div>
      </div>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: 'Beauty Station <onboarding@resend.dev>',
        to: paymentData.email,
        subject: 'Confimación de Pago - Beauty Station',
        html: customerHtml,
      });

      if (error) {
        console.error("Resend API Email Failed:", error);
      } else {
        console.log("Resend API Email Sent Successfully:", data);
      }
    } catch (emailErr) {
      console.error("Critical failure parsing Resend Email:", emailErr);
    }

    // 6. OWNER NOTIFICATION: Send enrollment alert to business owner via AWS SES
    try {
      await sesClient.send(new SendEmailCommand({
        Source: OWNER_EMAIL,
        Destination: { ToAddresses: [OWNER_EMAIL] },
        Message: {
          Subject: { Data: `Nueva Inscripción - ${paymentData.Items}`, Charset: 'UTF-8' },
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px;">
                  <h2 style="color: #000; border-bottom: 2px solid #f1b2c9; padding-bottom: 10px;">Nueva Inscripción Recibida</h2>
                  <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #555; width: 40%;"><strong>Nombre:</strong></td><td style="padding: 8px 0;">${paymentData.Name}</td></tr>
                    <tr><td style="padding: 8px 0; color: #555;"><strong>Email:</strong></td><td style="padding: 8px 0;">${paymentData.email}</td></tr>
                    <tr><td style="padding: 8px 0; color: #555;"><strong>Teléfono:</strong></td><td style="padding: 8px 0;">${paymentData.phoneNumber || 'No proporcionado'}</td></tr>
                    <tr><td style="padding: 8px 0; color: #555;"><strong>DPI/Pasaporte:</strong></td><td style="padding: 8px 0;">${paymentData.DPI || 'No proporcionado'}</td></tr>
                    <tr><td style="padding: 8px 0; color: #555;"><strong>Curso(s):</strong></td><td style="padding: 8px 0;">${paymentData.Items}</td></tr>
                    <tr><td style="padding: 8px 0; color: #555;"><strong>Total Pagado:</strong></td><td style="padding: 8px 0;"><strong>Q ${paymentData.TotalPrice}.00</strong></td></tr>
                    <tr><td style="padding: 8px 0; color: #555;"><strong>Fecha:</strong></td><td style="padding: 8px 0;">${new Date(paymentData.Timestamp).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                    <tr><td style="padding: 8px 0; color: #555;"><strong>No. Recibo:</strong></td><td style="padding: 8px 0;">${paymentData.id.split('-')[0].toUpperCase()}</td></tr>
                  </table>
                  <p style="margin-top: 20px; font-size: 12px; color: #999;">Este mensaje fue generado automáticamente por el sistema de Beauty Station.</p>
                </div>
              `
            }
          }
        }
      }));
      console.log("SES owner notification sent successfully.");
    } catch (sesErr) {
      console.error("SES owner notification failed:", sesErr);
    }

    // Send confident success signal back to the React UI
    res.json({ success: true, message: 'Pago completado y correo automatizado enviado.', paymentId: paymentId });

  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ error: error.message, message: 'Hubo un error al procesar el carrito directamente en el servidor AWS.' });
  }
});

// COURSE LESSONS: Returns lesson list after verifying the user has purchased.
// Prefers CourseSettings DynamoDB record; falls back to hardcoded ONLINE_COURSES.
app.get('/course-lessons/:courseId', async function (req, res) {
  try {
    const { courseId } = req.params;
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email requerido.' });

    // Try DB first, fall back to hardcoded
    let courseName, cartName, lessons;
    try {
      const dbItem = await ddbDocClient.send(new GetCommand({ TableName: 'CourseSettings', Key: { courseId } }));
      if (dbItem.Item && dbItem.Item.lessons) {
        courseName = dbItem.Item.courseName;
        cartName   = dbItem.Item.cartName || dbItem.Item.courseName;
        lessons    = dbItem.Item.lessons;
      }
    } catch (_) { /* table not seeded yet */ }

    if (!lessons) {
      const fallback = ONLINE_COURSES[courseId];
      if (!fallback) return res.status(404).json({ error: 'Curso no encontrado.' });
      courseName = fallback.courseName;
      cartName   = fallback.cartName;
      lessons    = fallback.lessons;
    }

    const data = await ddbDocClient.send(new ScanCommand({
      TableName: 'Payments',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    }));
    const hasPurchased = (data.Items || []).some(order =>
      order.Items && order.Items.toLowerCase().includes(cartName.toLowerCase())
    );
    if (!hasPurchased) {
      return res.status(403).json({ error: 'No tienes acceso a este curso. Adquiérelo para comenzar.' });
    }

    // Strip s3Key — never expose internal bucket paths to the frontend
    const safeLessons = lessons.map(({ id, title, description, duration }) => ({ id, title, description, duration }));
    res.json({ courseName, lessons: safeLessons });
  } catch (error) {
    console.error('Error fetching course lessons:', error);
    res.status(500).json({ error: 'Error al cargar las lecciones del curso.' });
  }
});

// COURSE VIDEO URL: Generates a time-limited S3 pre-signed URL for a specific lesson.
// Prefers CourseSettings DynamoDB record; falls back to hardcoded ONLINE_COURSES.
// The s3Key is never sent to the browser — only the signed URL is.
app.get('/course-video-url/:courseId/:lessonId', async function (req, res) {
  try {
    const { courseId, lessonId } = req.params;
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email requerido.' });

    // Try DB first, fall back to hardcoded
    let cartName, lessons;
    try {
      const dbItem = await ddbDocClient.send(new GetCommand({ TableName: 'CourseSettings', Key: { courseId } }));
      if (dbItem.Item && dbItem.Item.lessons) {
        cartName = dbItem.Item.cartName || dbItem.Item.courseName;
        lessons  = dbItem.Item.lessons;
      }
    } catch (_) { /* table not seeded yet */ }

    if (!lessons) {
      const fallback = ONLINE_COURSES[courseId];
      if (!fallback) return res.status(404).json({ error: 'Curso no encontrado.' });
      cartName = fallback.cartName;
      lessons  = fallback.lessons;
    }

    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lección no encontrada.' });

    // Verify purchase
    const data = await ddbDocClient.send(new ScanCommand({
      TableName: 'Payments',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    }));
    const hasPurchased = (data.Items || []).some(order =>
      order.Items && order.Items.toLowerCase().includes(cartName.toLowerCase())
    );
    if (!hasPurchased) {
      return res.status(403).json({ error: 'No tienes acceso a este curso.' });
    }

    // Generate a time-limited S3 pre-signed URL (valid for 4 hours)
    const signedUrl = await getS3SignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: S3_BUCKET, Key: lesson.s3Key }),
      { expiresIn: 14400 }
    );

    res.json({ videoUrl: signedUrl });
  } catch (error) {
    console.error('Error generating video URL:', error);
    res.status(500).json({ error: 'Error al generar el enlace del video.' });
  }
});

// GET PROGRESS: Returns the user's completed lessons for an online course
app.get('/course-progress/:courseId', async function (req, res) {
  try {
    const { courseId } = req.params;
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email requerido.' });

    const data = await ddbDocClient.send(new GetCommand({
      TableName: 'CourseProgress',
      Key: { email, courseId }
    }));

    res.json(data.Item || { email, courseId, completedLessons: [], lastWatched: null });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: 'Error al cargar el progreso del curso.' });
  }
});

// SAVE PROGRESS: Saves the user's lesson completion state for an online course
app.post('/course-progress/:courseId', async function (req, res) {
  try {
    const { courseId } = req.params;
    const { email, completedLessons, lastWatched } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido.' });

    await ddbDocClient.send(new PutCommand({
      TableName: 'CourseProgress',
      Item: {
        email,
        courseId,
        completedLessons: completedLessons || [],
        lastWatched: lastWatched || null,
        updatedAt: Date.now()
      }
    }));

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving course progress:', error);
    res.status(500).json({ error: 'Error al guardar el progreso.' });
  }
});

// ─── PUBLIC ENDPOINTS (no auth required) ────────────────────────────────────

// PUBLIC COURSES: Returns all visible courses from CourseSettings table.
// Falls back to an empty object if the table hasn't been seeded yet.
app.get('/courses', async function (req, res) {
  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: 'CourseSettings' }));
    const items = data.Items || [];
    // Convert array to courseId-keyed map matching the shape of courseData.js
    const courseMap = {};
    for (const item of items) {
      if (item.isVisible !== false) {
        // Strip admin-only fields before sending to public
        const { courseId, lastUpdatedBy, ...publicFields } = item;
        courseMap[courseId] = publicFields;
      }
    }
    res.json(courseMap);
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Return empty so the frontend falls back to hardcoded data
    res.json({});
  }
});

// PUBLIC SITE SETTINGS: Returns public-facing settings (fees, kit price, site notice).
// Strips any admin-only fields before sending to the browser.
app.get('/site-settings', async function (req, res) {
  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: 'SiteSettings' }));
    const allowed = ['enrollmentFee', 'kitPrice', 'siteNotice', 'siteNoticeActive'];
    const settings = {};
    for (const item of (data.Items || [])) {
      if (allowed.includes(item.settingKey)) {
        settings[item.settingKey] = item.value;
      }
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.json({});
  }
});

// PUBLIC REVIEWS: Returns all visible reviews for the homepage.
app.get('/reviews', async function (req, res) {
  try {
    const data = await ddbDocClient.send(new ScanCommand({
      TableName: 'Reviews',
      FilterExpression: 'isVisible = :v',
      ExpressionAttributeValues: { ':v': true }
    }));
    res.json(data.Items || []);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.json([]);
  }
});

// SUBMIT A NEW REVIEW (public — no auth required)
app.post('/reviews', async function (req, res) {
  try {
    const { name, rating, text, date } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: 'El texto de la reseña es requerido.' });

    const reviewId = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await ddbDocClient.send(new PutCommand({
      TableName: 'Reviews',
      Item: {
        reviewId,
        name:      (name  || 'Usuario').trim().slice(0, 80),
        rating:    Math.min(5, Math.max(1, Number(rating) || 5)),
        text:      text.trim().slice(0, 2000),
        date:      date || new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' }),
        source:    'user',
        isVisible: true,
        createdAt: Date.now(),
      },
    }));
    res.json({ success: true, reviewId });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Error al guardar la reseña.' });
  }
});

// ─── ADMIN ENDPOINTS (requireAdmin middleware enforces Cognito "admin" group) ─

// LIST ALL COURSES (including hidden)
app.get('/admin/courses', requireAdmin, async function (req, res) {
  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: 'CourseSettings' }));
    res.json(data.Items || []);
  } catch (error) {
    console.error('Admin: error listing courses:', error);
    res.status(500).json({ error: 'Error al listar cursos.' });
  }
});

// UPDATE A COURSE
app.put('/admin/courses/:courseId', requireAdmin, async function (req, res) {
  try {
    const { courseId } = req.params;
    const updates = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId requerido.' });

    // Build a dynamic UpdateExpression from whatever fields were sent
    const names  = {};
    const values = { ':ts': Date.now(), ':by': req.adminEmail };
    const parts  = ['#lastUpdatedAt = :ts', '#lastUpdatedBy = :by'];
    names['#lastUpdatedAt']  = 'lastUpdatedAt';
    names['#lastUpdatedBy']  = 'lastUpdatedBy';

    const forbidden = ['courseId'];
    for (const [key, val] of Object.entries(updates)) {
      if (forbidden.includes(key)) continue;
      const placeholder = `#f_${key}`;
      const valHolder   = `:v_${key}`;
      names[placeholder]  = key;
      values[valHolder]   = val;
      parts.push(`${placeholder} = ${valHolder}`);
    }

    await ddbDocClient.send(new UpdateCommand({
      TableName: 'CourseSettings',
      Key: { courseId },
      UpdateExpression: `SET ${parts.join(', ')}`,
      ExpressionAttributeNames:  names,
      ExpressionAttributeValues: values
    }));

    await writeActivityLog(req.adminEmail, `Updated course: ${courseId}`, null, JSON.stringify(updates));

    res.json({ success: true });
  } catch (error) {
    console.error('Admin: error updating course:', error);
    res.status(500).json({ error: 'Error al actualizar el curso.' });
  }
});

// LIST ALL REVIEWS (including hidden ones)
app.get('/admin/reviews', requireAdmin, async function (req, res) {
  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: 'Reviews' }));
    res.json(data.Items || []);
  } catch (error) {
    console.error('Admin: error listing reviews:', error);
    res.status(500).json({ error: 'Error al listar reseñas.' });
  }
});

// SOFT-DELETE A REVIEW (sets isVisible=false so it can be restored)
app.delete('/admin/reviews/:reviewId', requireAdmin, async function (req, res) {
  try {
    const { reviewId } = req.params;
    await ddbDocClient.send(new UpdateCommand({
      TableName: 'Reviews',
      Key: { reviewId },
      UpdateExpression: 'SET isVisible = :f, #deletedBy = :by, #deletedAt = :ts',
      ExpressionAttributeNames: { '#deletedBy': 'deletedBy', '#deletedAt': 'deletedAt' },
      ExpressionAttributeValues: { ':f': false, ':by': req.adminEmail, ':ts': Date.now() }
    }));
    await writeActivityLog(req.adminEmail, `Deleted review: ${reviewId}`, 'visible', 'hidden');
    res.json({ success: true });
  } catch (error) {
    console.error('Admin: error deleting review:', error);
    res.status(500).json({ error: 'Error al eliminar la reseña.' });
  }
});

// RESTORE A REVIEW (sets isVisible=true)
app.put('/admin/reviews/:reviewId', requireAdmin, async function (req, res) {
  try {
    const { reviewId } = req.params;
    await ddbDocClient.send(new UpdateCommand({
      TableName: 'Reviews',
      Key: { reviewId },
      UpdateExpression: 'SET isVisible = :t',
      ExpressionAttributeValues: { ':t': true }
    }));
    await writeActivityLog(req.adminEmail, `Restored review: ${reviewId}`, 'hidden', 'visible');
    res.json({ success: true });
  } catch (error) {
    console.error('Admin: error restoring review:', error);
    res.status(500).json({ error: 'Error al restaurar la reseña.' });
  }
});

// GET ALL SITE SETTINGS
app.get('/admin/site-settings', requireAdmin, async function (req, res) {
  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: 'SiteSettings' }));
    res.json(data.Items || []);
  } catch (error) {
    console.error('Admin: error fetching site settings:', error);
    res.status(500).json({ error: 'Error al obtener configuración del sitio.' });
  }
});

// UPDATE A SITE SETTING
app.put('/admin/site-settings/:key', requireAdmin, async function (req, res) {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ error: 'value requerido.' });

    // Capture old value for the activity log before overwriting
    let oldVal = null;
    try {
      const existing = await ddbDocClient.send(new GetCommand({ TableName: 'SiteSettings', Key: { settingKey: key } }));
      if (existing.Item) oldVal = existing.Item.value;
    } catch (_) {}

    await ddbDocClient.send(new UpdateCommand({
      TableName: 'SiteSettings',
      Key: { settingKey: key },
      UpdateExpression: 'SET #val = :v, lastUpdatedBy = :by, lastUpdatedAt = :ts',
      ExpressionAttributeNames: { '#val': 'value' },
      ExpressionAttributeValues: { ':v': value, ':by': req.adminEmail, ':ts': Date.now() }
    }));

    await writeActivityLog(req.adminEmail, `Updated setting: ${key}`, oldVal, value);

    res.json({ success: true });
  } catch (error) {
    console.error('Admin: error updating site setting:', error);
    res.status(500).json({ error: 'Error al actualizar configuración.' });
  }
});

// LIST ALL REGISTRATIONS (all Payments rows, sorted newest first)
app.get('/admin/registrations', requireAdmin, async function (req, res) {
  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: 'Payments' }));
    const sorted = (data.Items || []).sort((a, b) => (b.Timestamp || 0) - (a.Timestamp || 0));
    res.json(sorted);
  } catch (error) {
    console.error('Admin: error listing registrations:', error);
    res.status(500).json({ error: 'Error al listar inscripciones.' });
  }
});

// LIST ALL SEAT COUNTS (raw Modulos rows)
app.get('/admin/seats', requireAdmin, async function (req, res) {
  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: 'Modulos' }));
    res.json(data.Items || []);
  } catch (error) {
    console.error('Admin: error listing seats:', error);
    res.status(500).json({ error: 'Error al listar asientos.' });
  }
});

// UPDATE SEAT COUNT FOR ONE MODULE (admin manually adjusts availability)
app.put('/admin/seats/:moduleId', requireAdmin, async function (req, res) {
  try {
    const { moduleId } = req.params;
    const { courseName, seats } = req.body;
    if (!courseName || seats === undefined) {
      return res.status(400).json({ error: 'courseName y seats son requeridos.' });
    }
    // Capture old seat count for activity log
    let oldSeats = null;
    try {
      const existing = await ddbDocClient.send(new GetCommand({ TableName: 'Modulos', Key: { id: moduleId } }));
      if (existing.Item && existing.Item[courseName] !== undefined) oldSeats = existing.Item[courseName];
    } catch (_) {}

    await ddbDocClient.send(new UpdateCommand({
      TableName: 'Modulos',
      Key: { id: moduleId },
      UpdateExpression: 'SET #cn = :seats',
      ExpressionAttributeNames: { '#cn': courseName },
      ExpressionAttributeValues: { ':seats': Number(seats) }
    }));

    await writeActivityLog(req.adminEmail, `Updated seats: ${courseName}`, oldSeats, Number(seats));

    res.json({ success: true });
  } catch (error) {
    console.error('Admin: error updating seats:', error);
    res.status(500).json({ error: 'Error al actualizar asientos.' });
  }
});

// GET LESSONS FOR AN ONLINE COURSE (includes s3Key for admin use)
app.get('/admin/lessons/:courseId', requireAdmin, async function (req, res) {
  try {
    const { courseId } = req.params;
    let lessons, courseName;

    try {
      const dbItem = await ddbDocClient.send(new GetCommand({ TableName: 'CourseSettings', Key: { courseId } }));
      if (dbItem.Item) {
        lessons    = dbItem.Item.lessons || [];
        courseName = dbItem.Item.courseName;
      }
    } catch (_) { /* table not seeded yet */ }

    if (!lessons) {
      const fallback = ONLINE_COURSES[courseId];
      if (!fallback) return res.status(404).json({ error: 'Curso no encontrado.' });
      lessons    = fallback.lessons;
      courseName = fallback.courseName;
    }

    res.json({ courseId, courseName, lessons });
  } catch (error) {
    console.error('Admin: error fetching lessons:', error);
    res.status(500).json({ error: 'Error al obtener lecciones.' });
  }
});

// UPDATE LESSON LIST FOR AN ONLINE COURSE (full replacement of the lessons array)
app.put('/admin/lessons/:courseId', requireAdmin, async function (req, res) {
  try {
    const { courseId } = req.params;
    const { lessons } = req.body;
    if (!Array.isArray(lessons)) return res.status(400).json({ error: 'lessons debe ser un arreglo.' });

    await ddbDocClient.send(new UpdateCommand({
      TableName: 'CourseSettings',
      Key: { courseId },
      UpdateExpression: 'SET lessons = :l, lastUpdatedBy = :by, lastUpdatedAt = :ts',
      ExpressionAttributeValues: { ':l': lessons, ':by': req.adminEmail, ':ts': Date.now() }
    }));

    await writeActivityLog(req.adminEmail, `Updated lessons: ${courseId}`, null, `${lessons.length} lecciones`);

    res.json({ success: true });
  } catch (error) {
    console.error('Admin: error updating lessons:', error);
    res.status(500).json({ error: 'Error al actualizar lecciones.' });
  }
});

// GET ADMIN ACTIVITY LOG (last 100 entries, newest first)
// Requires AdminLog DynamoDB table: partition key = actionId (String)
app.get('/admin/activity-log', requireAdmin, async function (req, res) {
  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: 'AdminLog' }));
    const sorted = (data.Items || []).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    res.json(sorted.slice(0, 100));
  } catch (error) {
    console.error('Admin: error fetching activity log:', error);
    res.status(500).json({ error: 'Error al obtener el registro de actividad. Asegúrate de que la tabla AdminLog existe en DynamoDB.' });
  }
});

app.listen(3000, function () { console.log("AWS Checkout API local server started"); });
module.exports = app;
