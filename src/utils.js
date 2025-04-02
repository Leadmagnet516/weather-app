import { API_KEY, GEOCODE_API_URL, WEATHER_API_URL } from './CONSTANTS';

const fetchJson = async url => {
  const response = await fetch(url);
  const responseJson = await response.json();
  return responseJson;
}

const fetchWeatherByLocation = async (previousState, formData) => {
    // Get lat/long from geocode API
    const geo = await utils.fetchJson(`${GEOCODE_API_URL}?address=${formData.get('location')}&key=${API_KEY}`);
    const latLong = `${geo.results[0].geometry.location.lat},${geo.results[0].geometry.location.lng}`;

     // Get forecast APIs URL(s) from main weather API
    const weather = await utils.fetchJson(`${WEATHER_API_URL}${latLong}`);
    const { forecast, forecastHourly } = weather.properties;

    // Compile weather data from forecast APIs (hourly is needed for current conditions with this API)
    const forecastJson = await utils.fetchJson(forecast);
    const hourlyForecastJson = await utils.fetchJson(forecastHourly);

    return {
      daily: forecastJson.properties,
      hourly: hourlyForecastJson.properties
    };
  }

const friendlyTimeString = timeString => {
  const timeRegex = /T\d{2}/;
  let hour = parseInt(timeString.match(timeRegex)[0].replace('T', ''));
  hour = hour > 12 ? hour - 12 : hour;
  const meridian = hour > 12 ? 'PM' : 'AM';
  return `${hour} ${meridian}`;
}

const utils = {
  fetchJson,
  fetchWeatherByLocation,
  friendlyTimeString
}

export default utils;