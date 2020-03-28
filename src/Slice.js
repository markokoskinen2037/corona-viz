import React from 'react'
import * as d3 from "d3"
export const Slice = props => {

    let { pie, size } = props

    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(size)

    const colors = ["yellow", "green", "gray"]

    return pie.map((slice, index) => {

        return <path key={slice + index} d={arc(slice)} fill={colors[index]} />
    })
}
