import './App.css';
import { useState } from 'react';
import utils from './utils';
import LogoLookup from './ui/LogoLookup';
import CurrentConditions from './ui/CurrentConditions';
import Forecast from './ui/Forecast';
import {
  API_STATUS,
  MSG_PENDING,
  MSG_LOADING,
  MSG_ERROR
 } from './CONSTANTS';
const { friendlyTimeString } = utils;

const DEFAULT_WEATHER = {
  temp: '',
  desc: ''
};

const MAX_HOURLY_ITEMS = 12;

export default function App() {
  // ERROR/MESSAGING HANDLING
  const [ currentWeatherMessage, setCurrentWeatherMessage ] = useState(MSG_PENDING.CURRENT);
  const [ dailyForecastMessage, setDailyForecastMessage ] = useState(MSG_PENDING.DAILY);
  const [ hourlyForecastMessage, setHourlyForecastMessage ] = useState(MSG_PENDING.HOURLY);

  const handleError = failedOn => {
    switch(failedOn) {
      case API_STATUS.FAILED_ON.GEOCODE :
      case API_STATUS.FAILED_ON.WEATHER :
      default :
        setCurrentWeatherMessage(MSG_ERROR.CURRENT);
        setDailyForecastMessage(MSG_ERROR.DAILY);
        setHourlyForecastMessage(MSG_ERROR.HOURLY);
        break;
        case API_STATUS.FAILED_ON.HOURLY :
          setCurrentWeatherMessage(MSG_ERROR.CURRENT);
          setHourlyForecastMessage(MSG_ERROR.HOURLY);
          break;
      case API_STATUS.FAILED_ON.DAILY :
        setDailyForecastMessage(MSG_ERROR.DAILY);
        break;
    }
  }

  // WEATHER DATA MANGEMENT
  const [ currentWeather, setCurrentWeather ] = useState(DEFAULT_WEATHER);
  const [ dailyForecast, setDailyForecast ] = useState([]);
  const [ hourlyForecast, setHourlyForecast ] = useState([]);

  const handleCurrentWeather = (address, hourly) => {
    try {
      setCurrentWeather({
        address: address.replace(/ \d{5}/, ''),
        desc: hourly.periods[0].shortForecast,
        temp: hourly.periods[0].temperature,
        icon: hourly.periods[0].icon
      });
      setCurrentWeatherMessage('');
    } catch(err) {
      handleError(API_STATUS.FAILED_ON.HOURLY);
    }    
  }

  const handleDailyForecast = daily => {
    try {
      setDailyForecast(() => {
        const dailyArray = daily.periods.map(period => {
          return {
            name: period.name,
            temp: period.temperature,
            desc: period.shortForecast
          }
        })
        return dailyArray;
      })
      setDailyForecastMessage('');
    } catch(err) {
      handleError(API_STATUS.FAILED_ON.DAILY);
    }  
  }

  const handleHourlyForecast = hourly => {
    try {
      setHourlyForecast(() => {
        const hourlyArray = hourly.periods.slice(0, MAX_HOURLY_ITEMS - 1).map(period => {
          return {
            name: `${friendlyTimeString(period.startTime)} - ${friendlyTimeString(period.endTime)}`,
            temp: period.temperature,
            desc: period.shortForecast,
          }
        })
        return hourlyArray;
      })
      setHourlyForecastMessage('');
    } catch(err) {
      handleError(API_STATUS.FAILED_ON.HOURLY);
    }  
  }

  const handleWeatherData = weatherData => {
    switch(weatherData.status) {
      case API_STATUS.PENDING :
      default :
        /* noop */
        break;
      case API_STATUS.LOADING :
        setCurrentWeatherMessage(MSG_LOADING.CURRENT);
        setDailyForecastMessage(MSG_LOADING.DAILY);
        setHourlyForecastMessage(MSG_LOADING.HOURLY);
        break;
      case API_STATUS.OK :
        handleCurrentWeather(weatherData.address, weatherData.hourly);
        handleDailyForecast(weatherData.daily);
        handleHourlyForecast(weatherData.hourly);
        break;
      case API_STATUS.MIXED :
        if (weatherData.hourly !== API_STATUS.ERROR) {
          handleCurrentWeather(weatherData.hourly);
          handleHourlyForecast(weatherData.hourly);
        } else if (weatherData.daily !== API_STATUS.ERROR) {
          handleDailyForecast(weatherData.daily);
        }
        break;
      case API_STATUS.FAIL :
        handleError(weatherData.failedOn);
        break;
    }
  }

  return (
    <div className="App">
      <div className="app-header">
        <LogoLookup handleWeatherData={handleWeatherData} address={currentWeather.address} />
        <CurrentConditions dataset={currentWeather} message={currentWeatherMessage} />
      </div>
      <Forecast key="dailyForecast" title="Next Few Days" dataset={dailyForecast} message={dailyForecastMessage} />
      <Forecast key="hourlyForecast" title="Hourly" dataset={hourlyForecast} message={hourlyForecastMessage}/>
    </div>
  );
}
