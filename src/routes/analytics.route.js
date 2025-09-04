const router = require("express").Router();
const adminAnalyticsController = require("../controllers/admin/analytics.controller");
const auth = require("../middleware/auth");

router.get("/", auth.admin, adminAnalyticsController.getDashboardStats);
router.get(
  "/area-chart",
  auth.admin,
  adminAnalyticsController.getAreaChartData
);
router.get(
  "/recent-applications",
  auth.admin,
  adminAnalyticsController.getRecentApplications
);
router.get(
  "/payments",
  auth.admin,
  adminAnalyticsController.getPaymentAnalytics
);
router.get(
  "/customer-growth",
  auth.admin,
  adminAnalyticsController.getCustomerGrowth
);
router.get(
  "/referrals",
  auth.admin,
  adminAnalyticsController.getReferralAnalytics
);
router.get(
  "/all",
  auth.admin,
  adminAnalyticsController.getComprehensiveAnalytics
);
module.exports = router;
