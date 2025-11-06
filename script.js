// Base URLs
// for converting city to geo location
const geoApi = "https://geocoding-api.open-meteo.com/v1/search?name=Berlin&count=10&language=en&format=json";
// for fetching weather data
const weatherApi = "https://api.open-meteo.com/v1/forecast";

// Important DOM Elements
const form = document.getElementById("search-form");
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

    // Split turns the city into an array seperated by the comma
    const cityDisplayed = cityNameE1.textContent.split(",")[0];

    // If a valid city is displayed, refetch using new units
    if (cityDisplayed && cityDisplayed !== "Berlin") {
        handleSearch(new Event("submit"));
    }
});

// MAIN FUNCTIONS

// Getting coordinates for city using Open Meteos Geocoding Api
async function getCoordinates(city) {
    const response = await axios.get(geoApi, {
        params: {
            // User input
            name: city,
            // Limits to the top match
            count: 1
        }
    });

    // Extracting that first result
    const result = response.data.results && response.data.results[0];
    if (!result) throw new Error("City not found");

    return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: `${result.name}, ${result.country}`
    };
}

//Fetch current weather data
async function fetchWeather(lat, lon, units = "metric") {
    //Decides which units to use
    const unitParams = {
        temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
        wind_speed_unit: units === "imperial" ? "mph" : "kmh",
        precipitation_unit: units === "imperial" ? "inch" : "mm"
    };

    // Make API request (had to do hourly details for humidity feels like, etc. not on their current weather object)
    const response = await axios.get(weatherApi, {
        params: {
            latitude: lat,
            longitude: lon,
            // Gives current temp, wind speed, etc.
            current_weather: true,
            hourly: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation",
            // Adjusts to local time zone
            timezone: "auto",
            ...unitParams
        }
    });

    return response.data;
}

// Handle the search event (user submitted form)
async function handleSearch(event) {
    // Prevents page reload on form submit
    event.preventDefault();

    const city = cityInput.value.trim();
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    // Keeps only city name (ran into issues when typing a city with a state or country in search)
        if (city.includes(",")) {
        let city = cityInput.value.trim();
    }
    
    // Determine selected units
    const units = unitsSelect.value !== "Units" ? unitsSelect.value : "metric";

    try {
        // 1. Get coordinates of city
        const { latitude, longitude, name } = await getCoordinates(city);

        // 2. Get weather data from Open-Meteo
        const weatherData = await fetchWeather(latitude, longitude, units);

        // 3. Update UI
        updateUI(name, weatherData, units);
    }   catch (error) {
        console.error(error);
        alert("Please enter a valid city name without commas or extra details.")
    }
}

// Update placeholders in the UI
function updateUI(locationName, data, units) {
    // Determine units
    const tempUnit = units === "imperial" ? "°F" : "°C";
    const speedUnit = units === "imperial" ? "mph" : "km/h";
    const precipUnit = units === "imperial" ? "inch" : "mm";

    // Get current weather section of response
    const current = data.current_weather;

// UPDATE TEXT CONTENT

// City name
cityNameE1.textContent = locationName;

// Date
const currentDate = new Date(current.time);
dateE1.textContent = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
});

// Temperature 
tempE1.textContent = `${Math.round(current.temperature)}${tempUnit}`;

// Feels like
const feelsLike = 
    data.hourly.apparent_temperature && data.hourly.apparent_temperature[0]
    ? Math.round(data.hourly.apparent_temperature[0])
    : current.temperature;
feelsLikeE1.textContent = `${feelsLike}${tempUnit}`;

// Humidity
humidityE1.textContent = `${data.hourly.relative_humidity_2m[0]}%`;

// Wind Speed
windE1.textContent = `${Math.round(current.windspeed)} ${speedUnit}`;

// Precipitation
precipitationE1.textContent = `${data.hourly.precipitation[0]} ${precipUnit}`;

//UPDATE ICON
  const code = current.weathercode;
  const iconMap = {
    0: "sunny",
    1: "mainly_clear",
    2: "partly_cloudy",
    3: "overcast",
    45: "fog",
    48: "rime_fog",
    51: "drizzle",
    61: "rain",
    71: "snow",
    80: "rain_showers",
    95: "thunderstorm"
  };

    //Changes Icon dynamically (creates the file path based on the weather code)
    const condition = iconMap[code] || "sunny";
    weatherIcon.src = `./assets/images/icon-${condition}.webp`;
    weatherIcon.alt = condition.replace("_", " ");
}

