import React from 'react'

export default function ActiveDotDetails({ activeLocation, selectedDateIndex, dailyData }) {
    const data = dailyData[activeLocation.key]

    let [confirmedCases, deadCases, recoveredCases] = [0, 0, 0]
    let [deadPercentage, confirmedPercentage, recoveredPercentage] = [0, 0, 0]
    let total = 0

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
        total = confirmedCases + deadCases + recoveredCases
    }

    if (total > 0) {
        confirmedPercentage = (confirmedCases / total * 100).toFixed(2)
        recoveredPercentage = (recoveredCases / total * 100).toFixed(2)
        deadPercentage = (deadCases / total * 100).toFixed(2)
    }

    const { provinceOrState, countryOrRegion } = activeLocation
    const locationString = provinceOrState ? provinceOrState + ", " + countryOrRegion : countryOrRegion

    return (
        <>
            <h1>{locationString}:</h1>
            <div className="activeDotDetails-container">
                <div style={{ color: "yellow" }}>Confirmed: {confirmedCases} ({confirmedPercentage}%)  </div>
                <div style={{ color: "green" }}>Recovered: {recoveredCases} ({recoveredPercentage}%)</div>
                <div style={{ color: "gray" }} >Dead: {deadCases} ({deadPercentage}%)</div>
            </div>
        </>
    )
}
