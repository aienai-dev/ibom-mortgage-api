const Payment = require("../../models/payments.model");
const User = require("../../models/user.model");
const mongoose = require("mongoose");
const helper = require("../../middleware/helper");

class AdminPaymentsController {
  // Get all payments with filters, search, and pagination
  async getAllPayments(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        provider,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      // Build match conditions
      let matchConditions = {};

      // Date filter
      if (startDate || endDate) {
        matchConditions.createdAt = {};
        if (startDate) {
          matchConditions.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          matchConditions.createdAt.$lte = new Date(endDate);
        }
      }

      // Status filter
      if (status) {
        matchConditions.status = status;
      }

      // Provider filter
      if (provider) {
        matchConditions.provider = provider;
      }

      // Build aggregation pipeline
      let pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
      ];

      // Add search conditions
      if (search) {
        const searchRegex = new RegExp(search, "i");
        pipeline.push({
          $match: {
            $or: [
              { "userDetails.first_name": searchRegex },
              { "userDetails.last_name": searchRegex },
              { "userDetails.email": searchRegex },
              { reference: searchRegex },
              { transaction_id: searchRegex },
            ],
          },
        });
      }

      // Add other match conditions
      if (Object.keys(matchConditions).length > 0) {
        pipeline.push({ $match: matchConditions });
      }

      // Add sorting
      const sortCondition = {};
      sortCondition[sortBy] = sortOrder === "asc" ? 1 : -1;
      pipeline.push({ $sort: sortCondition });

