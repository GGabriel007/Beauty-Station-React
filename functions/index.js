const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const logger = require("firebase-functions/logger");


// Initialize Firebase Admin SDK
admin.initializeApp();

// Defining the secret key
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");


exports.sendPurchaseEmail = onDocumentCreated(
  { 
    document: "Payments/{paymentId}" ,
    secrets: [SENDGRID_API_KEY],
  },
  async (event) => {
    logger.info("Function triggered!!!");


    // IMPORTANT: call .value() and await it to retrieve the secret string
    let apiKey;
    try {
      apiKey = await SENDGRID_API_KEY.value();
    } catch (err) {
      logger.error("Failed to read SENDGRID_API_KEY secret", { err: err?.toString() });
      return;

    }

    if (!apiKey)
    {
      logger.error("SENDGRID_API_KEY secret is empty or missing");
      return;

    }
    logger.info("SENDGRID_API_KEY loaded successfully (value hidden)");

    // Initialize SendGrid
    sgMail.setApiKey(apiKey);


    try {
      const snap = event.data;
      if(!snap) {
        logger.warn("No Firestore document snapshot provided");
        return;
      }

      const paymentId = event.params.paymentId;
      const paymentData = snap.data();
      logger.info(" Payment document received", { paymentId, email: paymentData?.email });

      if (!paymentData || !paymentData.email) {
        logger.warn("Payment data missing or email not provided; aborting");
        return;
      }


      const itemsArray = typeof paymentData.Items === "string" 
      ? paymentData.Items.split(",")
      : paymentData.Items;



      const customerEmail = {
        to: paymentData.email,
        from: "g.a.gramirez007@gmail.com",
        subject: "Compra confirmada",
        html: `
        <div>
        <h1 style="font-family: Georgia, serif;  color:rgb(198, 121, 149); margin-left: 5px;"><strong>Beauty Station</strong></h1>
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 500px; border: 1px solid #757575; border-radius: 10px;">
              <h1 style="text-align: center; color: #007bff;">Recibo de Compra</h1>
      
              <p style="font-size: 19px;">Hola <strong>${paymentData.Name},</strong></p>
              <p style="font-size: 17px;">Tu compra ha sido confirmada. Detalles de tu registro:</p>
              
              <p style="font-size: 17px;">Orden ID:<strong> ${paymentId}</strong></p>
      
              <p style="font-size: 17px;"><strong>Registración:</strong></p>
              <ul style="font-size: 17px; padding-left: 20px;">
              ${itemsArray.map(item => `<li style="list-style-type: disc;">${item.trim()}</li>`).join('')}
              </ul>
      
              ${paymentData.IncludeKit 
                ? `<p style="color: green;"><strong>Incluye Kit de Pieles Perfectas</strong></p>`
                : ""}
      
              <p style="font-size: 18px; margin-top: 10px;"><strong>Total: $${paymentData.TotalPrice}</strong></p>
      
              <p style="font-size: 17px;">¡Gracias por tu compra!</p>

          </div>
      
          <!-- <div style="max-width: 500px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td align="center">
                  <img src="http://cdn.mcauto-images-production.sendgrid.net/1f79072616b1d08c/ca34e4cd-15da-4800-adfc-1fe09de7a6cb/634x440.png" alt="Curso Imagen" style="width: 100px; height: auto;"/>
                </td>
              </tr>
            </table>
          </div>
            -->
        </div>
        `,
      };
      
      // Owner Notification Email
      const ownerEmail = {
        to: "grgonzalez345@gmail.com", 
        from: "g.a.gramirez007@gmail.com",
        subject: "Nueva compra confirmada",
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 500px; border: 1px solid #ddd; border-radius: 10px;">
          <h1 style="text-align: center; color: #007bff;">Nueva Compra Recibida</h1>
          <p style="font-size: 19px;"><strong>Orden ID:</strong> ${paymentId}</p>
          <p style="font-size: 17px;"><strong>Cliente:</strong> ${paymentData.Name} (${paymentData.email})</p>
          <p style="font-size: 17px;"><strong>Registración:</strong></p>
          <ul style="font-size: 17px; padding-left: 20px;">
            ${itemsArray.map(item => `<li style="list-style-type: disc;">${item.trim()}</li>`).join('')}
          </ul>
          ${paymentData.IncludeKit ? `<p style="color: green;"><strong>Incluye Kit de Pieles Perfectas</strong></p>` : ""}
          <p style="font-size: 18px; margin-top: 10px;"><strong>Total:</strong> $${paymentData.TotalPrice}</p>
          <p style="font-size: 17px;">Revisar el registro en el sistema.</p>
        </div>
        `,
      };

      // send emails and log results 
      logger.info("Sending customer email", {to : customerEmail.to });
      const customerRes = await sgMail.send(customerEmail);
      logger.info("Customer email send result", {resultLength: (customerRes || []).length });

      logger.info("Sending owner", { to: ownerEmail.to });
      const ownerRes = await sgMail.send(ownerEmail);
      logger.info("Owner email send result", { resultLength: (ownerRes || []).length});

    
    } catch (error) {
      // log full error stack. message for debugging
      logger.error("Error in sendPurchaseEmail", { error: error?.toString(), stack: error?.stack });
    }
  }
);