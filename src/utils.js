import { API_KEY, API_STATUS, GEOCODE_API_URL, WEATHER_API_URL } from './CONSTANTS';

const fetchJson = async url => {
  const response = await fetch(url);
  const json = await response.json();

  return {response, json};
}

const fetchWeatherByLocation = async (previousState, formData) => {
    const weatherData = {
      status: API_STATUS.OK // Default to OK status; can downgrade as needed
    };

    // Get lat/long from geocode API
    let latLong;
    try {
      const geo = await utils.fetchJson(`${GEOCODE_API_URL}?address=${formData.get('location')}&key=${API_KEY}`);

      // Check for identifiable issues with the geocode request or response
      switch (geo.json.status) {
        default :
        case 'OK' :
          /* noop */
          break
        case 'INVALID_REQUEST' :
          return {
            status: API_STATUS.FAIL,
            failedOn: API_STATUS.FAILED_ON.GEOCODE,
            reason: API_STATUS.FAILURE_TYPE.BAD_REQUEST
          }
        case 'ZERO_RESULTS' :
          return {
            status: API_STATUS.FAIL,
            failedOn: API_STATUS.FAILED_ON.GEOCODE,
            reason: API_STATUS.FAILURE_TYPE.NO_RESULTS
          }
      }

      // It didn't work, but we just don't know why
      if (!geo.response.ok) {
        return {
          status: API_STATUS.FAIL,
          failedOn: API_STATUS.FAILED_ON.GEOCODE,
          reason: API_STATUS.FAILURE_TYPE.UNKNOWN
        }
      }

      // No errors, keep going
      weatherData.address = geo.json.results[0].formatted_address;
      latLong = `${geo.json.results[0].geometry.location.lat},${geo.json.results[0].geometry.location.lng}`;
    } catch(err) {
      // In case something goes wrong with the parsing, or something else we didn't already catch
      return {
        ...weatherData,
        status: API_STATUS.FAIL,
        failedOn: API_STATUS.FAILED_ON.GEOCODE,
        reason: API_STATUS.FAILURE_TYPE.UNKNOWN
      }
    }   

     // Get forecast APIs URL(s) from main weather API
    let forecast, forecastHourly;
    try {
      const weather = await utils.fetchJson(`${WEATHER_API_URL}${latLong}`);

      // Check for identifiable issues with the weather API request or response
      if (weather.json.title === 'Invalid Parameter') {
        return {
          ...weatherData,
          status: API_STATUS.FAIL,
          failedOn: API_STATUS.FAILED_ON.WEATHER,
          reason: API_STATUS.FAILURE_TYPE.BAD_REQUEST
        }
      }

      // It didn't work, but we just don't know why
      if (!weather.response.ok) {
        return {
          ...weatherData,
          status: API_STATUS.FAIL,
          failedOn: API_STATUS.FAILED_ON.WEATHER,
          reason: API_STATUS.FAILURE_TYPE.UNKNOWN
        }
      }

      // All good, carry on
      forecast = weather.json.properties.forecast;
      forecastHourly = weather.json.properties.forecastHourly;
    } catch(err) {
      // In case something goes wrong with the parsing, or something else we didn't already catch
      return {
        ...weatherData,
        status: API_STATUS.FAIL,
        failedOn: API_STATUS.FAILED_ON.WEATHER,
        reason: API_STATUS.FAILURE_TYPE.UNKNOWN
      }
    }

    // Get hourly data from forecast APIs (hourly is needed for current conditions with this API)
    let hourly;
    try {
      hourly = await utils.fetchJson(forecastHourly);

      if (!hourly.response.ok || hourly.json.title === 'Not Found') {
        // If anything has gone wrong, we might still be able to use the daily forecast, so don't bail yet
        weatherData.status = API_STATUS.MIXED;
        weatherData.hourly = API_STATUS.ERROR;
        weatherData.reason = API_STATUS.FAILURE_TYPE.UNKONWN;
      } else {
        // All good
        weatherData.hourly = hourly.json.properties;
      }
    } catch(err) {
      // Might still be able to use the daily forecast even if this fails
      weatherData.status = API_STATUS.MIXED;
      weatherData.hourly = API_STATUS.ERROR;
      weatherData.reason = API_STATUS.FAILURE_TYPE.UNKONWN;
    }
    
    // Get daily forecast data from forecast APIs
    let daily;
    try {
      daily = await utils.fetchJson(forecast + 'BREAK');

      if (!daily.response.ok || daily.json.title === 'Not Found') {
        // If anything has gone wrong, we might still be able to use hourly, so don't bail yet
        if (weatherData.status === API_STATUS.MIXED) {
          // Oh ok, the hourly forecast piece has already failed too, so we've got nothing; just gracefail
          return {
            status: API_STATUS.FAIL,
            failedOn: API_STATUS.FAILED_ON.FORECAST,
            reason: API_STATUS.FAILURE_TYPE.UNKNOWN
          }
        }

        // Hourly has probably succeeded, so just update the daily portion and move on
        weatherData.status = API_STATUS.MIXED;
        weatherData.daily = API_STATUS.ERROR;
        weatherData.reason = API_STATUS.FAILURE_TYPE.UNKNOWN;
      } else {
        // All good
        weatherData.daily = daily.json.properties
      }
    } catch(err) {
      if (weatherData.hourly === API_STATUS.ERROR) {
        // Both forecast calls have failed, so we don't really have anything at all
        return {
          status: API_STATUS.FAIL,
          failedOn: API_STATUS.FAILED_ON.FORECAST,
          reason: API_STATUS.FAILURE_TYPE.UNKNOWN
        }
      }

      // Daily forecast has failed, but we still have hourly
      weatherData.status = API_STATUS.MIXED;
      weatherData.daily = API_STATUS.ERROR;
      weatherData.reason = API_STATUS.FAILURE_TYPE.UNKNOWN;
    }

    return weatherData;
  }

const friendlyTimeString = timeString => {
  const timeRegex = /T\d{2}/;
  let hour = parseInt(timeString.match(timeRegex)[0].replace('T', ''));
  const meridian = hour > 12 ? 'PM' : 'AM';
  hour = hour > 12 ? hour - 12 : hour;
  hour = hour === 0 ? 12 : hour;
  return `${hour}${meridian}`;
}

const abbreviations = {
  Sunday: 'Sun.',
  Monday: 'Mon.',
  Tuesday: 'Tues.',
  Wednesday: 'Wed.',
  Thursday: 'Thurs.',
  Friday: 'Fri.',
  Saturday: 'Sat.'
}

const abbreviateIfTwoWords = name => {
  const words = name.split(' ');
  if (words.length !== 2 || !abbreviations[words[0]]) return name;

  return `${abbreviations[words[0]]} ${words[1]}`;
}

const utils = {
  fetchJson,
  fetchWeatherByLocation,
  friendlyTimeString,
  abbreviateIfTwoWords
}

export default utils;