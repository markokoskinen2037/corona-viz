import React, { useRef, useEffect, useState } from 'react'
import * as d3 from "d3"



export default function Graph({ dailyData, activeLocation }) {

    const svgRef = useRef();
    const [data, setData] = useState(null)

    useEffect(() => {
        setData(dailyData[activeLocation.key])
    }, [activeLocation.key])

    useEffect(
        () => {

            if (!data) return

            const svg = d3.select(svgRef.current);

            const confirmedMax = Math.max(...data.confirmed)
            const deadMax = Math.max(...data.dead)
            const recoveredMax = Math.max(...data.recovered)
            const yMax = Math.max(...[confirmedMax, deadMax, recoveredMax])
            const days = data.recovered.length


            // X-axis
            const xScale = d3.scaleLinear()
                .domain([0, days - 1])
                .range([0, 300])

            const xAxis = d3.axisBottom(xScale)
                .tickFormat(index => index)

            d3.select(".x-axis")
                .style("transform", "translateY(150px)")
                .call(xAxis)

            // Y-axis
            const yScale = d3.scaleLinear()
                .domain([0, yMax])
                .range([150, 0])

            const yAxis = d3.axisLeft(yScale)
            d3.selectAll(".y-axis")
                .call(yAxis)



            const deadLine = d3.line()
                .x((value, index) => xScale(index))
                .y((value) => yScale(value.dead))
                .curve(d3.curveCardinal)

            const confirmedLine = d3.line()
                .x((value, index) => xScale(index))
                .y((value) => yScale(value.confirmed))
                .curve(d3.curveCardinal)

            const recoveredLine = d3.line()
                .x((value, index) => xScale(index))
                .y((value) => yScale(value.recovered))
                .curve(d3.curveCardinal)


            // Transpose the data:
            var lineData = data.confirmed.map((element, index) => {
                return {
                    confirmed: element,
                    dead: data.dead[index],
                    recovered: data.recovered[index]
                }
            })


            // TODO: Would be more optimal to update instead of remove. Does not matter too much right now.
            d3.select(".dead-line").remove()
            d3.select(".recovered-line").remove()
            d3.select(".confirmed-line").remove()

            svg
                .append("path")
                .data([lineData])
                .attr("class", "dead-line")
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("stroke-width", "2px")
                .attr("d", deadLine)

            svg
                .append("path")
                .data([lineData])
                .attr("class", "confirmed-line")
                .attr("fill", "none")
                .attr("stroke", "yellow")
                .attr("stroke-width", "2px")
                .attr("d", confirmedLine)

            svg
                .append("path")
                .data([lineData])
                .attr("class", "recovered-line")
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-width", "2px")
                .attr("d", recoveredLine)



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
