const Referral = require("../../models/referrals.model");
const helper = require("../../middleware/helper");
const mongoose = require("mongoose");

class AdminReferralController {
  async createReferral(req, res) {
    try {
      const { first_name, last_name, email } = req.body;

      if (!first_name || !last_name || !email) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `first_name, last_name, email, `,
          })
        );
      }

      const referral = () => {
        const chars =
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < 13; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      const newReferral = new Referral({
        first_name,
        last_name,
        email,
        referral: referral(),
      });
      await newReferral.save();

      res.status(201).json(
        helper.responseHandler({
          status: 200,
          data: {
            newReferral,
          },
        })
      );
    } catch (error) {
      if (error.code === 11000) {
        return res.status(500).json(
          helper.responseHandler({
            status: 500,
            error: "User already has a referral link",
          })
        );
      }

      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  }

  async getReferrals(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const searchTerm = req.query.search;

      const searchQuery = {};
      if (searchTerm) {
        const regex = new RegExp(searchTerm, "i");
        searchQuery.$or = [
          { first_name: regex },
          { last_name: regex },
          { email: regex },
        ];
      }

      const referrals = await Referral.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalReferrals = await Referral.countDocuments(searchQuery);
      const totalPages = Math.ceil(totalReferrals / limit);

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            referrals,
            pagination: {
              totalReferrals,
              totalPages,
              currentPage: page,
              perPage: limit,
            },
          },
        })
      );
    } catch (error) {
      console.error("Error fetching referrals:", error);
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: err.message || err })
        );
    }
  }

  async getReferralById(req, res) {
    try {
      const { id } = req.params;

      const referral = await Referral.findById(id);
      if (!referral) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `referral not found `,
          })
        );
      }

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: referral,
        })
      );
    } catch (error) {
      console.error("Error fetching referral by ID:", error);
      res.status(500).json({
        message: "Server error while fetching referral.",
        error: error.message,
      });
    }
  }

  async updateReferral(req, res) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json();
      }
      const status = req.body.status;
      if (!status) {
      }

      const updatedReferral = await Referral.findByIdAndUpdate(
        id,
        { status: req.body.status },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedReferral) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: `referral not found `,
          })
        );
      }

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: updatedReferral,
        })
      );
    } catch (error) {
      if (error.code === 11000) {
        return res
          .status(409)
          .json({ message: "A referral with this email already exists." });
      }
      console.error("Error updating referral:", error);
      res.status(500).json({
        message: "Server error while updating referral.",
        error: error.message,
      });
    }
  }

  async deleteReferral(req, res) {
    try {
      const { id } = req.params;

      const deletedReferral = await Referral.findByIdAndDelete(id);

      if (!deletedReferral) {
        return res.status(404).json({ message: "Referral not found." });
      }

      res.status(200).json({ message: "Referral deleted successfully" });
    } catch (error) {
      console.error("Error deleting referral:", error);
      res.status(500).json({
        message: "Server error while deleting referral.",
        error: error.message,
      });
    }
  }
}

module.exports = new AdminReferralController();
