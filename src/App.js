import './App.css';
import { useState } from 'react';
import { friendlyTimeString } from './utils';
import LookupForm from './ui/LookupForm';
import CurrentConditions from './ui/CurrentConditions';
import Forecast from './ui/Forecast';

const DEFAULT_WEATHER = {
  temp: '',
  desc: ''
};

const MAX_DAILY_ITEMS = 7;
const MAX_HOURLY_ITEMS = 12;

export default function App() {
  const [ currentWeather, setCurrentWeather ] = useState(DEFAULT_WEATHER);
  const [ dailyForecast, setDailyForecast ] = useState([]);
  const [ hourlyForecast, setHourlyForecast ] = useState([]);

  const handleWeatherDataLoaded = weatherData => {
    setCurrentWeather({
      desc: weatherData.hourly.periods[0].shortForecast,
      temp: weatherData.hourly.periods[0].temperature,
    });
    
    setDailyForecast(() => {
      const dailyArray = weatherData.daily.periods.slice(0, MAX_DAILY_ITEMS - 1).map(period => {
        return {
          name: period.name,
          temp: period.temperature,
          desc: period.shortForecast,
        }
      })
      return dailyArray;
    })

    setHourlyForecast(() => {
      const hourlyArray = weatherData.hourly.periods.slice(0, MAX_HOURLY_ITEMS - 1).map(period => {
        return {
          name: `${friendlyTimeString(period.startTime)} - ${friendlyTimeString(period.endTime)}`,
          temp: period.temperature,
          desc: period.shortForecast,
        }
      })
      return hourlyArray;
    })
  }

  return (
    <div className="App">
      <div className="app-header">
        <div className="logo-lookup">
          <h1>Rainwalker</h1>
          <LookupForm handleWeatherDataLoaded={handleWeatherDataLoaded} />
        </div>
        <CurrentConditions dataset={currentWeather} />
      </div>
      <Forecast key="dailyForecast" title="Daily Forecast" dataset={dailyForecast}/>
      <Forecast key="hourlyForecast" title="Hourly Forecast" dataset={hourlyForecast}/>
    </div>
  );
}
