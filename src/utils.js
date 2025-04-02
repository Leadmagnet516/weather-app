import { API_KEY, GEOCODE_API_URL, WEATHER_API_URL } from './CONSTANTS';

export async function fetchWeatherByLocation(previousState, formData) {
    // Get lat/long from geocode API
    const geoResponse = await fetch(`${GEOCODE_API_URL}?address=${formData.get('location')}&key=${API_KEY}`);
    const geoResponseJson = await geoResponse.json();
    const latLong = `${geoResponseJson.results[0].geometry.location.lat},${geoResponseJson.results[0].geometry.location.lng}`;

    // Get forecast APIs URL(s) from main weather API
    const weatherResponse = await fetch(`${WEATHER_API_URL}${latLong}`);
    const weatherResponseJson = await weatherResponse.json();
    const { forecast, forecastHourly } = weatherResponseJson.properties;

    // Compile weather data from forecast APIs (hourly is needed for current conditions with this API)
    const weatherData = {};
    const forecastResponse = await fetch(forecast);
    const hourlyForecastResponse = await fetch(forecastHourly);
    const forecastJson = await forecastResponse.json();
    const hourlyForecastJson = await hourlyForecastResponse.json();
    weatherData.daily = forecastJson.properties;
    weatherData.hourly = hourlyForecastJson.properties;

    return weatherData;
}

export function friendlyTimeString(timeString) {
  const timeRegex = /T\d{2}/;
  let hour = parseInt(timeString.match(timeRegex)[0].replace('T', ''));
  hour = hour > 12 ? hour - 12 : hour;
  const meridian = hour > 12 ? 'PM' : 'AM';
  return `${hour} ${meridian}`;
}