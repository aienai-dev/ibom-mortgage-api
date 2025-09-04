const helper = require("../../middleware/helper");
const User = require("../../models/user.model");
const Compliance = require("../../models/compliance.model");
const Admin = require("../../models/admin.model");
const Payment = require("../../models/payments.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailer = require("../../middleware/mailer");
const mongoose = require("mongoose");

class AdminUserController {
  createAdmin = async (req, res) => {
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
        role: user.role,
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

      // Check for existing users
      const emailUser = await Admin.findOne({ email: user.email });
      if (emailUser) {
        return res.status(405).json(
          helper.responseHandler({
            status: 405,
            error: `User already exists`,
          })
        );
      }

      const newUser = new Admin({ ...user });

      const registration_token = jwt.sign(
        { email: newUser.email },
        process.env.ADMIN_REGISTRATION_TOKEN_SECRET
      );

      const mail = await mailer.sendAdminCreatePassword(
        user,
        registration_token
      );
      if (!mail || mail.status === "failed") {
        return res.status(422).json(
          helper.responseHandler({
            status: 422,
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
  };

  getAllUsers = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // 2. Search Query Construction
      const searchQuery = {};
      const searchTerm = req.query.search;

      if (searchTerm) {
        const regex = new RegExp(searchTerm, "i"); // 'i' for case-insensitive

        // Handles search by splitting the term to check against first and last names
        const nameParts = searchTerm.split(" ").filter((part) => part);
        const firstNameRegex = new RegExp(nameParts[0], "i");
        const lastNameRegex =
          nameParts.length > 1 ? new RegExp(nameParts[1], "i") : firstNameRegex;

        searchQuery.$or = [
          { first_name: regex },
          { last_name: regex },
          { email: regex },
          { referral: regex },
          {
            $and: [
              { first_name: firstNameRegex },
              { last_name: lastNameRegex },
            ],
          },
        ];
      }

      const users = await User.find(searchQuery)
        .sort({ first_name: 1 }) // Sorting alphabetically
        .skip(skip)
        .limit(limit);

      const totalUsers = await User.countDocuments(searchQuery);
      const totalPages = Math.ceil(totalUsers / limit);

      res.status(200).json({
        message: "Users fetched successfully",
        data: users,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          perPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  };

  getUser = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id).select("-password");

      if (!user) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `User not found`,
          })
        );
      }
      console.log(user);
      res.status(200).json({
        message: "User fetched successfully",
        data: { ...user },
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  };

  getAllTeamMembers = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // 2. Search Query Construction
      const searchQuery = {};
      const searchTerm = req.query.search;

      if (searchTerm) {
        const regex = new RegExp(searchTerm, "i"); // 'i' for case-insensitive

        // Handles search by splitting the term to check against first and last names
        const nameParts = searchTerm.split(" ").filter((part) => part);
        const firstNameRegex = new RegExp(nameParts[0], "i");
        const lastNameRegex =
          nameParts.length > 1 ? new RegExp(nameParts[1], "i") : firstNameRegex;

        searchQuery.$or = [
          { first_name: regex },
          { last_name: regex },
          { email: regex },
          {
            $and: [
              { first_name: firstNameRegex },
              { last_name: lastNameRegex },
            ],
          },
        ];
      }

      const users = await Admin.find(searchQuery)
        .sort({ first_name: 1 }) // Sorting alphabetically
        .skip(skip)
        .limit(limit);

      const totalUsers = await Admin.countDocuments(searchQuery);
      const totalPages = Math.ceil(totalUsers / limit);

      res.status(200).json({
        message: "Users fetched successfully",
        data: users,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          perPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  };

  updateRole = async (req, res) => {
    try {
      const { role, status } = req.body;
      let user;
      if (role) {
        user = await Admin.findByIdAndUpdate(
          res.user._id,
          {
            role: role,
          },
          { new: true }
        );
      }
      if (status) {
        user = await Admin.findByIdAndUpdate(
          res.user._id,
          {
            status,
          },
          { new: true }
        );
      }
      if (!user) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "failed to update user",
          })
        );
      }
      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            user,
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
  };
  deleteUser = async (req, res) => {
    try {
      await Admin.findByIdAndUpdate(
        res.user._id,
        {
          is_deleted: true,
        },
        { new: true }
      );

      return res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {},
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
  };
}

module.exports = new AdminUserController();
