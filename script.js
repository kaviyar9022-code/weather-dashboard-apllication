/* =========================================================
   Smart Weather & Travel Dashboard - script.js
   Vanilla JavaScript (ES6+) + OpenWeatherMap API
   ========================================================= */

/* ---------------------------------------------------------
   1. CONFIGURATION  👈 ADD YOUR API KEY HERE
   ---------------------------------------------------------
   Get a free key at https://openweathermap.org/api
   Paste it between the quotes below.
   NOTE: Never commit a real key to a public GitHub repo!
--------------------------------------------------------- */
const CONFIG = {
  API_KEY: "",                                   // <-- paste your OpenWeatherMap API key here
  BASE_URL: "https://api.openweathermap.org/data/2.5",
  DEFAULT_CITY: "London",                        // city shown when the page loads
  UNITS: "metric",                               // metric = °C, m/s
};

/* ---------------------------------------------------------
   2. DOM ELEMENTS (grab everything once, reuse later)
--------------------------------------------------------- */
const $ = (id) => document.getElementById(id);

const els = {
  form: $("search-form"),
  input: $("city-input"),
  loading: $("loading"),
  error: $("error"),
  errorMessage: $("error-message"),
  dashboard: $("dashboard"),
  cityName: $("city-name"),
  country: $("country"),
  date: $("current-date"),
  temp: $("temp"),
  condition: $("condition"),
  icon: $("current-icon"),
  feelsLike: $("feels-like"),
  humidity: $("humidity"),
  wind: $("wind"),
  pressure: $("pressure"),
  visibility: $("visibility"),
  travelBadge: $("travel-badge"),
  travelText: $("travel-text"),
  travelTips: $("travel-tips"),
  forecastGrid: $("forecast-grid"),
};

/* ---------------------------------------------------------
   3. WEATHER CATEGORY HELPERS
   OpenWeatherMap gives every weather a numeric "id".
   We group those ids into simple categories so we can pick
   icons, themes and travel tips easily.
   https://openweathermap.org/weather-conditions
--------------------------------------------------------- */
function getCategory(id) {
  if (id >= 200 && id < 300) return "storm";
  if (id >= 300 && id < 600) return "rain";   // drizzle + rain
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "mist";   // mist, fog, haze, smoke...
  if (id === 800) return "clear";
  return "clouds";                            // 801 - 804
}

// Category -> emoji icon (works offline, no image files needed)
const ICONS = {
  clear: "☀️",
  clouds: "☁️",
  rain: "🌧️",
  storm: "⛈️",
  snow: "❄️",
  mist: "🌫️",
};

// Returns the icon; shows a moon at night for clear/partly-cloudy skies
function getIcon(id, iconCode = "") {
  const isNight = iconCode.endsWith("n");
  if (isNight && id === 800) return "🌙";
  if (id === 801 || id === 802) return isNight ? "☁️" : "⛅";
  return ICONS[getCategory(id)];
}

/* ---------------------------------------------------------
   4. TRAVEL SUGGESTION LOGIC
   Temperature extremes take priority, then the condition.
--------------------------------------------------------- */
function getTravelSuggestion(weatherId, temp) {
  const category = getCategory(weatherId);

  // Dangerous weather first
  if (category === "storm") {
    return {
      badge: "⚡ Stormy",
      text: "Avoid outdoor travel and stay indoors.",
      tips: ["Check flight and train delays", "Keep your phone charged", "Visit a museum or café only if it is safe"],
    };
  }
  if (temp >= 35) {
    return {
      badge: "🔥 Very Hot",
      text: "Stay hydrated and avoid long outdoor activities.",
      tips: ["Wear light cotton clothes and sunscreen", "Travel early morning or evening", "Take breaks in air-conditioned places"],
    };
  }
  if (temp <= 10 || category === "snow") {
    return {
      badge: "🥶 Cold",
      text: "Carry warm clothes and plan indoor activities.",
      tips: ["Wear layers, gloves and a warm jacket", "Try cafés, museums or shopping malls", "Check road conditions before driving"],
    };
  }
  if (category === "rain") {
    return {
      badge: "☔ Rainy",
      text: "Carry an umbrella and consider visiting indoor attractions.",
      tips: ["Pack a waterproof jacket", "Wear non-slip footwear", "Keep electronics in a waterproof bag"],
    };
  }
  if (category === "mist") {
    return {
      badge: "🌫️ Low Visibility",
      text: "Drive carefully and keep plans flexible, visibility is low.",
      tips: ["Use fog lights when driving", "Allow extra travel time", "Scenic viewpoints may be hidden"],
    };
  }
  if (category === "clear") {
    return {
      badge: "😎 Sunny",
      text: "Perfect weather for sightseeing and outdoor activities.",
      tips: ["Wear sunglasses and sunscreen", "Great day for a walk or picnic", "Carry a water bottle"],
    };
  }
  return {
    badge: "⛅ Cloudy",
    text: "Good weather for sightseeing and photography.",
    tips: ["Soft light is ideal for photos", "Comfortable for walking tours", "Carry a light jacket just in case"],
  };
}

/* ---------------------------------------------------------
   5. UI STATE HELPERS (loading / error / content)
--------------------------------------------------------- */
function showLoading() {
  els.loading.classList.remove("hidden");
  els.error.classList.add("hidden");
  els.dashboard.classList.add("hidden");
}

function showError(message) {
  els.loading.classList.add("hidden");
  els.dashboard.classList.add("hidden");
  els.errorMessage.textContent = message;
  els.error.classList.remove("hidden");
}

function showDashboard() {
  els.loading.classList.add("hidden");
  els.error.classList.add("hidden");
  els.dashboard.classList.remove("hidden");
}

/* ---------------------------------------------------------
   6. API CALLS (fetch + async/await + error handling)
--------------------------------------------------------- */

