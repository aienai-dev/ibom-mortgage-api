const axios = require("axios");
const Payment = require("../models/payments.model");

const safehaven_baseUrl = process.env.SAFEHAVEN_BASE_URL;
const clientAssertion = process.env.SAFEHAVEN_CLIENT_ASSERTION;
const assertionType = process.env.SAFEHAVEN_ASSERTION_TYPE;
const safehaven_clientId = process.env.SAFEHAVEN_CLIENT_ID;

const wema_base_url = process.env.WEMA_BASE_URL + "bank-transfer/api/v1";
const wema_business_id = process.env.WEMA_BUSINESS_ID;
const wema_api_key = process.env.WEMA_API_KEY;
const wema_api_key_2 = process.env.WEMA_API_KEY_2;

const GatewayService = {
  generateSafehavenAccessToken: async () => {
    try {
      const res = await axios.post(`${safehaven_baseUrl}/oauth2/token`, {
        grant_type: "client_credentials",
        client_assertion_type: assertionType,
        client_assertion: clientAssertion,
        client_id: safehaven_clientId,
      });
      return res.data;
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      return {};
    }
  },

  getSafeHavenVirtualAccount: async () => {
    try {
      const accessToken = await PaymentService.generateSafehavenAccessToken();

      if (!accessToken) {
        return { error: "Failed to generate access token" };
      }
      const res = await axios.post(
        `${safehaven_baseUrl}/virtual-accounts`,
        {
          validFor: 900,
          settlementAccount: {
            bankCode: "999240",
            accountNumber: "0113976036",
          },
          amountControl: "Fixed",
          amount: 20000,
          callbackUrl: "https://ibom-mortgage-api.fly.dev/users/verify-payment",
        },
        {
          headers: {
            Authorization: "Bearer " + accessToken.access_token,
            "Content-Type": "application/json",
            ClientID: safehaven_clientId,
          },
        }
      );
      return res.data;
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      return {};
    }
  },

  generateWemaVirtualAccount: async (customer) => {
    try {
      const res = await axios.post(
        `${wema_base_url}/bankTransfer/virtualAccount`,
        {
          businessId: wema_business_id,
          businessName: "Ibom Mortgage Bank",
          amount: 20000,
          currency: "NGN",
          orderId: "45",
          description: "Renewed hopes application fee by Ibom Mortgage Bank",
          channel: "3",
          customer: {
            email: customer.email,
            phone: customer.phone_number,
            firstName: customer.first_name,
            lastName: customer.last_name,
            metadata: customer._id,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": wema_api_key,
          },
        }
      );
      return res.data;
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      return {
        error: err.response ? err.response.data : err.message,
      };
    }
  },

  validateWemaVirtualAccountTransaction: async (id, accountNumber) => {
    try {
      const res = await axios.get(
        `${wema_base_url}/bankTransfer/transactions/${id}`,
        { accountnumber: accountNumber },
        {
          headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": wema_api_key,
          },
        }
      );
      return res.data;
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      return {};
    }
  },
};

module.exports = GatewayService;
