const resetPasswordTemplate = {
  snippet: (user, token) => `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset - Ibom Mortgage Bank</title>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }

    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    td {
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .content-padding {
      padding: 36px 27px 0 27px;
    }

    .greeting {
      color: #030812;
      font-size: 18px;
      font-weight: 800;
    }

    .text-body {
      color: #475467;
      font-size: 14px;
      font-weight: 300;
      line-height: 19.6px;
    }
    
    .next-steps-title {
      color: #030812;
      font-size: 14px;
      font-weight: 600;
    }
    
    .button-container {
      margin-top: 40px;
    }

    .button {
      display: inline-block;
      background-color: #338330;
      color: #ffffff !important;
      padding: 14px 24px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: bold;
    }

    .footer {
      padding: 24px 27px;
    }

    /* Logo Specific Styles */
    .logo-container {
        padding: 20px 0;
        text-align: center;
        border-bottom: 1px solid #e0e0e0;
    }

    .logo-img {
        max-width: 150px;
        height: auto;
    }
    
    .footer-image-container {
      padding-top: 44px;
    }
    
    .footer-image {
        width: 100%;
        height: auto;
        display: block;
        max-width: 600px;
    }

    @media screen and (max-width: 600px) {
      .container {
        border-radius: 0;
      }
      .content-padding, .footer {
        padding: 20px 15px;
      }
    }
  </style>
</head>
<body>
  <center>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding: 20px;">
      <tr>
        <td align="center">
          <table class="container" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <!-- Logo Header Section -->
            <tr>
              <td>
                <img class="logo-img" src="https://res.cloudinary.com/fullstack-login-register/image/upload/v1749817364/Screenshot_2025-06-12_at_14.02.54-removebg-preview_2_cqfmfv.png" alt="Ibom Mortgage Bank Logo" />
              </td>
            </tr>
            
            <!-- Main Content Area -->
            <tr>
              <td>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="content-padding">
                      <span class="greeting">
                        Hello ${user.first_name} 👋,
                      </span>
                      <div style="margin-top: 14px;">
                        <p class="text-body">
                          We received a request to reset the password for your account. If you did not make this request, you can safely ignore this email.
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="footer">
                      <div style="margin-top: 16px;">
                        <p class="text-body">
                          To reset your password, please click the button below. This link is only valid for 1 hour.
                        </p>
                      </div>
                      <div class="button-container">
                        <a href="https://console.ibommortgagebank.com/reset-password/${token}" class="button" style="color: #fff !important;">
                          Reset My Password
                        </a>
                      </div>
                      <div style="margin-top: 44px;">
                        <p class="text-body">
                          If you have any questions or need assistance, feel free to reach out to our support team at info@ibommortgagebank.com or call us at +234 908 897 8002.
                        </p>
                      </div>
                     
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
         
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
`,
};

module.exports = resetPasswordTemplate;
