import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

export default function ActiveDotDetails({ yMax, activeLocation, selectedDateIndex, dailyData }) {
  const data = dailyData[activeLocation.key]
  let [confirmedCases, deadCases, recoveredCases] = [0, 0, 0]
  let [deadPercentage, confirmedPercentage, recoveredPercentage] = [0, 0, 0]
  let total = 0

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
    total = confirmedCases + deadCases + recoveredCases
  }

  if (total > 0) {
    confirmedPercentage = ((confirmedCases / total) * 100).toFixed(2)
    recoveredPercentage = ((recoveredCases / total) * 100).toFixed(2)
    deadPercentage = ((deadCases / total) * 100).toFixed(2)
  }

  const { provinceOrState, countryOrRegion } = activeLocation
  const locationString = provinceOrState ? provinceOrState + ', ' + countryOrRegion : countryOrRegion

  const options = {
    chart: {
      type: 'bar',
      spacingBottom: 3,
      spacingTop: 3,
      spacingLeft: 3,
      spacingRight: 3,

      // Explicitly tell the width and height of a chart
      height: 200,

      backgroundColor: null,
    },
    legend: {
      align: 'top',
      verticalAlign: 'right',
      layout: 'vertical',
      x: 0,
      y: 0,
      enabled: false,
    },
    title: {
      text: locationString,
    },
    xAxis: {
      categories: [''], // This removes values from left side (0)
      title: {
        text: null,
      },
    },
    yAxis: {
      min: 0,
      max: yMax,
      title: {
        text: 'Number of cases',
      },
      labels: {
        overflow: 'justify',
      },
    },
    tooltip: {
      valueSuffix: ' percent',
      formatter: function () {
        switch (this.series.name) {
          case 'Confirmed':
            return `${confirmedCases} confirmed (${confirmedPercentage}%)`
          case 'Dead':
            return `${deadCases} dead (${deadPercentage}%)`
          case 'Recovered':
            return `${recoveredCases} recovered (${recoveredPercentage}%)`
          default:
            return 'Undefined'
        }
      },
    },
    series: [
      {
        data: [confirmedCases],
        color: 'yellow',
        name: 'Confirmed',
        dataLabels: {
          enabled: true,
          inside: true,
        },
      },
      {
        data: [recoveredCases],
        color: 'green',
        name: 'Recovered',
        dataLabels: {
          enabled: true,
          inside: true,
        },
      },
      {
        data: [deadCases],
        color: 'gray',
        name: 'Dead',
        dataLabels: {
          enabled: true,
          inside: true,
        },
      },
    ],
    credits: {
      enabled: false,
    },
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
