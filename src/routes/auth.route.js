const router = require("express").Router();
const userController = require("../controllers/auth.controller");
// const complianceController = require("../controllers/compliance.controller");

router.post("/register", userController.registerPersonalDetails);
router.post("/create-password", userController.createPassword);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/login", userController.login);

// router.post(
//   "/users/:user_id/compliance",
//   complianceController.createCompliance
// );

module.exports = router;
