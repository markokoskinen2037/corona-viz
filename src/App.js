import React, { useState, useEffect } from 'react'
import { readString } from 'react-papaparse'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import MyMap from './MyMap'
import CompareContainer from './CompareContainer'
import { createMarkers, createPieMarkers, translateDay } from './util'

function App() {
  const [state, setState] = useState({
    confirmed: [],
    dead: [],
    recovered: [],
  })

  const [selectedDateIndex, setSelectedDateIndex] = useState(50)
  const [show, setShow] = useState('pies')
  const [activeLocation, setActiveLocation] = useState({
    key: '64,26',
    provinceOrState: '',
    countryOrRegion: 'Finland',
    max: 59, //TODO: This value needs to be updated later...
  })
  const [dailyData, setDailyData] = useState({})
  const [maxValues, setMaxValues] = useState({
    dead: null,
    recovered: null,
    confirmed: null,
  })
  const [lockedCountry, setLockedCountry] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [autoplay, setAutoplay] = useState(false)
  const [myInterval, saveMyInterval] = useState(null)

  const fetchCsv = (filename) => {
    return fetch(filename, { cache: 'no-store' }).then(function (response) {
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

        if (key === '64.0,26.0' && type === 'confirmed') {
          alert('')
        }
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

  useEffect(() => {
    async function getAndParseData() {
      const basePath = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/'
      const FAILSTRING = '404: Not Found'

      let confirmedCsv = await fetchCsv(`${basePath}time_series_covid19_confirmed_global.csv`)
      let deadCsv = await fetchCsv(`${basePath}time_series_covid19_deaths_global.csv`)
      let recoveredCsv = await fetchCsv(`${basePath}time_series_covid19_recovered_global.csv`)

      // Debug start
      console.log(confirmedCsv)
      console.log(deadCsv)
      console.log(recoveredCsv)
      // Debug end

      if (confirmedCsv === FAILSTRING || deadCsv === FAILSTRING || recoveredCsv === FAILSTRING) {
        alert('Failed to read latest data from github.\nUsing local (outdated) data instead.\nSorry for the inconvinience')
        confirmedCsv = await fetchCsv('confirmed.csv')
        deadCsv = await fetchCsv('dead.csv')
        recoveredCsv = await fetchCsv('recovered.csv')
      }

      // Slice 1st row off, because its the header row which contains no data:
      let confirmedData = readString(confirmedCsv).data.slice(1)
      let deadData = readString(deadCsv).data.slice(1)
      let recoveredData = readString(recoveredCsv).data.slice(1)

      // Debug start
      console.log(confirmedData)
      console.log(deadData)
      console.log(recoveredData)
      // Debug end

      // Now fix inconsistently formatted coordinates to be the same. i.e from "63.0" to "63"
      const fixCoordinates = (data) => {
        return data.map((row) =>
          row.map((element, index) => {
            return index === 2 || index === 3 ? parseFloat(element) : element
          })
        )
      }

      confirmedData = fixCoordinates(confirmedData)
      deadData = fixCoordinates(deadData)
      recoveredData = fixCoordinates(recoveredData)

      createSummary(confirmedData, deadData, recoveredData)

      // Need to perform slicing here, because last row is newline, which contains no new data.
      setState({
        confirmed: confirmedData.slice(0, confirmedData.length - 1),
        recovered: recoveredData.slice(0, recoveredData.length - 1),
        dead: deadData.slice(0, deadData.length - 1),
      })

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

      let confirmedMax = getMax(confirmedData)
      let deadMax = getMax(deadData)
      let recoveredMax = getMax(recoveredData)

      setMaxValues({
        dead: deadMax,
        recovered: recoveredMax,
        confirmed: confirmedMax,
      })

      setLoaded(true)
    }
    getAndParseData()
  }, [])

  useEffect(() => {
    if (autoplay) {
      //Start new autoplay
      const max = state.confirmed[0].length - 5
      if (selectedDateIndex === max) {
        setAutoplay(false)
        return
      }
      const temp = setInterval(() => {
        setSelectedDateIndex((selectedDateIndex) => selectedDateIndex + 1)
      }, 200)

      saveMyInterval(temp)
    } else {
      //Stop existing autplay
      clearInterval(myInterval)
      saveMyInterval(null)
    }
  }, [autoplay])

  useEffect(() => {
    if (!state.confirmed[0]) return
    const max = state.confirmed[0].length - 5
    if (selectedDateIndex === max && myInterval) {
      clearInterval(myInterval)
      saveMyInterval(null)
      setAutoplay(false)
    }
  }, [selectedDateIndex])

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

  if (!loaded)
    return (
      <span className="spinner">
        Downloading, processing and transpiling latest infection data from{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/CSSEGISandData/COVID-19">
          https://github.com/CSSEGISandData/COVID-19
        </a>
      </span>
    )

  let markers
  switch (show) {
    case 'dead':
      markers = createMarkers(show, state, selectedDateIndex, maxValues, handleLocationSelect)
      break
    case 'recovered':
      markers = createMarkers(show, state, selectedDateIndex, maxValues, handleLocationSelect)
      break
    case 'confirmed':
      markers = createMarkers(show, state, selectedDateIndex, maxValues, handleLocationSelect)
      break
    case 'pies':
      markers = createPieMarkers(state.confirmed, selectedDateIndex, maxValues, handleLocationSelect, getTodaysData)
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
          <div id="controls" style={{ padding: '1em 0em' }}>
            <span>Select which cases to show: </span>
            <select onChange={(val) => setShow(val.target.value)}>
              <option value="pies">Pies</option>
              <option value="confirmed">Confirmed cases</option>
              <option value="dead">Dead cases</option>
              <option value="recovered">Recovered cases</option>
            </select>
            <button onClick={lockCountryForComparison}>Lock {activeLocation.countryOrRegion} for comparison</button>
            {lockedCountry && <button onClick={() => setLockedCountry(null)}>x</button>}
            <h1>Day: {translateDay(selectedDateIndex)}</h1>
            <button onClick={() => setAutoplay(!autoplay)}>{autoplay ? 'Stop autoplay' : 'Start autoplay'}</button>
            <Slider onChange={(val) => setSelectedDateIndex(val)} value={selectedDateIndex} min={0} max={state.confirmed[0].length - 5} />
          </div>
          <img alt="legend" src="./legend.png"></img>
          <CompareContainer selectedDateIndex={selectedDateIndex} activeLocation={activeLocation} lockedLocation={lockedCountry} dailyData={dailyData} />
        </div>
        <MyMap markers={markers} />
      </div>
      <span id="github-link">
        <a href="https://github.com/markokoskinen2037/corona-viz" rel="noopener noreferrer" target="_blank">
          sourcecode@github
        </a>
      </span>
    </div>
  )
}

export default App
