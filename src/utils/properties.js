const mongoose = require("mongoose");

const agentIds = {
  agent1: new mongoose.Types.ObjectId("6a86ee7d130027a0ed44ae46"),
  agent2: new mongoose.Types.ObjectId("6a86eec2130027a0ed44ae47"),
  agent3: new mongoose.Types.ObjectId("6a86ee38130027a0ed44ae45"),
};

const properties = [
  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000001"),
    title: "Modern 3-Bedroom Apartment",
    description:
      "A beautifully finished three-bedroom apartment with spacious rooms, modern fittings, excellent natural lighting, and a secure environment.",
    propertyType: "Apartment",
    listingType: "rent",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Lekki",
      address: "12 Admiralty Way, Lekki Phase 1",
    },
    price: 4500000,
    photo:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 3,
    baths: 3,
    area: 185,
    facilities: [
      "24/7 Security",
      "Swimming Pool",
      "Parking",
      "Gym",
      "Generator",
    ],
    agent: agentIds.agent1,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000002"),
    title: "Luxury 5-Bedroom Duplex",
    description:
      "A spacious luxury duplex featuring five bedrooms, a modern kitchen, large living areas, private parking, and a beautifully landscaped compound.",
    propertyType: "House",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Ikoyi",
      address: "18 Glover Road, Ikoyi",
    },
    price: 250000000,
    photo:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 5,
    baths: 6,
    area: 520,
    facilities: [
      "Swimming Pool",
      "Smart Home",
      "Security",
      "Garden",
      "Parking",
    ],
    agent: agentIds.agent2,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000003"),
    title: "Contemporary 4-Bedroom Villa",
    description:
      "A contemporary villa designed for comfortable family living with elegant interiors, spacious bedrooms, and premium outdoor facilities.",
    propertyType: "Villa",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "AB",
        name: "Abuja",
      },
      city: "Maitama",
      address: "25 Agadez Street, Maitama",
    },
    price: 320000000,
    photo:
      "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 4,
    baths: 5,
    area: 610,
    facilities: [
      "Swimming Pool",
      "Garden",
      "Security",
      "Boys Quarters",
      "Parking",
    ],
    agent: agentIds.agent3,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000004"),
    title: "Affordable 2-Bedroom Apartment",
    description:
      "A comfortable two-bedroom apartment suitable for young professionals or small families, located close to major roads and commercial areas.",
    propertyType: "Apartment",
    listingType: "rent",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Yaba",
      address: "7 Herbert Macaulay Way, Yaba",
    },
    price: 2800000,
    photo:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 2,
    baths: 2,
    area: 120,
    facilities: ["Parking", "Security", "Water Supply", "Electricity"],
    agent: agentIds.agent1,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000005"),
    title: "Commercial Shopping Complex",
    description:
      "A strategically positioned commercial property suitable for retail businesses, restaurants, offices, and other commercial activities.",
    propertyType: "Commercial",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Victoria Island",
      address: "45 Ahmadu Bello Way, Victoria Island",
    },
    price: 480000000,
    photo:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 0,
    baths: 4,
    area: 850,
    facilities: ["Parking", "Security", "Generator", "CCTV", "Elevator"],
    agent: agentIds.agent2,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000006"),
    title: "Residential Land in Lokogoma",
    description:
      "A well-positioned residential plot in a developing neighborhood with good road access and excellent potential for future appreciation.",
    propertyType: "Land",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "AB",
        name: "Abuja",
      },
      city: "Lokogoma",
      address: "Plot 18, District 5, Lokogoma",
    },
    price: 35000000,
    photo:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 0,
    baths: 0,
    area: 600,
    facilities: ["Road Access", "Electricity", "Security", "Water Supply"],
    agent: agentIds.agent3,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000007"),
    title: "Premium Executive Office",
    description:
      "Fully fitted executive office space with modern workstations, meeting rooms, reception area, and reliable power supply.",
    propertyType: "Office",
    listingType: "rent",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Ikeja",
      address: "14 Allen Avenue, Ikeja",
    },
    price: 12000000,
    photo:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 0,
    baths: 3,
    area: 420,
    facilities: ["Reception", "Meeting Room", "Parking", "Generator", "CCTV"],
    agent: agentIds.agent1,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000008"),
    title: "Large Industrial Warehouse",
    description:
      "A spacious industrial warehouse suitable for logistics, manufacturing, storage, and distribution businesses.",
    propertyType: "Warehouse",
    listingType: "rent",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Ikeja",
      address: "22 Industrial Estate Road, Ikeja",
    },
    price: 18000000,
    photo:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 0,
    baths: 2,
    area: 1400,
    facilities: [
      "Loading Bay",
      "Security",
      "Parking",
      "Generator",
      "Large Storage Area",
    ],
    agent: agentIds.agent2,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000009"),
    title: "Elegant 4-Bedroom Family Home",
    description:
      "A beautifully designed family home with generous living spaces, modern bathrooms, fitted kitchen, and a secure gated compound.",
    propertyType: "House",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "OG",
        name: "Ogun",
      },
      city: "Abeokuta",
      address: "10 Presidential Estate Road, Abeokuta",
    },
    price: 78000000,
    photo:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 4,
    baths: 4,
    area: 380,
    facilities: ["Parking", "Garden", "Security", "Boys Quarters"],
    agent: agentIds.agent3,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000010"),
    title: "Waterfront Luxury Apartment",
    description:
      "A premium waterfront apartment offering stunning views, modern architecture, spacious rooms, and exclusive recreational facilities.",
    propertyType: "Apartment",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Lekki",
      address: "8 Ocean View Road, Lekki",
    },
    price: 185000000,
    photo:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 3,
    baths: 4,
    area: 270,
    facilities: [
      "Waterfront View",
      "Swimming Pool",
      "Gym",
      "Security",
      "Parking",
    ],
    agent: agentIds.agent1,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000011"),
    title: "Modern 3-Bedroom Apartment",
    description:
      "A stylish three-bedroom apartment with contemporary finishes, fitted kitchen, spacious lounge, and excellent security.",
    propertyType: "Apartment",
    listingType: "rent",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "AB",
        name: "Abuja",
      },
      city: "Wuse",
      address: "32 Aminu Kano Crescent, Wuse 2",
    },
    price: 5500000,
    photo:
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 3,
    baths: 3,
    area: 210,
    facilities: ["Security", "Parking", "Gym", "Generator"],
    agent: agentIds.agent2,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000012"),
    title: "Exclusive 6-Bedroom Villa",
    description:
      "An expansive luxury villa featuring six bedrooms, multiple living areas, private swimming pool, landscaped garden, and premium security.",
    propertyType: "Villa",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Banana Island",
      address: "6 Palm Grove Avenue, Banana Island",
    },
    price: 650000000,
    photo:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 6,
    baths: 8,
    area: 950,
    facilities: [
      "Swimming Pool",
      "Private Garden",
      "Smart Home",
      "Gym",
      "Cinema",
      "Security",
    ],
    agent: agentIds.agent3,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000013"),
    title: "Prime Commercial Property",
    description:
      "A strategically located commercial building ideal for banks, restaurants, retail outlets, corporate offices, and showrooms.",
    propertyType: "Commercial",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Surulere",
      address: "19 Adeniran Ogunsanya Street, Surulere",
    },
    price: 210000000,
    photo:
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 0,
    baths: 4,
    area: 700,
    facilities: ["Parking", "Security", "CCTV", "Generator", "Reception"],
    agent: agentIds.agent1,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000014"),
    title: "Affordable Residential Plot",
    description:
      "A residential plot located in a fast-growing community with access to roads, electricity, water, and other essential infrastructure.",
    propertyType: "Land",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "OG",
        name: "Ogun",
      },
      city: "Ibeju-Lekki",
      address: "Plot 42, Sunrise Estate, Ibeju-Lekki",
    },
    price: 18000000,
    photo:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 0,
    baths: 0,
    area: 500,
    facilities: ["Road Access", "Electricity", "Security", "Drainage"],
    agent: agentIds.agent2,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000015"),
    title: "Fully Furnished Executive Apartment",
    description:
      "A fully furnished executive apartment featuring premium furniture, modern appliances, elegant interiors, and excellent estate facilities.",
    propertyType: "Apartment",
    listingType: "rent",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Victoria Island",
      address: "11 Kofo Abayomi Street, Victoria Island",
    },
    price: 9000000,
    photo:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 3,
    baths: 3,
    area: 240,
    facilities: [
      "Fully Furnished",
      "Swimming Pool",
      "Gym",
      "Security",
      "Parking",
    ],
    agent: agentIds.agent3,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000016"),
    title: "Corporate Office Building",
    description:
      "A modern corporate office building with multiple offices, conference rooms, reception areas, elevators, and dedicated parking.",
    propertyType: "Office",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "AB",
        name: "Abuja",
      },
      city: "Central Business District",
      address: "15 Constitution Avenue, Abuja",
    },
    price: 390000000,
    photo:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 0,
    baths: 8,
    area: 1200,
    facilities: [
      "Elevator",
      "Conference Room",
      "Parking",
      "CCTV",
      "Generator",
      "Reception",
    ],
    agent: agentIds.agent1,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000017"),
    title: "Modern 4-Bedroom Duplex",
    description:
      "A newly built four-bedroom duplex with modern architecture, spacious living rooms, fitted kitchen, and a secure gated compound.",
    propertyType: "House",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Magodo",
      address: "24 Shangisha Road, Magodo Phase 2",
    },
    price: 135000000,
    photo:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 4,
    baths: 5,
    area: 430,
    facilities: ["Parking", "Security", "Garden", "Generator", "Boys Quarters"],
    agent: agentIds.agent2,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000018"),
    title: "Industrial Storage Warehouse",
    description:
      "A high-capacity warehouse with easy access for trucks and commercial vehicles, suitable for distribution and storage operations.",
    propertyType: "Warehouse",
    listingType: "rent",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Alaba",
      address: "31 Industrial Avenue, Alaba",
    },
    price: 15000000,
    photo:
      "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 0,
    baths: 2,
    area: 1100,
    facilities: [
      "Loading Bay",
      "Truck Access",
      "Security",
      "Parking",
      "Generator",
    ],
    agent: agentIds.agent3,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000019"),
    title: "Premium 5-Bedroom Residence",
    description:
      "A premium family residence with five spacious bedrooms, stylish interiors, landscaped outdoor space, and modern security features.",
    propertyType: "House",
    listingType: "sale",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "AB",
        name: "Abuja",
      },
      city: "Asokoro",
      address: "17 Danube Street, Asokoro",
    },
    price: 285000000,
    photo:
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 5,
    baths: 6,
    area: 580,
    facilities: [
      "Swimming Pool",
      "Garden",
      "Security",
      "Generator",
      "Parking",
      "Boys Quarters",
    ],
    agent: agentIds.agent1,
    status: "available",
  },

  {
    _id: new mongoose.Types.ObjectId("68a100000000000000000020"),
    title: "Luxury Estate Villa",
    description:
      "An exclusive estate villa with elegant architecture, large bedrooms, premium finishes, private parking, and a beautifully landscaped compound.",
    propertyType: "Villa",
    listingType: "rent",
    location: {
      country: {
        code: "NG",
        name: "Nigeria",
      },
      state: {
        code: "LA",
        name: "Lagos",
      },
      city: "Chevron",
      address: "9 Palm View Estate, Chevron Drive",
    },
    price: 18000000,
    photo:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    ],
    beds: 5,
    baths: 7,
    area: 720,
    facilities: [
      "Swimming Pool",
      "Gym",
      "Garden",
      "Smart Home",
      "Security",
      "Parking",
    ],
    agent: agentIds.agent2,
    status: "available",
  },
];

module.exports = properties;
