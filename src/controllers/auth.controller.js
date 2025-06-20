const helper = require("../middleware/helper");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailer = require("../middleware/mailer");

const userController = {
  registerPersonalDetails: async (req, res) => {
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
      const hasEmptyFields = helper.fieldValidator({
        first_name: user.first_name,
        last_name: user.last_name,
        // middle_name: user.middle_name,
        email: user.email,
        phone_number: user.phone_number,
        // whatsapp_number: user.whatsapp_number,
        gender: user.gender,
        age_range: user.age_range,
        employment_status: user.employment_status,
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
      if (!helper.validateEmail(user.email))
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Email is not valid`,
          })
        );

      if (!helper.validatePhoneNumber(user.phone_number))
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Phone number is not valid`,
          })
        );
      if (
        user.whatsapp_number &&
        !helper.validatePhoneNumber(user.phone_number)
      )
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Whatsapp number is not valid`,
          })
        );

      const emailUser = await User.findOne({ email: user.email });

      if (emailUser)
        return res.status(405).json(
          helper.responseHandler({
            status: 405,
            error: `User already exists`,
          })
        );
      const phoneUser = await User.findOne({ phone_number: user.phone_number });

      if (phoneUser)
        return res.status(405).json(
          helper.responseHandler({
            status: 405,
            error: `Phone number already taken`,
          })
        );

      if (user.whatsapp_number) {
        const whatsappUser = await User.findOne({
          whatsapp_number: user.whatsapp_number,
        });
        if (whatsappUser)
          return res.status(405).json(
            helper.responseHandler({
              status: 405,
              error: `Whatsapp number already taken`,
            })
          );
      }
      const newUser = new User({ ...user });
      const registration_token = jwt.sign(
        { email: newUser.email },
        process.env.REGISTRATION_TOKEN_SECRET
      );

      const mail = await mailer.sendCreatePassword(user, registration_token);
      console.log(mail);
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
            reg_token: registration_token,
          },
        })
      );
    } catch (err) {
      console.log("error");
      console.log(err);
      return res
        .status(500)
        .json(helper.responseHandler({ status: 500, error: err }));
    }
  },
  createPassword: async (req, res) => {
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

      if (hasEmptyFields.length > 0)
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `${hasEmptyFields.join()} ${
              hasEmptyFields.length > 0 ? "are" : "is"
            } required`,
          })
        );

      const user = jwt.verify(
        auth.reg_token,
        process.env.REGISTRATION_TOKEN_SECRET
      );

      if (!user)
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: "Contact support",
          })
        );

      if (auth.password !== auth.confirm_password)
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Passwords do not match",
          })
        );

      const dbUser = await User.findOne({ email: user.email });
      // console.log("dbUser");
      // console.log(dbUser);
      if (!dbUser)
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Account not found, contact support",
          })
        );

      if (dbUser.account_status === "verified")
        return res.status(405).json(
          helper.responseHandler({
            status: 405,
            error: "User already verified, contact support or reset password",
          })
        );

      const hashedPassword = await bcrypt.hash(auth.password, 12);
      // console.log()
      const newUserData = await User.findOneAndUpdate(
        { email: user.email },
        {
          password: hashedPassword,
          account_status: "verified",
        },
        {
          new: true,
        }
      );

      const data = newUserData;
      delete data.password;
      const access_token = jwt.sign(
        { _id: data._id, email: data.email },
        process.env.ACCESS_TOKEN_SECRET
      );
      const mail = await mailer.sendWelcome(user, access_token);
      if (mail.status === "failed") {
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
              updated_att: data.updatedAt,
            },
            access_token: access_token,
          },
        })
      );
    } catch (err) {
      console.log("error");
      console.log(err);
      return res
        .status(500)
        .json(helper.responseHandler({ status: 500, error: err }));
    }
  },
  forgotPassword: async (req, res) => {
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
        email: auth.email,
      });
      console.log("email", auth.email);
      if (hasEmptyFields.length > 0)
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `${hasEmptyFields.join()} ${
              hasEmptyFields.length > 0 ? "are" : "is"
            } required`,
          })
        );

      if (!helper.validateEmail(auth.email))
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Email is not valid`,
          })
        );

      const dbUser = await User.findOne({ email: auth.email });

      if (!dbUser)
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Account not found, contact support",
          })
        );

      const reset_token = jwt.sign(
        { email: dbUser.email },
        process.env.RESET_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      const mail = await mailer.sendResetPassword(dbUser, reset_token);
      if (mail.status === "failed") {
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
      console.log("error");
      console.log(err);
      return res
        .status(500)
        .json(helper.responseHandler({ status: 500, error: err }));
    }
  },
  resetPassword: async (req, res) => {
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
        reg_token: auth.reset_token,
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

      const user = jwt.verify(auth.reset_token, process.env.RESET_TOKEN_SECRET);

      if (!user)
        return res.status(401).json(
          helper.responseHandler({
            status: 401,
            error: "Contact support",
          })
        );

      if (auth.password !== auth.confirm_password)
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Passwords do not match",
          })
        );

      const dbUser = await User.findOne({ email: user.email });

      if (!dbUser)
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Account not found, contact support",
          })
        );

      const hashedPassword = await bcrypt.hash(auth.password, 12);
      // console.log()
      const newUserData = await User.findOneAndUpdate(
        { email: user.email },
        {
          password: hashedPassword,
          account_status: "verified",
        },
        {
          new: true,
        }
      );

      const data = newUserData;
      delete data.password;
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
              updated_att: data.updatedAt,
            },
            access_token: access_token,
          },
        })
      );
    } catch (err) {
      // console.log("error");
      // console.log(err);
      return res
        .status(500)
        .json(helper.responseHandler({ status: 500, error: err }));
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const hasEmptyFields = helper.fieldValidator({
        email: email,
        password: password,
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

      if (!helper.validateEmail(email)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Email is invalid`,
          })
        );
      }
      const user = await User.findOne({ email });
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
      const data = user;
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
              updated_att: data.updatedAt,
            },
            access_token: access_token,
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

module.exports = userController;
