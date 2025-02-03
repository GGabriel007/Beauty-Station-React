const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");

// Initialize Firebase Admin SDK
admin.initializeApp();

const EMAIL_USER = defineSecret("EMAIL_USER");
const EMAIL_PASS = defineSecret("EMAIL_PASS");



exports.sendPurchaseEmail = onDocumentCreated(
    { document: "Payments/{paymentId}", secrets: [EMAIL_USER, EMAIL_PASS] },
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
  
      // Create transporter inside the function (after retrieving secrets)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: EMAIL_USER.value(),
        to: paymentData.email,
        subject: "Compra confirmada",
        text: `Hola ${paymentData.Name}, tu compra ha sido confirmada. Total: $${paymentData.TotalPrice}. ¡Gracias por tu compra!`,
      };
  
      try {
        console.log("Sending email to:", paymentData.email);
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }
);
