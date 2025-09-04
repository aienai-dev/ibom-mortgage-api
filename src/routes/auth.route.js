const router = require("express").Router();
const authController = require("../controllers/auth.controller");
// const complianceController = require("../controllers/compliance.controller");

router.post("/register", (req, res, next) =>
  authController.registerPersonalDetails(req, res, next)
);

router.post("/create-password", (req, res, next) =>
  authController.createPassword(req, res, next)
);
router.post("/create-password/admin", (req, res, next) =>
  authController.createAdminPassword(req, res, next)
);
router.post("/forgot-password", (req, res, next) =>
  authController.forgotPassword(req, res, next)
);
router.post("/reset-password", (req, res, next) =>
  authController.resetPassword(req, res, next)
);
router.post("/login", (req, res, next) => authController.login(req, res, next));
router.post("/admin/login", (req, res, next) =>
  authController.adminLogin(req, res, next)
);

module.exports = router;
