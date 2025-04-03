import TemperatureDisplay from './TemperatureDisplay';

export default function ForecastItem( props ) {
  const { name, temp, desc } = props.period;

  return (
    <li>
      <div className='forecast-item'>
        <span className="forecast-item-heading">{name}</span>
        <TemperatureDisplay temp={temp} />
        <span className="forecast-item-desc">{desc}</span>
      </div>
    </li>
  )
}