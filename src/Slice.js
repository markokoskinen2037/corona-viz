import React from 'react'
import * as d3 from "d3"
export const Slice = props => {

    let { pie } = props

    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(5)

    let interpolate = d3.interpolateRgb("#eaaf79", "#bc3358")

    return pie.map((slice, index) => {
        let slideColor = interpolate(index / (pie.length - 1))

        return <path key={slice + index} d={arc(slice)} fill={slideColor} />
    })
}
