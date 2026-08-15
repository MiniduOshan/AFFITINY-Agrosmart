import React, { useState, useEffect } from 'react'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [isKeySaved, setIsKeySaved] = useState(false)
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [unit, setUnit] = useState('metric') // 'metric' for Celsius, 'imperial' for Fahrenheit

  // Load API Key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openweather_api_key')
    if (savedKey) {
      setApiKey(savedKey)
      setIsKeySaved(true)
    }
  }, [])

  // Save API Key to localStorage
  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openweather_api_key', apiKey.trim())
      setIsKeySaved(true)
      setError(null)
    } else {
      localStorage.removeItem('openweather_api_key')
      setIsKeySaved(false)
    }
  }

  // Fetch weather data
  const fetchWeather = async (e) => {
    if (e) e.preventDefault()
    if (!apiKey) {
      setError('Please provide a valid OpenWeather API key first.')
      return
    }
    if (!city.trim()) {
      setError('Please enter a city name.')
      return
    }

    setLoading(true)
    setError(null)
    setWeather(null)

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city.trim()
        )}&appid=${apiKey.trim()}&units=${unit}`
      )

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API Key. Please check your credentials.')
        } else if (response.status === 404) {
          throw new Error('City not found. Try a different city name.')
        } else {
          throw new Error(`Error: ${response.statusText}`)
        }
      }

      const data = await response.json()
      setWeather(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Refetch when unit changes and we already have a loaded weather city
  useEffect(() => {
    if (weather) {
      fetchWeather()
    }
  }, [unit])

  // Get dynamic weather style class
  const getWeatherClass = () => {
    if (!weather) return ''
    const main = weather.weather[0]?.main?.toLowerCase()
    if (main?.includes('clear')) return 'weather-clear'
    if (main?.includes('cloud')) return 'weather-clouds'
    if (main?.includes('rain') || main?.includes('drizzle')) return 'weather-rain'
    if (main?.includes('snow')) return 'weather-snow'
    if (main?.includes('thunder')) return 'weather-thunderstorm'
    return 'weather-clouds' // Default fallback
  };

  const getDynamicStyle = () => {
    if (!weather) return {}
    const main = weather.weather[0]?.main?.toLowerCase()
    let theme = 'var(--weather-theme-clouds)'
    let glow = 'rgba(148, 163, 184, 0.15)'
    
    if (main?.includes('clear')) {
      theme = 'var(--weather-theme-clear)'
      glow = 'rgba(234, 179, 8, 0.15)'
    } else if (main?.includes('rain') || main?.includes('drizzle')) {
      theme = 'var(--weather-theme-rain)'
      glow = 'rgba(59, 130, 246, 0.15)'
    } else if (main?.includes('snow')) {
      theme = 'var(--weather-theme-snow)'
      glow = 'rgba(255, 255, 255, 0.15)'
    } else if (main?.includes('thunder')) {
      theme = 'var(--weather-theme-thunderstorm)'
      glow = 'rgba(168, 85, 247, 0.15)'
    }
    
    return {
      '--bg-gradient': theme,
      '--glow-color': glow
    }
  }

  // Formatting utilities
  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--'
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`app-container ${getWeatherClass()}`} style={getDynamicStyle()}>
      {/* App Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">☀</div>
          <div>
            <h1>AgroSmart Weather</h1>
          </div>
        </div>

        {/* API Config block */}
        <div className="api-config">
          <div className="api-input-wrapper">
            <input
              type="password"
              placeholder="OpenWeather API Key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setIsKeySaved(false)
              }}
              className="api-input"
            />
            <button
              onClick={handleSaveKey}
              className={`api-status-btn ${isKeySaved ? 'active' : ''}`}
              title={isKeySaved ? 'API Key Saved' : 'Save API Key'}
            >
              {isKeySaved ? '✔' : '💾'}
            </button>
          </div>

          <div className="unit-toggle-wrapper">
            <button
              className={`unit-btn ${unit === 'metric' ? 'active' : ''}`}
              onClick={() => setUnit('metric')}
            >
              °C
            </button>
            <button
              className={`unit-btn ${unit === 'imperial' ? 'active' : ''}`}
              onClick={() => setUnit('imperial')}
            >
              °F
            </button>
          </div>
        </div>
      </header>

      {/* Search form */}
      <form onSubmit={fetchWeather} className="search-form">
        <div className="search-input-wrapper">
          <span className="search-icon-decor">🔍</span>
          <input
            type="text"
            placeholder="Search city (e.g. London, Paris, Tokyo...)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="search-input"
          />
        </div>
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="error-box">
          <span>⚠</span>
          <div>{error}</div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="info-box">
          <div className="spinner"></div>
          <p>Fetching weather insights...</p>
        </div>
      )}

      {/* Empty / Intro state */}
      {!weather && !loading && !error && (
        <div className="info-box">
          <span className="info-icon">☁</span>
          <h3>Explore Real-time Weather conditions</h3>
          <p>Input your OpenWeather API Key above, enter a city name, and press search to load current metrics.</p>
        </div>
      )}

      {/* Weather details display */}
      {weather && !loading && (
        <div className="weather-dashboard">
          <div className="main-weather-panel">
            {/* Left Card: Core Temp */}
            <div className="temp-card">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt={weather.weather[0].description}
                className="weather-icon-lg"
              />
              <div className="temp-val-wrapper">
                <span className="temp-value">{Math.round(weather.main.temp)}</span>
                <span className="temp-unit">{unit === 'metric' ? '°C' : '°F'}</span>
              </div>
              <div className="weather-desc">{weather.weather[0].description}</div>
              <div className="location-info">
                <span>📍</span>
                <strong>{weather.name}</strong>, {weather.sys.country}
              </div>
            </div>

            {/* Right Card: Metrics Grid */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon-wrapper">🌡</div>
                <div className="metric-details">
                  <span className="metric-label">Feels Like</span>
                  <span className="metric-value">
                    {Math.round(weather.main.feels_like)}
                    {unit === 'metric' ? '°C' : '°F'}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrapper">💧</div>
                <div className="metric-details">
                  <span className="metric-label">Humidity</span>
                  <span className="metric-value">{weather.main.humidity}%</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrapper">💨</div>
                <div className="metric-details">
                  <span className="metric-label">Wind Speed</span>
                  <span className="metric-value">
                    {weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrapper">⏲</div>
                <div className="metric-details">
                  <span className="metric-label">Pressure</span>
                  <span className="metric-value">{weather.main.pressure} hPa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Bar */}
          <div className="details-section">
            <div className="detail-item">
              <span className="detail-label">Min / Max Temp</span>
              <span className="detail-value">
                {Math.round(weather.main.temp_min)}° / {Math.round(weather.main.temp_max)}°
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Visibility</span>
              <span className="detail-value">{(weather.visibility / 1000).toFixed(1)} km</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sunrise</span>
              <span className="detail-value">{formatTime(weather.sys.sunrise)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sunset</span>
              <span className="detail-value">{formatTime(weather.sys.sunset)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App