// Generic helper: calls an endpoint and converts API problems into readable errors
async function fetchFromApi(endpoint, city) {
  const url =
    `${CONFIG.BASE_URL}/${endpoint}` +
    `?q=${encodeURIComponent(city)}&units=${CONFIG.UNITS}&appid=${CONFIG.API_KEY}`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    // fetch() only throws on network failures (offline, blocked, DNS...)
    throw new Error("Network error. Please check your internet connection and try again.");
  }

  if (response.status === 404) throw new Error(`City "${city}" was not found. Please check the spelling.`);
  if (response.status === 401) throw new Error("Invalid API key. Check the key in script.js (new keys can take up to 2 hours to activate).");
  if (response.status === 429) throw new Error("Too many requests. Please wait a minute and try again.");
  if (!response.ok) throw new Error("Something went wrong with the weather service. Please try again later.");

  return response.json();
}

// Fetch current weather AND forecast at the same time (faster than one after the other)
async function fetchWeatherData(city) {
  const [current, forecast] = await Promise.all([
    fetchFromApi("weather", city),
    fetchFromApi("forecast", city),
  ]);
  return { current, forecast };
}

/* ---------------------------------------------------------
   7. RENDER FUNCTIONS (put data on the page)
--------------------------------------------------------- */

// Converts a UTC timestamp to the searched city's local time using the timezone offset (seconds)
function toCityDate(unixSeconds, timezoneOffset) {
  return new Date((unixSeconds + timezoneOffset) * 1000);
}

// Current weather card + travel suggestion + background theme
function renderCurrent(data) {
  const weather = data.weather[0];
  const temp = Math.round(data.main.temp);

  els.cityName.textContent = data.name;
  els.country.textContent = data.sys.country;
  els.date.textContent = toCityDate(data.dt, data.timezone).toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
  });
  els.temp.textContent = temp;
  els.condition.textContent = weather.description;
  els.icon.textContent = getIcon(weather.id, weather.icon);

  els.feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
  els.humidity.textContent = `${data.main.humidity}%`;
  els.wind.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;   // m/s -> km/h
  els.pressure.textContent = `${data.main.pressure} hPa`;
  els.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`; // m -> km

  // Change the page background to match the weather
  document.body.className = `theme-${getCategory(weather.id)}`;

  renderTravel(weather.id, temp);
}

// Travel suggestion card
function renderTravel(weatherId, temp) {
  const suggestion = getTravelSuggestion(weatherId, temp);
  els.travelBadge.textContent = suggestion.badge;
  els.travelText.textContent = suggestion.text;
  els.travelTips.innerHTML = "";
  suggestion.tips.forEach((tip) => {
    const li = document.createElement("li");
    li.textContent = tip;
    els.travelTips.appendChild(li);
  });
}

/* The forecast API returns a reading every 3 hours (40 readings).
   We group them by day, then summarise each day into ONE card. */
function summariseForecast(forecastData) {
  const days = {};

  forecastData.list.forEach((item) => {
    const local = toCityDate(item.dt, forecastData.city.timezone);
    const key = local.toISOString().slice(0, 10);          // "YYYY-MM-DD"
    if (!days[key]) days[key] = { key, date: local, items: [] };
    days[key].items.push({ ...item, hour: local.getUTCHours() });
  });

  return Object.values(days)
    .slice(0, 5)                                           // only 5 days
    .map((day) => {
      // Use the reading closest to midday to represent the day
      const midday = day.items.reduce((best, it) =>
        Math.abs(it.hour - 12) < Math.abs(best.hour - 12) ? it : best
      );
      const temps = day.items.map((it) => it.main.temp);
      const avgHumidity = day.items.reduce((sum, it) => sum + it.main.humidity, 0) / day.items.length;

      return {
        date: day.date,
        weather: midday.weather[0],
        max: Math.round(Math.max(...temps)),
        min: Math.round(Math.min(...temps)),
        humidity: Math.round(avgHumidity),
      };
    });
}

// Forecast cards
function renderForecast(forecastData) {
  const days = summariseForecast(forecastData);
  els.forecastGrid.innerHTML = "";

  days.forEach((day, index) => {
    const card = document.createElement("article");
    card.className = "forecast-card";
    card.style.animationDelay = `${index * 0.08}s`;        // staggered fade-in

    const dayName = day.date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    const dateText = day.date.toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" });

    card.innerHTML = `
      <p class="f-date">${dateText}</p>
      <p class="f-day">${dayName}</p>
      <div class="f-icon" aria-hidden="true">${getIcon(day.weather.id, "d")}</div>
      <p class="f-cond">${day.weather.description}</p>
      <p class="f-temp">${day.max}°C <small>/ ${day.min}°C</small></p>
      <p class="f-hum">💧 ${day.humidity}%</p>
    `;
    els.forecastGrid.appendChild(card);
  });
}

/* ---------------------------------------------------------
   8. MAIN FUNCTION: load weather for a city
--------------------------------------------------------- */
async function loadWeather(city) {
  // Friendly message if the user forgot to add their API key
  if (!CONFIG.API_KEY) {
    showError("API key missing! Open script.js and paste your OpenWeatherMap key into CONFIG.API_KEY.");
    return;
  }

  showLoading();
  try {
    const { current, forecast } = await fetchWeatherData(city);
    renderCurrent(current);
    renderForecast(forecast);
    showDashboard();
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

/* ---------------------------------------------------------
   9. EVENT LISTENERS & START-UP
--------------------------------------------------------- */
els.form.addEventListener("submit", (event) => {
  event.preventDefault();                       // stop the page from reloading
  const city = els.input.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  loadWeather(city);
});

// Load the default city when the page opens
loadWeather(CONFIG.DEFAULT_CITY);
