const router = require("express").Router();
const complianceController = require("../controllers/users.controller");
const auth = require("../middleware/auth");
const uploadImage = require("../middleware/imageUpload");

router.post(
  "/:user_id/compliance",
  auth.user,
  complianceController.createCompliance
);

router.post(
  "/:compliance_id/:doc_type",
  auth.user,
  uploadImage.array("image"),
  complianceController.uploadImage
);

router.get(
  "/:user_id/compliance",
  auth.user,
  complianceController.getComplianceByUserId
);

router.put(
  "/:user_id/compliance/:compliance_id",
  auth.user,
  complianceController.updateCompliance
);

module.exports = router;
