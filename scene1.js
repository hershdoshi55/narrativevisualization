const margin = { top: 50, right: 30, bottom: 70, left: 80 },
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

const svg = d3
  .select("#line-chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("energy.csv").then((data) => {
  data.forEach((d) => {
    d.Year = new Date(d.Year, 0); 
    d.CO2_emission = +d.CO2_emission;
  });

  const countries = Array.from(new Set(data.map((d) => d.Country)));
  countries.unshift("Global");

  d3.select("#country-select")
    .selectAll("option")
    .data(countries)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.Year))
    .range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const line = d3
    .line()
    .x((d) => x(d.Year))
    .y((d) => y(d.CO2_emission));

  updateChart("Global");

  d3.select("#country-select").on("change", function () {
    updateChart(this.value);
  });

  function updateChart(country) {
    let filteredData;
    if (country === "Global") {
      filteredData = data;
    } else {
      filteredData = data.filter((d) => d.Country === country);
    }

    y.domain([0, d3.max(filteredData, (d) => d.CO2_emission)]);

    const path = svg.selectAll(".line").data([filteredData]);

    path
      .enter()
      .append("path")
      .attr("class", "line")
      .merge(path)
      .transition()
      .duration(750)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);

    svg.select(".x-axis").remove();
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"))); // Format tick labels as years

    svg.select(".x-axis-label").remove();
    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Year");

    svg.select(".y-axis").remove();
    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    svg.select(".y-axis-label").remove();
    svg
      .append("text")
      .attr("class", "y-axis-label")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("CO2 Emissions (Metric Tons)");

    addAnnotations(filteredData);
  }

  function addAnnotations(filteredData) {
    svg.selectAll(".annotation").remove();

    const maxDataPoint = d3.max(filteredData, (d) => d.CO2_emission);
    const maxData = filteredData.find((d) => d.CO2_emission === maxDataPoint);

    svg
      .append("text")
      .attr("x", x(maxData.Year) + 5)
      .attr("y", y(maxData.CO2_emission) - 10)
      .attr("class", "annotation")
      .text(`Max: ${maxData.CO2_emission.toFixed(2)} metric tons`)
      .style("font-size", "12px")
      .style("fill", "red");

    const recentIncrease = filteredData[filteredData.length - 1];
    svg
      .append("text")
      .attr("x", x(recentIncrease.Year) + 5)
      .attr("y", y(recentIncrease.CO2_emission) - 10)
      .attr("class", "annotation")
      .text(`Recent: ${recentIncrease.CO2_emission.toFixed(2)} metric tons`)
      .style("font-size", "12px")
      .style("fill", "green");
  }
});
