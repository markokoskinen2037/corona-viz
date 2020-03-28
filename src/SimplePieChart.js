import React from 'react'
import * as d3 from "d3"
import { Slice } from './Slice';

export const SimplePieChart = () => {

    const height = 10;
    const width = 10;

    let pie = d3.pie()([4, 2, 5])

    return (
        <svg height={height} width={width}>
            <g transform={`translate(${width / 2}, ${height / 2})`}>
                <Slice pie={pie} />
            </g>

        </svg>
    )
}
