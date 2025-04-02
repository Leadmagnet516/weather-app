export default function CurrentConditions( { dataset, message }) {
  return (
    <div className="tile current-conditions">
    { message ? (
      <p>{message}</p>
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
