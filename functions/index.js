const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin SDK
admin.initializeApp();

const SENDPULSE_CLIENT_ID = defineSecret("SENDPULSE_CLIENT_ID");
const SENDPULSE_CLIENT_SECRET = defineSecret("SENDPULSE_CLIENT_SECRET");
const SENDPULSE_FROM = defineSecret("SENDPULSE_FROM");

const LOG_TAG = "SENDPULSE_HTTP_FUNC";

// In-memory token cache
let _sendpulseToken = null;       // { access_token, expires_at: epoch_ms }
const SENDPULSE_TOKEN_URL = "https://api.sendpulse.com/oauth/access_token";
const SENDPULSE_SEND_URL = "https://api.sendpulse.com/smtp/emails";

// Helper: get cached token or request new one
async function getSendPulseToken() {
  // return cached if still valid (5s margin)
  if (_sendpulseToken && _sendpulseToken.access_token && Date.now() < _sendpulseToken.expires_at - 5000) {
    return _sendpulseToken.access_token;
  }

  // read secrets
  const clientId = await SENDPULSE_CLIENT_ID.value();
  const clientSecret = await SENDPULSE_CLIENT_SECRET.value();
  if (!clientId || !clientSecret) {
    throw new Error("SendPulse client credentials missing");
  }

  // request token
  const body = {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret

  };

  const resp = await fetch(SENDPULSE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify(body)
  });

  const json = await resp.json();
  if (!resp.ok) {
    const msg = JSON.stringify(json);
    throw new Error(`SendPulse token request failed: ${resp.status} ${msg}`);

  }

  // SendPulse typically returns access_token and expires_in (seconds)
  const accessToken = json.access_token;
  const expiresIn = json.expires_in || 3600;
  _sendpulseToken = { access_token: accessToken, expires_at: Date.now() + expiresIn * 1000};

  return accessToken; 

}

// Helper: send via SendPulse API
async function sendWithSendPulse(access_token, from, toEmail, subject, htmlBody) {
  const payload = {
    email: {
      html: htmlBody,
      text: htmlBody.replace(/<[^>]*>/g, ""),
      subject,
      from: { email: from, name: "Beauty Station"},
      to: [{ email: toEmail, name: ""}]
    }
  };

  const resp = await fetch(SENDPULSE_SEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });

  const json = await resp.json();
  return { ok: resp.ok, status: resp.status, body: json};

}


// Cloud Function Trigger

exports.sendPurchaseEmail = onDocumentCreated(
  { 
    document: "Payments/{paymentId}" ,
    secrets: [SENDPULSE_CLIENT_ID, SENDPULSE_CLIENT_SECRET, SENDPULSE_FROM],
  },
  async (event) => {
    logger.info(`${LOG_TAG}: invoked`, { eventId: event.id || null});


    // load the "from" address
    let fromAddr;
    try {
      fromAddr = await SENDPULSE_FROM.value();
    } catch (err) {
      logger.error(`${LOG_TAG}: failed to load SENDPULSE_FROM`, {err: err?.toString() });
      return;
    }
    if (!fromAddr) {
      logger.error(`${LOG_TAG}: SENDPULSE_FROM missing`);
      return;
    }

    // get token
    let token;
    try {
      token = await getSendPulseToken();
      logger.info(`${LOG_TAG}: obtained sendpulse token (cached)`);
    } catch (err) {
      logger.error(`${LOG_TAG}: token acquisition failed`, { err: err?.toString() });
      return;
    }

    // get event data
    const snap = event.data;
    if (!snap) {
      logger.warn(`${LOG_TAG}: no snapshot provided`);
      return;
    }

    const paymentId = event.params.paymentId;
    const paymentData = snap.data();

    logger.info(`${LOG_TAG}: payment doc received`, { paymentId, email: paymentData?.email || null });
    if (!paymentData || !paymentData) {
      logger.warn(`${LOGD_TAG}: payment missing or email missing`, { paymentId });
      return;
    }

    const itemsArray = typeof paymentData.Items === "string" ? paymentData.Items.split(",") : paymentData.Items;

    // build customer HTML (you can reuse your full HTML)
    const customerHtml = `
      <div>
        <h1><strong> Beauty Station </strong></h1>
        <p>Hola <strong>${paymentData.Name}</strong>,</p>
        <ul>
          ${itemsArray.map(item => `<li>${item.trim()}</li>`).join("")}
        </ul>
        <p><strong>Total: $${paymentData.TotalPrice}</strong></p>
      </div>
    `;

    // owner HTML
    const ownerHtml = `
      <div> 
        <h1>Nueva Compra Recibida</h1>
        <p>Orden ID: <strong>${paymentId}</strong></p>
        <p>Cliente: ${paymentData.Name} (${paymentData.email})</p>
    `;

    try {
      // send customer
      logger.info(`${LOG_TAG}: send customer email`, { paymentId, to: paymentData.email });
      const custResp = await sendWithSendPulse(token, fromAddr, paymentData.email, "Compra confirmada", customerHtml);

      if (!custResp.ok) {
        logger.error(`${LOG_TAG}: send customer failed`, { paymentId, status: custResp.status, body: custResp.body });

      } else {
        logger.info(`${LOG_TAG}: customer email sent`, { paymentId, body: custResp.body });

      }

    } catch (err) {

      logger.error(`${LOG_TAG}: function error`, { error: err?.toString(), stack: err?.stack });
    }
  }
);
