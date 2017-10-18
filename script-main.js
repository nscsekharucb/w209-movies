
// document.body.style.backgroundColor = "#f7f7f7";

// Set toggle flag as global
var labelVisible = true;

// Set the margins
var margin = {top: 60, right: 100, bottom: 30, left: 80},
  width = 850 - margin.left - margin.right,
  height = 470 - margin.top - margin.bottom;

// Parse the month variable
var parseMonth = d3.timeParse("%b");
var formatMonth = d3.timeFormat("%b");

// Set the scalers
var x = d3.scaleTime().domain([parseMonth("Jan"),parseMonth("Dec")]).range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the 1st line
var coffeeShopLine = d3.line()
    .x(function(d) { return x(d.Month); })
    .y(function(d) { return y(+d['Coffee Shop']); });

// define the 2nd line
var restaurantLine = d3.line()
    .x(function(d) { return x(d.Month); })
    .y(function(d) { return y(d.Restaurants); });

// Create the svg canvas
var svg = d3.select("#plot")
        .append("svg")
          .attr("class", "graph")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform","translate(" + margin.left + "," + margin.top + ")")
          .attr("class", "svg");

// Import the CSV data
d3.csv("food_transactions_2.csv", function(error, data) {
  if (error) throw error;

   // Format the data
  data.forEach(function(d) {
      d.Month = parseMonth(d.Month);
      d['Coffee Shop'] = +d['Coffee Shop'];
      d.Restaurants = +d.Restaurants;
  });

  // Mouseover handlers
  function mouseover(d) {
    var me = this;
    d3.selectAll(".line").classed("line--hover", function() {
      return (this === me);
    }).classed("line--fade", function() {
      return (this !== me);
    });
  }
  
  function mouseout(d) {
    d3.selectAll(".line")
      .classed("line--hover", false)
      .classed("line--fade", false);
  }
  
  // Button function
  // Toggles the counts on and off
  function toggleButton() {
    svg.append;
  }

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.Month; }));
  y.domain([0, d3.max(data, function(d) { return d.Restaurants; })]);

  // Debug prints
  // console.log("---------------")
  // console.log(d3.max(data, function(d) { return d.Restaurants; }))
  // console.log(data.map(function(item){return item.Restaurants}));

  // Debug prints
  // console.log("---------------------");
  // console.log(data.forEach(function(d) {console.log(d.Count);}));

  // Set up the x axis
  var xaxis = svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .attr("class", "x axis")
       .call(d3.axisBottom(x)
          .ticks(d3.timeMonth)
          .tickSize(0, 0)
          .tickFormat(d3.timeFormat("%B"))
          .tickSizeInner(6)
          .tickPadding(10));

  // Add the Y Axis
   var yaxis = svg.append("g")
       .attr("class", "y_axis")
       .call(d3.axisLeft(y)
          .ticks(5)
          .tickSizeInner(0)
          .tickPadding(6)
          .tickSize(0, 0));

  // Add a label to the y axis
  svg.append("text")
        .attr("class", "y_axis_label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 60)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1.1em")
        .style("text-anchor", "middle")
        .text("Count");

  // Add chart title
  svg.append("text")
        .attr("class", "title")
        .attr("y", -30)
        .attr("x", 0)
        .text("Restaurant and Coffee Shop Visits by Month")
        .attr("font-size", 28);



  // Add chart subtitle
  svg.append("text")
        .attr("class", "subtitle")
        .attr("y", -10)
        .attr("x", 0)
        .text("2013 — 2017")
        .attr("font-size", 18)
        .attr("font-style", "italic");

  // Add the restaurantLine path.
  svg.append("path")
      .data([data])
      .attr("class", "line")
      .style("stroke", "red")
      .attr("d", restaurantLine)
      .on("mouseover", mouseover)
      .on("mouseout", mouseout); 

  // Add the coffeeShopLine path.
  svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", coffeeShopLine)
      .on("mouseover", mouseover)
      .on("mouseout", mouseout); 

  // Helpful labels
  svg.append("text")
      .attr("transform", "translate("+(width+3)+","+y(data[0].Restaurants)+")")
      .attr("class", "restaurantLine")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "red")
      .style("font-family", "sans-serif")
      .text("Restaurants");

  svg.append("text")
      .attr("transform", "translate("+(width+3)+","+y(data[0]['Coffee Shop'])+")")
      .attr("class", "coffeeShopLine")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "steelblue")
      .style("font-family", "sans-serif")
      .text("Coffee Shops");

  // var label = svg.selectAll(".label")
  //     .data(function(d) { return }  )
  //     .attr("visibility", "hidden")
  //     .text()

  // Coffee shop line labels
  svg.append('g')
      // .classed('labels-group', true)
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr("id", "label-text")
      .attr("x", function(d) { return x(d.Month);})
      .attr("y", function(d) { return y(+d['Coffee Shop']) - 19;})
      .text(function(d, i) {
        return +d["Coffee Shop"];
      })
      .attr("font-family", "Archivo Narrow")
      .attr("font-weight", "bolder")
      .attr("font-size", "18px")
      .attr("fill", "#143966")
      .attr("visibility", "visible")
      ;

  // Restaurant line labels
  svg.append('g')
      // .classed('labels-group', true)
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr("id", "label-text")
      .attr("x", function(d) { return x(d.Month);})
      .attr("y", function(d) { return y(+d['Restaurants']) + 50;})
      .text(function(d, i) {
        return +d["Restaurants"];
      })
      .attr("font-family", "Archivo Narrow")
      .attr("font-weight", "bolder")
      .attr("font-size", "18px")
      .attr("fill", "red")
      .attr("visibility", "visible");

  // Add toggle button
  d3.select("#plot").append("button")
        .attr("type", "button")
        .attr("class", "btn btn-primary btn-lg")
        .text("Hide Counts")
        .on("click", function() {
          if (labelVisible) {labelVisible = false;
            d3.selectAll("#label-text").attr("visibility", "hidden");
            d3.selectAll(".btn").text("Show Counts");}
          else {labelVisible = true;
            d3.selectAll("#label-text").attr("visibility", "visible");
            d3.selectAll(".btn").text("Hide Counts");}
        });
})