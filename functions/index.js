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
    console.log("Function triggered!!! Arroz?");

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
      from: "g.a.gramirez007@gmail.com", // Replace with your verified SendGrid email
      subject: "Compra confirmada",
      html: `
        <p>Hola ${paymentData.Name}, tu compra ha sido confirmada. Total: $${paymentData.TotalPrice}. ¡Gracias por tu compra!</p>
        <img src="https://scontent-iad3-2.xx.fbcdn.net/v/t39.30808-6/326227690_913634052987919_4833733110769923167_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=Yxm_bz3p5FMQ7kNvgFOKMRq&_nc_zt=23&_nc_ht=scontent-iad3-2.xx&_nc_gid=A4joNgsBnPC6QRIHIz2hfh4&oh=00_AYBykMsojrFHdsk5MkjNFPM37uhHGDd2pRqsXii3Yn1yTQ&oe=67A76467" alt="Confirmation Image" />
      `,
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
