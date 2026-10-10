
import { useState, useEffect } from "react";
import WeatherDashboard from "./WeatherDashboard";

import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  Marker,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./App.css";

const STORAGE_KEY = "floodguard_assessment_history";

const INITIAL_PLACES = [
  { name: "Patna, Bihar", lat: 25.5941, lng: 85.1376, risk: "Moderate" },
  { name: "Delhi, India", lat: 28.6139, lng: 77.209, risk: "Low" },
  { name: "Mumbai, Maharashtra", lat: 19.076, lng: 72.8777, risk: "High" },
  { name: "Kolkata, West Bengal", lat: 22.5726, lng: 88.3639, risk: "Moderate" },
  { name: "Guwahati, Assam", lat: 26.1445, lng: 91.7362, risk: "High" },
];

function getRiskColor(level) {
  switch (level) {
    case "Low":
      return "#22c55e";
    case "Moderate":
      return "#eab308";
    case "High":
      return "#f97316";
    case "Severe":
      return "#ef4444";
    default:
      return "#64748b";
  }
}

function normalizeLocation(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function findMatchingPlace(location) {
  const normalized = normalizeLocation(location);

  return INITIAL_PLACES.find((place) => {
    const placeName = normalizeLocation(place.name);
    const cityName = normalizeLocation(place.name.split(",")[0]);

    return (
      normalized === placeName ||
      normalized === cityName ||
      normalized.startsWith(cityName)
    );
  });
}

function getSavedHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function FloodMap({ assessmentResult }) {
  const [selectedPlace, setSelectedPlace] = useState(INITIAL_PLACES[0]);

  useEffect(() => {
    if (!assessmentResult) return;

    const matched = findMatchingPlace(assessmentResult.location);

    if (matched) {
      setSelectedPlace(matched);
    }
  }, [assessmentResult]);

  const selectedMatchesAssessment =
    Boolean(assessmentResult) &&
    findMatchingPlace(assessmentResult.location)?.name === selectedPlace.name;

  const selectedRisk = selectedMatchesAssessment
    ? assessmentResult.level
    : selectedPlace.risk;

  return (
    <section className="map-section" id="map">
      <div className="section-heading">
        <span className="small-label">EXPLORE INDIA</span>
        <h2>
          Flood monitoring <span>map.</span>
        </h2>
        <p>
          Explore sample locations and illustrative flood-risk assessment results.
        </p>
      </div>

      <div className="map-search">
        <label htmlFor="map-city">Select a city</label>
        <select
          id="map-city"
          value={selectedPlace.name}
          onChange={(event) => {
            const place = INITIAL_PLACES.find(
              (item) => item.name === event.target.value
            );
            if (place) setSelectedPlace(place);
          }}
        >
          {INITIAL_PLACES.map((place) => (
            <option key={place.name} value={place.name}>
              {place.name}
            </option>
          ))}
        </select>
      </div>

      <div className="map-legend">
        <span>🟢 Low</span>
        <span>🟡 Moderate</span>
        <span>🟠 High</span>
        <span>🔴 Severe</span>
      </div>

      <div className="interactive-map">
        <MapContainer
          key={selectedPlace.name}
          center={[selectedPlace.lat, selectedPlace.lng]}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: "450px", width: "100%", borderRadius: "14px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {INITIAL_PLACES.map((place) => {
            const matchesAssessment =
              Boolean(assessmentResult) &&
              findMatchingPlace(assessmentResult.location)?.name === place.name;

            const risk = matchesAssessment
              ? assessmentResult.level
              : place.risk;

            const color = getRiskColor(risk);

            return (
              <Circle
                key={place.name}
                center={[place.lat, place.lng]}
                radius={15000}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.4,
                  weight: 2,
                }}
              >
                <Popup>
                  <strong>{place.name}</strong>
                  <br />
                  Risk Level: {risk}
                  {matchesAssessment && (
                    <>
                      <br />
                      Risk Score: {assessmentResult.score}/100
                      <br />
                      Rainfall: {assessmentResult.rainfall} mm
                      <br />
                      River Level: {assessmentResult.waterLevel} m
                    </>
                  )}
                  <br />
                  <small>
                    {matchesAssessment
                      ? "Illustrative assessment result."
                      : "Sample risk label only."}
                  </small>
                  <br />
                  <small>Not an official flood warning.</small>
                </Popup>
              </Circle>
            );
          })}

          <Marker position={[selectedPlace.lat, selectedPlace.lng]}>
            <Popup>
              <strong>{selectedPlace.name}</strong>
              <br />
              Risk Level: {selectedRisk}
              <br />
              {selectedMatchesAssessment ? (
                <>
                  Risk Score: {assessmentResult.score}/100
                  <br />
                  Rainfall: {assessmentResult.rainfall} mm
                  <br />
                  River Level: {assessmentResult.waterLevel} m
                </>
              ) : (
                <small>No assessment available for this location yet.</small>
              )}
              <br />
              <small>Illustrative demo result, not an official flood warning.</small>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <p className="map-disclaimer">
        Map labels are illustrative. This map does not provide verified flood
        zones, live river measurements, or official emergency alerts.
      </p>
    </section>
  );
}

