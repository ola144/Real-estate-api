const Property = require("../Models/property");

// =======
// CREATE PROPERTY
// =======

exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      price,
      photo,
      photos,
      location,
      beds,
      baths,
      area,
      facilities,
      status,
    } = req.body;

    const property = await Property.create({
      title,
      description,
      propertyType,
      price,
      photo,
      photos,
      location,
      beds,
      baths,
      area,
      facilities,
      status,

      // Logged-in user becomes the agent
      agent: req.user._id,
    });

    const populatedProperty = await Property.findById(property._id).populate(
      "agent",
      "name email phone photo role",
    );

    return res.status(201).json({
      success: true,
      message: "Property created successfully.",
      property: populatedProperty,
    });
  } catch (error) {
    console.error("Create property error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create property.",
    });
  }
};

// =======
// GET ALL PROPERTIES
// =======

exports.getProperties = async (req, res) => {
  try {
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

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate("agent", "name email phone photo role")
        .sort(sortOption)
        .skip(skip)
        .limit(perPage),

      Property.countDocuments(query),
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

// ==========
// GET SINGLE PROPERTY
// ==========

exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "agent",
      "name email phone photo role propertyCount location",
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    return res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("Get property error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch property.",
    });
  }
};

// =======
// UPDATE PROPERTY
// =======

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    // Check ownership
    const isOwner = property.agent.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this property.",
      });
    }

    // Don't allow agent to change ownership
    const { agent, ...updateData } = req.body;

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,

      updateData,

      {
        new: true,
        runValidators: true,
      },
    ).populate("agent", "name email phone photo role");

    return res.status(200).json({
      success: true,
      message: "Property updated successfully.",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Update property error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update property.",
    });
  }
};

// =======
// DELETE PROPERTY
// =======

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    const isOwner = property.agent.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this property.",
      });
    }

    await property.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully.",
    });
  } catch (error) {
    console.error("Delete property error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete property.",
    });
  }
};

exports.getAvailablePropertiesForUser = async (req, res) => {
  try {
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
      status: "available",
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
