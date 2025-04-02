import './App.css';
import { useState } from 'react';
import utils from './utils';
import LookupForm from './ui/LookupForm';
import CurrentConditions from './ui/CurrentConditions';
import Forecast from './ui/Forecast';
import { API_STATUS } from './CONSTANTS';
const { friendlyTimeString } = utils;

const DEFAULT_WEATHER = {
  temp: '',
  desc: ''
};

const MAX_DAILY_ITEMS = 7;
const MAX_HOURLY_ITEMS = 12;

export default function App() {
  // ERROR HANDLING
  const [ currentWeatherError, setCurrentWeatherError ] = useState('');
  const [ dailyForecastError, setDailyForecastError ] = useState('');
  const [ hourlyForecastError, setHourlyForecastError ] = useState('');

  const handleError = failedOn => {
    switch(failedOn) {
      case API_STATUS.FAILED_ON.GEOCODE :
      case API_STATUS.FAILED_ON.WEATHER :
      default :
        setCurrentWeatherError('There was a problem getting the current weather');
        setDailyForecastError('There was a problem getting the forecast');
        setHourlyForecastError('There was a problem getting the hourly forecast');
        break;
        case API_STATUS.FAILED_ON.HOURLY :
          setCurrentWeatherError('There was a problem getting the current weather');
          setHourlyForecastError('There was a problem getting the hourly forecast');
          break;
      case API_STATUS.FAILED_ON.DAILY :
        setDailyForecastError('There was a problem getting the forecast');
        break;
    }
  }

  // WEATHER DATA MANGEMENT
  const [ currentWeather, setCurrentWeather ] = useState(DEFAULT_WEATHER);
  const [ dailyForecast, setDailyForecast ] = useState([]);
  const [ hourlyForecast, setHourlyForecast ] = useState([]);
  
  const handleCurrentWeather = hourly => {
    try {
      setCurrentWeather({
        desc: hourly.periods[0].shortForecast,
        temp: hourly.periods[0].temperature,
      });
      setCurrentWeatherError('');
    } catch(err) {
      handleError(API_STATUS.FAILED_ON.HOURLY);
    }    
  }

  const handleDailyForecast = daily => {
    try {
      setDailyForecast(() => {
        const dailyArray = daily.periods.slice(0, MAX_DAILY_ITEMS - 1).map(period => {
          return {
            name: period.name,
            temp: period.temperature,
            desc: period.shortForecast,
          }
        })
        return dailyArray;
      })
      setDailyForecastError('');
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
      setHourlyForecastError('');
    } catch(err) {
      handleError(API_STATUS.FAILED_ON.HOURLY);
    }  
  }

  const handleWeatherDataLoaded = weatherData => {
    switch(weatherData.status) {
      case API_STATUS.OK :
        handleCurrentWeather(weatherData.hourly);
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
      case API_STATUS.PENDING :
      default :
        /* noop */
        break;
    }
  }

  return (
    <div className="App">
      <div className="app-header">
        <div className="logo-lookup">
          <h1>RainMagnet</h1>
          <LookupForm handleWeatherDataLoaded={handleWeatherDataLoaded} />
        </div>
        <CurrentConditions dataset={currentWeather} error={currentWeatherError} />
      </div>
      <Forecast key="dailyForecast" title="Daily Forecast" dataset={dailyForecast} error={dailyForecastError} />
      <Forecast key="hourlyForecast" title="Hourly Forecast" dataset={hourlyForecast} error={hourlyForecastError}/>
    </div>
  );
}
