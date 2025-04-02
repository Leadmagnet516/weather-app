export default function CurrentConditions( { dataset }) {
  return (
    <div className="tile current-conditions">
      <h2>Currently</h2>
      <h1>{dataset.temp}&deg; F</h1>
      <p>{dataset.desc}</p>
    </div>
  )
}
