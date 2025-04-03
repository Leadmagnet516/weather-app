import { useActionState, useEffect } from 'react';
import { API_STATUS} from '../CONSTANTS';
import utils from '../utils';
const { fetchWeatherByLocation } = utils;

export default function LookupForm( { handleWeatherData } ) {
  const [ weatherDataFromApis, formAction ] = useActionState(fetchWeatherByLocation, { status: API_STATUS.PENDING });

  const handleSubmitClicked = () => {
    handleWeatherData({ status: API_STATUS.LOADING })
  }

  useEffect(() => {
    handleWeatherData(weatherDataFromApis);
  }, [weatherDataFromApis])

  return (
    <div className="lookup-form">
      <form action={formAction}>
        <input name="location" type="text" placeholder="Enter a location"  />
        <button type="submit" onClick={handleSubmitClicked}>Search</button>
        { /*<p>OR</p>
        <button>Use My Location</button> */}
      </form>
    </div>
  )
}