const router = require("express").Router();
const adminPaymentsController = require("../controllers/admin/payments.controller");
const auth = require("../middleware/auth");

router.get("/", auth.admin, adminPaymentsController.getAllPayments);
router.get("/:id", auth.admin, adminPaymentsController.getPaymentById);
router.get("/stats", auth.admin, adminPaymentsController.getPaymentStats);
router.get("/export", auth.admin, adminPaymentsController.exportPayments);

module.exports = router;
