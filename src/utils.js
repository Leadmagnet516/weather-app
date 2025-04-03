import { API_KEY, API_STATUS, GEOCODE_API_URL, WEATHER_API_URL } from './CONSTANTS';

const fetchJson = async url => {
  const response = await fetch(url);
  const json = await response.json();

  return {response, json};
}

const fetchGeolocationData = async () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(location => {
        resolve({
          latLong: `${location.coords.latitude},${location.coords.longitude}`
        })
      }, err => {
        resolve({
          status: API_STATUS.FAIL,
          failedOn: API_STATUS.FAILED_ON.GEOLOCATION,
          reason: API_STATUS.FAILURE_TYPE.MISCELLANEOUS
        })
      });
    } else {
      resolve({
        status: API_STATUS.FAIL,
        failedOn: API_STATUS.FAILED_ON.GEOLOCATION,
        reason: API_STATUS.FAILURE_TYPE.UNAVAILABLE
      })
    }
  })
  
}

const fetchGeocodeData = async searchTerm => {
  let data = {}

  try {
    const geo = await utils.fetchJson(`${GEOCODE_API_URL}?address=${searchTerm}&key=${API_KEY}`);

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
        reason: API_STATUS.FAILURE_TYPE.MISC
      }
    }

    // No errors, keep going
    data = {
      address: geo.json.results[0].formatted_address,
      latLong: `${geo.json.results[0].geometry.location.lat},${geo.json.results[0].geometry.location.lng}`
    }
  } catch(err) {
    // In case something goes wrong with the parsing, or something else we didn't already catch
    return {
      ...data,
      status: API_STATUS.FAIL,
      failedOn: API_STATUS.FAILED_ON.GEOCODE,
      reason: API_STATUS.FAILURE_TYPE.MISC
    }
  }

  return data;
}

const fetchWeatherData = async latLong => {
  let data = {};

  // Get forecast APIs URL(s) from main weather API
  let forecast, forecastHourly;
  try {
    const weather = await utils.fetchJson(`${WEATHER_API_URL}${latLong}`);

    // Check for identifiable issues with the weather API request or response
    if (weather.json.title === 'Invalid Parameter') {
      return {
        ...ImageData,
        status: API_STATUS.FAIL,
        failedOn: API_STATUS.FAILED_ON.WEATHER,
        reason: API_STATUS.FAILURE_TYPE.BAD_REQUEST
      }
    }

    // It didn't work, but we just don't know why
    if (!weather.response.ok) {
      return {
        ...data,
        status: API_STATUS.FAIL,
        failedOn: API_STATUS.FAILED_ON.WEATHER,
        reason: API_STATUS.FAILURE_TYPE.MISC
      }
    }

    // All good, carry on
    forecast = weather.json.properties.forecast;
    forecastHourly = weather.json.properties.forecastHourly;
  } catch(err) {
    // In case something goes wrong with the parsing, or something else we didn't already catch
    return {
      ...data,
      status: API_STATUS.FAIL,
      failedOn: API_STATUS.FAILED_ON.WEATHER,
      reason: API_STATUS.FAILURE_TYPE.MISC
    }
  }

  // Get hourly data from forecast APIs (hourly is needed for current conditions with this API)
  let hourly;
  try {
    hourly = await utils.fetchJson(forecastHourly);

    if (!hourly.response.ok || hourly.json.title === 'Not Found') {
      // If anything has gone wrong, we might still be able to use the daily forecast, so don't bail yet
      data.status = API_STATUS.MIXED;
      data.hourly = API_STATUS.ERROR;
      data.reason = API_STATUS.FAILURE_TYPE.UNKONWN;
    } else {
      // All good
      data.hourly = hourly.json.properties;
    }
  } catch(err) {
    // Might still be able to use the daily forecast even if this fails
    data.status = API_STATUS.MIXED;
    data.hourly = API_STATUS.ERROR;
    data.reason = API_STATUS.FAILURE_TYPE.UNKONWN;
  }
  
  // Get daily forecast data from forecast APIs
  let daily;
  try {
    daily = await utils.fetchJson(forecast);

    if (!daily.response.ok || daily.json.title === 'Not Found') {
      // If anything has gone wrong, we might still be able to use hourly, so don't bail yet
      if (data.status === API_STATUS.MIXED) {
        // Oh ok, the hourly forecast piece has already failed too, so we've got nothing; just gracefail
        return {
          status: API_STATUS.FAIL,
          failedOn: API_STATUS.FAILED_ON.FORECAST,
          reason: API_STATUS.FAILURE_TYPE.MISC
        }
      }

      // Hourly has probably succeeded, so just update the daily portion and move on
      data.status = API_STATUS.MIXED;
      data.daily = API_STATUS.ERROR;
      data.reason = API_STATUS.FAILURE_TYPE.MISC;
    } else {
      // All good
      data.daily = daily.json.properties
    }
  } catch(err) {
    if (data.hourly === API_STATUS.ERROR) {
      // Both forecast calls have failed, so we don't really have anything at all
      return {
        status: API_STATUS.FAIL,
        failedOn: API_STATUS.FAILED_ON.FORECAST,
        reason: API_STATUS.FAILURE_TYPE.MISC
      }
    }

    // Daily forecast has failed, but we still have hourly
    data.status = API_STATUS.MIXED;
    data.daily = API_STATUS.ERROR;
    data.reason = API_STATUS.FAILURE_TYPE.MISC;
  }

  return data;
}

const fetchWeatherBySearchTerm = async (previousState, formData) => {
  const searchTerm = formData.get('location');
  
  if (searchTerm.length === 0) {
    // User forgot to enter a search term
    return {
      status: API_STATUS.FAIL,
      failedOn: API_STATUS.FAILED_ON.GEOCODE,
      reason: API_STATUS.FAILURE_TYPE.BAD_REQUEST
    }
  }

  const geoCodeData = await utils.fetchGeocodeData(searchTerm);

  if (geoCodeData.status === API_STATUS.FAIL) {
    return geoCodeData;
  }

  let data = {
    status: API_STATUS.OK,
    address: geoCodeData.address
  }

  const weatherData = await utils.fetchWeatherData(geoCodeData.latLong);

  return {
    ...data,
    ...weatherData
  }
}

const fetchWeatherByLocation = async () => {
  const geoLocationData = await utils.fetchGeolocationData();

  if (geoLocationData.status === API_STATUS.FAIL) {
    return geoLocationData;
  }

  let data = {
    status: API_STATUS.OK,
    address: 'your location'
  }

  const weatherData = await utils.fetchWeatherData(geoLocationData.latLong);

  return {
    ...data,
    ...weatherData
  }
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
  fetchGeolocationData,
  fetchGeocodeData,
  fetchWeatherData,
  fetchWeatherByLocation,
  fetchWeatherBySearchTerm,
  friendlyTimeString,
  abbreviateIfTwoWords
}

export default utils;