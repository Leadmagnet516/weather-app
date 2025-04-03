import { useActionState, useEffect } from 'react';
import { API_STATUS} from '../CONSTANTS';
import utils from '../utils';
const { fetchWeatherByLocation, fetchWeatherBySearchString } = utils;

export default function LookupForm( { handleWeatherData, message } ) {
  const [ weatherDataFromApis, formAction ] = useActionState(fetchWeatherBySearchString, { status: API_STATUS.PENDING });

  const handleSubmitClicked = () => {
    handleWeatherData({ status: API_STATUS.LOADING })
  }

  const handleUMLClicked = async () => {
    handleWeatherData({ status: API_STATUS.LOADING })
    const weatherData = await fetchWeatherByLocation();
    handleWeatherData(weatherData);
  }

  useEffect(() => {
    handleWeatherData(weatherDataFromApis);
  }, [weatherDataFromApis])

  return (
    <div className="lookup-form-container">
      <form className="lookup-form" action={formAction}>
        <input name="location" type="text" placeholder="Enter a location"  />
        <button type="submit" onClick={handleSubmitClicked}>Search</button>
        <button type="button" onClick={handleUMLClicked}>Use My Location</button>
      </form>
      <span className="lookup-form-error">{message}</span>
    </div>
  )
}