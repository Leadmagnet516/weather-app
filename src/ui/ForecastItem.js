import TemperatureDisplay from './TemperatureDisplay';

export default function ForecastItem( props ) {
  const { name, temp, desc, icon } = props.period;

  const iconUrl = icon ? icon.replace('small', 'large').replace('medium', 'large') : undefined;

  return (
    <li>
      <div className='forecast-item'>
        <span className="forecast-item-heading">{name}</span>
        <TemperatureDisplay temp={temp} />
        <span class="forecast-item-desc">{desc}</span>
      </div>
    </li>
  )
}