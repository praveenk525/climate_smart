const chartCtx = document.getElementById("forecastChart")?.getContext("2d");
let forecastChart;

document.getElementById("getWeather").addEventListener("click", async () => {
    const location = document.getElementById("location").value.trim();
    if (!location) {
        alert("Please enter a location.");
        return;
    }

    try {
        // 1️⃣ Get coordinates from Open-Meteo geocoding
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1`);
        const geoData = await geoRes.json();
        if (!geoData.results || !geoData.results.length)
            throw new Error("Location not found");

        const { latitude, longitude, name, country } = geoData.results[0];

        // 2️⃣ Get weather forecast
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        displayWeather(name, country, data);
    } catch (err) {
        console.error(err);
        alert("Error fetching data. Please check console.");
    }
});

function displayWeather(name, country, data) {
    document.getElementById("weatherResult").classList.remove("hidden");
    document.getElementById("placeName").textContent = `${name}, ${country}`;

    const maxTemp = data.daily.temperature_2m_max[0];
    const minTemp = data.daily.temperature_2m_min[0];
    const rain = data.daily.precipitation_sum[0];
    const wind = data.daily.wind_speed_10m_max[0];

    document.getElementById("maxTemp").textContent = `${maxTemp} °C`;
    document.getElementById("minTemp").textContent = `${minTemp} °C`;
    document.getElementById("rain").textContent = `${rain} mm`;
    document.getElementById("wind").textContent = `${wind} km/h`;

    // Weather icon logic
    const weatherIcon = document.getElementById("weatherIcon");
    if (rain > 5) weatherIcon.textContent = "🌧️";
    else if (maxTemp > 35) weatherIcon.textContent = "☀️";
    else if (wind > 20) weatherIcon.textContent = "💨";
    else weatherIcon.textContent = "🌤️";

    // Advice logic
    let advice = "";
    if (rain > 5) advice = "🌧 High chance of rain — avoid irrigation today.";
    else if (maxTemp > 35) advice = "🔥 Hot day — use shade nets or mulch.";
    else if (wind > 25) advice = "🌬 Strong winds — secure light plants.";
    else advice = "✅ Weather conditions are good for farming.";

    document.getElementById("adviceText").textContent = advice;

    // Forecast chart
    const days = data.daily.time.map((d) => d.slice(5));
    const maxTemps = data.daily.temperature_2m_max;
    const minTemps = data.daily.temperature_2m_min;

    if (forecastChart) forecastChart.destroy();
    forecastChart = new Chart(chartCtx, {
        type: "line",
        data: {
            labels: days,
            datasets: [
                {
                    label: "🌞 Max Temp (°C)",
                    data: maxTemps,
                    borderColor: "#ff6b6b",
                    backgroundColor: "rgba(255,107,107,0.3)",
                    fill: true,
                    tension: 0.3,
                },
                {
                    label: "❄️ Min Temp (°C)",
                    data: minTemps,
                    borderColor: "#4dabf7",
                    backgroundColor: "rgba(77,171,247,0.3)",
                    fill: true,
                    tension: 0.3,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
            },
            scales: {
                y: { beginAtZero: false },
            },
        },
    });
}
