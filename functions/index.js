const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { Resend } = require('resend');

const LOG_TAG = "RESEND_EMAIL_FUNC";

// Initialize Resend client using standard environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  console.log(`${LOG_TAG}: invoked with Event:`, JSON.stringify(event, null, 2));

  if (!process.env.RESEND_API_KEY) {
    console.error(`${LOG_TAG}: RESEND_API_KEY environment variable missing`);
    return;
  }

  // Loop through the DynamoDB stream records
  for (const record of event.Records) {

    // We only want to trigger emails on newly created payments
    if (record.eventName !== 'INSERT') {
      continue;
    }

    if (!record.dynamodb || !record.dynamodb.NewImage) {
      console.warn(`${LOG_TAG}: No NewImage found in stream record.`);
      continue;
    }

    // Unmarshall the DynamoDB JSON into a clean JavaScript object
    const paymentData = unmarshall(record.dynamodb.NewImage);
    const keys = unmarshall(record.dynamodb.Keys);

    // Attempt to extract the primary key/ID for logging purposes
    const paymentId = keys.id || keys.paymentId || JSON.stringify(keys) || "UnknownID";

    console.log(`${LOG_TAG}: payment doc received`, { paymentId, email: paymentData?.email || null });

    if (!paymentData || !paymentData.email) {
      console.warn(`${LOG_TAG}: payment data or email missing`, { paymentId });
      continue;
    }

    const itemsArray = typeof paymentData.Items === "string" ? paymentData.Items.split(",") : paymentData.Items || [];

    // build customer HTML (you can reuse your full HTML)
    const customerHtml = `
      <div>
        <h1><strong> Beauty Station </strong></h1>
        <p>Hola <strong>${paymentData.Name || ""}</strong>,</p>
        <ul>
          ${itemsArray.map(item => `<li>${item.trim()}</li>`).join("")}
        </ul>
        <p><strong>Total: $${paymentData.TotalPrice || 0}</strong></p>
      </div>
    `;

    try {
      // send customer email
      console.log(`${LOG_TAG}: send customer email to: ${paymentData.email}`);

      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        // IMPORTANT: While testing with the 'onboarding' address without a verified 
        // custom domain, Resend will only successfully deliver this email if the 
        // 'to' address exactly matches the email address you used to sign up for Resend!
        to: paymentData.email,
        subject: 'Compra confirmada',
        html: customerHtml,
      });

      if (error) {
        console.error(`${LOG_TAG}: send customer failed`, { paymentId, error });
      } else {
        console.log(`${LOG_TAG}: customer email sent`, { paymentId, data });
      }

    } catch (err) {
      console.error(`${LOG_TAG}: function error during Resend publish:`, err);
    }
  }
};
