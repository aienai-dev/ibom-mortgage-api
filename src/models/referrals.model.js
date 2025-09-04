const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const referralSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "first name required"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "last name required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      trim: true,
      unique: true,
    },
    referral: {
      type: String,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Referral", referralSchema);
