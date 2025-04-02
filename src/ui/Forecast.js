import ForecastItem from './ForecastItem';

export default function Forecast( { title, dataset } ) {
  return (
    <div className="forecast">
      <h2>{title}</h2>
      <div className="tile">
        <ul>
          {
            dataset.map(period => {
              return (
                <ForecastItem key={period.name} period={period}  />
              )
            })
          }
        </ul>
      </div>
    </div>
  )
}