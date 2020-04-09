import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

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


    const options = {
        chart: {
            type: "bar",
            height: 250
        },
        legend: {
            align: 'top',
            verticalAlign: 'right',
            layout: 'vertical',
            x: 0,
            y: -15
        },
        title: {
            text: locationString
        },
        xAxis: {
            categories: [''], // This removes values from left side (0)
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Cases',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valueSuffix: ' percent',
            formatter: function () {
                switch (this.series.name) {
                    case "Confirmed":
                        return `${confirmedCases} confirmed (${confirmedPercentage}%)`
                    case "Dead":
                        return `${deadCases} dead (${deadPercentage}%)`
                    case "Recovered":
                        return `${recoveredCases} recovered (${recoveredPercentage}%)`
                    default:
                        return "Undefined"
                }
            }
        },
        series: [{
            data: [confirmedCases],
            color: "yellow",
            name: "Confirmed"
        },
        {
            data: [recoveredCases],
            color: "green",
            name: "Recovered"
        },
        {
            data: [deadCases],
            color: "gray",
            name: "Dead"
        }]
    }


    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
        />

    )
}
