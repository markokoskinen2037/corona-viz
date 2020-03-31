import React from 'react'

export default function ActiveDotDetails({ activeLocationKey, selectedDateIndex, dailyData }) {


    const data = dailyData[activeLocationKey]

    let [confirmedCases, deadCases, recoveredCases] = [0, 0, 0]

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

    return (
        <>
            <h1>Detailed statistics:</h1>
            <div style={{ backgroundColor: "black", fontSize: 30 }}>
                <div style={{ color: "yellow" }}>Confirmed: {confirmedCases} </div>
                <div style={{ color: "green" }}>Recovered: {recoveredCases} </div>
                <div style={{ color: "gray" }} >Dead: {deadCases} </div>
            </div>
        </>
    )
}
