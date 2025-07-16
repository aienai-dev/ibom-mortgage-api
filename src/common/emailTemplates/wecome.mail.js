const welcomeTemplate = {
  snippet: (user) =>
    ` <div style="margin: auto; padding: 0 3%">
    <div style="padding: 36px 27px 0 27px; margin: auto">
      <span style="color: #030812; font-size: 18px; font-weight: 800">
        Hi ${user.first_name} 👋,
        <span
          style="
            width: 30px;
            height: 30px;
            background-image: url(https://res.cloudinary.com/fullstack-login-register/image/upload/v1723258544/Waving_Hand_Medium_Skin_Tone_1_bw7bq4.png);
          "
        ></span>
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
        Thank you for showing interest in our real estate platform and
        submitting your basic information. We're excited to help you find your
        ideal home!
      </div>
    </div>
    <div style="padding: 24px 27px">
      <div style="color: #030812; font-size: 14px; font-weight: 600">
        Next Steps
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
        To continue with your application process, we need to gather more
        detailed information. Please follow the link below to access your
        profile setup page, where you can provide additional details and
        preferences. Click the link ‘apply for housing’ to proceed
      </div>
      <div style="margin-top: 40px">
        Link:
        <a style="color: #338330" href="https://ibom-mortgage-ui.fly.dev/home">
          Apply for Housing
        </a>
      </div>
      <div style="margin-top: 40px; margin: auto">
        <div
          style="
            color: #030812;
            font-size: 14px;
            font-weight: 500;
            margin: 30px auto;
          "
        >
          What to Expect
        </div>
        <div>
          <ol>
            <li style="color: #475467; font-size: 14px; font-weight: 300">
              Personal Information: Provide details about yourself and your
              household.
            </li>
            <li style="color: #475467; font-size: 14px; font-weight: 300">
              Financial Information: Share your financial background to help
              us find suitable housing options.
            </li>
            <li style="color: #475467; font-size: 14px; font-weight: 300">
              Housing Preferences: Let us know your preferred locations,
              housing types, and other preferences.
            </li>
            <li style="color: #475467; font-size: 14px; font-weight: 300">
              Getting Started: Submit the form and await confirmation from our
              team.
            </li>
          </ol>
        </div>
      </div>
      <div
        style="
          margin-top: 44px;
          color: #475467;
          font-size: 14px;
          font-weight: 300;
          line-height: 19.6px;

          margin: auto;
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
  </div>`,
};

module.exports = welcomeTemplate;
