import React from 'react'

export default function ActiveDotDetails({ activeDot, selectedDateIndex }) {

    if (!activeDot) return null

    console.log(activeDot, selectedDateIndex)

    return (
        <div style={{ position: "fixed", bottom: 0, color: "yellow", backgroundColor: "black", fontSize: 50, left: 0 }}>
            <span>Confirmed: {activeDot[selectedDateIndex]}</span>
        </div>
    )
}
