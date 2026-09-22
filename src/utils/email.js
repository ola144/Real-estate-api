const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "RealEstate",
        email: process.env.EMAIL_FROM,
      },

      to: Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }],

      subject,
      htmlContent: html,

      ...(text && {
        textContent: text,
      }),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

const receiveEmail = async ({
  subject,
  html,
  sender,
  senderEmail,
  to = "yogarealestate3@gmail.com",
}) => {
  await sendEmail({
    to: to,
    subject: subject,
    html: `<b>${sender}</b> with this email "${senderEmail}" sent a mail with this message: <br /> <span style="font-style: italic; font-family: Arial, sans-serif">${html}</span> `,
  });
};

const sendBookingEmail = async (email, name, customerName) => {
  await sendEmail({
    to: email,
    subject: "New Booking",
    html: `
            <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
          "
        >

          <h2>
            New Property Booking Request
          </h2>

          <p>
            Hello ${name},
          </p>

          <p>
            ${customerName} just sent a new booking request for one of your properties. Login to your dashboard to check more details.
          </p>

        </div>
        `,
  });
};

const sellPropertyEmail = async ({
  subject = "Property Sale Request",
  name,
  email,
  phone,
  propertyType,
  propertyAddress,
  additionalMessage,
  to = "yogarealestate3@gmail.com",
}) => {
  await sendEmail({
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="margin-bottom: 20px;">New Request to Sell Property</h2>

        <p>A new property sale request has been submitted.</p>

        <div style="margin-top: 20px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Property Type:</strong> ${propertyType}</p>
          <p><strong>Property Address:</strong> ${propertyAddress}</p>
        </div>

        <div style="margin-top: 20px;">
          <p><strong>Additional Message:</strong></p>

          <div
            style="
              background: #f5f5f5;
              padding: 15px;
              border-radius: 6px;
              font-style: italic;
            "
          >
            ${additionalMessage || "No additional message provided."}
          </div>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  receiveEmail,
  sendBookingEmail,
  sellPropertyEmail,
};
