import React, { useState, useEffect } from "react"

import {
    ComposableMap,
    ZoomableGroup,
    Geographies,
    Geography,
    Markers,
    Marker,
} from "react-simple-maps"
import { readString } from 'react-papaparse'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import ActiveCountryDetails from "./ActiveCountryDetails";
import ActiveDotDetails from "./ActiveDotDetails";
import { SimplePieChart } from "./SimplePieChart";

function App() {

    const [state, setState] = useState({
        confirmed: [],
        dead: [],
        recovered: []
    })

    const [selectedDateIndex, setSelectedDateIndex] = useState(4)
    const [show, setShow] = useState("confirmed")
    const [divider, setDivider] = useState(2500)
    const [zoom, setZoom] = useState(1)
    const [activeCountry, setActiveCountry] = useState(null)
    const [activeDot, setActiveDot] = useState(null)

    const fetchCsv = (filename) => {
        return fetch(filename).then(function (response) {
            let reader = response.body.getReader();
            let decoder = new TextDecoder('utf-8');

            return reader.read().then(function (result) {
                return decoder.decode(result.value);
            });
        });
    }


    useEffect(() => {
        async function doStuff() {
            const confirmedCsv = await fetchCsv("confirmed.csv")
            const deadCsv = await fetchCsv("dead.csv")
            const recoveredCsv = await fetchCsv("recovered.csv")

            const confirmedData = readString(confirmedCsv).data
            const deadData = readString(deadCsv).data
            const recoveredData = readString(recoveredCsv).data

            console.log(recoveredData.slice(1))


            const dayData = []

            for (let i = 1; i < confirmedData.length - 1; i++) { // Data length = how many countries

                const country = confirmedData[i][1]
                console.log(country)

                const confirmedList = []
                for (let j = 4; j < confirmedData[0].length - 4; j++) { // Column size = how many days tracker
                    const confirmedCount = parseInt(confirmedData[i][j])
                    confirmedList.push(confirmedCount)
                }

                const deadList = []
                for (let j = 4; j < deadData[0].length - 4; j++) { // Column size = how many days tracker
                    const deadCount = parseInt(deadData[i][j])
                    deadList.push(deadCount)
                }

                const recoveredList = []
                for (let j = 4; j < recoveredData[0].length - 4; j++) { // Column size = how many days tracker
                    if (recoveredData[i]) {
                        const recoveredCount = parseInt(recoveredData[i][j])
                        recoveredList.push(recoveredCount)
                    } else {
                        recoveredList.push(recoveredList[recoveredList.length - 1])
                    }
                }

                dayData.push({
                    [country]: {
                        confirmedList,
                        recoveredList,
                        deadList
                    }
                })

            }


            console.log(dayData)

            setState({
                confirmed: confirmedData.slice(1),
                recovered: recoveredData.slice(1),
                dead: deadData.slice(1)
            })
        }
        doStuff()
    }, [])

    const calculateSize = (count) => {
        let size = count / divider
        if (size < 1) {
            size = 1.5
        }
        return size
    }

    if (state.confirmed.length === 0 || state.dead.length === 0) return "Loading data..."

    const recoveredMarkers = state.recovered.map((confirmed, i) => {
        // const provinceOrState = confirmed[0]
        // const countryOrRegion = confirmed[1]
        const lat = confirmed[2]
        const long = confirmed[3]
        const count = parseInt(confirmed[selectedDateIndex])
        let size = calculateSize(count)
        if (isNaN(lat) || isNaN(long) || isNaN(size) || count === 0) return null

        return (
            <Marker
                key={i + "recovered"}
                marker={{ coordinates: [long, lat] }}
                style={{
                    default: { fill: "green" },
                    hover: { fill: "green" },
                    pressed: { fill: "green" },
                }}
            >
                <circle cx={0} cy={0} r={size} />
            </Marker>
        )
    })

    const deadMarkers = state.recovered.map((confirmed, i) => {
        // const provinceOrState = confirmed[0]
        // const countryOrRegion = confirmed[1]
        const lat = confirmed[2]
        const long = confirmed[3]
        const count = parseInt(confirmed[selectedDateIndex])
        let size = calculateSize(count)


        if (isNaN(lat) || isNaN(long) || isNaN(size) || count === 0) return null

        return (
            <Marker
                key={i + "dead"}
                marker={{ coordinates: [long, lat] }}
                style={{
                    default: { fill: "red" },
                    hover: { fill: "red" },
                    pressed: { fill: "red" },
                }}
            >
                <circle cx={0} cy={0} r={size} />
            </Marker>
        )
    })

    const confirmedMarkers = state.confirmed.map((confirmed, i) => {
        // const provinceOrState = confirmed[0]
        // const countryOrRegion = confirmed[1]
        const lat = confirmed[2]
        const long = confirmed[3]
        let count = parseInt(confirmed[selectedDateIndex])

        const size = calculateSize(count)


        if (isNaN(lat) || isNaN(long) || isNaN(size) || count === 0) return null

        return (
            <Marker
                onClick={() => setActiveDot(confirmed)}
                key={i + "confirmed"}
                marker={{ coordinates: [long, lat] }}
                style={{
                    default: { fill: "yellow" },
                    hover: { fill: "yellow" },
                    pressed: { fill: "yellow" },
                }}
            >

                <circle cx={0} cy={0} r={size} />
                <SimplePieChart />


            </Marker>
        )
    })



    let markers
    switch (show) {
        case "dead":
            markers = deadMarkers
            break;
        case "recovered":
            markers = recoveredMarkers
            break;
        case "confirmed":
            markers = confirmedMarkers
            break;

        default:
            break;
    }

    return (
        <div>
            <h1 className="blink_me" style={{ textAlign: "center" }}>Coronavirus timeline 2020</h1>

            <div id="zoom-controls" style={{ position: "fixed", bottom: 0, right: 0 }}>
                <button onClick={() => setZoom(zoom * 2)}>Zoom in</button>
                <button onClick={() => setZoom(zoom / 2)}>Zoom out</button>
            </div>
            <div id="controls" style={{ paddingBottom: "1em" }} >
                <span>Select which cases to show: </span>
                <select onChange={val => setShow(val.target.value)}>
                    <option value="confirmed">Confirmed cases</option>
                    <option value="dead">Dead cases</option>
                    <option value="recovered">Recovered cases</option>
                </select>
                <h1>Day: {selectedDateIndex - 3}</h1>
                <Slider onChange={val => setSelectedDateIndex(val)} value={selectedDateIndex} min={4} max={state.confirmed[0].length - 4} />
                <h1>Divider: {divider}</h1>
                <Slider onChange={val => setDivider(val)} value={divider} min={1} max={100000} />
            </div>


            <ComposableMap style={{ width: "100%", height: "auto" }}>
                <ZoomableGroup zoom={zoom}>
                    <Geographies geography={"https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json"}>
                        {(geographies, projection) => geographies.map((geography, i) => (
                            <Geography
                                key={i}
                                onClick={() => setActiveCountry(geography.properties)}
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
            <ActiveCountryDetails activeCountry={activeCountry} />
            <ActiveDotDetails selectedDateIndex={selectedDateIndex} activeDot={activeDot} />
        </div >
    )

}

export default App