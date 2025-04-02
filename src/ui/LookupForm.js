import { useActionState, useEffect } from 'react';
import { API_STATUS} from '../CONSTANTS';
import utils from '../utils';
const { fetchWeatherByLocation }  = utils;

export default function LookupForm( { handleWeatherDataLoaded } ) {
  const [ weatherData, formAction ] = useActionState(fetchWeatherByLocation, { status: API_STATUS.PENDING });

  useEffect(() => {
    if (Object.keys(weatherData).length > 0) {
      handleWeatherDataLoaded(weatherData);
    }
  }, [weatherData])
  return (
    <form action={formAction}>
      <input name="location" type="text" placeholder="Enter a location"  />
      <button type="submit">Look Up</button>
      <p>OR</p>
      <button>Use My Location</button>
    </form>
  )
}