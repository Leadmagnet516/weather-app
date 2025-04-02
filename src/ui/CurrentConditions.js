export default function CurrentConditions( { dataset, error }) {
  return (
    <div className="tile current-conditions">
    { error ? (
      <p>{error}</p>
    ) : (
      <>
        <h2>Currently</h2>
        <h1>{dataset.temp}&deg; F</h1>
        <p>{dataset.desc}</p>
      </>
    )}
    </div>
  )
}
