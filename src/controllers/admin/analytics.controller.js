const helper = require("../../middleware/helper");
const User = require("../../models/user.model");
const Compliance = require("../../models/compliance.model");
const Admin = require("../../models/admin.model");
const Payment = require("../../models/payments.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailer = require("../../middleware/mailer");
const Referral = require("../../models/referrals.model");

class AdminAnalyticsController {
  // Get dashboard overview stats
  async getDashboardStats(req, res) {
    try {
      const [totalCustomers, totalPayments, totalApplications, totalReferrals] =
        await Promise.all([
          User.countDocuments(),
          Payment.countDocuments({ status: "Completed" }),
          Compliance.countDocuments(),
          Referral.countDocuments(),
        ]);

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            totalCustomers,
            totalPayments,
            totalApplications,
            totalReferrals,
          },
        })
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: error.message || err })
        );
    }
  }

  // Get area chart data for visitors (initiated vs completed applications)
  async getAreaChartData(req, res) {
    try {
      const { months = 3 } = req.query;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(months));

      // Aggregate compliance data by date
      const complianceData = await Compliance.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.date",
            initiated: {
              $sum: {
                $cond: [
                  { $eq: ["$_id.status", "pending-review"] },
                  "$count",
                  0,
                ],
              },
            },
            completed: {
              $sum: {
                $cond: [
                  { $ne: ["$_id.status", "pending-review"] },
                  "$count",
                  0,
                ],
              },
            },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Format data for frontend
      const chartData = complianceData.map((item) => ({
        date: new Date(item._id).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        initiated: item.initiated,
        completed: item.completed,
      }));

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: chartData,
        })
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: error.message || err })
        );
    }
  }

  // Get most recent applications
  async getRecentApplications(req, res) {
    try {
      const { limit = 10 } = req.query;

      const recentApplications = await Compliance.find()
        .populate("user_id", "first_name last_name email account_status")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select("status createdAt user_id");

      const formattedApplications = recentApplications.map((app) => ({
        id: app._id,
        message: this.getApplicationMessage(app.user_id, app.status),
        timestamp:
          app.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) +
          " – " +
          app.createdAt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        status: app.status,
        user: {
          name: `${app.user_id.first_name} ${app.user_id.last_name}`,
          email: app.user_id.email,
          accountStatus: app.user_id.account_status,
        },
      }));

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: formattedApplications,
        })
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: error.message || err })
        );
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(req, res) {
    try {
      const { period = "month" } = req.query;

      let groupBy;
      let startDate = new Date();

      switch (period) {
        case "week":
          groupBy = { $dayOfWeek: "$createdAt" };
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          groupBy = { $dayOfMonth: "$createdAt" };
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "year":
          groupBy = { $month: "$createdAt" };
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          groupBy = { $dayOfMonth: "$createdAt" };
          startDate.setMonth(startDate.getMonth() - 1);
      }

      const paymentStats = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              period: groupBy,
              status: "$status",
            },
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $group: {
            _id: "$_id.period",
            completed: {
              $sum: {
                $cond: [{ $eq: ["$_id.status", "Completed"] }, "$count", 0],
              },
            },
            initiated: {
              $sum: {
                $cond: [{ $eq: ["$_id.status", "Initiated"] }, "$count", 0],
              },
            },
            failed: {
              $sum: {
                $cond: [{ $eq: ["$_id.status", "Failed"] }, "$count", 0],
              },
            },
            totalRevenue: {
              $sum: "$totalAmount",
            },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: paymentStats,
        })
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: error.message || err })
        );
    }
  }

  // Get customer growth analytics
  async getCustomerGrowth(req, res) {
    try {
      const { months = 6 } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(months));

      const customerGrowth = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            newCustomers: { $sum: 1 },
            verifiedCustomers: {
              $sum: {
                $cond: [{ $eq: ["$account_status", "verified"] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]);

      const formattedGrowth = customerGrowth.map((item) => ({
        period: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        newCustomers: item.newCustomers,
        verifiedCustomers: item.verifiedCustomers,
      }));

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: formattedGrowth,
        })
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: error.message || err })
        );
    }
  }

  // Get referral analytics
  async getReferralAnalytics(req, res) {
    try {
      const referralStats = await Referral.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get top referrers
      const topReferrers = await User.aggregate([
        {
          $lookup: {
            from: "referrals",
            localField: "_id",
            foreignField: "referral",
            as: "referrals",
          },
        },
        {
          $project: {
            first_name: 1,
            last_name: 1,
            email: 1,
            referralCount: { $size: "$referrals" },
          },
        },
        {
          $match: {
            referralCount: { $gt: 0 },
          },
        },
        {
          $sort: { referralCount: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            referralStats,
            topReferrers,
          },
        })
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: error.message || err })
        );
    }
  }

  // Get comprehensive analytics (all data for dashboard)
  async getComprehensiveAnalytics(req, res) {
    try {
      const [
        dashboardStats,
        areaChartData,
        recentApplications,
        paymentAnalytics,
        customerGrowth,
        referralAnalytics,
      ] = await Promise.all([
        this.getDashboardStatsData(),
        this.getAreaChartDataInternal(),
        this.getRecentApplicationsData(),
        this.getPaymentAnalyticsData(),
        this.getCustomerGrowthData(),
        this.getReferralAnalyticsData(),
      ]);

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            overview: dashboardStats,
            areaChart: areaChartData,
            recentApplications,
            payments: paymentAnalytics,
            customerGrowth,
            referrals: referralAnalytics,
          },
        })
      );
    } catch (error) {
      return res
        .status(500)
        .json(
          helper.responseHandler({ status: 500, error: error.message || err })
        );
    }
  }

  // Helper method to generate application messages
  getApplicationMessage(user, status) {
    const userName = `${user.first_name} ${user.last_name}`;

    switch (status) {
      case "pending-review":
        return `${userName} submitted an application for review.`;
      case "approved":
        return `${userName}'s application was approved.`;
      case "rejected":
        return `${userName}'s application was rejected.`;
      default:
        return `${userName} updated their application status.`;
    }
  }

  // Internal helper methods (without res parameter)
  async getDashboardStatsData() {
    const [totalCustomers, totalPayments, totalApplications, totalReferrals] =
      await Promise.all([
        User.countDocuments(),
        Payment.countDocuments({ status: "Completed" }),
        Compliance.countDocuments(),
        Referral.countDocuments(),
      ]);

    return {
      totalCustomers,
      totalPayments,
      totalApplications,
      totalReferrals,
    };
  }

  async getAreaChartDataInternal() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    const complianceData = await Compliance.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          initiated: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "pending-review"] }, "$count", 0],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $ne: ["$_id.status", "pending-review"] }, "$count", 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return complianceData.map((item) => ({
      date: new Date(item._id).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      initiated: item.initiated,
      completed: item.completed,
    }));
  }

  async getRecentApplicationsData() {
    const recentApplications = await Compliance.find()
      .populate("user_id", "first_name last_name email account_status")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("status createdAt user_id");

    return recentApplications.map((app) => ({
      id: app._id,
      message: this.getApplicationMessage(app.user_id, app.status),
      timestamp:
        app.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
        " – " +
        app.createdAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      status: app.status,
      user: {
        name: `${app.user_id.first_name} ${app.user_id.last_name}`,
        email: app.user_id.email,
        accountStatus: app.user_id.account_status,
      },
    }));
  }

  async getPaymentAnalyticsData() {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    return await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
            },
          },
          initiated: {
            $sum: {
              $cond: [{ $eq: ["$status", "Initiated"] }, 1, 0],
            },
          },
          totalRevenue: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
  }

  async getCustomerGrowthData() {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    return await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          newCustomers: { $sum: 1 },
          verifiedCustomers: {
            $sum: {
              $cond: [{ $eq: ["$account_status", "verified"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);
  }

  async getReferralAnalyticsData() {
    const [referralStats, topReferrers] = await Promise.all([
      Referral.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      User.aggregate([
        {
          $lookup: {
            from: "referrals",
            localField: "_id",
            foreignField: "referral",
            as: "referrals",
          },
        },
        {
          $project: {
            first_name: 1,
            last_name: 1,
            email: 1,
            referralCount: { $size: "$referrals" },
          },
        },
        {
          $match: {
            referralCount: { $gt: 0 },
          },
        },
        {
          $sort: { referralCount: -1 },
        },
        {
          $limit: 10,
        },
      ]),
    ]);

    return { referralStats, topReferrers };
  }
}

module.exports = new AdminAnalyticsController();
