const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Define SendGrid API Key as a secret
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");

// Set the API key inside the function 
sgMail.setApiKey(SENDGRID_API_KEY.value());

exports.sendPurchaseEmail = onDocumentCreated(
    { document: "Payments/{paymentId}", secrets: [SENDGRID_API_KEY] },
    async (event) => {
      console.log("Function triggered!");
  
      const snap = event.data;
      if (!snap) {
        console.log("No data received.");
        return;
      }
  
      const paymentData = snap.data();
      console.log("Payment data:", paymentData);
  
      if (!paymentData || !paymentData.email) {
        console.log("No email found, exiting function.");
        return null;
      }
  
      const msg = {
        to: paymentData.email,
        from: "g.a.gramirez007@gmail.com",
        subject: "Compra confirmada",
        text: `Hola ${paymentData.Name}, tu compra ha sido confirmada. Total: $${paymentData.TotalPrice}. ¡Gracias por tu compra!`,
      };
  
      try {
        console.log("Sending email to:", paymentData.email);
        await sgMail.send(msg);
        console.log("Email sent successfully!");
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }
);
