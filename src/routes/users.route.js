const router = require("express").Router();
const complianceController = require("../controllers/users.controller");
const auth = require("../middleware/auth");
const uploadImage = require("../middleware/imageUpload");

router.post(
  "/:user_id/compliance",
  (req, res, next) => auth.user(req, res, next),
  (req, res, next) => complianceController.createCompliance(req, res, next)
);
// verify-payment

router.get(
  "/initiate-payment",
  (req, res, next) => auth.user(req, res, next),
  (req, res, next) => complianceController.initiatePayment(req, res, next)
);

router.post("/verify-payment", (req, res, next) =>
  complianceController.verifyPayment(req, res, next)
);
router.get(
  "/validate-payment",
  (req, res, next) => auth.user(req, res, next),
  (req, res, next) => complianceController.validateUserPayment(req, res, next)
);

router.post(
  "/:compliance_id/:doc_type",
  (req, res, next) => auth.user(req, res, next),
  uploadImage.array("image"),
  (req, res, next) => complianceController.uploadImage(req, res, next)
);

router.get(
  "/:user_id/compliance",
  (req, res, next) => auth.user(req, res, next),
  (req, res, next) => complianceController.getComplianceByUserId(req, res, next)
);

router.put(
  "/:user_id/compliance/:compliance_id",
  (req, res, next) => auth.user(req, res, next),
  (req, res, next) => complianceController.updateCompliance()
);

module.exports = router;
