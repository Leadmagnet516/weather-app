export const WEATHER_API_URL = 'https://api.weather.gov/points/';
export const GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
export const API_KEY = 'AIzaSyBcYs7xhQvSW0lSeULio-dnN-k1ccwiYqw';

export const API_STATUS = {
  PENDING: 'Pending',
  OK: 'Ok',
  ERROR: 'Error',
  FAIL: 'Fail',
  MIXED: 'Mixed',
  FAILED_ON: {
    GEOCODE: 'Geocode',
    WEATHER: 'Weather',
    FORECAST: 'Forecast',
    DAILY: 'Daily',
    HOURLY: 'Hourly'
  },
  FAILURE_TYPE: {
    BAD_REQUEST: 'BadRequest',
    NO_RESULTS: 'NoResults',
    MISC: 'Miscellaneous'
  }
}

export const MSG_PENDING = {
  CURRENT: 'Enter your city & state or zip code to see current weather',
  DAILY: 'Enter your city & state or zip code to see your daily forecast',
  HOURLY: 'Enter your city & state or zip code to see your hourly forecast'
}

export const MSG_LOADING = {
  CURRENT: 'Getting current weather...',
  DAILY: 'Getting your daily forecast...',
  HOURLY: 'Getting your hourly forecast...'
}

export const MSG_ERROR = {
  CURRENT: 'There was a problem getting the weather',
  DAILY: 'There was a problem getting the forecast',
  HOURLY: 'There was a problem getting the hourly forecast'
}

export const EVENT_ITEM_EXPANDED = 'EventItemExpanded';