const { Country, State, City } = require("country-state-city");

// =====================
// GET ALL COUNTRIES
// =====================

exports.getCountries = async (req, res) => {
  try {
    const countries = Country.getAllCountries();

    const formattedCountries = countries.map((country) => ({
      code: country.isoCode,
      name: country.name,
      phoneCode: country.phonecode,
      flag: country.flag,
      currency: country.currency,
    }));

    res.status(200).json({
      success: true,
      count: formattedCountries.length,
      countries: formattedCountries,
    });
  } catch (error) {
    console.error("Get countries error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get countries.",
    });
  }
};

// ==================
// GET STATES BY COUNTRY
// ==================

exports.getStates = async (req, res) => {
  try {
    const { countryCode } = req.params;

    if (!countryCode) {
      return res.status(400).json({
        success: false,
        message: "Country code is required.",
      });
    }

    const country = Country.getCountryByCode(countryCode.toUpperCase());

    if (!country) {
      return res.status(404).json({
        success: false,
        message: "Country not found.",
      });
    }

    const states = State.getStatesOfCountry(countryCode.toUpperCase());

    const formattedStates = states.map((state) => ({
      code: state.isoCode,
      name: state.name,
      countryCode: state.countryCode,
    }));

    res.status(200).json({
      success: true,
      count: formattedStates.length,
      country: {
        code: country.isoCode,
        name: country.name,
      },
      states: formattedStates,
    });
  } catch (error) {
    console.error("Get states error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get states.",
    });
  }
};

exports.getCities = async (req, res) => {
  try {
    const { countryCode, stateCode } = req.params;

    if (!countryCode || !stateCode) {
      return res.status(400).json({
        success: false,
        message: "Country code and state code are required",
      });
    }

    const cities = City.getCitiesOfState(
      countryCode.toUpperCase(),
      stateCode.toUpperCase(),
    );

    return res.status(200).json({
      success: true,
      count: cities.length,
      cities,
    });
  } catch (error) {
    console.error("Get cities error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
    });
  }
};
