
// document.body.style.backgroundColor = "#f7f7f7";

var my_viz_lib = my_viz_lib || {};

my_viz_lib.barPlot = function() {

  // Dynamically get the bootstrap width of a div
  var bb = document.querySelector ('#plot')
      .getBoundingClientRect(),
      width = bb.right - bb.left;


  // Set the margins
  var margin = {top: 60, right: 100, bottom: 30, left: 150}, // 150 left margin is okay for distributor names
      height = 750;


  // Set the scalers
  var x = d3.scaleLinear()
    // .domain([0, max()])
    .rangeRound([0, width - margin.left]);

  var y = d3.scaleBand()
    .rangeRound([0, height - margin.bottom - margin.top])
    .paddingInner(0.2);

  var setYAxis = function(data)  {
    y = d3.scaleBand().rangeRound([0, height - margin.bottom - margin.top]).paddingInner(0.2)
      .domain(data.map(function(d) { return d.key; }))
  }

  var barHeight = 20;

  var plot = d3.select("#plot")
    .append("svg")
    .attr("class", "first-plot")
    .attr("width", width)
    .attr("height", height);

// May not need this
  // // This is a subgroup that sits inside the svg above. Required so that the axes and other things don't clip.
  // g = plot.append("g")


  // Generic data function
  var data = [];
  var data_ = function(_) {
    var that = this;
    if (!arguments.length) return data;
    data = _;
    return that;
  }

  // // Get unique list of distributors and create drop down options
  // d3.select("#drop1-studios").selectAll("option")
  //     .data(d3.map(data, function(d){return d.normalizedDistributor;}).keys().sort())
  //     .enter()
  //     .append("option")
  //     .text(function(d){return d;})
  //     .attr("value", function(d){return d;});

  var plot_ = function() {

  // Scale the range of the data
  x.domain([0, d3.max(data, function(d) { return d.value; })]);
  y.domain(data.map(function(d) { return d.key; }));

  bar = plot
    .selectAll("rect")
    .data(data)
    // .enter()
    // .append("rect")
    // .attr("x", margin.left)
    // .attr("y", function(d) { return y(d.key) + margin.top; })
    // .transition()
    // .attr("height", y.bandwidth())
    // // .attr("height", 50)
    // .attr("width", function(d) { return x(d.value); })
    // .attr("fill", "#3A4B6A");

  bar.enter().append("rect")
    .attr("x", margin.left)
    .attr("y", function(d) { return y(d.key) + margin.top; })
    .transition()
    .attr("height", y.bandwidth())
    // .attr("height", 50)
    .attr("width", function(d) { return x(d.value); })
    .attr("fill", "#3A4B6A");

  bar.exit().remove()

  //Add x-axis.
  var xAxis = d3.axisBottom(x);
  plot.append("g")
    .attr("class", "x-axis")
    .attr("x", margin.left)
    .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
    // .attr("transform", "translate(0,30)")
    .call(xAxis.tickFormat(d3.format("$,.0s")));

  // Add the y-axis.
  var yAxis = d3.axisLeft(y);
  plot.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(yAxis);

  //Create title 
  plot.append("text")
    .attr("x", width / 2 )
    .attr("y", margin.top / 2 )
    .attr("class", "title")
    .style("text-anchor", "middle")
    .text("Total Domestic Gross Revenue by Year");
    // .text(function(d) { if (year != "all_years") { return '"' + year + '"'}});

  };


  var public = {
    "plot": plot_,
    "data": data_,
    "setYAxis": setYAxis,
    // "loglog": setLogScale, //change
    // "highlight": highlight, //change
    // "unhighlight" : unhighlight //change
  };
  
  return public;

};



