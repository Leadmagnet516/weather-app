import LookupForm from './LookupForm';
import logo from '../images/logo.png';
import { useEffect, useState } from 'react';

export default function LogoLookup( {handleWeatherData, address }) {
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
      <span className="logo-lookup-version">v1.0.0 by Leadmagnet516</span>
      <>
      { editing ?
        <LookupForm handleWeatherData={handleWeatherData} /> 
        :
        <div className="logo-lookup-current">
          showing weather for {address} &nbsp;
          <button onClick={toggleEditing}>Change</button>
        </div>
      }
      </>
    </div>
  )
}
