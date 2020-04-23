import React, { useState, useEffect } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

export default function NewGraph({ dailyData, activeLocation, selectedDateIndex, yMax }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    setData(dailyData[activeLocation.key])
  }, [activeLocation.key, dailyData])

  useEffect(() => {
    if (!data) return

    const confirmedMax = Math.max(...data.confirmed)
    const deadMax = Math.max(...data.dead)
    const recoveredMax = Math.max(...data.recovered)
    const yMax = Math.max(...[confirmedMax, deadMax, recoveredMax])
    const days = data.recovered.length

    // Transpose the data:
    var lineData = data.confirmed.map((element, index) => {
      return {
        confirmed: element,
        dead: data.dead[index],
        recovered: data.recovered[index],
      }
    })
  }, [data])

  if (!data) return null

  const options = {
    chart: {
      type: 'area',
      height: 400,

      backgroundColor: null,
    },
    title: {
      text: null,
      // text: activeLocation.countryOrRegion,
    },
    yAxis: {
      categories: [''], // This removes values from left side (0)
      title: {
        text: null,
      },
      min: 0,
      max: yMax,
    },
    xAxis: {
      title: {
        text: 'Day index',
      },
    },
    series: [
      {
        data: data.confirmed.slice(0, selectedDateIndex),
        name: 'Confirmed',
        color: 'yellow',
      },
      {
        data: data.recovered.slice(0, selectedDateIndex),
        name: 'Recovered',
        color: 'green',
      },
      {
        data: data.dead.slice(0, selectedDateIndex),
        name: 'Dead',
        color: 'gray',
      },
    ],
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
  }

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}
