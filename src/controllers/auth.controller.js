const helper = require("../middleware/helper");
const User = require("../models/user.model");
// const Compliance = require("../models/compliance.model");
const Admin = require("../models/admin.model");
const Payment = require("../models/payments.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailer = require("../middleware/mailer");

class AuthController {
  async registerPersonalDetails(req, res) {
    try {
      const { user } = req.body;
      if (!user) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `User data is required`,
          })
        );
      }

      const fieldsToValidate = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        gender: user.gender,
        age_range: user.age_range,
        employment_status: user.employment_status,
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

      if (!helper.validateEmail(user.email)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Email is not valid`,
          })
        );
      }

      if (!helper.validatePhoneNumber(user.phone_number)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Phone number is not valid`,
          })
        );
      }

      if (
        user.whatsapp_number &&
        !helper.validatePhoneNumber(user.whatsapp_number)
      ) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Whatsapp number is not valid`,
          })
        );
      }

      // Check for existing users
      const emailUser = await User.findOne({ email: user.email });
      if (emailUser) {
        return res.status(405).json(
          helper.responseHandler({
            status: 405,
            error: `User already exists`,
          })
        );
      }

      const phoneUser = await User.findOne({ phone_number: user.phone_number });
      if (phoneUser) {
        return res.status(405).json(
          helper.responseHandler({
            status: 405,
            error: `Phone number already taken`,
          })
        );
      }

      if (user.whatsapp_number) {
        const whatsappUser = await User.findOne({
          whatsapp_number: user.whatsapp_number,
        });
        if (whatsappUser) {
          return res.status(405).json(
            helper.responseHandler({
              status: 405,
              error: `Whatsapp number already taken`,
            })
          );
        }
      }

      const newUser = new User({ ...user, referral: user.referral || null });

      const registration_token = jwt.sign(
        { email: newUser.email },
        process.env.REGISTRATION_TOKEN_SECRET
      );

      const mail = await mailer.sendCreatePassword(user, registration_token);
      if (!mail || mail.status === "failed") {
        return res.status(412).json(
          helper.responseHandler({
            status: 412,
            error: `Failed to send email`,
          })
        );
      }

      await newUser.save();

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            user: newUser,
            // reg_token: registration_token,
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

  async createPassword(req, res) {
    try {
      const { auth } = req.body;
      if (!auth) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `User data is required`,
          })
        );
      }

      const hasEmptyFields = helper.fieldValidator({
        password: auth.password,
        confirm_password: auth.confirm_password,
        reg_token: auth.reg_token,
      });

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

      const user = jwt.verify(
        auth.reg_token,
        process.env.REGISTRATION_TOKEN_SECRET
      );

      console.log(user);

      if (!user) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: "Contact support",
          })
        );
      }

      if (auth.password !== auth.confirm_password) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Passwords do not match",
          })
        );
      }
      console.log(user);
      const dbUser = await User.findOne({ email: user.email });
      // console.log();
      if (!dbUser) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Account not found, contact support",
          })
        );
      }

      if (dbUser.account_status === "verified") {
        return res.status(405).json(
          helper.responseHandler({
            status: 405,
            error: "User already verified, contact support or reset password",
          })
        );
      }

      const hashedPassword = await bcrypt.hash(auth.password, 12);

      const newUserData = await User.findOneAndUpdate(
        { email: user.email },
        { password: hashedPassword, account_status: "verified" },
        { new: true }
      );

      const data = newUserData.toObject();
      delete data.password;
      const access_token = jwt.sign(
        { _id: data._id, email: data.email },
        process.env.ACCESS_TOKEN_SECRET
      );

      const mail = await mailer.sendRegistrationEmail(data, access_token);
      if (mail && mail.status === "failed") {
        return res.status(412).json(
          helper.responseHandler({
            status: 412,
            error: `Failed to send email`,
          })
        );
      }

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            user: {
              _id: data._id,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              phone_number: data.phone_number,
              age_range: data.age_range,
              gender: data.gender,
              employment_status: data.employment_status,
              user_type: data.user_type,
              account_status: data.account_status,
              compliance_status: data.compliance_status,
              image: data.image,
              created_at: data.createdAt,
              updated_at: data.updatedAt,
            },
            access_token: access_token,
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

  async createAdminPassword(req, res) {
    try {
      const { auth } = req.body;
      if (!auth) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `User data is required`,
          })
        );
      }

      const hasEmptyFields = helper.fieldValidator({
        password: auth.password,
        confirm_password: auth.confirm_password,
        reg_token: auth.reg_token,
      });

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

      const user = jwt.verify(
        auth.reg_token,
        process.env.ADMIN_REGISTRATION_TOKEN_SECRET
      );

      console.log(user);

      if (!user) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: "Contact support",
          })
        );
      }

      if (auth.password !== auth.confirm_password) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Passwords do not match",
          })
        );
      }
      console.log(user);
      const dbUser = await Admin.findOne({ email: user.email });
      // console.log();
      if (!dbUser) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Account not found, contact support",
          })
        );
      }

      if (dbUser.status === "verified") {
        return res.status(405).json(
          helper.responseHandler({
            status: 405,
            error: "User already verified, contact support or reset password",
          })
        );
      }

      const hashedPassword = await bcrypt.hash(auth.password, 12);

      const newUserData = await Admin.findOneAndUpdate(
        { email: user.email },
        { password: hashedPassword, status: "verified" },
        { new: true }
      );

      const data = newUserData.toObject();
      delete data.password;
      const access_token = jwt.sign(
        { _id: data._id, email: data.email },
        process.env.ADMIN_ACCESS_TOKEN_SECRET
      );

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            user: {
              _id: data._id,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              role: data.role,
              status: data.status,
            },
            access_token: access_token,
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

  async forgotPassword(req, res) {
    try {
      const { auth } = req.body;
      if (!auth) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `User data is required`,
          })
        );
      }

      const hasEmptyFields = helper.fieldValidator({ email: auth.email });
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

      if (!helper.validateEmail(auth.email)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Email is not valid`,
          })
        );
      }

      let dbUser;

      if (auth.role && auth.role === "admin")
        dbUser = await Admin.findOne({ email: auth.email });
      else dbUser = await User.findOne({ email: auth.email });

      if (!dbUser) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Account not found, contact support",
          })
        );
      }
      let env =
        auth.role && auth.role === "admin"
          ? process.env.ADMIN_RESET_TOKEN_SECRET
          : process.env.RESET_TOKEN_SECRET;

      const reset_token = jwt.sign({ email: dbUser.email }, env, {
        expiresIn: "1h",
      });

      const mail = await mailer.sendResetPassword(dbUser, reset_token);
      if (mail && mail.status === "failed") {
        return res.status(412).json(
          helper.responseHandler({
            status: 412,
            error: `Failed to send email`,
          })
        );
      }

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            reset_token: reset_token,
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

  async resetPassword(req, res) {
    try {
      const { auth } = req.body;
      if (!auth) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `User data is required`,
          })
        );
      }

      const hasEmptyFields = helper.fieldValidator({
        password: auth.password,
        confirm_password: auth.confirm_password,
        reset_token: auth.reset_token,
      });

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
      let user;
      if (auth.role && auth.role === "admin")
        user = jwt.verify(
          auth.reset_token,
          process.env.ADMIN_RESET_TOKEN_SECRET
        );
      else user = jwt.verify(auth.reset_token, process.env.RESET_TOKEN_SECRET);

      if (!user) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: "Invalid or expired token",
          })
        );
      }

      if (auth.password !== auth.confirm_password) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Passwords do not match",
          })
        );
      }
      let dbUser;
      if (auth.role && auth.role === "admin")
        dbUser = await Admin.findOne({ email: user.email });
      else dbUser = await User.findOne({ email: user.email });

      if (!dbUser) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Account not found, contact support",
          })
        );
      }

      const hashedPassword = await bcrypt.hash(auth.password, 12);
      let newUserData;
      if (auth.role && auth.role === "admin")
        newUserData = await Admin.findOneAndUpdate(
          { email: user.email },
          { password: hashedPassword, status: "verified" },
          { new: true }
        );
      else
        newUserData = await User.findOneAndUpdate(
          { email: user.email },
          { password: hashedPassword, account_status: "verified" },
          { new: true }
        );

      const data = newUserData.toObject();
      delete data.password;
      const access_token = jwt.sign(
        { _id: data._id, email: data.email },
        auth.role && auth.role === "admin"
          ? process.env.ADMIN_ACCESS_TOKEN_SECRET
          : process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      let obj =
        auth.role && auth.role === "admin"
          ? {
              _id: data._id,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              role: data.role,
              status: data.status,
            }
          : {
              _id: data._id,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              phone_number: data.phone_number,
              age_range: data.age_range,
              gender: data.gender,
              employment_status: data.employment_status,
              user_type: data.user_type,
              account_status: data.account_status,
              compliance_status: data.compliance_status,
              image: data.image,
              created_at: data.createdAt,
              updated_at: data.updatedAt,
            };

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            user: {
              ...obj,
            },
            access_token: access_token,
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

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const hasEmptyFields = helper.fieldValidator({ email, password });

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

      if (!helper.validateEmail(email)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Email is invalid`,
          })
        );
      }

      let user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: `Invalid email or password`,
          })
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: `Invalid email or password`,
          })
        );
      }

      const hasPayment = await Payment.findOne({ user: user._id });
      if (
        hasPayment &&
        hasPayment.status === "Completed" &&
        user.payment_details.status !== "paid"
      ) {
        user = await User.findByIdAndUpdate(
          user._id,
          {
            payment_details: {
              status: "paid",
              payment_id: hasPayment._id,
              date: hasPayment.createdAt,
            },
          },
          { new: true }
        );
      }
      const data = user.toObject();

      const access_token = jwt.sign(
        { _id: data._id, email: data.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            user: {
              _id: data._id,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              phone_number: data.phone_number,
              age_range: data.age_range,
              gender: data.gender,
              employment_status: data.employment_status,
              user_type: data.user_type,
              account_status: data.account_status,
              compliance_status: data.compliance_status,
              image: data.image,
              created_at: data.createdAt,
              updated_at: data.updatedAt,
              payment_details: data.payment_details,
            },
            access_token: access_token,
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
  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;
      const hasEmptyFields = helper.fieldValidator({ email, password });

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

      if (!helper.validateEmail(email)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Email is invalid`,
          })
        );
      }

      let user = await Admin.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: `Invalid email or password`,
          })
        );
      }

      if (user.is_deleted) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: `User unauthorized`,
          })
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: `Invalid email or password`,
          })
        );
      }

      const data = user.toObject();

      const access_token = jwt.sign(
        { _id: data._id, email: data.email },
        process.env.ADMIN_ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            user: {
              _id: data._id,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              role: data.role,
              status: data.status,
            },
            access_token: access_token,
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
}

module.exports = new AuthController();
