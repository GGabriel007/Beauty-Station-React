const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const logger = require("firebase-functions/logger");

// Load environment variables
require("dotenv").config(); 

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get SendGrid API key from process.env
const SENDGRID_APIKEY = process.env.SENDGRIDD_API_KEY;

if (!SENDGRID_APIKEY) {
  console.error("Missing SendGrid API Key in .env file");
  process.exit(1); // Exit if API key is missing
}

 


sgMail.setApiKey(SENDGRID_APIKEY);

exports.sendPurchaseEmail = onDocumentCreated(
  { document: "Payments/{paymentId}" },
  async (event) => {
    console.log("Function triggered!!!");

    const snap = event.data;
    if (!snap) {
      console.log("No data received.");
      return;
    }

    const paymentId = event.params.paymentId;

    const paymentData = snap.data();
    console.log("Payment data:", paymentData);

    if (!paymentData || !paymentData.email) {
      console.log("No email found, exiting function.");
      return null;
    }

    const itemsArray = typeof paymentData.Items === "string" ? paymentData.Items.split(",") : paymentData.Items;



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

    

    try {
      console.log("Sending email to:", paymentData.email);
      await sgMail.send(customerEmail);
      console.log("Customer email sent successfully!");

      console.log("Sending confirmation email to owner...");
      await sgMail.send(ownerEmail);
      console.log("Owner confirmation email sent successfully!");

    } catch (error) {
      console.error("Error sending emails:", error);
    }
  }
);