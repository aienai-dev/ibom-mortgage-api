const Compliance = require("../../models/compliance.model");
const User = require("../../models/user.model");
const helper = require("../../middleware/helper");
const mongoose = require("mongoose");

class AdminApplicationsController {
  // Get all applications with filters, search, and pagination
  async getAllApplications(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
        employment_status,
        age_range,
        gender,
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

      // Build aggregation pipeline
      let pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "user_id",
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
              { "userDetails.phone_number": searchRegex },
            ],
          },
        });
      }

      // Add user-specific filters
      let userFilters = {};
      if (employment_status)
        userFilters["userDetails.employment_status"] = employment_status;
      if (age_range) userFilters["userDetails.age_range"] = age_range;
      if (gender) userFilters["userDetails.gender"] = gender;

      if (Object.keys(userFilters).length > 0) {
        pipeline.push({ $match: userFilters });
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
      const totalResult = await Compliance.aggregate(countPipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      // Add pagination to main pipeline
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNumber });

      // Add projection for final result
      pipeline.push({
        $project: {
          _id: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          personal_details: 1,
          location_preference: 1,
          customer_account_profile: 1,
          user: {
            _id: "$userDetails._id",
            first_name: "$userDetails.first_name",
            last_name: "$userDetails.last_name",
            email: "$userDetails.email",
            phone_number: "$userDetails.phone_number",
            age_range: "$userDetails.age_range",
            gender: "$userDetails.gender",
            employment_status: "$userDetails.employment_status",
            account_status: "$userDetails.account_status",
            compliance_status: "$userDetails.compliance_status",
          },
        },
      });

      const applications = await Compliance.aggregate(pipeline);

      const totalPages = Math.ceil(total / limitNumber);

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            applications,
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

  // Get single application by ID
  async getApplicationById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Invalid application ID",
          })
        );
      }

      const application = await Compliance.findById(id).populate(
        "user_id",
        "first_name last_name email phone_number age_range gender employment_status account_status compliance_status image"
      );

      if (!application) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Application not found",
          })
        );
      }

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: application,
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

  // Create new application
  async createApplication(req, res) {
    try {
      const {
        user_id,
        status,
        personal_details,
        location_preference,
        customer_account_profile,
      } = req.body;

      // Validate required fields using helper
      const missingFields = helper.fieldValidator({ user_id });
      if (missingFields.length > 0) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Missing required fields: ${missingFields.join(", ")}`,
          })
        );
      }

      // Check if user exists
      const userExists = await User.findById(user_id);
      if (!userExists) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "User not found",
          })
        );
      }

      // Check if application already exists for this user
      const existingApplication = await Compliance.findOne({ user_id });
      if (existingApplication) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Application already exists for this user",
          })
        );
      }

      const application = new Compliance({
        user_id,
        status: status || "pending-review",
        personal_details,
        location_preference,
        customer_account_profile,
      });

      await application.save();

      // Update user compliance status
      await User.findByIdAndUpdate(user_id, {
        compliance_status: status || "pending-review",
      });

      const populatedApplication = await Compliance.findById(
        application._id
      ).populate(
        "user_id",
        "first_name last_name email phone_number age_range gender employment_status"
      );

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: populatedApplication,
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

  // Update application
  async updateApplication(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Invalid application ID",
          })
        );
      }

      const application = await Compliance.findById(id);
      if (!application) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Application not found",
          })
        );
      }

      // Update application
      const updatedApplication = await Compliance.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate(
        "user_id",
        "first_name last_name email phone_number age_range gender employment_status"
      );

      // Update user compliance status if status changed
      if (updateData.status && updateData.status !== application.status) {
        await User.findByIdAndUpdate(application.user_id, {
          compliance_status: updateData.status,
        });

        // Update account status based on compliance status
        if (updateData.status === "approved") {
          await User.findByIdAndUpdate(application.user_id, {
            account_status: "verified",
          });
        }
      }

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: updatedApplication,
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

  // Delete application
  async deleteApplication(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Invalid application ID",
          })
        );
      }

      const application = await Compliance.findById(id);
      if (!application) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Application not found",
          })
        );
      }

      await Compliance.findByIdAndDelete(id);

      // Update user compliance status back to pending
      await User.findByIdAndUpdate(application.user_id, {
        compliance_status: "pending",
        account_status: "unverified",
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

  // Bulk update applications
  async bulkUpdateApplications(req, res) {
    try {
      const { applicationIds, updateData } = req.body;

      // Validate required fields using helper
      const missingFields = helper.fieldValidator({
        applicationIds,
        updateData,
      });
      if (missingFields.length > 0) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: `Missing required fields: ${missingFields.join(", ")}`,
          })
        );
      }

      if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Application IDs must be a non-empty array",
          })
        );
      }

      const validIds = applicationIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );
      if (validIds.length !== applicationIds.length) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Some application IDs are invalid",
          })
        );
      }

      const result = await Compliance.updateMany(
        { _id: { $in: validIds } },
        { ...updateData, updatedAt: new Date() }
      );

      // If updating status, update user compliance status
      if (updateData.status) {
        const applications = await Compliance.find({ _id: { $in: validIds } });
        const userUpdates = applications.map((app) =>
          User.findByIdAndUpdate(app.user_id, {
            compliance_status: updateData.status,
            ...(updateData.status === "approved"
              ? { account_status: "verified" }
              : {}),
          })
        );
        await Promise.all(userUpdates);
      }

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            message: `${result.modifiedCount} applications updated successfully`,
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

  // Get application statistics
  async getApplicationStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let matchConditions = {};
      if (startDate || endDate) {
        matchConditions.createdAt = {};
        if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
        if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
      }

      const stats = await Compliance.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalApplications: { $sum: 1 },
            pendingApplications: {
              $sum: { $cond: [{ $eq: ["$status", "pending-review"] }, 1, 0] },
            },
            approvedApplications: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            rejectedApplications: {
              $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
            },
          },
        },
      ]);

      // Get applications by user demographics
      const demographicsBreakdown = await Compliance.aggregate([
        { $match: matchConditions },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $group: {
            _id: {
              age_range: "$userDetails.age_range",
              gender: "$userDetails.gender",
              employment_status: "$userDetails.employment_status",
            },
            count: { $sum: 1 },
          },
        },
      ]);

      // Get status breakdown with user info
      const statusBreakdown = await Compliance.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get monthly application trends
      const monthlyTrends = await Compliance.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            applications: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
            },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]);

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            overview: stats[0] || {
              totalApplications: 0,
              pendingApplications: 0,
              approvedApplications: 0,
              rejectedApplications: 0,
            },
            statusBreakdown,
            demographicsBreakdown,
            monthlyTrends,
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

  // Get applications by status
  async getApplicationsByStatus(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;

      if (!status) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Status parameter is required",
          })
        );
      }

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const applications = await Compliance.find({ status })
        .populate(
          "user_id",
          "first_name last_name email phone_number age_range gender employment_status account_status"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);

      const total = await Compliance.countDocuments({ status });
      const totalPages = Math.ceil(total / limitNumber);

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            applications,
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

  // Approve application
  async approveApplication(req, res) {
    try {
      const { id } = req.params;
      const { approver_notes } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Invalid application ID",
          })
        );
      }

      const application = await Compliance.findById(id);
      if (!application) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Application not found",
          })
        );
      }

      // Update application status to approved
      const updatedApplication = await Compliance.findByIdAndUpdate(
        id,
        {
          status: "approved",
          approver_notes,
          approved_at: new Date(),
          updatedAt: new Date(),
        },
        { new: true }
      ).populate("user_id", "first_name last_name email phone_number");

      // Update user status
      await User.findByIdAndUpdate(application.user_id, {
        compliance_status: "approved",
        account_status: "verified",
      });

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: updatedApplication,
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

  // Reject application
  async rejectApplication(req, res) {
    try {
      const { id } = req.params;
      const { rejection_reason, rejector_notes } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(
          helper.responseHandler({
            status: 400,
            error: "Invalid application ID",
          })
        );
      }

      const application = await Compliance.findById(id);
      if (!application) {
        return res.status(404).json(
          helper.responseHandler({
            status: 404,
            error: "Application not found",
          })
        );
      }

      // Update application status to rejected
      const updatedApplication = await Compliance.findByIdAndUpdate(
        id,
        {
          status: "rejected",
          rejection_reason,
          rejector_notes,
          rejected_at: new Date(),
          updatedAt: new Date(),
        },
        { new: true }
      ).populate("user_id", "first_name last_name email phone_number");

      // Update user status
      await User.findByIdAndUpdate(application.user_id, {
        compliance_status: "rejected",
      });

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: updatedApplication,
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

  // Export applications
  async exportApplications(req, res) {
    try {
      const {
        search,
        status,
        employment_status,
        age_range,
        gender,
        startDate,
        endDate,
        format = "json",
      } = req.query;

      // Build match conditions
      let matchConditions = {};
      if (startDate || endDate) {
        matchConditions.createdAt = {};
        if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
        if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
      }
      if (status) matchConditions.status = status;

      let pipeline = [
        {
          $lookup: {
            from: "users",
            localField: "user_id",
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
            ],
          },
        });
      }

      // Add user-specific filters
      let userFilters = {};
      if (employment_status)
        userFilters["userDetails.employment_status"] = employment_status;
      if (age_range) userFilters["userDetails.age_range"] = age_range;
      if (gender) userFilters["userDetails.gender"] = gender;

      if (Object.keys(userFilters).length > 0) {
        pipeline.push({ $match: userFilters });
      }

      if (Object.keys(matchConditions).length > 0) {
        pipeline.push({ $match: matchConditions });
      }

      pipeline.push({
        $project: {
          status: 1,
          createdAt: 1,
          user_name: {
            $concat: ["$userDetails.first_name", " ", "$userDetails.last_name"],
          },
          user_email: "$userDetails.email",
          user_phone: "$userDetails.phone_number",
          age_range: "$userDetails.age_range",
          gender: "$userDetails.gender",
          employment_status: "$userDetails.employment_status",
          account_status: "$userDetails.account_status",
          preferred_state: "$location_preference.preferred_state",
          preferred_city: "$location_preference.preferred_city",
          housing_type: "$location_preference.type_of_housing",
          budget: "$location_preference.budget",
          monthly_income: "$customer_account_profile.monthly_income",
        },
      });

      const applications = await Compliance.aggregate(pipeline);

      if (format === "csv") {
        const csvHeaders = [
          "User Name",
          "Email",
          "Phone",
          "Age Range",
          "Gender",
          "Employment Status",
          "Account Status",
          "Application Status",
          "Preferred State",
          "Preferred City",
          "Housing Type",
          "Budget",
          "Monthly Income",
          "Application Date",
        ];

        const csvRows = applications.map((app) => [
          app.user_name || "",
          app.user_email || "",
          app.user_phone || "",
          app.age_range || "",
          app.gender || "",
          app.employment_status || "",
          app.account_status || "",
          app.status || "",
          app.preferred_state || "",
          app.preferred_city || "",
          app.housing_type || "",
          app.budget || "",
          app.monthly_income || "",
          new Date(app.createdAt).toLocaleDateString(),
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map((row) => row.map((field) => `"${field}"`).join(","))
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="applications.csv"'
        );
        return res.send(csvContent);
      }

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: applications,
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

  // Get applications requiring review (pending applications)
  async getPendingApplications(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "asc",
      } = req.query;

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const sortCondition = {};
      sortCondition[sortBy] = sortOrder === "asc" ? 1 : -1;

      const applications = await Compliance.find({ status: "pending-review" })
        .populate(
          "user_id",
          "first_name last_name email phone_number age_range gender employment_status image"
        )
        .sort(sortCondition)
        .skip(skip)
        .limit(limitNumber);

      const total = await Compliance.countDocuments({
        status: "pending-review",
      });
      const totalPages = Math.ceil(total / limitNumber);

      res.status(200).json(
        helper.responseHandler({
          status: 200,
          data: {
            applications,
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
}

module.exports = new AdminApplicationsController();
