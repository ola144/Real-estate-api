const User = require("../Models/user.js");
const Property = require("../Models/property.js");
const crypto = require("node:crypto");
const { sendEmail } = require("../utils/email.js");

exports.getAgents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNumber = Number(page);

    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const filter = {
      role: "agent",
    };

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: search,
            $options: "i",
          },
        },

        {
          location: {
            $regex: search,
            $options: "i",
          },
        },

        {
          specialization: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [agents, total] = await Promise.all([
      User.find(filter)

        .select("-password")

        .sort({
          createdAt: -1,
        })

        .skip(skip)

        .limit(limitNumber)

        .lean(),

      User.countDocuments(filter),
    ]);

    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const propertyCount = await Property.countDocuments({
          agent: agent._id,
        });

        return {
          ...agent,
          propertyCount,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      agents: agentsWithStats,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message || "Failed to fetch agents.",
    });
  }
};

exports.getAgent = async (req, res) => {
  try {
    const agent = await User.findOne({
      _id: req.params.id,
      role: "agent",
    })
      .select("+password")
      .lean();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    const [properties, total, available, sold, rented] = await Promise.all([
      Property.find({
        agent: agent._id,
      })
        .populate("agent", "name, email, phone, photo")
        .sort({
          createdAt: -1,
        }),

      Property.countDocuments({
        agent: agent._id,
      }),

      Property.countDocuments({
        agent: agent._id,
        status: "available",
      }),

      Property.countDocuments({
        agent: agent._id,
        status: "sold",
      }),

      Property.countDocuments({
        agent: agent._id,
        status: "rented",
      }),
    ]);

    const getPercentage = (count) => {
      if (total === 0) return 0;

      return Number(((count / total) * 100).toFixed(2));
    };

    const propertyStats = {
      total,
      available: {
        count: available,
        percentage: getPercentage(available),
      },
      sold: {
        count: sold,
        percentage: getPercentage(sold),
      },
      rented: {
        count: rented,
        percentage: getPercentage(rented),
      },
    };

    return res.status(200).json({
      success: true,

      agent: {
        ...agent,
        hasPassword: Boolean(agent.password),
        propertyCount: total,

        propertyStats,

        properties,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message || "Failed to fetch agent.",
    });
  }
};

exports.createAgent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      photo,
      bio,
      gender,
      specialization,
      experience,
      licenseNumber,
      location,
    } = req.body;

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,

        message: "A user with this email already exists.",
      });
    }

    // Generate random token
    const setupToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(setupToken)
      .digest("hex");

    //Token expires in 30 minutes
    const setupExpires = new Date(Date.now() + 30 * 60 * 1000);

    const agent = await User.create({
      name,
      email,
      password: null,
      phone,
      photo,
      bio,
      gender,
      specialization,
      experience,
      licenseNumber,
      location,
      role: "agent",
      passwordSetupToken: hashedToken,
      passwordSetupExpires: setupExpires,
    });

    const setupUrl = `${process.env.FRONTEND_URL}/auth/create-password?token=${setupToken}`;

    //send email
    await sendEmail({
      to: agent.email,
      subject: "Create your Real Estate Dashboard Password",
      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
          "
        >

          <h2>
            Welcome to RealEstate
          </h2>

          <p>
            Hello ${agent.name},
          </p>

          <p>
            An administrator has created an
            agent account for you.
          </p>

          <p>
            Click the button below to create
            your password and access your
            dashboard.
          </p>

          <div style="margin: 30px 0;">

            <a
              href="${setupUrl}"
              style="
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 14px 24px;
                border-radius: 8px;
                text-decoration: none;
              "
            >
              Create Password
            </a>

          </div>

          <p>
            This link will expire in
            <strong>30 minutes</strong>.
          </p>

          <p>
            If you did not expect this email,
            you can safely ignore it.
          </p>

        </div>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Agent created successfully. Password setup email sent.",
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        photo: agent.photo,
        bio: agent.bio,
        specialization: agent.specialization,
        experience: agent.experience,
        licenseNumber: agent.licenseNumber,
        location: agent.location,
        role: agent.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message || "Failed to create agent.",
    });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const agent = await User.findOne({
      _id: req.params.id,
      role: "agent",
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isOwner = req.user._id.toString() === agent._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,

        message: "You are not authorized to update this agent.",
      });
    }

    const fields = [
      "name",
      "phone",
      "photo",
      "bio",
      "specialization",
      "experience",
      "licenseNumber",
      "location",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        agent[field] = req.body[field];
      }
    });

    await agent.save();

    return res.status(200).json({
      success: true,
      message: "Agent updated successfully.",
      agent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message || "Failed to update agent.",
    });
  }
};

exports.deactivateAgent = async (req, res) => {
  try {
    const agent = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "agent",
      },
      {
        isActive: false,
      },

      {
        new: true,
      },
    );

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Agent deactivated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to deactivate agent.",
    });
  }
};

exports.activateAgent = async (req, res) => {
  try {
    const agent = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: "agent",
      },
      {
        isActive: true,
      },

      {
        new: true,
      },
    );

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Agent activated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to deactivate agent.",
    });
  }
};

