import { useState } from "react";

const cities = {
  Patna: {
    latitude: 25.5941,
    longitude: 85.1376,
  },
  Delhi: {
    latitude: 28.6139,
    longitude: 77.209,
  },
  Mumbai: {
    latitude: 19.076,
    longitude: 72.8777,
  },
  Kolkata: {
    latitude: 22.5726,
    longitude: 88.3639,
  },
  Guwahati: {
    latitude: 26.1445,
    longitude: 91.7362,
  },
};

export default function WeatherDashboard({ onUseWeather }) {
  const [city, setCity] = useState("Patna");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchWeather() {
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const { latitude, longitude } = cities[city];

      const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        "&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m" +
        "&timezone=auto";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Weather API request failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.current) {
        throw new Error("Weather data unavailable");
      }

      setWeather({
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        wind: data.current.wind_speed_10m,
        time: data.current.time,
        temperatureUnit:
          data.current_units?.temperature_2m ?? "°C",
        windUnit:
          data.current_units?.wind_speed_10m ?? "km/h",
      });
    } catch (err) {
      console.error("Weather error:", err);

      setError(
        "Weather data load nahi hua. Internet connection check karke dobara try karo."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleUseWeather() {
    if (!weather) return;

    onUseWeather({
      city,
      precipitation: weather.precipitation,
      temperature: weather.temperature,
      humidity: weather.humidity,
      wind: weather.wind,
      time: weather.time,
    });
  }

  return (
    <section className="weather-dashboard">
      <div className="section-heading">
        <span className="small-label">LIVE WEATHER</span>

        <h2>
          Weather <span>Dashboard.</span>
        </h2>

        <p>
          Check the latest available weather data for
          selected Indian cities.
        </p>
      </div>

      <div className="weather-controls">
        <label htmlFor="weather-city">
          Select City
        </label>

        <select
          id="weather-city"
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
            setWeather(null);
            setError("");
          }}
        >
          {Object.keys(cities).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={fetchWeather}
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Weather"}
        </button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {weather && (
        <div className="weather-results">
          <h3>{city}</h3>

          <div className="weather-grid">
            <article className="weather-stat">
              <span>Temperature</span>
              <strong>
                {weather.temperature}
                {weather.temperatureUnit}
              </strong>
            </article>

            <article className="weather-stat">
              <span>Humidity</span>
              <strong>{weather.humidity}%</strong>
            </article>

            <article className="weather-stat">
              <span>Current Precipitation</span>
              <strong>
                {weather.precipitation} mm
              </strong>
            </article>

            <article className="weather-stat">
              <span>Wind Speed</span>
              <strong>
                {weather.wind} {weather.windUnit}
              </strong>
            </article>
          </div>

          <p>
            <strong>Data time:</strong> {weather.time}
          </p>

          <button
            type="button"
            onClick={handleUseWeather}
          >
            Use in Risk Assessment →
          </button>

          <small>
            Weather data is informational and is not an
            official flood warning.
          </small>
        </div>
      )}

      <p className="weather-note">
        Current precipitation is not the same as total
        rainfall over 24 hours. Enter the appropriate
        rainfall and river-level measurements separately.
      </p>
    </section>
  );
}