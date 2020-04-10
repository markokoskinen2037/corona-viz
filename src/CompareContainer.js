import React from 'react'
import ActiveDotDetails from './ActiveDotDetails'

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

  const max = lockedLocation ? Math.max(getMax(activeLocation.key), getMax(lockedLocation.key)) : getMax(activeLocation.key)

  return (
    <div>
      {lockedLocation && <ActiveDotDetails yMax={max} activeLocation={lockedLocation} selectedDateIndex={selectedDateIndex} dailyData={dailyData} />}
      <ActiveDotDetails yMax={max} activeLocation={activeLocation} selectedDateIndex={selectedDateIndex} dailyData={dailyData} />
    </div>
  )
}