exports.resendPasswordLink = async (req, res) => {
  try {
    const agent = await User.findOne({
      _id: req.params.id,
      role: "agent",
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    const setupToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(setupToken)
      .digest("hex");

    agent.passwordSetupToken = hashedToken;

    agent.passwordSetupExpires = new Date(Date.now() + 30 * 60 * 1000);

    await agent.save();

    const setupUrl = `${process.env.FRONTEND_URL}/auth/create-password?token=${setupToken}`;

    await sendEmail({
      to: agent.email,
      subject: "Create your Real Estate Dashboard password",
      html: `
        <h2>
          Create your password
        </h2>

        <p>
          Hello ${agent.name},
        </p>

        <p>
          Click the link below to create
          your dashboard password.
        </p>

        <p>
          <a href="${setupUrl}">
            Create Password
          </a>
        </p>

        <p>
          This link expires in 30 minutes.
        </p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Password setup link sent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to resend password setup link.",
    });
  }
};

exports.getAgentDashboardStatistics = async (req, res) => {
  try {
    const agentId = req.user._id;

    // =======
    // Total properties
    // =======

    const totalProperties = await Property.countDocuments({
      agent: agentId,
    });

    // =======
    // Properties by status
    // =======

    const statusStatistics = await Property.aggregate([
      {
        $match: {
          agent: agentId,
        },
      },

      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const byStatus = {
      available: 0,
      sold: 0,
      rented: 0,
    };

    statusStatistics.forEach((item) => {
      if (item._id === "available") {
        byStatus.available = item.count;
      }

      if (item._id === "sold") {
        byStatus.sold = item.count;
      }

      if (item._id === "rented") {
        byStatus.rented = item.count;
      }
    });

    // =======
    // Properties by type
    // ========

    const propertyTypeStatistics = await Property.aggregate([
      {
        $match: {
          agent: agentId,
        },
      },

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

    propertyTypeStatistics.forEach((item) => {
      byType[item._id] = item.count;
    });

    // ========
    // Revenue
    // ========

    const revenueStatistics = await Property.aggregate([
      {
        $match: {
          agent: agentId,
          status: {
            $in: ["sold", "rented"],
          },
        },
      },

      {
        $group: {
          _id: "$status",

          revenue: {
            $sum: {
              $convert: {
                input: "$price",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
          },
        },
      },
    ]);

    let soldRevenue = 0;
    let rentalRevenue = 0;

    revenueStatistics.forEach((item) => {
      if (item._id === "sold") {
        soldRevenue = item.revenue;
      }

      if (item._id === "rented") {
        rentalRevenue = item.revenue;
      }
    });

    const totalRevenue = soldRevenue + rentalRevenue;

    // ========
    // Revenue Chart
    // ========
    const revenueResult = await Property.aggregate([
      {
        $match: {
          agent: agentId,
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

    const recentProperties = await Property.find({ agent: agentId });

    // ========
    // Response
    // ========

    return res.status(200).json({
      success: true,

      statistics: {
        overview: {
          totalProperties,

          availableProperties: byStatus.available,

          soldProperties: byStatus.sold,

          rentedProperties: byStatus.rented,
        },

        properties: {
          byStatus,

          byType,
        },

        revenue: {
          totalRevenue,
          soldRevenue,
          rentalRevenue,
        },

        revenueChart: {
          categories: months,
          data: revenueData,
        },

        recentProperties,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message || "Failed to get dashboard statistics",
    });
  }
};

exports.getAgentProperties = async (req, res) => {
  try {
    const agentId = req.params.id;

    const {
      page = 1,
      limit = 10,
      search,
      propertyType,
      country,
      state,
      city,
      minPrice,
      maxPrice,
      status,
      sort = "newest",
    } = req.query;

    // ------------------
    // Build query
    // ------------------

    const query = {};

    // Search
    if (search) {
      query.$text = {
        $search: search,
      };
    }

    // Property type
    if (propertyType) {
      query.propertyType = propertyType;
    }

    // Country
    if (country) {
      query["location.country.code"] = country.toUpperCase();
    }

    // State
    if (state) {
      query["location.state.code"] = state.toUpperCase();
    }

    // City
    if (city) {
      query["location.city"] = {
        $regex: city,
        $options: "i",
      };
    }

    // Status
    if (status) {
      query.status = status;
    }

    // Price
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // -------------------
    // Pagination
    // -------------------
    const currentPage = Math.max(Number(page), 1);

    const perPage = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (currentPage - 1) * perPage;

    // ------------
    // Sorting
    // ------------
    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "price_asc":
        sortOption = {
          price: 1,
        };
        break;

      case "price_desc":
        sortOption = {
          price: -1,
        };
        break;

      case "title_asc":
        sortOption = {
          title: 1,
        };
        break;

      case "title_desc":
        sortOption = {
          title: -1,
        };
        break;

      default:
        sortOption = {
          createdAt: -1,
        };
    }

    // -------------------
    // Query database
    // -------------------

    const propertyQuery = {
      agent: agentId,
      ...query,
    };

    const [properties, total] = await Promise.all([
      Property.find(propertyQuery)
        .populate("agent", "name email phone photo role")
        .sort(sortOption)
        .skip(skip)
        .limit(perPage),

      Property.countDocuments(propertyQuery),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return res.status(200).json({
      success: true,

      count: properties.length,

      total,

      page: currentPage,

      limit: perPage,

      totalPages,

      hasNextPage: currentPage < totalPages,

      hasPreviousPage: currentPage > 1,

      properties,
    });
  } catch (error) {
    console.error("Get properties error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch properties.",
    });
  }
};
