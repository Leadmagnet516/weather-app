import LookupForm from './LookupForm';
import logo from '../images/logo.png';
import { useEffect, useState } from 'react';

export default function LogoLookup( {handleWeatherData, address, message }) {
  const [ editing, setEditing ] = useState(true);

  const toggleEditing = () => {
    setEditing(editing => !editing);
  }

  useEffect(() => {
    if(address?.length > 0) {
      setEditing(false);
    }
  }, [address]);

  return (
    <div className="logo-lookup">
      <img src={logo} alt="RAINFRONT" />
      <>
      { editing ?
        <LookupForm handleWeatherData={handleWeatherData} message={message} /> 
        :
        <div className="logo-lookup-current">
          Showing weather for {address} &nbsp;
          <button onClick={toggleEditing}>Change</button>
        </div>
      }
      </>
    </div>
  )
}
