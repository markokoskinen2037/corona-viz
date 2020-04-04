import React, { useRef, useEffect, useState } from 'react'
import * as d3 from "d3"



export default function Graph({ dailyData, activeLocationKey }) {

    const svgRef = useRef();
    const [data, setData] = useState([25, 56, 72, 128, 200, 220])

    useEffect(() => {
        setData(dailyData[activeLocationKey].recovered)
    }, [activeLocationKey])

    useEffect(
        () => {
            const svg = d3.select(svgRef.current);


            const xScale = d3.scaleLinear()
                .domain([0, data.length - 1])
                .range([0, 300])

            const xAxis = d3.axisBottom(xScale)
                .tickFormat(index => index + 1)

            d3.select(".x-axis")
                .style("transform", "translateY(150px)")
                .call(xAxis)


            const yScale = d3.scaleLinear()
                .domain([0, 100000])
                .range([150, 0])

            const yAxis = d3.axisLeft(yScale)
            d3.selectAll(".y-axis")
                .call(yAxis)



            const myLine = d3.line()
                .x((value, index) => xScale(index))
                .y(yScale)
                .curve(d3.curveCardinal)

            svg
                .selectAll(".line")
                .data([data])
                .join("path")
                .attr("class", "line")
                .attr("d", myLine)
                .attr("fill", "none")
                .attr("stroke", "blue")



        }, [data])

    return (
        <>
            <svg style={{ marginLeft: "50px" }} overflow="visible" ref={svgRef}>
                <g className="x-axis" />
                <g className="y-axis" />
            </svg>
            <br></br>
        </>
    )
}
