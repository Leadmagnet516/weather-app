import TemperatureDisplay from './TemperatureDisplay';
import { useEffect, useState } from 'react';
import { EVENT_ITEM_EXPANDED } from '../CONSTANTS';

export default function ForecastItem( props ) {
  const { name, temp, desc, detail } = props.period;
  const [ expanded, setExpanded ] = useState(false);

  const collapse = () => {
    setExpanded(false)
  }

  const toggleExpanded = () => {
    if (detail) {
      if (!expanded) window.dispatchEvent(new Event(EVENT_ITEM_EXPANDED));
      setExpanded(expanded => !expanded);
    }
  }

  useEffect(() => {
    // Collapse self when another tile expands
    window.addEventListener(EVENT_ITEM_EXPANDED, collapse);

    return(() => {
      window.removeEventListener(EVENT_ITEM_EXPANDED, collapse);
    })
  })

  return (
    <li>
      <div className={`forecast-item ${expanded ? 'expanded' : ''}`} onClick={toggleExpanded}>
        <span className="forecast-item-heading">{name}</span>
        <TemperatureDisplay temp={temp} />
        <span className="forecast-item-desc" style={{opacity: expanded ? '0' : '1'}}>{desc}</span>
        <span className="forecast-item-detail" style={{opacity: expanded ? '1' : '0'}}>{detail}</span>
      </div>
    </li>
  )
}