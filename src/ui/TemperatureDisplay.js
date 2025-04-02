export default function TemperatureDisplay( { temp }) {
  return (
    <div className="temperature-display">
      <span className="temperature-numeral">
        {temp}
        <span className="temperature-unit">&deg; F</span>
      </span>
      
    </div>
  )
}