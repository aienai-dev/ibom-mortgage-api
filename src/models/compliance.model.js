const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const identitySchema = new mongoose.Schema({
  identity_type: {
    type: String,
    required: [true, "identity type required"],
  },
  identity_status: {
    type: String,
    default: "unverified",
    enum: {
      values: ["unverified", "verified"],
      message: "{Value} is not allowed",
    },
  },
  identity_number: {
    type: String,
    required: [true, "identity number required"],
  },
  identity_image: {
    type: String,
    required: [true, "identity image required"],
  },
});

const personalDetailsSchema = new mongoose.Schema({
  date_of_birth: {
    type: String,
    required: [true, "date of birth required"],
  },

  marital_status: {
    type: String,
    enum: {
      values: ["single", "married", "divorced", "widowed"],
      message: "{VALUE} is not supported",
    },
    required: [true, "marital status required"],
  },

  address: {
    state: {
      type: String,
      required: [true, "state required"],
    },
    city: {
      type: String,
      required: [true, "city required"],
    },
    street: {
      type: String,
      required: [true, "street required"],
    },
  },

  home_address: {
    state_of_origin: {
      type: String,
      required: [true, "state of origin required"],
    },
    lga: {
      type: String,
      required: [true, "lga required"],
    },
  },
  user_identity: {
    type: identitySchema,
    required: [true, "user identity is required"],
  },
});
const locationPreferenceSchema = new mongoose.Schema({
  preferred_state: {
    type: String,
    required: [true, "preferred state required"],
  },
  preferred_city: {
    type: String,
    required: [true, "preferred city required"],
  },
  preferred_area: {
    type: String,
  },
  type_of_housing: {
    type: String,
    required: [true, "type of housing required"],
  },
  no_of_bedrooms: {
    type: Number,
    required: [true, "number of bedrooms required"],
  },
  housing_purpose: {
    type: String,
    required: [true, "housing purpose required"],
  },
  budget: {
    type: String,
    required: [true, "budget required"],
  },
  customer_preference_feedback: {
    type: String,
  },
});

const customerAccountProfileSchema = new mongoose.Schema({
  employment_status: {
    type: String,
    required: [true, "employment status required"],
  },
  occupation: {
    type: String,
    required: [true, "occupation required"],
  },
  monthly_income: {
    type: String,
    required: [true, "monthly income required"],
  },
  source_of_income: {
    type: String,
    required: [true, "type of housing required"],
  },
  loans_and_mortgage: {
    out_standing: {
      type: Boolean,
      required: [true, "loans_and_mortgage required"],
    },
    loan_type: {
      type: String,
      default: null,
    },
    loan_amount: {
      type: String,
      default: null,
    },
  },
  proof_of_income: {
    type: String,
    required: [true, "proof of income required"],
  },
});

const complianceSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user required"],
    },
    status: {
      type: String,
      default: "pending-review",
    },
    personal_details: {
      type: personalDetailsSchema,
    },
    location_preference: {
      type: locationPreferenceSchema,
    },
    customer_account_profile: {
      type: customerAccountProfileSchema,
    },
  },
  { timestamps: true }
);

// userSchema.methods = {
//   authenticate: function (password) {
//     return bcrypt.compare(password, this.password);
//   },
// };

module.exports = mongoose.model("Compliance", complianceSchema);
