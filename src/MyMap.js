import React from 'react'
import { ComposableMap, ZoomableGroup, Geographies, Geography, Markers } from "react-simple-maps"

const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json"


export default function MyMap({ zoom, markers, setZoom }) {
    return (
        <div className="map">
            <ComposableMap style={{ width: "100%", height: "auto" }}>
                <ZoomableGroup zoom={zoom}>
                    <Geographies geography={geoUrl}>
                        {({ geographies, projection }) => geographies.map((geography, i) => (
                            <Geography
                                key={i}
                                geography={geography}
                                projection={projection}
                            />
                        ))
                        }
                    </Geographies>
                    {markers}
                </ZoomableGroup>
            </ComposableMap>
        </div>
    )
}
