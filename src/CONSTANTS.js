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
  }
}