import React from 'react'
import { Marker } from 'react-simple-maps'
import { SimplePieChart } from './SimplePieChart'

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

const createMarkers = (type, state, selectedDateIndex, maxValues, handleLocationSelect) => {
  let color, keyPostFix
  switch (type) {
    case 'confirmed':
      color = 'yellow'
      keyPostFix = 'confirmed'
      break
    case 'recovered':
      color = 'yellow'
      keyPostFix = 'recovered'
      break
    case 'dead':
      color = 'gray'
      keyPostFix = 'dead'
      break
    default:
      break
  }

  const markers = state[type].map((row, i) => {
    const provinceOrState = row[0]
    const countryOrRegion = row[1]
    const lat = row[2]
    const long = row[3]
    const count = parseInt(row[selectedDateIndex])
    let size = calculateSize(count, false, maxValues[type])
    if (isNaN(lat) || isNaN(long) || isNaN(size) || count === 0) return null
    return (
      <Marker
        key={i + keyPostFix}
        onClick={() => handleLocationSelect(lat, long, provinceOrState, countryOrRegion)}
        coordinates={[long, lat]}
        style={{
          default: { fill: color, opacity: '75%' },
          hover: { fill: color },
          pressed: { fill: color },
        }}
      >
        <circle cx={0} cy={0} r={size} />
      </Marker>
    )
  })

  return markers
}

const createPieMarkers = (confirmed, selectedDateIndex, maxValues, handleLocationSelect, getTodaysData) => {
  const pieMarkers = confirmed.map((confirmed, i) => {
    const provinceOrState = confirmed[0]
    const countryOrRegion = confirmed[1]
    const lat = confirmed[2]
    const long = confirmed[3]
    const todaysData = getTodaysData(lat, long)

    const hasCases = Object.entries(todaysData).find((entry) => entry[1] !== 0)
    if (!hasCases) return null

    const size = calculateSize(todaysData, true, maxValues.recovered + maxValues.dead + maxValues.confirmed)

    return (
      <Marker onClick={() => handleLocationSelect(lat, long, provinceOrState, countryOrRegion)} key={i + 'pie'} coordinates={[long, lat]}>
        <g transform={`translate(-100,-100)`}>
          <SimplePieChart size={size} data={todaysData} />
        </g>
      </Marker>
    )
  })
  return pieMarkers
}

export { createMarkers, createPieMarkers }
