import ForecastItem from './ForecastItem';

export default function Forecast( { title, dataset, message } ) {
  return (
    <div className="forecast full-width-centered">
      <div className="forecast-heading">
        <h2>{title}</h2>
        {
          dataset[0]?.detail ? (
            <span>Tap to expand</span>
          ) : (
            <>
            </>
          )
        }
      </div>
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