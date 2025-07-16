const nodemailer = require('nodemailer');
const welcomeTemplate = require("../common/emailTemplates/wecome.mail");
const createPasswordTemplate = require("../common/emailTemplates/created-password.mail");
const resetPasswordTemplate = require("../common/emailTemplates/reset-password.mail");
const template = require("../common/emailTemplates/template");

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465, // SSL port
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'hello@fhaestates.com', // Your Zoho email address (e.g., info@ibommortgage.com)
    pass: 'fhamortgageDev@dev123' // Your Zoho email password or app-specific password
  },
  tls: {
    rejectUnauthorized: false // Only for testing, remove in production
  }
});

// Verify SMTP connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

const mailer = {
  sendCreatePassword: async (user, token) => {
    try {
      const mailOptions = {
        from: `"Ibom Mortgage Initiative" <hello@fhaestates.com>`,
        to: user.email,
        subject: `Welcome ${user.first_name} 👋, Let's get you started!`,
        html: template({
          user,
          token,
          content: createPasswordTemplate,
        })
      };

      const info = await transporter.sendMail(mailOptions);
      return {
        status: "success",
        messageId: info.messageId
      };
    } catch (error) {
      console.error("Error sending create password email:", error);
      return {
        status: "failed",
        error: error.message
      };
    }
  },

  sendWelcome: async (user, token) => {
    try {
      const mailOptions = {
        from: `"Ibom Mortgage Initiative" <${process.env.ZOHO_EMAIL}>`,
        to: user.email,
        subject: "Thank You for Your Interest in Our Real Estate Platform!",
        html: template({
          user,
          token,
          content: welcomeTemplate,
        })
      };

      const info = await transporter.sendMail(mailOptions);
      return {
        status: "success",
        messageId: info.messageId
      };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return {
        status: "failed",
        error: error.message
      };
    }
  },

  sendResetPassword: async (user, token) => {
    try {
      const mailOptions = {
        from: `"Ibom Mortgage Initiative" <${process.env.ZOHO_EMAIL}>`,
        to: user.email,
        subject: "Don't remember your password?",
        html: template({
          user,
          token,
          content: resetPasswordTemplate,
        })
      };

      const info = await transporter.sendMail(mailOptions);
      return {
        status: "success",
        messageId: info.messageId
      };
    } catch (error) {
      console.error("Error sending reset password email:", error);
      return {
        status: "failed",
        error: error.message
      };
    }
  }
};

module.exports = mailer;