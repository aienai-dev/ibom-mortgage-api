const helper = require("../middleware/helper");
const Compliance = require("../models/compliance.model");
const User = require("../models/user.model");
const Payment = require("../models/payments.model");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const cloudinary = require("../middleware/cloudinary");
const axios = require("axios");
const mailer = require("../middleware/mailer");
const PaymentService = require("../services/gateway.service");

class UsersController {
  access_token = "";
  refresh_token = "";

  async createCompliance(req, res) {
    try {
      const { user_id } = req.params;
      const {
        personal_details,
        location_preference,
        customer_account_profile,
      } = req.body;

      if (!user_id) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `user_id is required`,
          })
        );
      }
      const fieldsToValidate = {
        personal_details,
        location_preference,
        customer_account_profile,
        ...personal_details,
        ...location_preference,
        ...customer_account_profile,
        ...(personal_details.address || {}),
        ...(personal_details.home_address || {}),
        ...(personal_details.user_identity || {}),
      };

      const hasEmptyFields = helper.fieldValidator(fieldsToValidate);
      if (hasEmptyFields.length > 0) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `${hasEmptyFields.join(", ")} ${
              hasEmptyFields.length > 1 ? "are" : "is"
            } required`,
          })
        );
      }

      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `User not found, contact support`,
          })
        );
      }

      const userCompliance = await Compliance.findOne({ user_id: user._id });
      if (userCompliance) {
        return res.status(405).json(
          helper.responseHandler({
            status: 405,
            error: `Compliance already exists`,
          })
        );
      }

      const newCompliance = new Compliance({
        user_id: user._id,
        personal_details,
        location_preference,
        customer_account_profile,
      });

      await newCompliance.save();
      await User.findByIdAndUpdate(
        user_id,
        { compliance_status: "pending_review" },
        { new: true }
      );

      await mailer.sendWelcome(user);

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            compliance: newCompliance,
          },
        })
      );
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  }

  async getComplianceByUserId(req, res) {
    try {
      const user_ = req.user;
      const user = await User.findById(user_._id);
      if (!user) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `User not found, contact support`,
          })
        );
      }

      const payment = user.payment_details;

      if (payment.status === "unpaid") {
        return res.status(200).json(
          // CORRECTED: Added res.status().json()
          helper.responseHandler({
            status: 200,
            data: {
              compliance: null,
              payment,
            },
          })
        );
      }

      const compliance = await Compliance.findOne({ user_id: user._id });
      if (!compliance) {
        return res.status(201).json(
          // CORRECTED: Added res.status().json()
          helper.responseHandler({
            status: 201,
            data: {},
          })
        );
      }

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            compliance: compliance,
          },
        })
      );
    } catch (err) {
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  }

  async getComplianceById(req, res) {
    try {
      const { user_id } = req.params;
      if (!user_id) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `user_id is required`,
          })
        );
      }

      const user_ = req.user;
      if (user_._id !== user_id) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: `Unauthorized access`,
          })
        );
      }
      const user = await User.findById(user_._id);
      if (!user) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `User not found, contact support`,
          })
        );
      }

      const compliance = await Compliance.findOne({ user_id: user._id });

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            compliance: compliance || null,
          },
        })
      );
    } catch (err) {
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  }

  async uploadImage(req, res) {
    try {
      const { compliance_id, doc_type } = req.params;
      if (
        !compliance_id ||
        (doc_type !== "identity" && doc_type !== "income")
      ) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Compliance ID and valid document type are required`,
          })
        );
      }

      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `User not found`,
          })
        );
      }

      const compliance = await Compliance.findOne({ _id: compliance_id });
      if (!compliance) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `Compliance not found`,
          })
        );
      }

      const files = req.files;
      if (!files || files.length < 1) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Files required`,
          })
        );
      }

      const newBlob = await cloudinary(
        files[0].path,
        files[0].originalname + Math.floor(Math.random() * 1000 + 1)
      );

      if (!newBlob) {
        return res.status(400).json({
          message: "Image not supported",
          status: 400,
        });
      }

      // Cleanup local file
      // files[0].path &&
      //   fs.unlink(files[0].path, (err) => {
      //     if (err) console.error("Error unlinking file:", err);
      //   });

      let updateField;
      if (doc_type === "identity") {
        updateField = {
          "personal_details.user_identity.identity_image": newBlob.secure_url,
        };
      } else {
        updateField = {
          "customer_account_profile.proof_of_income": newBlob.secure_url,
        };
      }

      await Compliance.findOneAndUpdate({ user_id: user._id }, updateField, {
        new: true,
      });

      return res.status(200).json({
        message: "success",
        data: {
          image: newBlob.secure_url,
        },
        status: 200,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  }

  async updateCompliance(req, res) {
    try {
      const { compliance_id, user_id } = req.params;
      const {
        personal_details,
        location_preference,
        customer_account_profile,
      } = req.body;

      if (!compliance_id || !user_id) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `compliance_id and user_id are required`,
          })
        );
      }

      if (req.user._id !== user_id) {
        // CORRECTED: Used req.user
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: `Unauthorized access`,
          })
        );
      }

      const fieldsToValidate = {
        personal_details,
        location_preference,
        customer_account_profile,
        ...personal_details,
        ...location_preference,
        ...customer_account_profile,
        ...(personal_details.address || {}),
        ...(personal_details.home_address || {}),
        ...(personal_details.user_identity || {}),
      };

      const hasEmptyFields = helper.fieldValidator(fieldsToValidate);
      if (hasEmptyFields.length > 0) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `${hasEmptyFields.join(", ")} ${
              hasEmptyFields.length > 1 ? "are" : "is"
            } required`,
          })
        );
      }

      const compliance = await Compliance.findByIdAndUpdate(
        compliance_id,
        { personal_details, location_preference, customer_account_profile },
        { new: true }
      );

      if (!compliance) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `No compliance found`,
          })
        );
      }

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            compliance: compliance,
          },
        })
      );
    } catch (err) {
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  }

  async initiatePayment(req, res) {
    try {
      // const service = PaymentService.getSafeHavenVirtualAccount();
      const user = await User.findById(req.user._id);

      const service = await PaymentService.generateWemaVirtualAccount(user);

      if (service.error) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Error: ${service.error}`,
          })
        );
      }

      const virtualAccount = service.data;

      console.log("Account generated", virtualAccount.id);

      let existingPayment = await Payment.findOne({ user: user._id });

      if (existingPayment) {
        if (existingPayment.status === "Completed") {
          await User.findByIdAndUpdate(req.user._id, {
            payment_details: {
              status: "paid",
              date: existingPayment.createdAt,
              payment_id: existingPayment._id,
            },
          });
          return res.status(200).json(
            helper.responseHandler({
              status: 200,
              data: {
                message: "Payment Received",
                payment_details: {
                  status: "paid",
                  date: existingPayment.createdAt,
                  payment_id: existingPayment._id,
                },
              },
            })
          );
        }
        await Payment.findByIdAndUpdate(
          existingPayment._id,
          {
            account_id: virtualAccount.id,
            reference: "",
            transaction_id: virtualAccount.transactionId,
            metadata: { ...virtualAccount },
          },
          { new: true }
        );
      } else {
        let newPayment = new Payment({
          user: user._id,
          status: "Initiated",
          amount: 20000,
          account_id: virtualAccount.id,
          reference: "",
          transaction_id: virtualAccount.transactionId,
          metadata: { ...virtualAccount },
        });

        await newPayment.save();
      }

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            accountNumber: virtualAccount.virtualBankAccountNumber,
            accountName: "Ibom Mortgage Bank LTD",
            currencyCode: "NGN",
            bankName: "WEMA BANK",
            amount: 20000,
          },
        })
      );
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  }

  async verifyPayment(req, res) {
    try {
      const { type, data } = req.body;

      console.log("Received webhook:", { type, data });

      if (type !== "virtualAccount.transfer") {
        console.warn(`Received unsupported webhook type: ${type}`);
        return res.status(400).json({ message: "Unsupported webhook type" });
      }
      let account_id = data.virtualAccount;

      const payment = await Payment.findOne({
        account_id: account_id,
      }).populate("user");

      if (!payment) {
        console.error(
          `Payment not found for virtual account ID: ${data.virtualAccount}`
        );
        return res.status(404).json({ message: "Payment not found" });
      }

      if (data.status === "Completed") {
        if (data.amount !== payment.amount) {
          console.error(
            `Amount mismatch. Expected: ${payment.amount}, Received: ${data.amount}`
          );
          return res.status(400).json({ message: "Amount mismatch" });
        }

        await Payment.findByIdAndUpdate(
          payment._id,
          {
            status: "Completed",
            reference: data.paymentReference,
            transaction_id: data.sessionId,
            metadata: data,
          },
          { new: true }
        );

        await User.findByIdAndUpdate(
          payment.user._id,
          {
            payment_details: {
              status: "paid",
              date: payment.createdAt,
              payment_id: payment._id,
            },
          },
          { new: true }
        );

        await mailer.sendReceiptEmail(payment.user, data);
        console.log(
          `Payment for account ${data.virtualAccount} successfully completed.`
        );
        return res
          .status(200)
          .json({ message: "Payment updated successfully" });
      } else {
        // Handle other statuses like 'Declined' or 'Reversed'
        console.warn(
          `Payment status is not 'Completed' for account: ${data.virtualAccount}`
        );
        // You might want to update the status to 'Failed' or 'Declined'
        return res
          .status(200)
          .json({ message: "Payment status not completed" });
      }
    } catch (err) {}
  }

  validateUserPayment = async (req, res) => {
    try {
      const payment = await Payment.findOne({ user: req.user._id });

      if (!payment) {
        return res
          .status(404)
          .json(
            helper.responseHandler({ status: 404, error: err.message || err })
          );
      }

      if (payment.status === "Completed") {
        await User.findByIdAndUpdate(req.user._id, {
          payment_details: {
            status: "paid",
            date: payment.createdAt,
            payment_id: payment._id,
          },
        });
        return res.status(200).json(
          helper.responseHandler({
            status: 200,
            data: {
              message: "Payment Received",
            },
          })
        );
      }

      const virtualPayment =
        await PaymentService.validateWemaVirtualAccountTransaction(
          payment.transaction_id,
          payment.metadata.virtualBankAccountNumber
        );

      if (virtualPayment.status !== "completed") {
        return res.status(200).json(
          helper.responseHandler({
            status: 200,
            data: {
              message: "Payment Pending",
            },
          })
        );
      }

      await User.findByIdAndUpdate(req.user._id, {
        payment_details: {
          status: "paid",
          date: payment.updatedAt,
          payment_id: payment._id,
        },
      });

      await Payment.findByIdAndUpdate(payment._id, {
        status: "Completed",
        reference: virtualPayment.sessionId,
        transaction_id: virtualPayment.transactionId,
        metadata: virtualPayment,
      });

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            message: "Payment Received",
            payment_details: {
              status: "paid",
              date: payment.updatedAt,
              payment_id: payment._id,
            },
          },
        })
      );
    } catch (err) {
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  };
}

module.exports = new UsersController();
