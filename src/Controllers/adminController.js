const Property = require("../Models/property");
const User = require("../Models/user");

// =====
// ADMIN DASHBOARD STATISTICS
// =====

exports.getAdminDashboardStatistics = async (req, res) => {
  try {
    // =====
    // PROPERTY STATISTICS
    // =====

    const totalProperties = await Property.countDocuments();

    const availableProperties = await Property.countDocuments({
      status: "available",
    });

    const soldProperties = await Property.countDocuments({
      status: "sold",
    });

    const rentedProperties = await Property.countDocuments({
      status: "rented",
    });

    // =====
    // AGENT STATISTICS
    // =====

    const totalAgents = await User.countDocuments({ role: "agent" });

    const activeAgents = await User.countDocuments({
      isActive: true,
      role: "agent",
    });

    const inactiveAgents = await User.countDocuments({
      isActive: false,
      role: "agent",
    });

    // =====
    // CUSTOMER STATISTICS
    // =====

    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth());

    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
    );

    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth());

    console.log(startOfCurrentMonth, startOfPreviousMonth, endOfPreviousMonth);

    const [currentCustomers, previousCustomers, totalCustomers] =
      await Promise.all([
        User.countDocuments({
          role: "customer",
          createdAt: { $gte: startOfCurrentMonth },
        }),

        User.countDocuments({
          role: "customer",
          createdAt: {
            $gte: startOfPreviousMonth,
            $lt: endOfPreviousMonth,
          },
        }),

        User.countDocuments({
          role: "customer",
        }),
      ]);

    let percentageChange = 0;

    if (previousCustomers === 0) {
      percentageChange = currentCustomers > 0 ? 100 : 0;
    } else {
      percentageChange =
        ((currentCustomers - previousCustomers) / previousCustomers) * 100;
    }

    // =====
    // REVENUE
    // =====

    const soldRevenueResult = await Property.aggregate([
      {
        $match: {
          status: "sold",
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: {
              $toDouble: "$price",
            },
          },
        },
      },
    ]);

    const rentalRevenueResult = await Property.aggregate([
      {
        $match: {
          status: "rented",
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: {
              $toDouble: "$price",
            },
          },
        },
      },
    ]);

    const soldRevenue = soldRevenueResult[0]?.total || 0;

    const rentalRevenue = rentalRevenueResult[0]?.total || 0;

    const totalRevenue = soldRevenue + rentalRevenue;

    // =====
    // REVENUE CHART
    // =====

    const revenueResult = await Property.aggregate([
      {
        $match: {
          status: {
            $in: ["sold", "rented"],
          },
        },
      },

      {
        $group: {
          _id: {
            month: {
              $month: "$updatedAt",
            },

            year: {
              $year: "$updatedAt",
            },
          },

          total: {
            $sum: {
              $toDouble: "$price",
            },
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // =====
    // CREATE 12 MONTH CHART DATA
    // =====

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const revenueData = new Array(12).fill(0);

    revenueResult.forEach((item) => {
      const monthIndex = item._id.month - 1;

      revenueData[monthIndex] = item.total;
    });

    // =====
    // PROPERTY TYPES
    // =====

    const propertyTypeResult = await Property.aggregate([
      {
        $group: {
          _id: "$propertyType",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const byType = {};

    propertyTypeResult.forEach((item) => {
      if (item._id) {
        byType[item._id] = item.count;
      }
    });

    // =====
    // AGENT PROPERTY STATISTICS
    // =====

    const agentPropertyResult = await Property.aggregate([
      {
        $group: {
          _id: "$agent",

          totalProperties: {
            $sum: 1,
          },

          sold: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "sold"],
                },
                1,
                0,
              ],
            },
          },

          rented: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "rented"],
                },
                1,
                0,
              ],
            },
          },

          available: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "available"],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          totalProperties: -1,
        },
      },

      {
        $limit: 5,
      },
    ]);

    // =====
    // POPULATE TOP AGENTS
    // =====

    const topAgentIds = agentPropertyResult
      .map((item) => item._id)
      .filter(Boolean);

    const topAgents = await User.find({
      _id: {
        $in: topAgentIds,
      },
    })
      .select("firstName lastName name email photo")
      .lean();

    const topAgentsData = agentPropertyResult.map((item) => {
      const agent = topAgents.find(
        (agent) => agent._id.toString() === item._id.toString(),
      );

      return {
        agentId: item._id,
        name: agent
          ? (
              agent.name || `${agent.firstName || ""} ${agent.lastName || ""}`
            ).trim()
          : "Unknown Agent",
        email: agent?.email || "",
        photo: agent?.photo || "",
        totalProperties: item.totalProperties,
        available: item.available,
        sold: item.sold,
        rented: item.rented,
      };
    });

    // =====
    // RECENT PROPERTIES
    // =====

    const recentProperties = await Property.find()
      .sort({
        createdAt: -1,
      })
      .limit(4)
      .select("title propertyType location price photo status agent createdAt")
      .populate("agent", "firstName lastName name")
      .lean();

    // =====
    // FINAL RESPONSE
    // =====

    return res.status(200).json({
      success: true,

      statistics: {
        // =====
        // OVERVIEW
        // =====

        overview: {
          totalProperties,
          availableProperties,
          soldProperties,
          rentedProperties,
          totalAgents,
          activeAgents,
          inactiveAgents,
          totalCustomers,
        },

        // =====
        // REVENUE
        // =====

        revenue: {
          totalRevenue,
          soldRevenue,
          rentalRevenue,
        },

        // =====
        // PROPERTY STATISTICS
        // =====

        properties: {
          byStatus: {
            available: availableProperties,
            sold: soldProperties,
            rented: rentedProperties,
          },

          byType,
        },

        // =====
        // AGENT STATISTICS
        // =====

        agents: {
          total: totalAgents,
          active: activeAgents,
          inactive: inactiveAgents,
          topAgents: topAgentsData,
        },

        // =====
        // CUSTOMER STATISTICS
        // =====

        customers: {
          total: totalCustomers,
          currentCustomers: currentCustomers,
          previousCustomers: previousCustomers,
          percentageChange,
        },

        // =====
        // REVENUE CHART
        // =====

        revenueChart: {
          categories: months,
          data: revenueData,
        },

        // =====
        // RECENT PROPERTIES
        // =====

        recentProperties,
      },
    });
  } catch (error) {
    console.error("Admin dashboard statistics error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to get admin dashboard statistics",

      error: error.message,
    });
  }
};
