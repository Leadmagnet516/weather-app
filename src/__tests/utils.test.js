import { waitFor } from '@testing-library/react';
import { GEOCODE_API_URL, WEATHER_API_URL } from '../CONSTANTS.js';
import utils from '../utils.js';

const mockFormData = {
  get: location => 'Nowhere, NO'
}

const mockEmptyFormData = {
  get: location => ''
}

const mockGeoData = {
  response: {
    ok: true
  },
  json: {
    results: [
      {
        formatted_address: 'Pantsville, OH',
        geometry: {
          location: {
            lat: '33',
            lng: '34'
          }
        }
      }
    ]
  }
}

const mockWeatherData = {
  response: {
    ok: true
  },
  json: {
    properties: {
      forecast: 'forecast url',
      forecastHourly: 'hourly forecast url'
    }
  }
}

const mockForecastData = {
  response: {
    ok: true
  },
  json: {
    properties: {
      today: 'windy'
    }
  }
}

const mockInvalidData = {
  response: {
    ok: false
  },
  json: {
    gobbledygook: 'just absolute garbage here'
  }
}

const mockNoResultsData = {
  response: {
    ok: true
  },
  json: {
    results: [],
    status: 'ZERO_RESULTS'
  }
}

describe('utils', () => {
  describe('fetchWeatherBySearchString', () => {
    test(`fetchWeatherBySearchString calls fetchJson with the geo API url`, async () => {
      const fetchJsonSpy = jest.spyOn(utils, 'fetchJson');
      await waitFor(() => utils.fetchWeatherBySearchString({}, mockFormData));
      expect(fetchJsonSpy.mock.calls).toContainEqual([expect.stringContaining(GEOCODE_API_URL)])
    })
  
    test(`fetchWeatherBySearchString calls fetchJson with the main weather API url`, async () => {
      const fetchJsonSpy = jest.spyOn(utils, 'fetchJson').mockReturnValue(mockGeoData);
      await waitFor(() => utils.fetchWeatherBySearchString({}, mockFormData));
      expect(fetchJsonSpy.mock.calls).toContainEqual([expect.stringContaining(WEATHER_API_URL)])
    })
  
    test(`fetchWeatherBySearchString calls fetchJson with the strings from the weather API response`, async () => {
      const fetchJsonSpy = jest.spyOn(utils, 'fetchJson')
        .mockReturnValueOnce(mockGeoData)
        .mockReturnValueOnce(mockWeatherData)
      await waitFor(() => utils.fetchWeatherBySearchString({}, mockFormData));
      expect(fetchJsonSpy.mock.calls).toContainEqual(['forecast url']);
      expect(fetchJsonSpy.mock.calls).toContainEqual(['hourly forecast url']);
    })
  
    test(`fetchWeatherBySearchString returns an object combining the [properties] attribute from both forecast responses`, async () => {
      jest.spyOn(utils, 'fetchJson')
        .mockReturnValueOnce(mockGeoData)
        .mockReturnValueOnce(mockWeatherData)
        .mockReturnValueOnce(mockForecastData)
        .mockReturnValueOnce(mockForecastData)
      const weatherData = await waitFor(() => utils.fetchWeatherBySearchString({}, mockFormData));
      expect(weatherData).toStrictEqual({
        address: 'Pantsville, OH',
        status: 'Ok',
        daily: {
          today: 'windy'
        },
        hourly: {
          today: 'windy'
        }
      })
    })

    test(`fetchWeatherBySearchString insta-fails on empty form data`, async () => {
      const weatherData = await waitFor(() => utils.fetchWeatherBySearchString({}, mockEmptyFormData));
      expect(weatherData.status).toBe('Fail');
      expect(weatherData.reason).toBe('BadRequest');
    })

    test(`fetchWeatherBySearchString reports when the geocode API call returns no results`, async () => {
      jest.spyOn(utils, 'fetchJson').mockReturnValue(mockNoResultsData)
      const weatherData = await waitFor(() => utils.fetchWeatherBySearchString({}, mockFormData));
      expect(weatherData.status).toBe('Fail');
      expect(weatherData.reason).toBe('NoResults');
    })
    
     test(`fetchWeatherBySearchString surfaces a miscellaneous error when attempting to parse invalid data`, async () => {
      jest.spyOn(utils, 'fetchJson').mockReturnValue(mockInvalidData)
      const weatherData = await waitFor(() => utils.fetchWeatherBySearchString({}, mockFormData));
      expect(weatherData.status).toBe('Fail');
      expect(weatherData.reason).toBe('Miscellaneous');
    })
  })

  describe('friendlyTimeString', () => {
    test(`friendlyTimeString returns a string of 1-2 numerals, with no leading zeroes, followed by a valid meridian`, () => {
      const unfriendly = '2025-04-02T09:00:00-04:00';
      const friendly = utils.friendlyTimeString(unfriendly)
      const regex = /([1-9]|[1-9]\d)(am|pm|AM|PM)/
      expect(friendly.match(regex)[0].length).toBe(friendly.length);
    })
  })

  describe('abbreviateIfTwoWords', () => {
    test(`abbreviateIfTwoWords abbreviates a valid day name only if it's the first of two words`, () => {
      const multiWordString = 'Wednesday Night';
      const returnedString = utils.abbreviateIfTwoWords(multiWordString);
      expect(returnedString).toBe('Wed. Night');
    })

    test(`abbreviateIfTwoWords returns the string unchanged if it's not exactly two words, or if the first word is not a day name`, () => {
      const singleWordString = 'Thursday';
      let returnedString = utils.abbreviateIfTwoWords(singleWordString);
      expect(returnedString).toBe(singleWordString);

      const invalidDayString = 'Crazy Night';
      returnedString = utils.abbreviateIfTwoWords(invalidDayString);
      expect(returnedString).toBe(invalidDayString);

      const tooManyWordsString = 'M. Night Shyamalan';
      returnedString = utils.abbreviateIfTwoWords(tooManyWordsString);
      expect(returnedString).toBe(tooManyWordsString);
    })
  })
})
