const apiKey = "0189820455fabccc91d93b56b709f3ff"; // <-- PUT YOUR KEY

let map;
let todayChart, weekChart;

// ---------- MAP ----------
function initMap(lat = 20, lon = 78) {
  if (!map) {
    map = L.map('map').setView([lat, lon], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
  } else {
    map.setView([lat, lon], 8);
  }
  L.marker([lat, lon]).addTo(map);
}

// ---------- AUTO LOCATION ----------
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    });
  }
};

// ---------- SEARCH ----------
async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Enter city name");

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
  );

  const data = await res.json();

  if (data.cod !== "200") {
    alert("City not found!");
    return;
  }

  displayWeather(data.city, data.list[0]);
  displayForecast(data);
}

// ---------- BY COORDS ----------
async function getWeatherByCoords(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );

  const data = await res.json();

  displayWeather(data.city, data.list[0]);
  displayForecast(data);
}

// ---------- CURRENT ----------
function displayWeather(city, current) {
  document.getElementById("weatherInfo").innerHTML = `
    <h2>${city.name}</h2>
    <p>🌡 Temp: ${current.main.temp} °C</p>
    <p>💧 Humidity: ${current.main.humidity}%</p>
    <p>💨 Wind: ${current.wind.speed} m/s</p>
  `;

  initMap(city.coord.lat, city.coord.lon);
}

// ---------- GRAPHS ----------
function displayForecast(data) {

  // Tomorrow
  const tomorrow = data.list[8];
  document.getElementById("tomorrowInfo").innerHTML = `
    <h3>Tomorrow</h3>
    <p>${tomorrow.main.temp} °C - ${tomorrow.weather[0].description}</p>
  `;

  // -------- TODAY GRAPH --------
  const todayData = data.list.slice(0, 8);

  const labels = todayData.map(item =>
    new Date(item.dt_txt).getHours() + ":00"
  );

  const temps = todayData.map(item => item.main.temp);

  if (todayChart) todayChart.destroy();

  todayChart = new Chart(document.getElementById("todayChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Temp (°C)",
        data: temps,
        borderWidth: 2,
        tension: 0.4
      }]
    }
  });

  // -------- WEEK GRAPH --------
  const daily = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!daily[date]) daily[date] = [];
    daily[date].push(item.main.temp);
  });

  const weekLabels = Object.keys(daily).slice(0, 7);

  const weekTemps = weekLabels.map(d => {
    const arr = daily[d];
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  });

  if (weekChart) weekChart.destroy();

  weekChart = new Chart(document.getElementById("weekChart"), {
    type: "bar",
    data: {
      labels: weekLabels,
      datasets: [{
        label: "Avg Temp (°C)",
        data: weekTemps,
        borderWidth: 1
      }]
    }
  });
}