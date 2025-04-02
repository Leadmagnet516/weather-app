export default function ForecastItem( props ) {
  const { name, temp, desc } = props.period;

  return (
    <li className='forecast-item'>
      <h2>{name}</h2>
      <h1>{temp}&deg; F</h1>
      <p>{desc}</p>
    </li>
  )
}