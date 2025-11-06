// Base URLs
// for converting city to geo location
const geoApi = "https://geocoding-api.open-meteo.com/v1/search";
// for fetching weather data
const weatherApi = "https://api.open-meteo.com/v1/forecast";

// Important DOM Elements
const form = document.getElemenetById("search-form");
const cityInput = document.getElementById("city-input");
const unitsSelect = document.getElementById("drop-down");

// Elements that are updated (used E1 to identify that these are elements)
const cityNameE1 = document.getElementById("city-name");
const dateE1 = document.getElementById("date");
const tempE1 = document.getElementById("temp");
const feelsLikeE1 = document.getElementById("feels-like");
const humidityE1 = document.getElementById("humidity");
const windE1 = document.getElementById("wind");
const precipitationE1 = document.getElementById("precipitation");

// Weather icon image
const weatherIcon = document.querySelector(".current-weather-card img");

// Event listeners

// Form submission (search)
form.addEventListener("submit", handleSearch);

// Unit change from dropdown
unitsSelect.addEventListener("change", () => {

    // split turns the city into an array seperated by the comma
    const cityDisplayed = cityNameE1.textContent.split(",")[0];

    // If a valid city is displayed, refetch using new units
    if (cityDisplayed && cityDisplayed !== "Berlin") {
        handleSearch(new Event("submit"));
    }
});

// MAIN FUNCTIONS

// Getting coordinates for city using Open-Meteo's Geocoding Api
async function getCoordinates(city) {
    const response = await axios.get(geoApi, {
        params: {
            // User input
            name: city,
            // limits to the top match
            count: 1
        }
    });

    //Extracting that first result
    const result = response.data.results && response.data.resuls[0];
    if (!result) throw new Error("City not found");

    return {
        latitiude: result.latitude,
        longitude: result.longitude,
        name: `${result.name}, ${result.country}`
    };
}