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
    const [dailyData, setDailyData] = useState({})

    const fetchCsv = (filename) => {
        return fetch(filename).then(function (response) {
            let reader = response.body.getReader();
            let decoder = new TextDecoder('utf-8');

            return reader.read().then(function (result) {
                return decoder.decode(result.value);
            });
        });
    }

    const createSummary = (confirmedData, deadData, recoveredData) => {
        console.log("Creating summary...")

        const uniqueCordinates = []

        let temp = confirmedData.concat(deadData).concat(recoveredData)

        temp.forEach(element => {
            const lat = element[2]
            const long = element[3]

            const obj = { lat, long }

            if (!uniqueCordinates.find((element) => element.lat === lat && element.long === long)) {
                uniqueCordinates.push(obj)
            }
        })


        console.log("Found ", uniqueCordinates.length, " unique cordinates.")


        const dayCount = Math.min(confirmedData[0].length, deadData[0].length, recoveredData[0].length)

        console.log("Processing data for ", dayCount, " days.")

        let results = {}

        uniqueCordinates.forEach((cordinate) => {
            const { lat, long } = cordinate

            if (!lat || !long) return

            const key = lat + "," + long

            results = {
                ...results,
                [key]: {
                    confirmed: [],
                    recovered: [],
                    dead: []
                }
            }

        })



        for (let dayIndex = 4; dayIndex < dayCount; dayIndex++) { // Start from i = 4, because first 3 entries are metadata.


            confirmedData.forEach(row => {
                const count = parseInt(row[dayIndex])
                const lat = row[2]
                const long = row[3]


                if (!lat || !long) return

                const key = lat + "," + long

                const oldList = results[key].confirmed
                oldList.push(count)

                results = {
                    ...results,
                    [key]: {
                        ...results[key],
                        confirmed: oldList

                    }
                }
            })

            deadData.forEach(row => {
                const count = parseInt(row[dayIndex])
                const lat = row[2]
                const long = row[3]


                if (!lat || !long) return

                const key = lat + "," + long

                const oldList = results[key].dead
                oldList.push(count)

                results = {
                    ...results,
                    [key]: {
                        ...results[key],
                        dead: oldList

                    }
                }
            })

            recoveredData.forEach(row => {
                const count = parseInt(row[dayIndex])
                const lat = row[2]
                const long = row[3]


                if (!lat || !long) return

                const key = lat + "," + long

                const oldList = results[key].recovered
                oldList.push(count)

                results = {
                    ...results,
                    [key]: {
                        ...results[key],
                        recovered: oldList

                    }
                }
            })


        }

        //console.log(results)
        setDailyData(results)
    }


    useEffect(() => {
        async function doStuff() {
            const confirmedCsv = await fetchCsv("confirmed.csv")
            const deadCsv = await fetchCsv("dead.csv")
            const recoveredCsv = await fetchCsv("recovered.csv")

            const confirmedData = readString(confirmedCsv).data.slice(1)
            const deadData = readString(deadCsv).data.slice(1)
            const recoveredData = readString(recoveredCsv).data.slice(1)


            createSummary(confirmedData, deadData, recoveredData)

            setState({
                confirmed: confirmedData,
                recovered: recoveredData,
                dead: deadData,
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

        const key = lat + "," + long
        const data = dailyData[key]

        let confirmedCases, deadCases, recoveredCases = 0

        if (data) {
            if (data["confirmed"][selectedDateIndex]) {
                confirmedCases = data["confirmed"][selectedDateIndex]
            }

            if (data["dead"][selectedDateIndex]) {
                deadCases = data["dead"][selectedDateIndex]
            }

            if (data["recovered"][selectedDateIndex]) {
                recoveredCases = data["recovered"][selectedDateIndex]
            }
        }

        const res = [confirmedCases, deadCases, recoveredCases]







        const size = calculateSize(count)


        if (isNaN(lat) || isNaN(long) || isNaN(size) || count === 0) return null


        return (
            <Marker
                onClick={() => setActiveDot(confirmed)}
                key={i + "confirmed"}
                marker={{ coordinates: [long, lat] }}

            >
                <g transform={`translate(-100,-100)`}>
                    <SimplePieChart size={size} data={res} />
                </g>

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