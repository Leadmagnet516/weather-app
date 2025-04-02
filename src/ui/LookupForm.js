import { useActionState, useEffect } from 'react';
import { fetchWeatherByLocation } from '../utils';

export default function LookupForm( { handleWeatherDataLoaded } ) {
  const [ weatherData, formAction ] = useActionState(fetchWeatherByLocation, {});

  useEffect(() => {
    if (Object.keys(weatherData).length > 0) {
      handleWeatherDataLoaded(weatherData);
    }
  }, [weatherData])
  return (
    <form action={formAction}>
      <input name="location" type="text" placeholder="Enter a location"  value="Birdsboro, PA"  />
      <button type="submit">Look Up</button>
      <p>OR</p>
      <button>Use My Location</button>
    </form>
  )
}