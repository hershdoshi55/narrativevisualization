
const margin = { top: 50, right: 30, bottom: 100, left: 60 },
  width = 1000 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;


const svg = d3
  .select("#bar-chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);


const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


d3.csv("energy.csv").then((data) => {
 
  const countries = Array.from(new Set(data.map((d) => d.Country)));
  const years = [2000, 2005, 2010, 2015, 2019];

 
  d3.select("#country-select1")
    .selectAll("option")
    .data(countries)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d);

  d3.select("#country-select2")
    .selectAll("option")
    .data(countries)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d);

  
  let selectedCountries = [countries[0], countries[1]];

  
  function updateChart() {
    const filteredData = data.filter(
      (d) => selectedCountries.includes(d.Country) && years.includes(+d.Year)
    );

    
    const x0 = d3
      .scaleBand()
      .domain(selectedCountries)
      .range([0, width])
      .padding(0.1);

    const x1 = d3
      .scaleBand()
      .domain(years)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => +d.CO2_emission)])
      .nice()
      .range([height, 0]);

    
    const colors = ["#1f77b4", "#2ca02c", "#ff7f0e", "#d62728", "#9467bd"];

    
    svg.selectAll(".bar-group").remove();
    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();

   
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0).tickSize(0))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

   
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Country");

   
    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

   
    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("CO2 Emissions (Metric Tons)");

   
    const bars = svg
      .selectAll(".bar-group")
      .data(filteredData)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", (d) => `translate(${x0(d.Country)},0)`);

    bars
      .selectAll("rect")
      .data((d) =>
        years.map((year) => {
          const emission =
            +data.find(
              (item) => item.Country === d.Country && +item.Year === year
            )?.CO2_emission || 0;
          return { key: year, value: emission, Country: d.Country, Year: year };
        })
      )
      .enter()
      .append("rect")
      .attr("x", (d) => x1(d.key))
      .attr("y", (d) => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => height - y(d.value))
      .attr("fill", (d, i) => colors[i % colors.length]) 
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Country: ${d.Country}<br>Year: ${
              d.Year
            }<br>CO2 Emissions: ${d.value.toFixed(2)} metric tons`
          )
          .style("left", event.pageX + 5 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () =>
        tooltip.transition().duration(500).style("opacity", 0)
      );

   
    const legend = svg
      .selectAll(".legend")
      .data(years)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend
      .append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d, i) => colors[i]);

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text((d) => d);
  }


  updateChart();

 
  d3.select("#country-select1").on("change", function () {
    selectedCountries[0] = this.value;
    updateChart();
  });

  d3.select("#country-select2").on("change", function () {
    selectedCountries[1] = this.value;
    updateChart();
  });
});
