const welcomeTemplate = {
  snippet: (user) =>
    ` <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Housing Application - Ibom Mortgage Bank</title>
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

    .heading {
      color: #030812;
      font-size: 14px;
      font-weight: 600;
    }
    
    .list-item {
      color: #475467;
      font-size: 14px;
      font-weight: 300;
      line-height: 19.6px;
    }

    .content-area {
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
    
    /* Footer Specific Styles */
    .footer {
        background-color: #f4f4f4;
        padding: 24px 27px;
        border-top: 1px solid #e0e0e0;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        text-align: center;
    }

    .footer-text {
      font-size: 12px;
      color: #475467;
      line-height: 18px;
    }

    .footer-link {
      color: #338330;
      text-decoration: none;
      font-weight: 500;
    }

    @media screen and (max-width: 600px) {
      .container {
        border-radius: 0;
      }
      .content-padding, .content-area, .footer {
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
               <td ">
                <!-- Replace this placeholder with your actual logo image URL -->
                <img class="logo-img"  src="https://res.cloudinary.com/fullstack-login-register/image/upload/v1749817364/Screenshot_2025-06-12_at_14.02.54-removebg-preview_2_cqfmfv.png" alt="Ibom Mortgage Bank Logo" />
              </td>
            </tr>
            
            <!-- Main Content Area -->
            <tr>
              <td>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="content-padding">
                      <span class="greeting">
                        Hi ${user.first_name} 👋,
                      </span>
                      <div style="margin-top: 14px;">
                        <p class="text-body">
                          Thank you for showing interest in our real estate platform and submitting your basic information. We're excited to help you find your ideal home!
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="content-area">
                      <div style="color: #030812; font-size: 14px; font-weight: 600">
                        Next Steps
                      </div>
                      <div style="margin-top: 16px;">
                        <p class="text-body">
                          To continue with your application process, we need to gather more detailed information. Please follow the link below to access your profile setup page, where you can provide additional details and preferences. Click the link 'Apply for Housing' to proceed.
                        </p>
                      </div>
                      <div style="margin-top: 40px;">
                        <a href="https://profiling.ibommortgagebank.com/home" style="color: #338330; text-decoration: none; font-weight: 500;">
                          Apply for Housing
                        </a>
                      </div>
                      <div style="margin-top: 40px;">
                        <p style="color: #030812; font-size: 14px; font-weight: 500; margin-bottom: 10px;">
                          What to Expect
                        </p>
                        <ol style="margin: 0; padding: 0 0 0 20px; color: #475467;">
                          <li style="margin-bottom: 10px; font-size: 14px; font-weight: 300;">
                            Personal Information: Provide details about yourself and your household.
                          </li>
                          <li style="margin-bottom: 10px; font-size: 14px; font-weight: 300;">
                            Financial Information: Share your financial background to help us find suitable housing options.
                          </li>
                          <li style="margin-bottom: 10px; font-size: 14px; font-weight: 300;">
                            Housing Preferences: Let us know your preferred locations, housing types, and other preferences.
                          </li>
                          <li style="font-size: 14px; font-weight: 300;">
                            Getting Started: Submit the form and await confirmation from our team.
                          </li>
                        </ol>
                      </div>
                      <div style="margin-top: 44px;">
                        <p class="text-body">
                          If you have any questions or need assistance, feel free to reach out to our support team at support@ibommortgage or call us at 1-800-123-4567.
                        </p>
                      </div>
                      <div style="margin-top: 16px;">
                        <p class="text-body">
                          Thank you again for your interest. We look forward to helping you find your perfect home!
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Footer Section -->
            <tr>
              <td class="footer">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" style="padding-bottom: 10px;">
                      <a href="#" style="text-decoration: none;"><img src="https://placehold.co/24x24/FFFFFF/338330?text=F" alt="Facebook" style="width: 24px; height: 24px; margin: 0 5px;" /></a>
                      <a href="#" style="text-decoration: none;"><img src="https://placehold.co/24x24/FFFFFF/338330?text=T" alt="Twitter" style="width: 24px; height: 24px; margin: 0 5px;" /></a>
                      <a href="#" style="text-decoration: none;"><img src="https://placehold.co/24x24/FFFFFF/338330?text=I" alt="Instagram" style="width: 24px; height: 24px; margin: 0 5px;" /></a>
                      <a href="#" style="text-decoration: none;"><img src="https://placehold.co/24x24/FFFFFF/338330?text=L" alt="LinkedIn" style="width: 24px; height: 24px; margin: 0 5px;" /></a>
                    </td>
                  </tr>
                  <tr>
                    <td class="footer-text">
                      <p>
                        This email was sent from Ibom Mortgage Bank.<br/>
                        &copy; 2024 Ibom Mortgage Bank. All rights reserved.
                      </p>
                      <p>
                        <a href="#" class="footer-link">Privacy Policy</a> |
                        <a href="#" class="footer-link">Terms of Service</a> |
                        <a href="#" class="footer-link">Unsubscribe</a>
                      </p>
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

module.exports = welcomeTemplate;
