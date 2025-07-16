const resetPasswordTemplate = {
  snippet: (user, token) =>
    `
  <div style="margin: auto; padding: 0 3%">
      <div style="padding: 36px 27px 0 27px">
        <span style="color: #030812; font-size: 18px; font-weight: 800">
        Hi ${user.first_name} 👋,
        </span>
        <div
          style="
            margin-top: 14px;
            color: #475467;
            font-size: 14px;
            font-weight: 300;
            line-height: 19.6px;
          "
        >
          Don't remember your password?
        </div>
      </div>
      <div style="padding: 24px 27px">
        <div
          style="
            margin-top: 16px;
            color: #475467;
            font-size: 14px;
            font-weight: 300;
            line-height: 19.6px;
          "
        >
          Click please setup a new password.
        </div>
        <div style="margin-top: 40px">
          <a
            style="
              background-color: #338330;
              text-decoration: none;
              padding: 14px 24px;
              color: #fff;
              border-radius: 10px;
              margin-top: 40px;
            "
            href=https://ibom-mortgage-ui.fly.dev/reset-password/${token}"
          >
            Reset My Password
          </a>
        </div>
        <div
          style="
            margin-top: 44px;
            color: #475467;
            font-size: 14px;
            font-weight: 300;
            line-height: 19.6px;
          "
        >
          If you have any questions or need assistance, feel free to reach out
          to our support team at support@ibommortgage or call us at
          1-800-123-4567.
        </div>
        <div
          style="
            margin-top: 16px;
            color: #475467;
            font-size: 14px;
            font-weight: 300;
            line-height: 19.6px;
          "
        >
          Thank you again for your interest. We look forward to helping you find
          your perfect home!
        </div>
      </div>
    </div>
  `,
};

module.exports = resetPasswordTemplate;
