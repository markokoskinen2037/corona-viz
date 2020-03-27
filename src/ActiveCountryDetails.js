import React from 'react'

export default function ActiveCountryDetails({ activeCountry }) {

    if (!activeCountry) return null

    const { NAME, POP_EST, CONTINENT } = activeCountry

    return (
        <div style={{ position: "fixed", top: 0, right: 0 }}>
            <div>Name: {NAME}</div>
            <div>Polulation: {POP_EST}</div>
            <div>Continent: {CONTINENT}</div>

        </div>
    )
}