function App() {
  const [location, setLocation] = useState("Patna, Bihar");
  const [rainfall, setRainfall] = useState("120");
  const [waterLevel, setWaterLevel] = useState("4.5");
  const [result, setResult] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [history, setHistory] = useState(getSavedHistory);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      setFormError("Unable to save history in browser storage.");
    }
  }, [history]);

  function handleUseWeather(weather) {
    if (!weather) return;

    setLocation(weather.city || "Patna, Bihar");
    setCurrentWeather(weather);
    setResult(null);

    document.getElementById("assessment")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function handleAssessment(event) {
    event.preventDefault();
    setFormError("");

    const cleanLocation = location.trim();
    const rain = Number(rainfall);
    const water = Number(waterLevel);

    if (!cleanLocation) {
      setFormError("Please enter a location.");
      return;
    }

    if (
      rainfall.trim() === "" ||
      waterLevel.trim() === "" ||
      !Number.isFinite(rain) ||
      !Number.isFinite(water) ||
      rain < 0 ||
      rain > 300 ||
      water < 0 ||
      water > 10
    ) {
      setFormError(
        "Enter rainfall between 0 and 300 mm and river level between 0 and 10 metres."
      );
      return;
    }

    const score = Math.min(
      100,
      Math.max(0, Math.round((rain / 300) * 60 + (water / 10) * 40))
    );

    let level;

    if (score < 30) level = "Low";
    else if (score < 60) level = "Moderate";
    else if (score < 80) level = "High";
    else level = "Severe";

    const assessment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      location: cleanLocation,
      rainfall: rain,
      waterLevel: water,
      score,
      level,
      createdAt: new Date().toISOString(),
    };

    setResult(assessment);
    setHistory((previous) => [assessment, ...previous].slice(0, 50));
  }

  function viewHistory(item) {
    setLocation(item.location);
    setRainfall(String(item.rainfall));
    setWaterLevel(String(item.waterLevel));
    setResult(item);

    document.getElementById("assessment")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function clearHistory() {
    const confirmed = window.confirm("Delete all saved assessment history?");
    if (!confirmed) return;

    setHistory([]);
    setResult(null);
    setFormError("");
  }

  function downloadReport() {
    if (!result) return;

    const report = `
FLOODGUARD - ASSESSMENT REPORT
================================

Location: ${result.location}
Date: ${new Date(result.createdAt).toLocaleString()}

Rainfall: ${result.rainfall} mm / 24 hours
River Level: ${result.waterLevel} metres

Demo Risk Score: ${result.score}/100
Demo Risk Level: ${result.level}

SCORING METHOD
Rainfall contributes 60% and river level contributes 40%
to the illustrative score.

IMPORTANT DISCLAIMER
This report contains an illustrative demonstration score only.
It is not an official flood prediction or emergency warning.
Do not use it to make real-world safety decisions.
`;

    const blob = new Blob([report], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `FloodGuard_Report_${Date.now()}.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <nav className="navbar">
        <a className="logo" href="#home" aria-label="FloodGuard home">
          <span className="logo-icon">🌊</span>
          Flood<span>Guard</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#weather">Weather</a>
          <a href="#map">Interactive Map</a>
          <a href="#assessment">Risk Assessment</a>
          <a href="#history">History</a>
        </div>

        <button
          className="nav-button"
          type="button"
          onClick={() =>
            document.getElementById("assessment")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          Get Started ↗
        </button>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="pulse"></span>
              FLOOD RISK AWARENESS PLATFORM
            </div>

            <h1>
              Predict the risk.
              <br />
              <span>Protect the future.</span>
            </h1>

            <p>
              Explore weather information, assess illustrative flood-risk
              indicators, and visualize sample locations through an interactive map.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  document.getElementById("assessment")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                Assess Flood Risk ↗
              </button>

              <a className="secondary-button" href="#features">
                Explore Platform ↓
              </a>
            </div>

            <div className="hero-note">
              <span className="note-dot"></span>
              Better information. Better preparedness.
            </div>
          </div>

          <div className="visual-panel">
            <div className="visual-top">
              <div>
                <span className="small-label">FLOOD INTELLIGENCE</span>
                <h3>Risk Overview</h3>
              </div>
              <span className="live-badge">DEMO MODE</span>
            </div>

            <div className="water-visual">
              <div className="water-circle circle-one"></div>
              <div className="water-circle circle-two"></div>
              <div className="water-circle circle-three"></div>
              <div className="map-pin">⌖</div>
              <div className="map-label">Flood monitoring zone</div>
            </div>

            <div className="risk-summary">
              <div>
                <span className="small-label">ASSESSMENT STATUS</span>
                <h3>{result ? `${result.level} Risk` : "Ready to assess"}</h3>
              </div>

              <span
                className="status-icon"
                style={result ? { color: getRiskColor(result.level) } : {}}
              >
                ↗
              </span>
            </div>

            <div className="mini-stats">
              <div>
                <span>Rainfall</span>
                <strong>{result ? `${result.rainfall} mm` : "Awaiting input"}</strong>
              </div>
              <div>
                <span>River level</span>
                <strong>{result ? `${result.waterLevel} m` : "Awaiting input"}</strong>
              </div>
            </div>

            {result && (
              <div className="hero-score">
                <span>Demo Score</span>
                <strong>{result.score}/100</strong>
              </div>
            )}
          </div>
        </section>

        <section className="features" id="features">
          <div className="section-heading">
            <span className="small-label">BUILT FOR A SAFER TOMORROW</span>
            <h2>
              Intelligence that <span>protects.</span>
            </h2>
            <p>Explore the main features of FloodGuard.</p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon">◉</div>
              <h3>Risk Assessment</h3>
              <p>
                Calculate an illustrative score using rainfall and river-level inputs.
              </p>
              <a href="#assessment">Explore assessment ↗</a>
            </article>

            <article className="feature-card">
              <div className="feature-icon">⌖</div>
              <h3>Interactive Maps</h3>
              <p>
                Explore sample Indian locations and illustrative risk zones.
              </p>
              <a href="#map">Explore map ↗</a>
            </article>

            <article className="feature-card">
              <div className="feature-icon">⌁</div>
              <h3>Assessment History</h3>
              <p>
                Keep a local record of your recent assessments in this browser.
              </p>
              <a href="#history">View history ↗</a>
            </article>
          </div>
        </section>

        <section id="weather">
          <WeatherDashboard onUseWeather={handleUseWeather} />
        </section>

        <FloodMap assessmentResult={result} />

        <section className="assessment" id="assessment">
          <span className="small-label">FLOOD RISK ANALYSIS</span>
          <h2>
            Understand your <span>flood risk.</span>
          </h2>
          <p>
            Enter environmental readings to calculate a demonstration score.
            This is not an official flood prediction.
          </p>

          <div className="assessment-card">
            <div className="form-heading">
              <div>
                <span className="small-label">ASSESSMENT FORM</span>
                <h3>Assess your location</h3>
              </div>
              <span className="form-icon">⌖</span>
            </div>

            {currentWeather && (
              <div className="weather-results">
                <h3>Selected Weather Data</h3>
                <p>City: {currentWeather.city}</p>
                <p>
                  Current precipitation: {currentWeather.precipitation ?? "N/A"} mm
                </p>
                {currentWeather.time && <p>Data time: {currentWeather.time}</p>}
                <small>
                  Current precipitation is not necessarily the same as total
                  rainfall over 24 hours. Enter the appropriate rainfall and
                  river-level measurements separately.
                </small>
              </div>
            )}

            <form className="assessment-form" onSubmit={handleAssessment}>
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Patna, Bihar"
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                  setFormError("");
                }}
                required
              />

              <div className="form-grid">
                <div>
                  <label htmlFor="rainfall">Rainfall (mm / 24 hours)</label>
                  <input
                    id="rainfall"
                    type="number"
                    min="0"
                    max="300"
                    step="any"
                    placeholder="e.g. 120"
                    value={rainfall}
                    onChange={(event) => {
                      setRainfall(event.target.value);
                      setFormError("");
                    }}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="waterLevel">River level (metres)</label>
                  <input
                    id="waterLevel"
                    type="number"
                    min="0"
                    max="10"
                    step="any"
                    placeholder="e.g. 4.5"
                    value={waterLevel}
                    onChange={(event) => {
                      setWaterLevel(event.target.value);
                      setFormError("");
                    }}
                    required
                  />
                </div>
              </div>

              {formError && (
                <p className="form-error" role="alert">{formError}</p>
              )}

              <button className="primary-button submit-button" type="submit">
                Calculate Demo Score ↗
              </button>
            </form>

            {result && (
              <div className="result-card" aria-live="polite">
                <span className="small-label">ILLUSTRATIVE DEMO RESULT</span>

                <div className="result-row">
                  <div>
                    <p className="result-location">{result.location}</p>
                    <h3 style={{ color: getRiskColor(result.level) }}>
                      {result.level} Risk
                    </h3>
                  </div>

                  <div
                    className="score-circle"
                    style={{
                      borderColor: getRiskColor(result.level),
                      color: getRiskColor(result.level),
                    }}
                  >
                    <strong>{result.score}</strong>
                    <span>/100</span>
                  </div>
                </div>

                <div className="score-track">
                  <div
                    className="score-fill"
                    style={{
                      width: `${result.score}%`,
                      background: getRiskColor(result.level),
                    }}
                  />
                </div>

                <div className="result-details">
                  <p><strong>Rainfall:</strong> {result.rainfall} mm</p>
                  <p><strong>River level:</strong> {result.waterLevel} metres</p>
                  <p><strong>Risk level:</strong> {result.level}</p>
                </div>

                <p className="result-note">
                  This is a demonstration score based on a simple formula. It
                  is not a trained AI model, verified flood prediction, or
                  official warning. Do not use it for real-world safety decisions.
                </p>

                <div className="hero-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() =>
                      document.getElementById("map")?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                  >
                    View Map Result ↓
                  </button>

                  <button
                    className="primary-button"
                    type="button"
                    onClick={downloadReport}
                  >
                    Download Assessment Report ↓
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="assessment history-section" id="history">
          <span className="small-label">YOUR RECENT RECORDS</span>
          <h2>
            Assessment <span>history.</span>
          </h2>
          <p>Your last 50 assessments are stored locally in this browser.</p>

          <div className="history-header">
            <h3>Saved Assessments ({history.length})</h3>

            {history.length > 0 && (
              <button className="secondary-button" type="button" onClick={clearHistory}>
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="history-empty">
              <div className="feature-icon">◷</div>
              <h3>No saved assessments yet</h3>
              <p>Complete a risk assessment to see your results here.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <article className="history-item" key={item.id}>
                  <div className="history-info">
                    <h3>{item.location}</h3>
                    <p>Score: {item.score}/100</p>
                    <p>Rainfall: {item.rainfall} mm</p>
                    <p>River level: {item.waterLevel} m</p>
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                  </div>

                  <div className="history-actions">
                    <strong style={{ color: getRiskColor(item.level) }}>
                      {item.level}
                    </strong>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => viewHistory(item)}
                    >
                      View Result
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <a className="logo" href="#home">
          🌊 Flood<span>Guard</span>
        </a>
        <p>Flood risk awareness and preparedness.</p>
        <small>Educational project · Demo scores are not official warnings.</small>
      </footer>
    </div>
  );
}

export default App;
