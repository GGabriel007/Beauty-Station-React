const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');
const { Resend } = require('resend');

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

    // 1. PRE-CHECK INVENTORY: Verify seats exist in DynamoDB 'Modulos' before processing payment
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

    // 4. DISPATCH EMAIL: Send automated receipt natively via Resend SDK
    const itemsArray = typeof paymentData.Items === 'string' ? paymentData.Items.split(",") : [];

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

    // Send confident success signal back to the React UI
    res.json({ success: true, message: 'Pago completado y correo automatizado enviado.', paymentId: paymentId });

  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ error: error.message, message: 'Hubo un error al procesar el carrito directamente en el servidor AWS.' });
  }
});

app.listen(3000, function () { console.log("AWS Checkout API local server started"); });
module.exports = app;
