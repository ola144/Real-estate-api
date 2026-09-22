const express = require("express");

const {
  getCountries,
  getStates,
  getCities,
} = require("../Controllers/locationController");

const router = express.Router();

router.get("/countries", getCountries);
router.get("/states/:countryCode", getStates);
router.get("/cities/:countryCode/:stateCode", getCities);

module.exports = router;
