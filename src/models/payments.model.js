const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user required"],
    },
    status: {
      type: String,
      enum: ["Initiated", "Completed", "Pending", "Failed", "Reversed"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    account_id: {
      type: String,
      default: null,
    },
    reference: {
      type: String,
      default: null,
    },
    transaction_id: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Payment", paymentSchema);
