import React from 'react'
import { ComposableMap, ZoomableGroup, Geographies, Geography, Markers } from "react-simple-maps"

export default function MyMap({ zoom, markers, setZoom }) {
    return (
        <div className="map">
            <ComposableMap style={{ width: "100%", height: "auto" }}>
                <ZoomableGroup zoom={zoom}>
                    <Geographies geography={"https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json"}>
                        {(geographies, projection) => geographies.map((geography, i) => (
                            <Geography
                                key={i}
                                geography={geography}
                                projection={projection}
                            />
                        ))}
                    </Geographies>
                    <Markers>
                        {markers}
                    </Markers>
                </ZoomableGroup>
            </ComposableMap>

            <div className="zoom-controls">
                <button onClick={() => setZoom(zoom * 2)}>Zoom in</button>
                <button onClick={() => setZoom(zoom / 2)}>Zoom out</button>
            </div>


        </div>
    )
}
