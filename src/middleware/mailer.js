// const mail = require("resend");
const welcomeTemplate = require("../common/emailTemplates/wecome.mail");
const createPasswordTemplate = require("../common/emailTemplates/created-password.mail");
const resetPasswordTemplate = require("../common/emailTemplates/reset-password.mail");
var brevo = require("sib-api-v3-sdk");
const template = require("../common/emailTemplates/template");
var defaultClient = brevo.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new brevo.TransactionalEmailsApi();

const sendSmtpEmail = new brevo.SendSmtpEmail({});

const mailer = {
  sendCreatePassword: async (user, token) => {
    sendSmtpEmail.sender = {
      email: "hello@fhaestates.com",
      name: "Vimo from AIENAI",
    };
    sendSmtpEmail.subject = `Welcome ${user.first_name} 👋 , Let's get you started! `;
    sendSmtpEmail.to = [
      { email: user.email, name: user.first_name + " " + user.last_name },
    ];
    sendSmtpEmail.htmlContent = template({
      user,
      token,
      content: createPasswordTemplate,
    });

    const res = await apiInstance.sendTransacEmail(sendSmtpEmail);
    if (res.messageId) return { status: "success" };
    else return { status: "failed" };
  },
  sendWelcome: async (user, token) => {
    sendSmtpEmail.sender = {
      email: "hello@fhaestates.com",
      name: "Welcome To FHA Estates",
    };
    sendSmtpEmail.subject = `Thank You for Your Interest in Our Real Estate Platform!`;
    sendSmtpEmail.to = [
      { email: user.email, name: user.first_name + " " + user.last_name },
    ];
    sendSmtpEmail.htmlContent = template({
      user,
      token,
      content: welcomeTemplate,
    });

    const res = await apiInstance.sendTransacEmail(sendSmtpEmail);
    if (res.messageId) return { status: "success" };
    else return { status: "failed" };
  },
  sendResetPassword: async (user, token) => {
    sendSmtpEmail.sender = {
      email: "hello@fhaestates.com",
      name: "Welcome To FHA Estates",
    };
    sendSmtpEmail.subject = `Dont remember your password?`;
    sendSmtpEmail.to = [
      { email: user.email, name: user.first_name + " " + user.last_name },
    ];
    sendSmtpEmail.htmlContent = template({
      user,
      token,
      content: resetPasswordTemplate,
    });

    const res = await apiInstance.sendTransacEmail(sendSmtpEmail);
    if (res.messageId) return { status: "success" };
    else return { status: "failed" };
  },
  // test: async () => {

  // },
};

module.exports = mailer;
