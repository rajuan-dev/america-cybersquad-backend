import nodemailer from "nodemailer";
import config from "../config";
import ApiError from "../errors/ApiErrors";

const emailSender = async (subject: string, email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.send_email.nodemailer_email,
      pass: config.send_email.nodemailer_password,
    },
  });
  //
  const emailTransport = transporter;

  const mailOptions = {
    from: `"Wasiq Ali" <${ config.send_email.nodemailer_email}>`,
    to: email,
    subject,
    html,
  };

  // Send the email
  try {
    const info = await emailTransport.sendMail(mailOptions);
    // console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, "Error sending email");
  }
};

export default emailSender;
