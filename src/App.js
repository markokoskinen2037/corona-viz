import React, { useState, useEffect } from 'react'
import { Marker } from 'react-simple-maps'
import { readString } from 'react-papaparse'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { SimplePieChart } from './SimplePieChart'
import Graph from './Graph'
import MyMap from './MyMap'
import CompareContainer from './CompareContainer'

function App() {
  const [state, setState] = useState({
    confirmed: [],
    dead: [],
    recovered: [],
  })

  const [selectedDateIndex, setSelectedDateIndex] = useState(50)
  const [show, setShow] = useState('pies')
  const [activeLocation, setActiveLocation] = useState({
    key: '64.0,26.0',
    provinceOrState: '',
    countryOrRegion: 'Finland',
    max: 59, //TODO: This value needs to be updated later...
  }) // Finland
  const [dailyData, setDailyData] = useState({})
  const [maxValues, setMaxValues] = useState({
    deadMax: null,
    recoveredMax: null,
    confirmedMax: null,
  })
  const [lockedCountry, setLockedCountry] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const fetchCsv = (filename) => {
    return fetch(filename).then(function (response) {
      let reader = response.body.getReader()
      let decoder = new TextDecoder('utf-8')

      return reader.read().then(function (result) {
        return decoder.decode(result.value)
      })
    })
  }

  const createSummary = (confirmedData, deadData, recoveredData) => {
    console.log('Creating summary...')

    const uniqueCordinates = []

    let temp = confirmedData.concat(deadData).concat(recoveredData)

    temp.forEach((element) => {
      const lat = element[2]
      const long = element[3]

      const obj = { lat, long }

      if (!uniqueCordinates.find((element) => element.lat === lat && element.long === long)) {
        uniqueCordinates.push(obj)
      }
    })

    console.log('Found ', uniqueCordinates.length, ' unique cordinates.')

    const dayCount = Math.min(confirmedData[0].length, deadData[0].length, recoveredData[0].length)

    console.log('Processing data for ', dayCount, ' days.')

    let results = {}

    uniqueCordinates.forEach((cordinate) => {
      const { lat, long } = cordinate

      if (!lat || !long) return

      const key = lat + ',' + long

      results = {
        ...results,
        [key]: {
          confirmed: [],
          recovered: [],
          dead: [],
        },
      }
    })

    const helper = (data, type, dayIndex) => {
      data.forEach((row) => {
        const count = parseInt(row[dayIndex])
        const lat = row[2]
        const long = row[3]

        if (!lat || !long) return

        const key = lat + ',' + long

        const oldList = results[key][type]
        oldList.push(count)

        results = {
          ...results,
          [key]: {
            ...results[key],
            [type]: oldList,
          },
        }
      })
    }

    // Start from i = 4, because first 3 entries are metadata.
    for (let dayIndex = 4; dayIndex < dayCount; dayIndex++) {
      helper(confirmedData, 'confirmed', dayIndex)
      helper(deadData, 'dead', dayIndex)
      helper(recoveredData, 'recovered', dayIndex)
    }

    setDailyData(results)
  }

  const getMax = (data) => {
    let max = 0
    data.forEach((row) => {
      row.forEach((element) => {
        let val = parseInt(element)
        if (val > max) max = val
      })
    })
    return max
  }

  useEffect(() => {
    async function getAndParseData() {
      const basePath = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/'
      const FAILSTRING = '404: Not Found'

      let confirmedCsv = await fetchCsv(`${basePath}/time_series_covid19_confirmed_global.csv`)
      let deadCsv = await fetchCsv(`${basePath}time_series_covid19_deaths_global.csv`)
      let recoveredCsv = await fetchCsv(`${basePath}time_series_covid19_recovered_global.csv`)

      if (confirmedCsv === FAILSTRING || deadCsv === FAILSTRING || recoveredCsv === FAILSTRING) {
        alert('Failed to read latest data from github.\nUsing local (outdated) data instead.\nSorry for the inconvinience')
        confirmedCsv = await fetchCsv('confirmed.csv')
        deadCsv = await fetchCsv('dead.csv')
        recoveredCsv = await fetchCsv('recovered.csv')
      }

      // Slice 1st row off, because its the header row which contains no data:
      const confirmedData = readString(confirmedCsv).data.slice(1)
      const deadData = readString(deadCsv).data.slice(1)
      const recoveredData = readString(recoveredCsv).data.slice(1)

      createSummary(confirmedData, deadData, recoveredData)

      // Need to perform slicing here, because last row is newline, which contains no new data.
      setState({
        confirmed: confirmedData.slice(0, confirmedData.length - 1),
        recovered: recoveredData.slice(0, recoveredData.length - 1),
        dead: deadData.slice(0, deadData.length - 1),
      })

      let confirmedMax = getMax(confirmedData)
      let deadMax = getMax(deadData)
      let recoveredMax = getMax(recoveredData)

      setMaxValues({
        deadMax,
        recoveredMax,
        confirmedMax,
      })

      setLoaded(true)
    }
    getAndParseData()
  }, [])

  const calculateSize = (todaysData, forPie, maxValue) => {
    const v_max = maxValue // This is just an estimate, need to calculate correct value automatically later.

    if (!forPie) {
      let v_i = todaysData
      let r = Math.pow(v_i / v_max, 0.57) // Perceptual scaling (Flanney)
      r = r * 12 // Maximum radius
      r = r + 1 // To make the smallest dots appear

      return r
    } else {
      const { dead, recovered, confirmed } = todaysData

      let v_i = dead + recovered + confirmed
      let r = Math.pow(v_i / v_max, 0.57) // Perceptual scaling (Flanney)
      r = r * 12 // Maximum radius
      r = r + 1 // To make the smallest dots appear

      return r
    }
  }

  if (!loaded) return 'Loading data...'

  const getTodaysData = (lat, long) => {
    const key = lat + ',' + long
    const data = dailyData[key]

    let [confirmedCases, deadCases, recoveredCases] = [0, 0, 0]

    if (data) {
      if (data['confirmed'][selectedDateIndex]) {
        confirmedCases = data['confirmed'][selectedDateIndex]
      }

      if (data['dead'][selectedDateIndex]) {
        deadCases = data['dead'][selectedDateIndex]
      }

      if (data['recovered'][selectedDateIndex]) {
        recoveredCases = data['recovered'][selectedDateIndex]
      }
    }

    return {
      confirmed: confirmedCases,
      recovered: recoveredCases,
      dead: deadCases,
    }
  }

  const handleLocationSelect = (lat, long, provinceOrState, countryOrRegion) => {
    const key = lat + ',' + long
    setActiveLocation({
      key,
      provinceOrState,
      countryOrRegion,
    })
  }

  const recoveredMarkers = state.recovered.map((row, i) => {
    const provinceOrState = row[0]
    const countryOrRegion = row[1]
    const lat = row[2]
    const long = row[3]
    const count = parseInt(row[selectedDateIndex])
    let size = calculateSize(count, false, maxValues.recoveredMax)
    if (isNaN(lat) || isNaN(long) || isNaN(size) || count === 0) return null

    return (
      <Marker
        key={i + 'recovered'}
        onClick={() => handleLocationSelect(lat, long, provinceOrState, countryOrRegion)}
        coordinates={[long, lat]}
        style={{
          default: { fill: 'green' },
          hover: { fill: 'green' },
          pressed: { fill: 'green' },
        }}
      >
        <circle cx={0} cy={0} r={size} />
      </Marker>
    )
  })

  const deadMarkers = state.dead.map((row, i) => {
    const provinceOrState = row[0]
    const countryOrRegion = row[1]
    const lat = row[2]
    const long = row[3]
    const count = parseInt(row[selectedDateIndex])
    let size = calculateSize(count, false, maxValues.deadMax)

    if (isNaN(lat) || isNaN(long) || isNaN(size) || count === 0) return null

    return (
      <Marker
        key={i + 'dead'}
        onClick={() => handleLocationSelect(lat, long, provinceOrState, countryOrRegion)}
        coordinates={[long, lat]}
        style={{
          default: { fill: 'gray' },
          hover: { fill: 'gray' },
          pressed: { fill: 'gray' },
        }}
      >
        <circle cx={0} cy={0} r={size} />
      </Marker>
    )
  })

  const confirmedMarkers = state.confirmed.map((row, i) => {
    const provinceOrState = row[0]
    const countryOrRegion = row[1]
    const lat = row[2]
    const long = row[3]
    const count = parseInt(row[selectedDateIndex])
    let size = calculateSize(count, false, maxValues.confirmedMax)

    if (isNaN(lat) || isNaN(long) || isNaN(size) || count === 0) return null

    return (
      <Marker
        onClick={() => handleLocationSelect(lat, long, provinceOrState, countryOrRegion)}
        key={i + 'confirmed'}
        coordinates={[long, lat]}
        style={{
          default: { fill: 'yellow' },
          hover: { fill: 'yellow' },
          pressed: { fill: 'yellow' },
        }}
      >
        <circle cx={0} cy={0} r={size} />
      </Marker>
    )
  })

  const pieMarkers = state.confirmed.map((confirmed, i) => {
    const provinceOrState = confirmed[0]
    const countryOrRegion = confirmed[1]
    const lat = confirmed[2]
    const long = confirmed[3]
    const todaysData = getTodaysData(lat, long)

    const hasCases = Object.entries(todaysData).find((entry) => entry[1] !== 0)
    if (!hasCases) return null

    const size = calculateSize(todaysData, true, maxValues.recoveredMax + maxValues.deadMax + maxValues.confirmedMax)

    return (
      <Marker onClick={() => handleLocationSelect(lat, long, provinceOrState, countryOrRegion)} key={i + 'pie'} coordinates={[long, lat]}>
        <g transform={`translate(-100,-100)`}>
          <SimplePieChart size={size} data={todaysData} />
        </g>
      </Marker>
    )
  })

  let markers
  switch (show) {
    case 'dead':
      markers = deadMarkers
      break
    case 'recovered':
      markers = recoveredMarkers
      break
    case 'confirmed':
      markers = confirmedMarkers
      break
    case 'pies':
      markers = pieMarkers
      break

    default:
      break
  }

  const lockCountryForComparison = () => {
    setLockedCountry({
      ...activeLocation,
    })
  }

  return (
    <div>
      <h1 className="blink_me" style={{ textAlign: 'center' }}>
        Coronavirus timeline 2020
      </h1>
      <div className="application-container">
        <div className="sidebar">
          <div id="controls" style={{ paddingBottom: '1em' }}>
            <span>Select which cases to show: </span>
            <select onChange={(val) => setShow(val.target.value)}>
              <option value="pies">Pies</option>
              <option value="confirmed">Confirmed cases</option>
              <option value="dead">Dead cases</option>
              <option value="recovered">Recovered cases</option>
            </select>
            <button onClick={lockCountryForComparison}>Lock {activeLocation.countryOrRegion} for comparison</button>
            {lockedCountry && <button onClick={() => setLockedCountry(null)}>x</button>}
            <h1>Day: {selectedDateIndex}</h1>
            <Slider onChange={(val) => setSelectedDateIndex(val)} value={selectedDateIndex} min={0} max={state.confirmed[0].length - 5} />
          </div>
          <CompareContainer selectedDateIndex={selectedDateIndex} activeLocation={activeLocation} lockedLocation={lockedCountry} dailyData={dailyData} />
          <Graph dailyData={dailyData} activeLocation={activeLocation} />
        </div>
        <MyMap markers={markers} />
      </div>
    </div>
  )
}

export default App
