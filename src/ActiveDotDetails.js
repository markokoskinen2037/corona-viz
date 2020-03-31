import React from 'react'

export default function ActiveDotDetails({ activeDot, selectedDateIndex }) {

    if (!activeDot) return null

    console.log(activeDot, selectedDateIndex)

    return (
        <div style={{ position: "fixed", bottom: 0, backgroundColor: "black", fontSize: 50, left: 0 }}>
            <div style={{ color: "yellow" }}>Confirmed: {activeDot[0]}</div>
            <div style={{ color: "green" }}>Recovered: {activeDot[1]}</div>
            <div style={{ color: "gray" }} >Dead: {activeDot[2]}</div>
        </div>
    )
}
