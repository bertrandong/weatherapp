import React, { useState } from 'react';
import axios from 'axios';
import './Weather.css'

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  const API_KEY = process.env.REACT_APP_API_KEY; // Remember to set OpenWeather API Key

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather data: ', error);
    }
  };

  const fetchForecastData = async () => {
    try {
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
      const filteredForecast = response.data.list.filter(item => {
        const currentDate = new Date();
        const forecastDate = new Date(item.dt_txt);
        return forecastDate.getDate() > currentDate.getDate() && forecastDate.getDate() <= currentDate.getDate() + 4;
      });
      setForecast(filteredForecast);
    } catch (error) {
      console.error('Error fetching forecast data: ', error);
    }
  };

  const handleSearch = () => {
    fetchWeatherData();
    fetchForecastData();
  };

  const renderTable = () => {
    // Group forecast data by date
    const groupedForecast = forecast.reduce((acc, item) => {
      const date = item.dt_txt.split(' ')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    const times = forecast.map(item => item.dt_txt.split(' ')[1]);
    const uniqueTimes = [...new Set(times)];

    return (
      <table>
        <thead>
          <tr>
            <th>Time</th>
            {Object.keys(groupedForecast).map((date, index) => (
              <th key={index}>{date}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uniqueTimes.map((time, index) => (
            <tr key={index}>
              <td>{time}</td>
              {Object.keys(groupedForecast).map((date, idx) => {
                const forecastItem = groupedForecast[date].find(item => item.dt_txt.includes(time));
                return (
                  <td key={idx}>
                    {forecastItem && (
                      <div>
                        <div>Temperature: {forecastItem.main.temp}°C</div>
                        <div>Weather Condition: {forecastItem.weather[0].description}</div>
                        <img 
                          src={`http://openweathermap.org/img/wn/${forecastItem.weather[0].icon}.png`} 
                          alt="weather icon" 
                        />
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="weather-app-container">
      <h1>Weather Forecast</h1>
      <input 
        type="text" 
        size="50"
        placeholder="Enter city name Eg. Singapore" 
        value={city} 
        onChange={(e) => setCity(e.target.value)} 
      />
      <button onClick={handleSearch}>Search</button>
      {weather && (
        <div>
          <h2>Current Weather</h2>
          <div>Temperature: {weather.main.temp}°C</div>
          <div>Weather Condition: {weather.weather[0].description}</div>
          <div>Humidity: {weather.main.humidity}%</div>
          <div>Wind Speed: {weather.wind.speed} m/s</div>
          <img 
            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`} 
            alt="weather icon" 
          />
        </div>
      )}
      {forecast.length > 0 && (
        <div>
          <h2>Forecast</h2>
          {renderTable()}
        </div>
      )}
    </div>
  );
};

export default Weather;
