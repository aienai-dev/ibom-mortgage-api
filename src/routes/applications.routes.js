const router = require("express").Router();
const adminApplicationsController = require("../controllers/admin/applications.controllers");
const auth = require("../middleware/auth");

router.get("/", auth.admin, adminApplicationsController.getAllApplications);
router.get(
  "/pending",
  auth.admin,
  adminApplicationsController.getPendingApplications
);
router.get(
  "/stats",
  auth.admin,
  adminApplicationsController.getApplicationStats
);
router.get(
  "/status",
  auth.admin,
  adminApplicationsController.getApplicationsByStatus
);
router.get(
  "/export",
  auth.admin,
  adminApplicationsController.exportApplications
);
router.get("/:id", auth.admin, adminApplicationsController.getApplicationById);
router.post(
  "/",
  auth.admin,
  adminApplicationsController.createApplication
);
router.put("/:id", auth.admin, adminApplicationsController.updateApplication);
router.put(
  "/:id/approve",
  auth.admin,
  adminApplicationsController.approveApplication
);
router.put(
  "/:id/reject",
  auth.admin,
  adminApplicationsController.rejectApplication
);
router.put(
  "/bulk",
  auth.admin,
  adminApplicationsController.bulkUpdateApplications
);
router.delete(
  "/:id",
  auth.admin,
  adminApplicationsController.deleteApplication
);
module.exports = router;
