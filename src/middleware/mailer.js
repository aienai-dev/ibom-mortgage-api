const nodemailer = require("nodemailer");
const welcomeTemplate = require("../common/emailTemplates/wecome.mail");
const createPasswordTemplate = require("../common/emailTemplates/created-password.mail");
const createAdminPasswordTemplate = require("../common/emailTemplates/new-admin-user");
const resetPasswordTemplate = require("../common/emailTemplates/reset-password.mail");
const receiptTemplate = require("../common/emailTemplates/receipt.mail");
const regTemplate = require("../common/emailTemplates/registration.mail");
const template = require("../common/emailTemplates/template");

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587, // SSL port
  secure: false, // true for 465, false for other ports
  auth: {
    user: "noreply@ibommortgagebank.com", // Your Zoho email address (e.g., info@ibommortgage.com)
    pass: "Housingmail@123", // Your Zoho email password or app-specific password
  },
  tls: {
    rejectUnauthorized: false, // Only for testing, remove in production
  },
});

// Verify SMTP connection on startup
transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

const mailer = {
  sendCreatePassword: async (user, token) => {
    try {
      const mailOptions = {
        from: `"Ibom Mortgage Initiative" <noreply@ibommortgagebank.com>`,
        to: user.email,
        subject: `Welcome ${user.first_name} 👋, Let's get you started!`,
        html: template({
          user,
          token,
          content: createPasswordTemplate,
        }),
      };

      const info = await transporter.sendMail(mailOptions);
      return {
        status: "success",
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending create password email:", error);
      return {
        status: "failed",
        error: error.message,
      };
    }
  },

  sendAdminCreatePassword: async (user, token) => {
    try {
      const mailOptions = {
        from: `"Admin Invite" <noreply@ibommortgagebank.com>`,
        to: user.email,
        subject: `Welcome ${user.first_name} 👋, Let's get you started!`,
        html: template({
          user,
          token,
          content: createAdminPasswordTemplate,
        }),
      };

      const info = await transporter.sendMail(mailOptions);
      return {
        status: "success",
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending create password email:", error);
      return {
        status: "failed",
        error: error.message,
      };
    }
  },

  sendWelcome: async (user) => {
    try {
      const mailOptions = {
        from: `"Ibom Mortgage Initiative" <noreply@ibommortgagebank.com>`,
        to: user.email,
        subject: "Thank You for Your Interest in Our Real Estate Platform!",
        html: template({
          user,
          token: "",
          content: welcomeTemplate,
        }),
      };

      const info = await transporter.sendMail(mailOptions);
      return {
        status: "success",
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return {
        status: "failed",
        error: error.message,
      };
    }
  },

  sendResetPassword: async (user, token) => {
    try {
      const mailOptions = {
        from: `"Ibom Mortgage Initiative" <noreply@ibommortgagebank.com>`,
        to: user.email,
        subject: "Don't remember your password?",
        html: template({
          user,
          token,
          content: resetPasswordTemplate,
        }),
      };

      const info = await transporter.sendMail(mailOptions);
      return {
        status: "success",
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending reset password email:", error);
      return {
        status: "failed",
        error: error.message,
      };
    }
  },
  sendReceiptEmail: async (user, details) => {
    try {
      const mailOptions = {
        from: `"Ibom Mortgage Initiative" <noreply@ibommortgagebank.com>`,
        to: user.email,
        subject: "Payment received",
        html: template({
          user,
          token: details,
          content: receiptTemplate,
        }),
      };

      const info = await transporter.sendMail(mailOptions);
      return {
        status: "success",
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending  receipt:", error);
      return {
        status: "failed",
        error: error.message,
      };
    }
  },
  sendRegistrationEmail: async (user) => {
    try {
      const mailOptions = {
        from: `"Ibom Mortgage Initiative" <noreply@ibommortgagebank.com>`,
        to: user.email,
        subject: "Registration Successful",
        html: template({
          user,
          token: "",
          content: regTemplate,
        }),
      };

      const info = await transporter.sendMail(mailOptions);
      return {
        status: "success",
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending  receipt:", error);
      return {
        status: "failed",
        error: error.message,
      };
    }
  },
};

module.exports = mailer;
