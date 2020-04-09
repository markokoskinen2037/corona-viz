import React from 'react'
import * as d3 from "d3"
import { Slice } from './Slice';

export const SimplePieChart = ({ data, size }) => {

    const height = 200;
    const width = 200;

    const pieData = Object.entries(data).map(entry => entry[1])

    let pie = d3.pie()(pieData)

    return (
        <svg height={height} width={width} style={{ opacity: "75%" }}>
            <g transform={`translate(100,100)`}>
                <Slice size={size} pie={pie} />
            </g>

        </svg>
    )
}
