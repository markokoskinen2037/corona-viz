import React from 'react'
import { ComposableMap, ZoomableGroup, Geographies, Geography } from 'react-simple-maps'

const geoUrl = 'https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json'

export default function MyMap({ markers }) {
  return (
    <div className="map">
      <ComposableMap style={{ width: '100%', height: 'auto' }}>
        <ZoomableGroup zoom={1.2}>
          <Geographies geography={geoUrl}>{({ geographies }) => geographies.map((geography, i) => <Geography key={i} geography={geography} />)}</Geographies>
          {markers}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
