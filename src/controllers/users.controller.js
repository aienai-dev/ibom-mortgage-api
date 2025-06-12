const helper = require("../middleware/helper");
const Compliance = require("../models/compliance.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// var mailer = require("../Middlewares/nodemailer");
const fs = require("fs");
const cloudinary = require("../middleware/cloudinary");
// const { Resend } = require("resend");

// const resend = new Resend("re_123456789");

const usersController = {
  createCompliance: async (req, res) => {
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
      let token = req.headers["x-access-token"] || req.headers["authorization"];
      // console.log(token, token);
      const user_ = jwt.verify(token.slice(7), process.env.ACCESS_TOKEN_SECRET);
      if (user_._id !== user_id) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: ``,
          })
        );
      }
      const hasEmptyPrimaryFields = helper.fieldValidator({
        personal_details,
        location_preference,
        customer_account_profile,
      });

      if (hasEmptyPrimaryFields.length > 0)
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `${hasEmptyPrimaryFields.join()} ${
              hasEmptyPrimaryFields.length > 0 ? "are" : "is"
            } required`,
          })
        );
      const {
        date_of_birth,
        marital_status,
        address,
        home_address,
        user_identity,
      } = personal_details;

      const {
        preferred_state,
        preferred_city,
        type_of_housing,
        no_of_bedrooms,
        housing_purpose,
        budget,
      } = location_preference;
      // console.log(no_of_bedrooms);
      const {
        employment_status,
        occupation,
        monthly_income,
        source_of_income,
        loans_and_mortgage,
        proof_of_income,
      } = customer_account_profile;

      const hasEmptySecondaryFields = helper.fieldValidator({
        date_of_birth,
        marital_status,
        address,
        home_address,
        user_identity,
        preferred_state,
        preferred_city,
        type_of_housing,
        no_of_bedrooms,
        housing_purpose,
        budget,
        employment_status,
        occupation,
        monthly_income,
        source_of_income,
        loans_and_mortgage,
        proof_of_income,
      });
      if (hasEmptySecondaryFields.length > 0)
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `${hasEmptySecondaryFields.join()} ${
              hasEmptySecondaryFields.length > 0 ? "are" : "is"
            } required`,
          })
        );

      const { state, city, street } = address;
      const { state_of_origin, lga } = home_address;
      const {
        identity_type,
        // identity_status,
        identity_number,
        identity_image,
      } = user_identity;

      const { out_standing, loan_type, loan_amount } = loans_and_mortgage;

      const hasEmptyFields = helper.fieldValidator({
        state,
        city,
        street,
        state_of_origin,
        lga,
        identity_type,
        // identity_status,
        identity_number,
        identity_image,
        // out_standing,
        // loan_type,
        // loan_amount,
      });

      if (hasEmptyFields.length > 0)
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `${hasEmptyFields.join()} ${
              hasEmptyFields.length > 0 ? "are" : "is"
            } required`,
          })
        );

      const user = await User.findById({ _id: user_id });
      // console.log(user);
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
            error: `Compliance already exist`,
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
        { _id: user_id },
        { compliance_status: "pending_review" },
        { new: true }
      );

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            compliance: newCompliance,
          },
        })
      );
      // preferred_area, customer_preference_feedback
    } catch (err) {
      console.log("error");
      console.log(err);
      return res
        .status(500)
        .json(helper.responseHandler({ status: 500, error: err }));
    }
  },
  getComplianceByUserId: async (req, res) => {
    try {
      let token = req.headers["x-access-token"] || req.headers["authorization"];
      const user_ = jwt.verify(token.slice(7), process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById({ _id: user_._id });
      if (!user) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `User not found, contact support`,
          })
        );
      }
      const compliance = await Compliance.findOne({ user_id: user._id });
      if (!compliance) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `No compliance for this user`,
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
        .json(helper.responseHandler({ status: 500, error: err }));
    }
  },
  getComplianceById: async (req, res) => {
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
      let token = req.headers["x-access-token"] || req.headers["authorization"];
      const user_ = jwt.verify(token.slice(7), process.env.ACCESS_TOKEN_SECRET);
      if (user_._id !== user_id) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: ``,
          })
        );
      }
      const user = await User.findById({ _id: user_._id });
      if (!user) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `User not found, contact support`,
          })
        );
      }
      const compliance = await Compliance.findOne({ user_id: user._id });
      if (!compliance) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `No compliance for this user`,
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
        .json(helper.responseHandler({ status: 500, error: err }));
    }
  },
  uploadImage: async (req, res) => {
    try {
      const { compliance_id, doc_type } = req.params;
      if (!compliance_id) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Compliance Id is required`,
          })
        );
      }
      if (!doc_type && doc_type !== "identity" && doc_type !== "income") {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `document type is required`,
          })
        );
      }
      let token = req.headers["x-access-token"] || req.headers["authorization"];
      const user_ = jwt.verify(token.slice(7), process.env.ACCESS_TOKEN_SECRET);
      console.log(user_);
      const user = await User.findOne({ email: user_.email });
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
          message: "image not supported",
          status: 400,
        });
      }
      files[0].path &&
        fs.unlink(files[0].path, (err) => {
          if (err) return;
        });

      doc_type === "identity"
        ? await Compliance.findOneAndUpdate(
            { user_id: user._id },
            {
              personal_details: {
                ...compliance.personal_details,
                user_identity: {
                  ...compliance.personal_details.user_identity,
                  identity_image: newBlob.secure_url,
                },
              },
            },
            { new: true }
          )
        : await Compliance.findOneAndUpdate(
            { user_id: user._id },
            {
              customer_account_profile: {
                ...compliance.customer_account_profile,
                proof_of_income: newBlob.secure_url,
              },
            },
            { new: true }
          );

      return res.status(200).json({
        message: "success",
        data: {
          image: newBlob.secure_url,
        },
        status: 200,
      });
    } catch (err) {
      console.log("error");
      console.log(err);
      return res
        .status(500)
        .json(helper.responseHandler({ status: 500, error: err }));
    }
  },
  updateCompliance: async (req, res) => {
    try {
      let token = req.headers["x-access-token"] || req.headers["authorization"];
      const user_ = jwt.verify(token.slice(7), process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById({ _id: user_._id });
      if (!user) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `User not found, contact support`,
          })
        );
      }
      const { compliance_id, user_id } = req.params;

      const hasEmptyParams = helper.fieldValidator({
        compliance_id, user_id
      });

      if (hasEmptyParams.length > 0)
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `${hasEmptyPrimaryFields.join()} ${
              hasEmptyPrimaryFields.length > 0 ? "are" : "is"
            } required`,
          })
        );

      if (!user_._id || user_._id !== user_id) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: ``,
          })
        );
      }

      const {
        personal_details,
        location_preference,
        customer_account_profile,
      } = req.body;

      const hasEmptyPrimaryFields = helper.fieldValidator({
        personal_details,
        location_preference,
        customer_account_profile,
      });

      if (hasEmptyPrimaryFields.length > 0)
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `${hasEmptyPrimaryFields.join()} ${
              hasEmptyPrimaryFields.length > 0 ? "are" : "is"
            } required`,
          })
        );
      const {
        date_of_birth,
        marital_status,
        address,
        home_address,
        user_identity,
      } = personal_details;

      const {
        preferred_state,
        preferred_city,
        type_of_housing,
        no_of_bedrooms,
        housing_purpose,
        budget,
      } = location_preference;
      // console.log(no_of_bedrooms);
      const {
        employment_status,
        occupation,
        monthly_income,
        source_of_income,
        loans_and_mortgage,
        proof_of_income,
      } = customer_account_profile;

      const hasEmptySecondaryFields = helper.fieldValidator({
        date_of_birth,
        marital_status,
        address,
        home_address,
        user_identity,
        preferred_state,
        preferred_city,
        type_of_housing,
        no_of_bedrooms,
        housing_purpose,
        budget,
        employment_status,
        occupation,
        monthly_income,
        source_of_income,
        loans_and_mortgage,
        proof_of_income,
      });
      if (hasEmptySecondaryFields.length > 0)
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `${hasEmptySecondaryFields.join()} ${
              hasEmptySecondaryFields.length > 0 ? "are" : "is"
            } required`,
          })
        );

      const { state, city, street } = address;
      const { state_of_origin, lga } = home_address;
      const {
        identity_type,
        // identity_status,
        identity_number,
        identity_image,
      } = user_identity;

      const { out_standing, loan_type, loan_amount } = loans_and_mortgage;

      const hasEmptyFields = helper.fieldValidator({
        state,
        city,
        street,
        state_of_origin,
        lga,
        identity_type,
        // identity_status,
        identity_number,
        identity_image,
        // out_standing,
        // loan_type,
        // loan_amount,
      });

      if (hasEmptyFields.length > 0)
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `${hasEmptyFields.join()} ${
              hasEmptyFields.length > 0 ? "are" : "is"
            } required`,
          })
        );

      const compliance = await Compliance.findByIdAndUpdate(
        { _id: compliance_id },
        { personal_details, location_preference, customer_account_profile },
        { new: true }
      );
      if (!compliance) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `No compliance for this user`,
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
        .json(helper.responseHandler({ status: 500, error: err }));
    }
  },
};

module.exports = usersController;
