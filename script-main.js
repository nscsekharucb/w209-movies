
// document.body.style.backgroundColor = "#f7f7f7";



// Dynamically get the bootstrap width of a div
var bb = document.querySelector ('#plot')
                    .getBoundingClientRect(),
       width = bb.right - bb.left;

// Set the margins
var margin = {top: 60, right: 100, bottom: 30, left: 80},
  // width = 850 - margin.left - margin.right,
  // height = 470 - margin.top - margin.bottom;
  // width = 800,
  height = 350;
  // height = 970 - margin.top - margin.bottom;



// Set the scalers
var x = d3.scaleLinear()
    // .domain([0, max()])
    .rangeRound([0, width - margin.left]);

var y = d3.scaleBand()
    .rangeRound([0, height - margin.bottom - margin.top])
    .paddingInner(0.2);


var barHeight = 20;

var plot = d3.select("#plot")
  .append("svg")
  .attr("class", "first-plot")
  .attr("width", width)
  .attr("height", height);
  // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // .attr("transform", "translate(" + 0 + "," + margin.top + ")");

// This is a subgroup that sits inside the svg above. Required so that the axes and other things don't clip.
g = plot.append("g")
  // .attr("width", width - margin.left - margin.right)
  // .attr("height", height - margin.top - margin.bottom)
  // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Import JSON data
d3.json("data/hollywoodStories_consol.json", function(error, data) {
  if (error) throw error;

  // Rollup domestic gross rev by year, all studios
  var rollup_data = d3.nest()
      .key(function(d) { return d.year;})
      .sortKeys(d3.descending)
      .rollup(function(d) {
          return d3.sum(d, function(g) { return g.domesticGrossAdj; });
      }).entries(data);


  // Scale the range of the data
  // x.domain(d3.extent(rollup_data, function(d) { return d.domesticGrossAdj; }))
  x.domain([0, d3.max(rollup_data, function(d) { return d.value; })]);
  y.domain(rollup_data.map(function(d) { return d.key; }));
  



  // Draw the bars.
  g.selectAll("rect")
    .data(rollup_data)
    .enter()
    .append("rect")
    .attr("x", margin.left)
    .attr("y", function(d) { return y(d.key) + margin.top; })
    // .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; })
    // .attr("transform", "translate(50, 0)")
    // .attr("transform", function(d, i) { return "translate(" + margin.left + "," + i * 115 + ")";})
    .attr("height", y.bandwidth())
    .attr("width", function(d) { return x(d.value); })
    // .attr("height", 20)
    .attr("fill", "#3A4B6A");

  //Add x-axis.
  g.append("g")
    .attr("class", "x-axis")
    .attr("x", margin.left)
    .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
    // .attr("transform", "translate(0,30)")
    .call(d3.axisBottom(x)
        .tickFormat(d3.format("$,.0s")));

  // Add the y-axis.
  g.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(d3.axisLeft(y));

  // g.append("g")
  //   .attr("class", "title")
  //   .text()

  //Create title 
  g.append("text")
    .attr("x", width / 2 )
    .attr("y", margin.top / 2 )
    .attr("class", "title")
    .style("text-anchor", "middle")
    .text("Total Domestic Gross Revenue by Year");
  // //define chart title to svg
  // let title = plot.append("g")
  //   .attr("class", "title");
  // title.append("text")
  //   .attr("x", (width/1.5))
  //     .attr("y", 40)
  //     .attr("text-anchor", "middle")
  //     .style("font", "20px sans-serif")
  //     .text("Percent of GDP Spent on Education, 2014");

  // //append source data to svg
  // let source = plot.append("g")
  //   .attr("class", "source");
  // source.append("text")
  //   .attr("x", 10)
  //   .attr("y", 500)
  //   .attr("text-anchor", "left")
  //   .style("font", "12px monospace")
  //   .text("Source: The World Bank");

  });