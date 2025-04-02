import { API_KEY, API_STATUS, GEOCODE_API_URL, WEATHER_API_URL } from './CONSTANTS';

const fetchJson = async url => {
  const response = await fetch(url);
  const responseJson = await response.json();
  return responseJson;
}

const fetchWeatherByLocation = async (previousState, formData) => {
    // Get lat/long from geocode API
    let latLong;
    try {
      const geo = await utils.fetchJson(`${GEOCODE_API_URL}?address=${formData.get('location')}&key=${API_KEY}`);
      latLong = `${geo.results[0].geometry.location.lat},${geo.results[0].geometry.location.lng}`;
    } catch(err) {
      return {
        status: API_STATUS.FAIL,
        fail: API_STATUS.FAILED_ON.GEOCODE
      }
    }   

     // Get forecast APIs URL(s) from main weather API
    let forecast, forecastHourly;
    try {
      const weather = await utils.fetchJson(`${WEATHER_API_URL}${latLong}`);
      forecast = weather.properties.forecast;
      forecastHourly = weather.properties.forecastHourly;
    } catch(err) {
      return {
        status: API_STATUS.FAIL,
        fail: API_STATUS.FAILED_ON.WEATHER
      }
    }

    // Compile weather data from properties attribute of forecast API responses
    const weatherData = {
      status: API_STATUS.OK
    };

    // Get hourly data from forecast APIs (hourly is needed for current conditions with this API)
    let hourlyForecastJson;
    try {
      hourlyForecastJson = await utils.fetchJson(forecastHourly);
      weatherData.hourly = hourlyForecastJson.properties;
    } catch(err) {
      // Might still be able to use the daily forecast even if this fails
      weatherData.status = API_STATUS.MIXED
      weatherData.hourly = API_STATUS.ERROR
    }
    
    // Get daily forecast data from forecast APIs
    let forecastJson;
    try {
      forecastJson = await utils.fetchJson(forecast);
      weatherData.daily = forecastJson.properties
    } catch(err) {
      if (weatherData.hourly === API_STATUS.ERROR) {
        // Both forecast calls have failed, so we don't really have anything at all
        return {
          status: API_STATUS.FAIL,
          fail: API_STATUS.FAILED_ON.FORECAST
        }
      }
      // Daily forecast has failed, but we still have hourly
      weatherData.status = API_STATUS.MIXED;
      weatherData.daily = API_STATUS.ERROR;
    }

    return weatherData;
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