// Import JSON data
d3.json("data/hollywoodStories_consol.json", function(error, data) {
  if (error) throw error;

  // Get unique list of distributors and create drop down options
  d3.select("#drop1-studios").selectAll("option:not(#default)")
      .data(d3.map(data, function(d){return d.normalizedDistributor;}).keys().sort())
      .enter()
      .append("option")
      .text(function(d){return d;})
      .attr("value", function(d){return d;});

  // Get unique list of years and create drop down options
  d3.select("#drop1-year").selectAll("option:not(#default)")
      .data(d3.map(data, function(d){return d.year;}).keys().sort(function(a, b){return b-a})) // Descending sort
      .enter()
      .append("option")
      .text(function(d){return d;})
      .attr("value", function(d){return d;});

  // console.log(yearSelector)


  // Change plot based on year selected
  d3.select("#drop1-year").on("change", function(){
      var selectionYear = document.getElementById("drop1-year");
      var selectionStudio = document.getElementById("drop1-studios")
      // console.log(selection.value);
      if (selectionYear.value != "all_years" && selectionStudio.value == "all_studios") { // One year, all studios

        // filter data by year (selection.value)
        var filtered = data.filter(function(d) {
            return d.year == selectionYear.value;
        })

        // change data to rollup by distributor
        rollup_data = d3.nest()
          .key(function(d) { return d.normalizedDistributor;})
          .sortKeys(d3.ascending)
          .rollup(function(d) {
              return d3.sum(d, function(g) { return g.domesticGrossAdj; });
          }).entries(filtered); 


        // Sort by value descending
        rollup_data.sort(function(a, b) {
            return b["value"] - a["value"];
            });

        // Remap y-axis domain
        // console.log(y)
        // console.log(mainBarPlot.plot().y)
        // mainBarPlot.setYAxis(rollup_data);

        // var svg = d3.select(".first-plot");
        // // svg.selectAll("*").remove();
        // // svg.remove();
        d3.selectAll("rect").remove(); // this is a workaround that will kill other rects on the page
        d3.selectAll(".x-axis").remove();
        d3.selectAll(".y-axis").remove();
        d3.selectAll(".title").remove();
        mainBarPlot.data(rollup_data);
        mainBarPlot.plot();
        d3.select(".title").text(function() {return "Top Studio Domestic Gross Revenue for " + selectionYear.value})
      } else if (selectionYear.value != "all_years" && selectionStudio.value != "all_studios") { // One studio, one year
        // filter data by year (selection.value)
        var filtered = data.filter(function(d) {
            return d.year == selectionYear.value && d.normalizedDistributor == selectionStudio.value;
        })

        // change data to rollup by distributor
        rollup_data = d3.nest()
          .key(function(d) { return d.filmName;})
          .sortKeys(d3.ascending)
          .rollup(function(d) {
              return d3.sum(d, function(g) { return g.domesticGrossAdj; });
          }).entries(filtered); 


        // Sort by value descending
        rollup_data.sort(function(a, b) {
            return b["value"] - a["value"];
            });

        d3.selectAll("rect").remove();
        d3.selectAll(".x-axis").remove();
        d3.selectAll(".y-axis").remove();
        d3.selectAll(".title").remove();
        mainBarPlot.data(rollup_data);
        mainBarPlot.plot();
        d3.select(".title").text(function() {return selectionStudio.value + "'s Top Film Domestic Gross Revenue for " + selectionYear.value})
      } else if (selectionYear.value == "all_years" && selectionStudio.value != "all_studios") { // all years, one studio
        // filter data by year (selection.value)
        var filtered = data.filter(function(d) {
            return d.normalizedDistributor == selectionStudio.value;
        })

        // Rollup by year
        var rollup_data = d3.nest()
            .key(function(d) { return d.year;})
            // .key(function(d) { return d.normalizedDistributor;})
            .sortKeys(d3.descending)
            .rollup(function(d) {
                return d3.sum(d, function(g) { return g.domesticGrossAdj; });
            }).entries(filtered); 

        d3.selectAll("rect").remove(); // this is a workaround that will kill other rects on the page
        d3.selectAll(".x-axis").remove();
        d3.selectAll(".y-axis").remove();
        d3.selectAll(".title").remove();
        mainBarPlot.data(rollup_data);
        mainBarPlot.plot();
        d3.select(".title").text(function() {return selectionStudio.value + "Domestic Gross Revenue by Year"})
      } else {
        d3.selectAll("rect").remove(); // this is a workaround that will kill other rects on the page
        d3.selectAll(".x-axis").remove();
        d3.selectAll(".y-axis").remove();
        d3.selectAll(".title").remove();
        mainBarPlot.data(rollupDataYears);
        mainBarPlot.plot();
        d3.select(".title").text(function() {return "Total Domestic Gross Revenue by Year"})
      }

  });

  // Change plot based on studio selected
  d3.select("#drop1-studios").on("change", function(){
      var selectionYear = document.getElementById("drop1-year");
      var selectionStudio = document.getElementById("drop1-studios")
      if (selectionYear.value != "all_years" && selectionStudio.value == "all_studios") { // one year, all studios

        // filter data by year (selection.value)
        var filtered = data.filter(function(d) {
            return d.year == selectionYear.value;
        })

        // change data to rollup by distributor
        rollup_data = d3.nest()
          .key(function(d) { return d.normalizedDistributor;})
          .sortKeys(d3.ascending)
          .rollup(function(d) {
              return d3.sum(d, function(g) { return g.domesticGrossAdj; });
          }).entries(filtered); 


        // Sort by value descending
        rollup_data.sort(function(a, b) {
            return b["value"] - a["value"];
            });

        d3.selectAll("rect").remove(); // this is a workaround that will kill other rects on the page
        d3.selectAll(".x-axis").remove();
        d3.selectAll(".y-axis").remove();
        d3.selectAll(".title").remove();
        mainBarPlot.data(rollup_data);
        mainBarPlot.plot();
        d3.select(".title").text(function() {return "Top Studio Domestic Gross Revenue for " + selectionYear.value})
      } else if (selectionYear.value == "all_years" && selectionStudio.value != "all_studios") {  // One studio for all years
        // filter data by year (selection.value)
        var filtered = data.filter(function(d) {
            return d.normalizedDistributor == selectionStudio.value;
        })

        // Rollup by year
        var rollup_data = d3.nest()
            .key(function(d) { return d.year;})
            // .key(function(d) { return d.normalizedDistributor;})
            .sortKeys(d3.descending)
            .rollup(function(d) {
                return d3.sum(d, function(g) { return g.domesticGrossAdj; });
            }).entries(filtered); 

        d3.selectAll("rect").remove(); // this is a workaround that will kill other rects on the page
        d3.selectAll(".x-axis").remove();
        d3.selectAll(".y-axis").remove();
        d3.selectAll(".title").remove();
        mainBarPlot.data(rollup_data);
        mainBarPlot.plot();
        d3.select(".title").text(function() {return selectionStudio.value + "Domestic Gross Revenue by Year"})
        // change data to rollup by year
      } else if (selectionYear.value == "all_years" && selectionStudio.value == "all_studios") { // All studios, all years
        d3.selectAll("rect").remove(); // this is a workaround that will kill other rects on the page
        d3.selectAll(".x-axis").remove();
        d3.selectAll(".y-axis").remove();
        d3.selectAll(".title").remove();
        mainBarPlot.data(rollupDataYears);
        mainBarPlot.plot();
        d3.select(".title").text(function() {return "Total Domestic Gross Revenue by Year"})
      } else if (selectionYear.value != "all_years" && selectionStudio.value != "all_studios") { // One studio, one year
        // filter data by year (selection.value)
        var filtered = data.filter(function(d) {
            return d.year == selectionYear.value && d.normalizedDistributor == selectionStudio.value;
        })

        // change data to rollup by distributor
        rollup_data = d3.nest()
          .key(function(d) { return d.filmName;})
          .sortKeys(d3.ascending)
          .rollup(function(d) {
              return d3.sum(d, function(g) { return g.domesticGrossAdj; });
          }).entries(filtered); 


        // Sort by value descending
        rollup_data.sort(function(a, b) {
            return b["value"] - a["value"];
            });

        d3.selectAll("rect").remove();
        d3.selectAll(".x-axis").remove();
        d3.selectAll(".y-axis").remove();
        d3.selectAll(".title").remove();
        mainBarPlot.data(rollup_data);
        mainBarPlot.plot();
        d3.select(".title").text(function() {return selectionStudio.value + "'s Top Film Domestic Gross Revenue for " + selectionYear.value})
      } else if (selectionYear.value == "all_years" && selectionStudio.value != "all_studios") { // One studio, all years
        // filter data by year (selection.value)
        var filtered = data.filter(function(d) {
            return d.normalizedDistributor == selectionStudio.value;
        })

        // Rollup by year
        var rollup_data = d3.nest()
            .key(function(d) { return d.year;})
            // .key(function(d) { return d.normalizedDistributor;})
            .sortKeys(d3.descending)
            .rollup(function(d) {
                return d3.sum(d, function(g) { return g.domesticGrossAdj; });
            }).entries(filtered); 

        d3.selectAll("rect").remove(); // this is a workaround that will kill other rects on the page
        d3.selectAll(".x-axis").remove();
        d3.selectAll(".y-axis").remove();
        d3.selectAll(".title").remove();
        mainBarPlot.data(rollup_data);
        mainBarPlot.plot();
      }
  });

  // Rollup domestic gross rev by year, all studios
  var rollupDataYears = d3.nest()
      .key(function(d) { return d.year;})
      // .key(function(d) { return d.normalizedDistributor;})
      .sortKeys(d3.descending)
      .rollup(function(d) {
          return d3.sum(d, function(g) { return g.domesticGrossAdj; });
      }).entries(data); 

  // // Sorts array by value descending
  // rollup_data.sort(function(a, b) {
  //     return b["value"] - a["value"];
  //     });

  // Objects for dropdown 1 Years
  var elementsYears = Object.keys(data[0])
    .filter(function(d){
        return ((d != "filmName") & (d != "scoreRotten"));
    });
  var selection = elementsYears[0];


  mainBarPlot = my_viz_lib.barPlot();
  mainBarPlot.data(rollupDataYears);
  mainBarPlot.plot();



  });