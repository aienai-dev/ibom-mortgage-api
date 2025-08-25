const moment = require("moment");
const receiptTemplate = {
  snippet: (user, details) =>
    `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Confirmation - Ibom Mortgage Bank</title>
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
    
    .receipt-container {
        padding: 27px;
        background-color: #f9f9f9;
        border-radius: 8px;
        margin-top: 20px;
    }

    .receipt-title {
        color: #030812;
        font-size: 16px;
        font-weight: 800;
        text-align: center;
        margin-bottom: 20px;
    }

    .receipt-item {
        color: #475467;
        font-size: 14px;
        font-weight: 400;
        line-height: 1.5;
    }
    
    .receipt-label {
        color: #475467;
        font-weight: 600;
        text-align: left;
    }
    
    .receipt-value {
        text-align: right;
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
                          We're excited to welcome you to the Ibom Mortgage Bank platform! Your payment of NGN 20,000 has been successfully received, and you can now begin your application process.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Payment Receipt Section -->
                  <tr>
                    <td style="padding: 0 27px;">
                      <div class="receipt-container">
                        <h3 class="receipt-title">Payment Receipt</h3>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="receipt-table">
                          <tr>
                            <td class="receipt-item receipt-label">Amount Paid:</td>
                            <td class="receipt-item receipt-value">NGN 20,000</td>
                          </tr>
                          <tr>
                            <td class="receipt-item receipt-label">Date:</td>
                            <td class="receipt-item receipt-value">${
                              moment(details?.createdAt).format("LLLL") || ""
                            }</td>
                          </tr>
                          <tr>
                            <td class="receipt-item receipt-label">Payment Reference:</td>
                            <td class="receipt-item receipt-value">${
                              details?.paymentReference || ""
                            }</td>
                          </tr>
                          <tr>
                            <td class="receipt-item receipt-label">Session ID:</td>
                            <td class="receipt-item receipt-value">${
                              details?.sessionId || ""
                            }</td>
                          </tr>
                          <tr>
                            <td class="receipt-item receipt-label">Account Number:</td>
                            <td class="receipt-item receipt-value">${
                              details?.debitAccountNumber || ""
                            }</td>
                          </tr>
                          <tr>
                            <td class="receipt-item receipt-label">Narration:</td>
                            <td class="receipt-item receipt-value">${
                              details?.narration || ""
                            }</td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                  
                  <tr>
                    <td class="footer">
                      <span class="next-steps-title">
                        Next Steps
                      </span>
                      <div style="margin-top: 16px;">
                        <p class="text-body">
                          You are now fully registered and can log in to your dashboard to complete your application. Click the button below to get started!
                        </p>
                      </div>
                      <div class="button-container">
                        <a href="https://profiling.ibommortgagebank.com/login" class="button" style="color: #fff !important;">
                         View My Dashboard
                        </a>
                      </div>
                      <div style="margin-top: 44px;">
                        <p class="text-body">
                          If you have any questions or need assistance, feel free to reach out to our support team at info@ibommortgagebank.com or call us at +234 908 897 8002.
                        </p>
                      </div>
                      <div style="margin-top: 16px;">
                        <p class="text-body">
                          Thank you for choosing Ibom Mortgage Bank. We look forward to serving you!
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer Image -->
            <tr>
              <td>
                 <img class="footer-image" src="https://res.cloudinary.com/fullstack-login-register/image/upload/v1723255584/Screenshot_2024-06-25_at_15.30.48_1_1_chlgqr.png" alt="Connect with us via our Social Media" />
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

module.exports = receiptTemplate;
