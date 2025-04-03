import { waitFor } from '@testing-library/react';
import { GEOCODE_API_URL, WEATHER_API_URL } from '../CONSTANTS.js';
import utils from '../utils.js';

const mockFormData = {
  get: location => 'Nowhere, NO'
}

const mockEmptyFormData = {
  get: location => ''
}

const mockGeocodeApiData = {
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

const mockGeocodeData = {
  address: 'Pantsville, OH',
  latLong: '33,34'
}

const mockGeolocationData = {
  latLong: '33,34'
}

const mockWeatherApiData = {
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

const mockWeatherData = {
  hourly: {
    today: 'windy'
  },
  daily: {
    today: 'windy'
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
  describe('fetchGeocodeData', () => {
    test(`fetchGeocodeData calls fetchJson with the geo API url`, async () => {
      const fetchJsonSpy = jest.spyOn(utils, 'fetchJson');
      await waitFor(() => utils.fetchGeocodeData('Nowhere, NO'));
      expect(fetchJsonSpy.mock.calls).toContainEqual([expect.stringContaining(GEOCODE_API_URL)])
    })

    test(`fetchGeocodeData reports when the geocode API call returns no results`, async () => {
      jest.spyOn(utils, 'fetchJson').mockReturnValue(mockNoResultsData)
      const geoData = await waitFor(() => utils.fetchGeocodeData('Nowhere, NO'));
      expect(geoData.status).toBe('Fail');
      expect(geoData.reason).toBe('NoResults');
    })

    test(`fetchGeocodeData surfaces a miscellaneous error when attempting to parse invalid data`, async () => {
      jest.spyOn(utils, 'fetchJson').mockReturnValue(mockInvalidData)
      const geoData = await waitFor(() => utils.fetchGeocodeData('Nowhere, NO'));
      expect(geoData.status).toBe('Fail');
      expect(geoData.reason).toBe('Miscellaneous');
    })

    test(`fetchGeocodeData returns an object containing the address and latLong from the search term`, async () => {
      jest.spyOn(utils, 'fetchJson').mockReturnValue(mockGeocodeApiData)
      const geoData = await waitFor(() => utils.fetchGeocodeData('Nowhere, NO'));
      expect(geoData).toStrictEqual({
        address: 'Pantsville, OH',
        latLong: '33,34'
      })
    })
  })

  describe('fetchWeatherData', () => {
    test(`fetchWeatherData calls fetchJson with the geo API url`, async () => {
      const fetchJsonSpy = jest.spyOn(utils, 'fetchJson');
      await waitFor(() => utils.fetchWeatherData('33,34'));
      expect(fetchJsonSpy.mock.calls).toContainEqual([expect.stringContaining(WEATHER_API_URL)])
    })

    test(`fetchWeatherData calls fetchJson with the strings from the weather API response`, async () => {
      const fetchJsonSpy = jest.spyOn(utils, 'fetchJson').mockReturnValueOnce(mockWeatherApiData)
      await waitFor(() => utils.fetchWeatherData('33,34'));
      expect(fetchJsonSpy.mock.calls).toContainEqual(['forecast url']);
      expect(fetchJsonSpy.mock.calls).toContainEqual(['hourly forecast url']);
    })

    test(`fetchWeatherData surfaces a miscellaneous error when attempting to parse invalid data`, async () => {
      jest.spyOn(utils, 'fetchJson').mockReturnValue(mockInvalidData)
      const weatherData = await waitFor(() => utils.fetchWeatherData('Nowhere, NO'));
      expect(weatherData.status).toBe('Fail');
      expect(weatherData.reason).toBe('Miscellaneous');
    })
  })

  describe('fetchWeatherBySearchTerm', () => {
    test(`fetchWeatherBySearchTerm insta-fails on empty form data`, async () => {
      const weatherData = await waitFor(() => utils.fetchWeatherBySearchTerm({}, mockEmptyFormData));
      expect(weatherData.status).toBe('Fail');
      expect(weatherData.reason).toBe('BadRequest');
    })

    test(`fetchWeatherBySearchTerm calls fetchGeocodeData with the search term`, async () => {
      const fetchGeocodeDataSpy = jest.spyOn(utils, 'fetchGeocodeData');
      await waitFor(() => utils.fetchWeatherBySearchTerm({}, mockFormData));
      expect(fetchGeocodeDataSpy).toHaveBeenCalledWith('Nowhere, NO');
    })

    test(`fetchWeatherBySearchTerm calls fetchWeatherData with the lat and long`, async () => {
      jest.spyOn(utils, 'fetchGeocodeData').mockReturnValue(mockGeocodeData);
      const fetchWeatherDataSpy = jest.spyOn(utils, 'fetchWeatherData');
      await waitFor(() => utils.fetchWeatherBySearchTerm({}, mockFormData));
      expect(fetchWeatherDataSpy).toHaveBeenCalledWith('33,34');
    })

    test(`fetchWeatherBySearchTerm returns an object combining attributes from both forecast responses`, async () => {
      jest.spyOn(utils, 'fetchGeocodeData').mockReturnValue(mockGeocodeData);
      jest.spyOn(utils, 'fetchWeatherData').mockReturnValue(mockWeatherData);
      const weatherData = await waitFor(() => utils.fetchWeatherBySearchTerm({}, mockFormData));
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
  })
 
  describe('fetchWeatherByLocation', () => {
    test(`fetchWeatherByLocation calls fetchGeolocationData`, async () => {
      const fetchGeolocationDataSpy = jest.spyOn(utils, 'fetchGeolocationData');
      await waitFor(() => utils.fetchWeatherByLocation({}, mockFormData));
      expect(fetchGeolocationDataSpy).toHaveBeenCalled();
    })

    test(`fetchWeatherByLocation calls fetchWeatherData with the lat and long`, async () => {
      jest.spyOn(utils, 'fetchGeolocationData').mockReturnValue(mockGeolocationData);
      const fetchWeatherDataSpy = jest.spyOn(utils, 'fetchWeatherData');
      await waitFor(() => utils.fetchWeatherByLocation({}, mockFormData));
      expect(fetchWeatherDataSpy).toHaveBeenCalledWith('33,34');
    })

    test(`fetchWeatherByLocation returns an object combining attributes from both forecast responses`, async () => {
      jest.spyOn(utils, 'fetchGeolocationData').mockReturnValue(mockGeolocationData);
      jest.spyOn(utils, 'fetchWeatherData').mockReturnValue(mockWeatherData);
      const weatherData = await waitFor(() => utils.fetchWeatherByLocation({}, mockFormData));
      expect(weatherData).toStrictEqual({
        address: 'your location',
        status: 'Ok',
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