      // Get total count for pagination
      const countPipeline = [...pipeline, { $count: "total" }];
      const totalResult = await Payment.aggregate(countPipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      // Add pagination to main pipeline
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNumber });

      // Add projection for final result
      pipeline.push({
        $project: {
          _id: 1,
          status: 1,
          amount: 1,
          account_id: 1,
          reference: 1,
          transaction_id: 1,
          provider: 1,
          metadata: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            _id: "$userDetails._id",
            first_name: "$userDetails.first_name",
            last_name: "$userDetails.last_name",
            email: "$userDetails.email",
            phone_number: "$userDetails.phone_number",
          },
        },
      });

      const payments = await Payment.aggregate(pipeline);

      const totalPages = Math.ceil(total / limitNumber);

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            payments,
            pagination: {
              currentPage: pageNumber,
              totalPages,
              totalItems: total,
              itemsPerPage: limitNumber,
              hasNextPage: pageNumber < totalPages,
              hasPrevPage: pageNumber > 1,
            },
          },
        })
      );
    } catch (error) {
      res.status(500).json(
        helper.responseHandler({
          status: 500,
          error: error.message,
        })
      );
    }
  }

  // Get single payment by ID
  async getPaymentById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Invalid payment ID",
          })
        );
      }

      const payment = await Payment.findById(id).populate(
        "user",
        "first_name last_name email phone_number account_status"
      );

      if (!payment) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Payment not found",
          })
        );
      }

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: payment,
        })
      );
    } catch (error) {
      res.status(500).json(
        helper.responseHandler({
          status: 500,
          error: error.message,
        })
      );
    }
  }

  // Create new payment
  async createPayment(req, res) {
    try {
      const {
        user,
        status,
        amount,
        account_id,
        reference,
        transaction_id,
        provider,
        metadata,
      } = req.body;

      // Validate required fields using helper
      const missingFields = helper.fieldValidator({ user, status, amount });
      if (missingFields.length > 0) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Missing required fields: ${missingFields.join(", ")}`,
          })
        );
      }

      // Check if user exists
      const userExists = await User.findById(user);
      if (!userExists) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "User not found",
          })
        );
      }

      // Generate reference if not provided
      const paymentReference =
        reference ||
        `PAY_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;

      const payment = new Payment({
        user,
        status,
        amount,
        account_id,
        reference: paymentReference,
        transaction_id,
        provider,
        metadata,
      });

      await payment.save();

      // Update user payment status if payment is completed
      if (status === "Completed") {
        await User.findByIdAndUpdate(user, {
          "payment_details.status": "paid",
          "payment_details.date": new Date().toISOString(),
          "payment_details.payment_id": payment._id,
        });
      }

      const populatedPayment = await Payment.findById(payment._id).populate(
        "user",
        "first_name last_name email phone_number"
      );

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: populatedPayment,
        })
      );
    } catch (error) {
      res.status(500).json(
        helper.responseHandler({
          status: 500,
          error: error.message,
        })
      );
    }
  }

  // Update payment
  async updatePayment(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Invalid payment ID",
          })
        );
      }

      const payment = await Payment.findById(id);
      if (!payment) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Payment not found",
          })
        );
      }

      // Update payment
      const updatedPayment = await Payment.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate("user", "first_name last_name email phone_number");

      // Update user payment status if status changed to completed
      if (updateData.status === "Completed" && payment.status !== "Completed") {
        await User.findByIdAndUpdate(payment.user, {
          "payment_details.status": "paid",
          "payment_details.date": new Date().toISOString(),
          "payment_details.payment_id": payment._id,
        });
      }

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: updatedPayment,
        })
      );
    } catch (error) {
      res.status(500).json(
        helper.responseHandler({
          status: 500,
          error: error.message,
        })
      );
    }
  }

  // Delete payment
  async deletePayment(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Invalid payment ID",
          })
        );
      }

      const payment = await Payment.findById(id);
      if (!payment) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Payment not found",
          })
        );
      }

      await Payment.findByIdAndDelete(id);

      // Update user payment status back to unpaid
      await User.findByIdAndUpdate(payment.user, {
        "payment_details.status": "unpaid",
        "payment_details.date": null,
        "payment_details.payment_id": null,
      });

      res.status(200).json(
        helper.responseHandler({
          status: 200,
        })
      );
    } catch (error) {
      res.status(500).json(
        helper.responseHandler({
          status: 500,
          error: error.message,
        })
      );
    }
  }

  // Bulk update payments
  async bulkUpdatePayments(req, res) {
    try {
      const { paymentIds, updateData } = req.body;

      // Validate required fields
      const missingFields = helper.fieldValidator({ paymentIds, updateData });
      if (missingFields.length > 0) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Missing required fields: ${missingFields.join(", ")}`,
          })
        );
      }

      if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Payment IDs must be a non-empty array",
          })
        );
      }

      const validIds = paymentIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );
      if (validIds.length !== paymentIds.length) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Some payment IDs are invalid",
          })
        );
      }

      const result = await Payment.updateMany(
        { _id: { $in: validIds } },
        { ...updateData, updatedAt: new Date() }
      );

      // If updating status to completed, update user payment details
      if (updateData.status === "Completed") {
        const payments = await Payment.find({ _id: { $in: validIds } });
        const userUpdates = payments.map((payment) =>
          User.findByIdAndUpdate(payment.user, {
            "payment_details.status": "paid",
            "payment_details.date": new Date().toISOString(),
            "payment_details.payment_id": payment._id,
          })
        );
        await Promise.all(userUpdates);
      }

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            message: `${result.modifiedCount} payments updated successfully`,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
          },
        })
      );
    } catch (error) {
      res.status(500).json(
        helper.responseHandler({
          status: 500,
          error: error.message,
        })
      );
    }
  }

  // Get payment statistics
  async getPaymentStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let matchConditions = {};
      if (startDate || endDate) {
        matchConditions.createdAt = {};
        if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
        if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
      }

      const stats = await Payment.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
            completedPayments: {
              $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
            },
            completedAmount: {
              $sum: {
                $cond: [{ $eq: ["$status", "Completed"] }, "$amount", 0],
              },
            },
            failedPayments: {
              $sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] },
            },
            pendingPayments: {
              $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
            },
            averageAmount: { $avg: "$amount" },
          },
        },
      ]);

      const statusBreakdown = await Payment.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      const providerBreakdown = await Payment.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: "$provider",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            overview: stats[0] || {
              totalPayments: 0,
              totalAmount: 0,
              completedPayments: 0,
              completedAmount: 0,
              failedPayments: 0,
              pendingPayments: 0,
              averageAmount: 0,
            },
            statusBreakdown,
            providerBreakdown,
          },
        })
      );
    } catch (error) {
      res.status(500).json(
        helper.responseHandler({
          status: 500,
          error: error.message,
        })
      );
    }
  }

  // Export payments to CSV
  async exportPayments(req, res) {
    try {
      const {
        search,
        status,
        provider,
        startDate,
        endDate,
        format = "json",
      } = req.query;

      // Build match conditions (same as getAllPayments)
      let matchConditions = {};
      if (startDate || endDate) {
        matchConditions.createdAt = {};
        if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
        if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
      }
      if (status) matchConditions.status = status;
      if (provider) matchConditions.provider = provider;

      let pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
      ];

      if (search) {
        const searchRegex = new RegExp(search, "i");
        pipeline.push({
          $match: {
            $or: [
              { "userDetails.first_name": searchRegex },
              { "userDetails.last_name": searchRegex },
              { "userDetails.email": searchRegex },
              { reference: searchRegex },
              { transaction_id: searchRegex },
            ],
          },
        });
      }

      if (Object.keys(matchConditions).length > 0) {
        pipeline.push({ $match: matchConditions });
      }

      pipeline.push({
        $project: {
          reference: 1,
          transaction_id: 1,
          status: 1,
          amount: 1,
          provider: 1,
          createdAt: 1,
          user_name: {
            $concat: ["$userDetails.first_name", " ", "$userDetails.last_name"],
          },
          user_email: "$userDetails.email",
          user_phone: "$userDetails.phone_number",
        },
      });

      const payments = await Payment.aggregate(pipeline);

      if (format === "csv") {
        const csvHeaders = [
          "Reference",
          "Transaction ID",
          "Status",
          "Amount",
          "Provider",
          "User Name",
          "User Email",
          "User Phone",
          "Created Date",
        ];

        const csvRows = payments.map((payment) => [
          payment.reference || "",
          payment.transaction_id || "",
          payment.status,
          payment.amount,
          payment.provider,
          payment.user_name,
          payment.user_email,
          payment.user_phone || "",
          new Date(payment.createdAt).toLocaleDateString(),
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map((row) => row.map((field) => `"${field}"`).join(","))
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="payments.csv"'
        );
        return res.send(csvContent);
      }

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: payments,
        })
      );
    } catch (error) {
      res.status(500).json(
        helper.responseHandler({
          status: 500,
          error: error.message,
        })
      );
    }
  }
}

module.exports = new AdminPaymentsController();
