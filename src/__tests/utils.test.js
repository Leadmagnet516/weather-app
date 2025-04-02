import { waitFor } from '@testing-library/react';
import { GEOCODE_API_URL, WEATHER_API_URL } from '../CONSTANTS.js';
import utils from '../utils.js';

const mockFormData = {
  get: location => 'Nowhere, NO'
}

const mockGeoData = {
  results: [
    {
      geometry: {
        location: {
          lat: '33',
          lng: '34'
        }
      }
    }
  ]
}

const mockWeatherData = {
  properties: {
    forecast: 'forecast url',
    forecastHourly: 'hourly forecast url'
  }
}

const mockForecastData = {
  properties: {
    today: 'windy'
  }
}

describe('utils', () => {
  describe('fetchWeatherByLocation', () => {
    let fetchJsonSpy;
    beforeEach(() => {
      fetchJsonSpy = jest.spyOn(utils, 'fetchJson')
        .mockReturnValueOnce(mockGeoData)
        .mockReturnValueOnce(mockWeatherData)
        .mockReturnValueOnce(mockForecastData)
        .mockReturnValueOnce(mockForecastData)
    })
  
    // I could have tested for all these with one call to utils.fetchWeatherBylocation, but this way is more human-readable
    test(`fetchWeatherByLocation calls fetchJson with the geo API url`, async () => {
      await waitFor(() => utils.fetchWeatherByLocation({}, mockFormData));
      expect(fetchJsonSpy.mock.calls).toContainEqual([expect.stringContaining(GEOCODE_API_URL)])
    })
  
    test(`fetchWeatherByLocation calls fetchJson with the main weather API url`, async () => {
      await waitFor(() => utils.fetchWeatherByLocation({}, mockFormData));
      expect(fetchJsonSpy.mock.calls).toContainEqual([expect.stringContaining(WEATHER_API_URL)])
    })
  
    test(`fetchWeatherByLocation calls fetchJson with the strings from the weather API response`, async () => {
      await waitFor(() => utils.fetchWeatherByLocation({}, mockFormData));
      expect(fetchJsonSpy.mock.calls).toContainEqual(['forecast url']);
      expect(fetchJsonSpy.mock.calls).toContainEqual(['hourly forecast url']);
    })
  
    test(`fetchWeatherByLocation returns and object combining the [properties] attribute from both forecast responses`, async () => {
      const weatherData = await waitFor(() => utils.fetchWeatherByLocation({}, mockFormData));
      expect(weatherData).toStrictEqual({
        daily: {
          today: 'windy'
        },
        hourly: {
          today: 'windy'
        }
      })
    })
  })

  describe('friendlyTimeString', () => {
    test(`friendlyTimeString returns a string of 1-2 numerals, with no leading zeroes, followed by "AM" or "PM"`, () => {
      const unfriendly = '2025-04-02T09:00:00-04:00';
      const friendly = utils.friendlyTimeString(unfriendly)
      const regex = /([1-9]|[1-9]\d)(am|pm)/
      expect(friendly.match(regex)[0].length).toBe(friendly.length);
    })
  })
})
