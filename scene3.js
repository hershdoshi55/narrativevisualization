
const margin = { top: 50, right: 30, bottom: 70, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;


const svg = d3.select("#bar-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


d3.csv("energy.csv").then(data => {
    
    data.forEach(d => {
        d.CO2_emission = +d.CO2_emission;
        d.Year = +d.Year;
    });

    
    const filteredData = data.filter(d => d.Year === 2019 && d.Country !== "World");

    
    const top10 = filteredData.sort((a, b) => b.CO2_emission - a.CO2_emission).slice(0, 10);
    
    
    const x = d3.scaleBand()
        .domain(top10.map(d => d.Country))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(top10, d => d.CO2_emission)]).nice()
        .range([height, 0]);

    
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format(",.0f")));

    
    svg.selectAll(".bar")
        .data(top10)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.Country))
        .attr("y", d => y(d.CO2_emission))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.CO2_emission))
        .attr("fill", "steelblue");

    
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Country");

    
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("CO2 Emissions (Metric Tons)");

    
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    
    svg.selectAll(".bar")
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Country: ${d.Country}<br>CO2 Emissions: ${d.CO2_emission.toLocaleString()} metric tons`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));
});
