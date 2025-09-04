const express = require("express");
const router = express.Router();
const referralController = require("../controllers/admin/referral.controller");
const auth = require("../middleware/auth");

// Create a new referral
router.post("/", auth.admin, referralController.createReferral);
router.get("/", auth.admin, referralController.getReferrals);
router.get("/:id", auth.admin, referralController.getReferralById);
router.put("/:id", auth.admin, referralController.updateReferral);
router.delete("/:id", auth.admin, referralController.deleteReferral);

module.exports = router;
