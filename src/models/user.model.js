const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
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
    middle_name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      trim: true,
      unique: true,
    },
    phone_number: {
      type: String,
      required: [true, "phone number required"],
      trim: true,
      unique: true,
    },
    whatsapp_number: {
      type: String,
      trim: true,
      // unique: true,
    },
    age_range: {
      type: String,
      enum: {
        values: ["18-25", "26-35", "36-45", "46-60", "61+"],
        message: "{VALUE} is not supported",
      },
      required: [true, "Age range required"],
    },
    gender: {
      type: String,
      enum: { values: ["male", "female"], message: "{VALUE} is not supported" },
      required: [true, "Gender required"],
    },
    password: {
      type: String,
      default: null,
    },
    employment_status: {
      type: String,
      enum: {
        values: ["employed", "self-employed", "unemployed", "retired"],
        message: "{VALUE} is not supported",
      },
      required: [true, "Employment status required"],
    },
    user_type: {
      type: String,
      default: "user",
    },
    account_status: {
      type: String,
      default: 'unverified'
    },
    compliance_status: {
      type: String,
      default: "pending",
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/fullstack-login-register/image/upload/v1666587424/AUTH/avatar_nqomfb.png",
    },
  },
  { timestamps: true }
);

userSchema.methods = {
  authenticate: function (password) {
    return bcrypt.compare(password, this.password);
  },
};

module.exports = mongoose.model("User", userSchema);
