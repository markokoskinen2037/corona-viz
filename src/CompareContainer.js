import React from 'react'
import ActiveDotDetails from './ActiveDotDetails'
import NewGraph from './NewGraph'

export default function CompareContainer({ selectedDateIndex, activeLocation, lockedLocation, dailyData }) {
  const getMax = (key) => {
    let [confirmedCases, deadCases, recoveredCases] = [0, 0, 0]

    const data = dailyData[key]
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

    return Math.max(confirmedCases, deadCases, recoveredCases)
  }

  let max = lockedLocation ? Math.max(getMax(activeLocation.key), getMax(lockedLocation.key)) : getMax(activeLocation.key)

  if (max === 0) max = 5 // Because graph looks weird, if yMax is set to 0.

  const bgColor = lockedLocation ? 'white' : '#000000dd'

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%', backgroundColor: bgColor }} className="lockedDetails">
        {lockedLocation && <ActiveDotDetails yMax={max} activeLocation={lockedLocation} selectedDateIndex={selectedDateIndex} dailyData={dailyData} />}
        {lockedLocation && <NewGraph yMax={max} dailyData={dailyData} activeLocation={lockedLocation} selectedDateIndex={selectedDateIndex} />}
        {!lockedLocation && <div style={{ color: 'white', position: 'relative', top: '50%', textAlign: 'center' }}>Lock a location to compare with</div>}
      </div>

      <div style={{ width: '50%' }} className="selectedDetails">
        <ActiveDotDetails yMax={max} activeLocation={activeLocation} selectedDateIndex={selectedDateIndex} dailyData={dailyData} />
        <NewGraph yMax={max} dailyData={dailyData} activeLocation={activeLocation} selectedDateIndex={selectedDateIndex} />
      </div>
    </div>
  )
}
