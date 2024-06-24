const weatherstackApiKey = "7bd5625eb1385c928ee6e64ed648e0d1";
const openWeatherMapApiKey = "ccaa04133f00912777e76affb23c2f49"; // 

const searchButton = document.getElementById("search-button");
const cityInput = document.getElementById("city-input");
const weatherInfo = document.getElementById("weather-info");
const forecastContainer = document.getElementById("forecast-container");
const recentSearchesContainer = document.getElementById("recent-searches");

searchButton.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    console.log("Fetching weather for:", city); // Log the city being searched
    saveSearch(city);
    getCurrentWeather(city);
    get5DayForecast(city);
  } else {
    alert("Please enter a city name");
  }
});

async function getCurrentWeather(city) {
  const url = `https://api.weatherstack.com/current?access_key=${weatherstackApiKey}&query=${city}&units=f`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Current Weather API Response:", data); // Log the API response
    if (data.error) {
      weatherInfo.innerHTML = `<p>${data.error.info}</p>`;
    } else {
      displayCurrentWeather(data);
    }
  } catch (error) {
    console.error("Error fetching current weather data:", error); // Log any errors
    weatherInfo.innerHTML = `<p>Failed to fetch current weather data. Please try again.</p>`;
  }
}

function displayCurrentWeather(data) {
  const weather = data.current;
  const location = data.location;
  console.log("Displaying current weather data:", weather, location); // Log the weather data
  weatherInfo.innerHTML = `
        <h2>${location.name}, ${location.country}</h2>
        <p>${weather.weather_descriptions[0]}</p>
        <p>Temperature: ${weather.temperature}°F</p>
        <p>Feels like: ${weather.feelslike}°F</p>
        <p>Humidity: ${weather.humidity}%</p>
        <img src="${weather.weather_icons[0]}" alt="Weather Icon">
      `;
}

async function get5DayForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${openWeatherMapApiKey}&units=imperial`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("5-Day Forecast API Response:", data); // Log the API response
    if (data.cod !== "200") {
      forecastContainer.innerHTML = `<p>${data.message}</p>`;
    } else {
      display5DayForecast(data);
    }
  } catch (error) {
    console.error("Error fetching 5-day forecast data:", error); // Log any errors
    forecastContainer.innerHTML = `<p>Failed to fetch 5-day forecast data. Please try again.</p>`;
  }
}

function display5DayForecast(data) {
  forecastContainer.innerHTML = ""; // Clear previous content
  const forecastList = data.list;
  const forecastByDay = forecastList.filter((item) =>
    item.dt_txt.includes("12:00:00")
  ); // Get data for each day at 12:00 PM
  console.log("Filtered forecast data for 12:00 PM:", forecastByDay); // Log filtered data
  forecastByDay.forEach((forecast) => {
    const date = new Date(forecast.dt_txt);
    const weather = forecast.weather[0];
    forecastContainer.innerHTML += `
          <div class="column is-one-fifth">
            <div class="box">
              <p><strong>${date.toDateString()}</strong></p>
              <p>${weather.description}</p>
              <p>Temp: ${forecast.main.temp}°F</p>
              <p>Humidity: ${forecast.main.humidity}%</p>
              <img src="http://openweathermap.org/img/wn/${
                weather.icon
              }.png" alt="Weather Icon">
            </div>
          </div>
        `;
  });
}

function saveSearch(city) {
  let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  if (searches.includes(city)) {
    searches = searches.filter((item) => item !== city);
  }
  searches.unshift(city);
  if (searches.length > 5) {
    searches.pop();
  }
  localStorage.setItem("recentSearches", JSON.stringify(searches));
  displayRecentSearches();
}

function displayRecentSearches() {
  let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  recentSearchesContainer.innerHTML = "";
  searches.forEach((city) => {
    const cityElement = document.createElement("div");
    cityElement.className = "box";
    cityElement.textContent = city;
    cityElement.addEventListener("click", () => {
      cityInput.value = city;
      getCurrentWeather(city);
      get5DayForecast(city);
    });
    recentSearchesContainer.appendChild(cityElement);
  });
}

// Display recent searches on page load
document.addEventListener("DOMContentLoaded", displayRecentSearches);
