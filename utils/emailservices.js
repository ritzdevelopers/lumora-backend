const nodemailer = require('nodemailer');

const sendEnquiryEmailHelper = async ({ name, mail, phone, message }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    // to: 'info@lumoraestates.com',  // added this instead of process.env.MAIL_USER
    to:process.env.TO_MAIL,
    bcc:process.env.MAIL_USER,
    subject: 'New Enquiry',
    text: `Name: ${name}\nEmail: ${mail}\nPhone: ${phone}\nMessage: ${message}`,
  };


  return transporter.sendMail(mailOptions);
};



module.exports = {
  sendEnquiryEmailHelper
};
