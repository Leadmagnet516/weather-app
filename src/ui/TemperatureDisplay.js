export default function TemperatureDisplay( { temp }) {
  
  //This ridiculous hack is here because the font I chose for the temperatures tends to cram 7's together
  const letterSpacing = temp.toString().indexOf(7) !== -1 ? '.05em' : 'inherit';

  return (
    <div className="temperature-display">
      <span className="temperature-numeral" style={{letterSpacing}}>
        {temp}
        <span className="temperature-unit">&deg; F</span>
      </span>
      
    </div>
  )
}