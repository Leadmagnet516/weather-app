import ForecastItem from './ForecastItem';

export default function Forecast( { title, dataset, message } ) {
  return (
    <div className="forecast">
      <h2>{title}</h2>
      <div className="tile scrollable">
        { message ? (
          <p>{message}</p>
        ) : (
        <ul>
          {
            dataset.map(period => {
              return (
                <ForecastItem key={period.name} period={period}  />
              )
            })
          }
        </ul>
        )}
      </div>
    </div>
  )
}