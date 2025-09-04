const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema(
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
    password: {
      type: String,
      default: null,
      select: false,
    },
    role: {
      type: String,
      default: "admin",
    },
    status: {
      type: String,
      default: "unverified",
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/fullstack-login-register/image/upload/v1756274276/Frame_1707479020_aotbwe.svg",
    },
  },
  { timestamps: true }
);

adminSchema.methods = {
  authenticate: function (password) {
    return bcrypt.compare(password, this.password);
  },
};

module.exports = mongoose.model("Admin", adminSchema);
