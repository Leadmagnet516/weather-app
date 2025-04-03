import TemperatureDisplay from './TemperatureDisplay';

export default function CurrentConditions( { dataset, message }) {
  const { temp, desc } = dataset;
  return (
    <div className="tile current-conditions">
    { message ? (
      <p>{message}</p>
    ) : (
      <>
        <span className="current-conditions-heading">Current conditions </span>
        <div className="current-conditions-weather">
          <TemperatureDisplay temp={temp} />
          <p>{desc}</p>
        </div>
      </>
    )}
    </div>
  )
}
