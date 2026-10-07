# 🌦️ weather dashboard application


A responsive weather dashboard built with **only HTML5, CSS3 and Vanilla JavaScript**. Search any city to see real-time weather, a 5-day forecast and smart travel suggestions based on the conditions.

## 📖 Project Description

The app uses the [OpenWeatherMap API](https://openweathermap.org/api) to fetch live weather data. Based on the temperature and weather condition, it generates travel advice (for example: *"Carry an umbrella and consider visiting indoor attractions."*). The page background also changes with the weather.

## ✨ Features

- 🔍 City search with a default city on load (London)
- 🌡️ Current weather: city, country, temperature (°C), condition, feels-like, humidity, wind, pressure, visibility, icon
- 📅 5-day forecast cards (date, icon, condition, temperature, humidity)
- ☀️☁️🌧️⛈️❄️🌫️ Dynamic weather icons and background themes
- 🧳 Dynamic travel suggestions (sunny, cloudy, rainy, stormy, cold, very hot, foggy)
- ⏳ Loading spinner and friendly error messages (invalid city, bad API key, network errors)
- 📱 Fully responsive: mobile, tablet and desktop
- 🎨 Glassmorphism cards, smooth hover effects and CSS transitions

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic page structure |
| CSS3 | Flexbox, Grid, animations, media queries |
| JavaScript (ES6+) | `fetch()`, `async/await`, DOM manipulation |
| OpenWeatherMap API | Current weather + 5-day forecast data |

No frameworks, libraries or backend are used.

## 🔑 How to Get an OpenWeatherMap API Key

1. Go to <https://openweathermap.org/> and click **Sign In → Create an Account**.
2. Verify your email address.
3. Open your profile menu and choose **My API keys**.
4. Copy the default key (or generate a new one).
5. ⏱️ A new key can take **up to 2 hours** to activate. Until then you may see an "Invalid API key" message.

## ⚙️ How to Configure the API Key

1. Open `script.js`.
2. Find the `CONFIG` section at the very top:

   ```js
   const CONFIG = {
     API_KEY: "",   // <-- paste your key here
     ...
   };
   ```
3. Paste your key between the quotes and save the file.

> ⚠️ **Security note:** Frontend keys are visible to anyone who opens the site. Do not push your real key to a public GitHub repository. Use a free-tier key and consider regenerating it if shared.

## ▶️ How to Run the Project

**Option 1 – Open directly**
Double-click `index.html` to open it in your browser.

**Option 2 – VS Code Live Server (recommended)**
1. Install the *Live Server* extension.
2. Right-click `index.html` → **Open with Live Server**.

**Option 3 – GitHub Pages**
Push the files to a repository, then go to **Settings → Pages**, select the `main` branch and save.

## 📸 Screenshots

> Add your screenshots here after running the project.

| Desktop | Mobile |
|---------|--------|
| `screenshots/desktop.png` | `screenshots/mobile.png` |

## 🚀 Future Improvements

- Use browser geolocation to detect the user's city
- °C / °F toggle
- Hourly forecast chart
- Save favourite cities with `localStorage`
- Search suggestions / autocomplete
- Dark / light mode switch
- Air quality index and sunrise/sunset times

## 📁 File Structure

```
weather-dashboard/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 📄 License

Free to use for learning and college projects.
