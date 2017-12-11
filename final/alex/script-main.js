//SVG setup
const margin = {top: 10, right: 30, bottom: 50, left: 70},
      width = 1060 - margin.left - margin.right,
      height = 680 - margin.top - margin.bottom;

// x scale
const x = d3.scaleLinear()
    .rangeRound([0, width])
    .domain([0, 100]);

// y scale
const yscale = d3.scaleLinear()
    .rangeRound([height, 0])
    .domain([0, 51]);

// profit color scale
// const colorScale = d3.scaleLinear().range(["red", "white", "green"]);
// const colorScale = d3.scaleLinear().range(["red", "white", "green", "yellow", "orange", "purple"]);
const colorScale = d3.scaleLinear().range(["red", "white", "#bff442", "#42f465"]);
// const colorScale = d3.interpolate(d3.interpolateRdYlGn);

//Define Y axis
var yAxis = d3.axisLeft(yscale)
              .ticks(5);

//set up svg
// const svg = d3.select("body")
// const svg = d3.select("#profit-chart-alex")
const svg = d3.select("#profit-chart-alex")
  .append("svg")
  // .attr("class", "alex-plot")
  .attr("id", "alex-plot")
  // .classed("alex-plot", true)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    // .attr("class", "alex-plot-group")
    .attr("id", "alex-plot-group")
    // .classed("alex-plot-group", true)
    .attr("transform",
            `translate(${margin.left}, ${margin.top})`);

//tooltip
// const tooltip = d3.select("body")
const tooltip = d3.select("#profit-chart-tooltipArea-alex")
  .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const t = d3.transition()
      .duration(750);

const dataFile = "data/hollywoodStories_consol_alex.csv"

// Dot scaler (larger value leads to smaller dots)
const dotScaler = 4;

//number of bins for histogram
const nbins = 50;

// Set initial Genre Displayed label
filterGenre = "All Genres"

// Mode flag
modeFlag = "review"

d3.csv(dataFile, function(error, allData) {
    allData.forEach(function(d) {
        d.filmName = d.filmName,
        d.scoreRotten = +d.scoreRotten,
        d.scoreAudience = +d.scoreAudience,
        d.domesticGrossAdj = +d.domesticGrossAdj,
        d.budgetAdj = +d.budgetAdj,
        d.domProfitability = +d.domesticProfitability,
        d.profitLossPercent  = +d.profitLossPercent
        d.audCriticDiff = +d.audCriticDiff,
        d.histBin = +d.histBin,
        d.domProfitDollars = +d.domProfitDollars,
        d.rankDollarProfit = +d.rankDollarProfit,
        d.audCriticRatio = +d.audCriticRatio,
        d.rankGenreDollarProfit = +d.rankGenreDollarProfit,
        d.rankPercentProfit = +d.rankPercentProfit,
        d.rankGenrePercentProfit = +d.rankGenrePercentProfit,
        d.sumReviewScoreNormalized = +d.sumReviewScoreNormalized;
    });

    data = allData; // Set allData to the entire csv file

    // Sort by genre so that histogram isn't so random
    data.sort(function(x, y) {
        return d3.ascending(x.genre, y.genre)
    });

    function update() {
      // Histogram binning
      histogram = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(nbins))
        .value(function(d) { return d.sumReviewScoreNormalized;} )

      // Binning data and filtering out empty bins
      const bins = histogram(data).filter(d => d.length>0)

      // Remove all existing group bins as keeping existing ones cause problems on enter/exit/remove
      svg.selectAll(".gBin").remove()

      // g container for each bin
      let binContainer = svg.selectAll(".gBin")
        .data(bins);

      // binContainer.exit().remove()

      // let binContainerEnter = binContainer.enter()
      binContainerEnter = binContainer.enter()
        .append("g")
          .attr("class", "gBin")
          .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

      // Need to populate the bin containers with data the first time
      binContainerEnter.selectAll("circle")
          .data(d => d.map((p, i) => {
            // console.log(p)
            // console.log(i)
            // console.log(d)
            return {idx: i,
                    filmName: p.filmName,
                    genre: p.genre,
                    sumReviewScoreNormalized: p.sumReviewScoreNormalized,
                    domProfitDollars: p.domProfitDollars,
                    domProfitPercent: p.profitLossPercent,
                    rankDollarProfit: p.rankDollarProfit,
                    leadActor: p["Lead Actor"],
                    director: p.Director,
                    audCriticRatio: p.audCriticRatio,
                    // radius: (x(d.x1)-x(d.x0))/2
                    radius: (x(d.x1)-x(d.x0))/dotScaler // Set radius of dots. Original was '2'
                  }
          }))
        .enter()
        .append("circle")
          .attr("class", function(d) {
              return "genre-" + d.genre; })
          .attr("cx", 0) // g element already at correct x pos
          .attr("cy", function(d) {
              return - d.idx * 2.5 * d.radius - d.radius; })  // Spacing of dots. Original value was '2'
          .attr("r", 0)
          .on("mouseover", tooltipOn)
          .on("mouseout", tooltipOff)
          .on("click", clickFilter)
          .transition()
            .duration(500)
            .attr("r", function(d) {
            return (d.length==0) ? 0 : d.radius; })

      binContainerEnter.merge(binContainer)
          .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

      ////////////////////////////////////////////////////////////////////////////
      // TEST to store the length of each bin to use in calculating average and median of displayed histogram
      // console.log("binContainer: ", binContainer._enter[0][1].__data__.length)

      // Enter/update/exit for circles, inside each container
      // let dots = binContainer.selectAll("circle")
      dots = binContainer.selectAll("circle")
          .data(d => d.map((p, i) => {
            console.log("dots enter")
            return {idx: i,
                    filmName: p.filmName,
                    genre: p.genre,
                    sumReviewScoreNormalized: p.sumReviewScoreNormalized,
                    leadActor: p["Lead Actor"],
                    director: p.Director,
                    audCriticRatio: p.audCriticRatio,
                    radius: (x(d.x1)-x(d.x0))/2
                  }
          }))
          .attr("class", function(d) {
            return "genre-" + d.genre; })

      //EXIT old elements not present in data
      dots.exit()
          // .attr("class", "exit")
        .transition(t)
          .attr("r", 0)
          .remove();

      // //UPDATE old elements present in new data.
      // dots.attr("class", "update");

      //ENTER new elements present in new data.
      dots.enter()
        .append("circle")
          // .attr("class", "enter")
          .attr("cx", 0) //g element already at correct x pos
          .attr("cy", function(d) {
            return - d.idx * 2 * d.radius - d.radius; })
          .attr("r", 0)
        .merge(dots)
          .on("mouseover", tooltipOn)
          .on("mouseout", tooltipOff)
          .transition()
            .duration(500)
            .attr("r", function(d) {
            return (d.length==0) ? 0 : d.radius; })


      // Summary stats for profitLossPercent because Paranormal Activity skews everything else
      // var profitLossPercentSTDDEV = d3.deviation(data, function(d) { return d.profitLossPercent})
      // console.log("profitLossPercent median: ", d3.median(data, function(d) { return d.profitLossPercent}))
      // console.log("profitLossPercent mean: ", d3.mean(data, function(d) { return d.profitLossPercent}))
      // console.log("profitLossPercent std dev: ", d3.deviation(data, function(d) { return d.profitLossPercent}))

      allFilmCount = allData.length
      currentFilmCount = data.length
      meanReviewScore = d3.mean(data, function(d) { return d.sumReviewScoreNormalized})
      audCriticRatio = d3.mean(data, function(d) { return d.audCriticRatio})
      meanProfitDollars = d3.mean(data, function(d) { return d.domProfitDollars})
      meanProfitPercent = d3.mean(data, function(d) { return d.profitLossPercent})
      medianProfitDollars = d3.median(data, function(d) { return d.domProfitDollars})
      medianProfitPercent = d3.median(data, function(d) { return d.profitLossPercent})


      // Compute the color scale domain
      colorScale.domain([d3.min(data, function(d) { return +d.domProfitDollars; }), 0, d3.max(data, function(d) { return +d.domProfitDollars; })]);
      // console.log(colorScale.domain()[0], colorScale.domain()[1], colorScale.domain()[2])

    summaryBuild();
    };//update


    function summaryBuild() {
      d3.select("#summaryBox").remove()
      // d3.select("#profit-chart-tooltipArea-alex")

      allFilmCount = allData.length
      currentFilmCount = data.length
      meanReviewScore = d3.mean(data, function(d) { return d.sumReviewScoreNormalized})
      audCriticRatio = d3.mean(data, function(d) { return d.audCriticRatio})
      meanProfitDollars = d3.mean(data, function(d) { return d.domProfitDollars})
      meanProfitPercent = d3.mean(data, function(d) { return d.profitLossPercent})
      medianProfitDollars = d3.median(data, function(d) { return d.domProfitDollars})
      medianProfitPercent = d3.median(data, function(d) { return d.profitLossPercent})

      var summaryBox = d3.select("#profit-chart-tooltipArea-alex")
        .append("div")
        .attr("id", "summaryBox")
        .attr("width", 100)
        .attr("height", 100)
        .attr("transform", "translate(500 , -1000)")
        .style("left", "0px")
        .style("top", "0px")

        // console.log("modeFlag: ",modeFlag)
      if (modeFlag == "review") {
        summaryBox
        .html("<p class='hist-film-name-tooltip'>"+ filterGenre + ": " + 
              "<br>" +
              "</p><p class='hist-film-genre-tooltip'>" + "</p>" +
              "Average Combined Review Score: <b style='font-size: 115%''>" + d3.format(",.2f")(meanReviewScore) + "</b><br>" +
              "Average Critic to Audience Ratio: <b style='font-size: 115%''>" + d3.format(",.2f")(audCriticRatio) + "</b><br>")
      } else if (modeFlag == "profDol") {
        summaryBox
        .html("<p class='hist-film-name-tooltip'>"+ filterGenre + ": " + 
              "<br>" +
              "</p><p class='hist-film-genre-tooltip'>" + "</p>" +
              "Average Dollar Profit: <b style='font-size: 115%''>" + d3.format("-$,.0f")(meanProfitDollars) + "</b><br>" +
              "Median Dollar Profit: <b style='font-size: 115%''>" + d3.format("-$,.0f")(medianProfitDollars) + "</b><br>")
      } else if (modeFlag == "profPerc") {
        summaryBox
        .html("<p class='hist-film-name-tooltip'>"+ filterGenre + ": " + 
              "<br>" +
              "</p><p class='hist-film-genre-tooltip'>" + "</p>" +
              "Average Return on Investment Percentage: <b style='font-size: 115%''>" + d3.format("-,.0%")(meanProfitPercent / 100) + "</b><br>" +
              "Median Return on Investment Percentage: <b style='font-size: 115%''>" + d3.format("-,.0%")(medianProfitPercent / 100) + "</b><br>")
      }
    };//summaryBuild

    function clickFilter(d) {
      filterGenre = d.genre;
      data = data.filter(function(d) {
        return d.genre == filterGenre;
      });
      d3.select("body").selectAll(".tooltip").style("opacity", 0); // Set all tooltips back to invisible
      update();
    }//clickFilter


    // Button to clear genre filters and reset data to original
    d3.select("#profit-chart-buttons").append("button")
        .attr("class", "btn btn-primary")
        .text("Show All Genres")
        .on("click", function(){
          // console.log("embedded button test")
          data = allData;
          modeFlag = "review"
          filterGenre = "All Genres"
          update();

          // Switch out legend
          d3.select("#profit-chart-alex-legend")
            .attr("src", "img/genreLegend.png")
        }); // Clear filters button

    // Button enable profit $ view
    // Redraws circles with existing data, creating genre-colored outlines on the dots,
    // and changing the dot fill color to reflect money made/lost.
    // d3.select("body").append("button")
    d3.select("#profit-chart-buttons").append("button")
        .attr("class", "btn btn-default")
        .text("Profit $")
        .on("click", profitDollars)
        // });

    // Button enable profit % view
    d3.select("#profit-chart-buttons").append("button")
        .attr("class", "btn btn-default")
        .text("ROI %")
        .on("click", profitPercent)

    // jQuery function for handling the dropdown selections
    $('div.btn-group ul.dropdown-menu li a').click(function (e) {
        var $div = $(this).parent().parent().parent(); 
        var $btn = $div.find('button');
        $btn.html($(this).text() + ' <span class="caret"></span>');
        $div.removeClass('open');
        
        filterGenre = $(this).text();

        if (filterGenre == "Show All Genres") {
          data = allData;
          modeFlag = "review"
          filterGenre = "All Genres"
          // console.log(filterGenre)
          // console.log(data)
          update();

          // Switch out legend
          d3.select("#profit-chart-alex-legend")
            .attr("src", "img/genreLegend.png")

          return false;
          } else {

        data = allData.filter(function(d) {
          return d.genre == filterGenre;
          })
          d3.select("body").selectAll(".tooltip").style("opacity", 0); // Set all tooltips back to invisible
          if (modeFlag == "review") {
            update();
          } else if (modeFlag == "profDol") {
            profitDollars();
          } else if (modeFlag == "profPerc") {
            profitPercent();
        };
        e.preventDefault();
        return false;};
    });
    

    function profitDollars(d) {
        // Update mode flag
        modeFlag = "profDol";
        summaryBuild();
        // console.log("profDol modeFlag", modeFlag)
        // Binning data and filtering out empty bins
        const bins = histogram(data).filter(d => d.length>0)

        // Remove all existing group bins as keeping existing ones cause problems on enter/exit/remove
        svg.selectAll(".gBin").remove()

        // g container for each bin
        let binContainer = svg.selectAll(".gBin")
          .data(bins);

        // binContainer.exit().remove()

        // let binContainerEnter = binContainer.enter()
        binContainerEnter = binContainer.enter()
          .append("g")
            .attr("class", "gBin")
            .attr("transform", d => `translate(${x(d.x0)}, ${height})`)
    
        // Compute the color scale domain
        colorScale.domain([d3.min(data, function(d) { return +d.domProfitDollars; }), 0, Math.min(d3.max(data, function(d) { return +d.domProfitDollars * .75; }), 25000000)]);

        // Need to populate the bin containers with data the first time
        binContainerEnter.selectAll("circle")
            .data(d => d.map((p, i) => {
              // console.log(p)
              // console.log(i)
              // console.log(d)
              return {idx: i,
                      filmName: p.filmName,
                      genre: p.genre,
                      sumReviewScoreNormalized: p.sumReviewScoreNormalized,
                      profitDollars: p.domProfitDollars,
                      domProfitPercent: p.profitLossPercent,
                      rankDollarProfit: p.rankDollarProfit,
                      domesticGrossAdj: p.domesticGrossAdj,
                      budgetAdj: p.budgetAdj,
                      leadActor: p["Lead Actor"],
                      director: p.Director,
                      rankGenreDollarProfit: p.rankGenreDollarProfit,
                      // radius: (x(d.x1)-x(d.x0))/2
                      radius: (x(d.x1)-x(d.x0))/dotScaler // Set radius of dots. Original was '2'
                    }
            }))
          .enter()
          .append("circle")
            .attr("class", function(d) {
                return "genre-" + d.genre; })
            .attr("cx", 0) // g element already at correct x pos
            .attr("cy", function(d) {
                return - d.idx * 2.5 * d.radius - d.radius; })  // Spacing of dots. Original value was '2'
            .attr("r", 0)
            // .style("fill", function(d) { return colorScale(+d.domProfitDollars); })
            .style("fill", function(d) { return colorScale(d.profitDollars); })
            // .style("fill", function(d) { return colorScale(1000000000); })
            .style("stroke", ({
                  "Action" : "#f28e2b",
                  "Comedy" : "#9c755f",
                  "Documentary" : "#76b7b2",
                  "Drama" : "#59a14f",
                  "Family" : "#edc948",
                  "Horror" : "#e15759",
                  "Musical" : "#b07aa1",
                  "Romance" : "#ff9da7",
                  "Thriller" : "#bab0ac"
                })[ function(d) { return d.genre;}])
            .style("stroke-width", "2px")
            .on("mouseover", tooltipOnProfitDollars)
            .on("mouseout", tooltipOff)
            .on("click", clickAndProfit)
            // .on("click", console.log(function(d) {return d.genre;}))
            .transition()
              .duration(500)
              .attr("r", function(d) {
              return (d.length==0) ? 0 : d.radius; })

        binContainerEnter.merge(binContainer)
            .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

        function clickAndProfit(d) {
            console.log(d);
            clickFilter(d);
            profitDollars(d);
        };

        // Switch out legend
        d3.select("#profit-chart-alex-legend")
          .attr("src", "img/profitLegend.png")
        
    }; // Profit $ view

    function profitPercent(d) {
        // Update mode flat
        modeFlag = "profPerc"
        summaryBuild();
        const bins = histogram(data).filter(d => d.length>0)
        svg.selectAll(".gBin").remove()
        let binContainer = svg.selectAll(".gBin")
          .data(bins);
        binContainerEnter = binContainer.enter()
          .append("g")
            .attr("class", "gBin")
            .attr("transform", d => `translate(${x(d.x0)}, ${height})`)
    
        // Compute the color scale domain
        colorScale.domain([d3.min(data, function(d) { return +d.profitLossPercent; }), 0, Math.min(d3.max(data, function(d) { return +d.profitLossPercent * .75; }), 300)]);

        // Need to populate the bin containers with data the first time
        binContainerEnter.selectAll("circle")
            .data(d => d.map((p, i) => {
              return {idx: i,
                      filmName: p.filmName,
                      genre: p.genre,
                      sumReviewScoreNormalized: p.sumReviewScoreNormalized,
                      profitDollars: p.domProfitDollars,
                      domProfitPercent: p.profitLossPercent,
                      rankDollarProfit: p.rankDollarProfit,
                      domesticGrossAdj: p.domesticGrossAdj,
                      budgetAdj: p.budgetAdj,
                      leadActor: p["Lead Actor"],
                      director: p.Director,
                      rankGenrePercentProfit: p.rankGenrePercentProfit,
                      rankPercentProfit: p.rankPercentProfit,
                      audCriticRatio: p.audCriticRatio,
                      // radius: (x(d.x1)-x(d.x0))/2
                      radius: (x(d.x1)-x(d.x0))/dotScaler // Set radius of dots. Original was '2'
                    }
            }))
          .enter()
          .append("circle")
            .attr("class", function(d) {
                return "genre-" + d.genre; })
            .attr("cx", 0) // g element already at correct x pos
            .attr("cy", function(d) {
                return - d.idx * 2.5 * d.radius - d.radius; })  // Spacing of dots. Original value was '2'
            .attr("r", 0)
            .style("fill", function(d) { return colorScale(d.domProfitPercent); })
            .style("stroke", ({
                  "Action" : "#f28e2b",
                  "Comedy" : "#9c755f",
                  "Documentary" : "#76b7b2",
                  "Drama" : "#59a14f",
                  "Family" : "#edc948",
                  "Horror" : "#e15759",
                  "Musical" : "#b07aa1",
                  "Romance" : "#ff9da7",
                  "Thriller" : "#bab0ac"
                })[ function(d) { return d.genre;}])
            .style("stroke-width", "2px")
            .on("mouseover", tooltipOnProfitPercent)
            .on("mouseout", tooltipOff)
            .on("click", clickAndProfit)
            .transition()
              .duration(500)
              .attr("r", function(d) {
              return (d.length==0) ? 0 : d.radius; })

        binContainerEnter.merge(binContainer)
            .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

        function clickAndProfit(d) {
            console.log(d);
            clickFilter(d);
            profitPercent(d);
        };

        // Switch out legend
        d3.select("#profit-chart-alex-legend")
          .attr("src", "img/profitLegend.png")

    }; // Profit % view

    // Summary box
    // const summaryBox = d3.select("alex-plot")
    //   .append("text")
    //   .text("hl;kjsdf;lfjdslk;fjs;ldfs")

    update() // Draw everything
});//d3.csv


function tooltipOn(d) {
  //x position of parent g element
  let gParent = d3.select(this.parentElement)
  let translateValue = gParent.attr("transform")
  let gX = translateValue.split(",")[0].split("(")[1]
  let gY = height + (+d3.select(this).attr("cy")-50)

  gX = 0;
  gY = height / 2 - 70;

  d3.select(this)
    .classed("selected", true)
  tooltip.style("background", ({
      "Action" : "#f28e2b",
      "Comedy" : "#9c755f",
      "Documentary" : "#76b7b2",
      "Drama" : "#59a14f",
      "Family" : "#edc948",
      "Horror" : "#e15759",
      "Musical" : "#b07aa1",
      "Romance" : "#ff9da7",
      "Thriller" : "#bab0ac"
  })[d.genre]); // Switch case to set the background color to match the genre's dot color.
  tooltip.transition()
       .duration(200)
       .style("opacity", .9);
  tooltip.html("<p class='hist-film-name-tooltip'>"+ d.filmName + "</p>" + 
    "<p class='hist-film-genre-tooltip'>" + d.genre + "</p><br>" +
    "<p class='hist-film-genre-tooltip' 'style=display: inline;'> Combined RT Review Score </p>" +
    "<p class='hist-film-profitDollars-tooltip' 'style=display: inline;'>" + d.sumReviewScoreNormalized + "</p>" + 
    "<p class='hist-film-genre-tooltip' 'style=display: inline;'> Critic to Audience Ratio </p>" +
    "<p class='hist-film-profitDollars-tooltip' 'style=display: inline;'>" + d3.format(".2f")(d.audCriticRatio) + "</p>" + 
    "Director: " + d.director + "<br>" +
    "Lead Actor: " + d.leadActor + "<br>"
    )
    .style("left", gX + "px")
    .style("top", gY + "px")
    ;
}//tooltipOn


function tooltipOnProfitDollars(d) {
  //x position of parent g element
  gX = 0;
  // gY = height / 2 - 150
  // gY = height / 2;
  gY = height / 2 - 70;

  if (filterGenre == "All Genres") { var rankMethod = d.rankDollarProfit;} else { var rankMethod = d.rankGenreDollarProfit;}
  // console.log(rankMethod)

  d3.select(this)
    .classed("selected", true)
  tooltip.style("background", ({
      "Action" : "#f28e2b",
      "Comedy" : "#9c755f",
      "Documentary" : "#76b7b2",
      "Drama" : "#59a14f",
      "Family" : "#edc948",
      "Horror" : "#e15759",
      "Musical" : "#b07aa1",
      "Romance" : "#ff9da7",
      "Thriller" : "#bab0ac"
  })[d.genre]); // Switch case to set the background color to match the genre's dot color.
  tooltip.transition()
       .duration(200)
       .style("opacity", .95);
  tooltip.html("<p class='hist-film-name-tooltip'>"+ d.filmName + "<br>" +
              "</p><p class='hist-film-genre-tooltip'>" + d.genre + "</p>" +
              "Director: " + d.director + "<br>" +
              "Lead Actor: " + d.leadActor + "<br>" +
              "</p> <div id='tooltipDiv'></div>" + 
              "<p class='hist-film-genre-tooltip' 'style=display: inline;'> Profit / (Loss) </p>" +
              "<p class='hist-film-profitDollars-tooltip' 'style=display: inline;'>" + d3.format("-$,.0f")(d.profitDollars) + 
              "</p><p class='hist-film-genre-tooltip' 'style=display: inline;'> Profit Ranking </p>" +
              "<p class='hist-film-profitDollars-tooltip' 'style=display: inline;'>" + rankMethod + " / " + currentFilmCount + "</p>" +
              "<p class='hist-profitDollars-subtitle-tooltip'> Budget: " + d3.format("-$,.0f")(d.budgetAdj) + "</p>"+ 
              "<p 'style=display: inline;' class='hist-profitDollars-subtitle-tooltip'> Gross Domestic Revenue: " + d3.format("-$,.0f")(d.domesticGrossAdj)

              )
  // <svg width='50' height='50'><circle cx='25' cy='25' r='15' style='fill:rgb(0,0,255);stroke-width:2;stroke:rgb(0,0,0)' /></svg> 
    .style("left", gX + "px")
    .style("top", gY + "px")
  // console.log("background: ", d.profitDollars)
  // console.log("new bg color: ", colorScale(d.profitDollars))

  profitScaler = d3.scaleLinear().range([0, tooltip._groups["0"]["0"].clientWidth - 20])
                                .domain([0, Math.max(d.domesticGrossAdj * 1.1, d.budgetAdj * 1.1)])
  // console.log("max: ", Math.max(d.domesticGrossAdj * 1.1, d.budgetAdj *1.1))
  // console.log("profit scale: ", profitScaler.domain()[0], profitScaler.domain()[1])
  // console.log("profit range: ", profitScaler.range()[0], profitScaler.range()[1])

  var tipSVG = d3.select("#tooltipDiv")
        .append("svg")
        .attr("width", tooltip._groups["0"]["0"].clientWidth - 20)
        .attr("height", 50);

      // Background bar
      tipSVG.append("rect")
        .attr("fill", "white")
        .attr("y", 10)
        .attr("width", 0)
        .attr("height", 30)
        .transition()
        .duration(250)
        // .attr("width", d.domesticGrossAdj * 6)
        .attr("width", tooltip._groups["0"]["0"].clientWidth - 20);

      // Revenue bar
      tipSVG.append("rect")
        .attr("fill", "gray")
        .attr("fill", function() {
            if(d.domesticGrossAdj >= d.budgetAdj) {
              return "green";
            } else {
              return "red";
            }
        })
        .attr("y", 20)
        .attr("width", 0)
        .attr("height", 10)
        .transition()
        .duration(500)
        // .attr("width", d.domesticGrossAdj * 6)
        .attr("width", profitScaler(d.domesticGrossAdj));

      // Budget line
      tipSVG.append("rect")
        .attr("fill", "gray")
        .attr("y", 10)
        .attr("width", 2)
        .attr("height", 30)
        .attr("x", profitScaler(d.budgetAdj));

      tipSVG.append("text")
        .text(d.domesticGrossAdj)
        .attr("x", 10)
        .attr("y", 30)
        .transition()
        .duration(1000)
        .attr("x", 6 + d.domesticGrossAdj * 6)

;}//tooltipOnProfitDollars

function tooltipOnProfitPercent(d) {
  //x position of parent g element
  gX = 0;
  // gY = height / 2 - 150
  // gY = height / 2;
  gY = height / 2 - 70;

  if (filterGenre == "All Genres") { var rankMethod = d.rankPercentProfit;} else { var rankMethod = d.rankGenrePercentProfit;}
  // console.log(rankMethod)
  // console.log(filterGenre)

  d3.select(this)
    .classed("selected", true)
  tooltip.style("background", ({
      "Action" : "#f28e2b",
      "Comedy" : "#9c755f",
      "Documentary" : "#76b7b2",
      "Drama" : "#59a14f",
      "Family" : "#edc948",
      "Horror" : "#e15759",
      "Musical" : "#b07aa1",
      "Romance" : "#ff9da7",
      "Thriller" : "#bab0ac"
  })[d.genre]); // Switch case to set the background color to match the genre's dot color.
  tooltip.transition()
       .duration(200)
       .style("opacity", .95);
  tooltip.html("<p class='hist-film-name-tooltip'>"+ d.filmName + "<br>" +
              "</p><p class='hist-film-genre-tooltip'>" + d.genre + "</p>" +
              "Director: " + d.director + "<br>" +
              "Lead Actor: " + d.leadActor + "<br>" +
              "</p> <div id='tooltipDiv'></div>" + 
              "<p class='hist-film-genre-tooltip' 'style=display: inline;'> Return on Investment Percentage </p>" +
              "<p class='hist-film-profitDollars-tooltip' 'style=display: inline;'>" + d3.format("-,.0%")(d.domProfitPercent / 100) + 
              "</p><p class='hist-film-genre-tooltip' 'style=display: inline;'> Profit Ranking </p>" +
              "<p class='hist-film-profitDollars-tooltip' 'style=display: inline;'>" + rankMethod + " / " + currentFilmCount +
              "<p class='hist-profitDollars-subtitle-tooltip'> Budget: " + d3.format("-$,.0f")(d.budgetAdj) + "</p>"+ 
              "<p 'style=display: inline;' class='hist-profitDollars-subtitle-tooltip'> Gross Domestic Revenue: " + d3.format("-$,.0f")(d.domesticGrossAdj)
              )
    .style("left", gX + "px")
    .style("top", gY + "px")
  // console.log("background: ", d.profitDollars)
  // console.log("new bg color: ", colorScale(d.profitDollars))

  profitScaler = d3.scaleLinear().range([0, tooltip._groups["0"]["0"].clientWidth - 20])
                                .domain([0, Math.max(d.domesticGrossAdj * 1.1, d.budgetAdj * 1.1)])
  // console.log("max: ", Math.max(d.domesticGrossAdj * 1.1, d.budgetAdj *1.1))
  // console.log("profit scale: ", profitScaler.domain()[0], profitScaler.domain()[1])
  // console.log("profit range: ", profitScaler.range()[0], profitScaler.range()[1])

  var tipSVG = d3.select("#tooltipDiv")
        .append("svg")
        .attr("width", tooltip._groups["0"]["0"].clientWidth - 20)
        .attr("height", 50);

      // Background bar
      tipSVG.append("rect")
        .attr("fill", "white")
        .attr("y", 10)
        .attr("width", 0)
        .attr("height", 30)
        .transition()
        .duration(250)
        // .attr("width", d.domesticGrossAdj * 6)
        .attr("width", tooltip._groups["0"]["0"].clientWidth - 20);

      // Revenue bar
      tipSVG.append("rect")
        .attr("fill", "gray")
        .attr("fill", function() {
            if(d.domesticGrossAdj >= d.budgetAdj) {
              return "green";
            } else {
              return "red";
            }
        })
        .attr("y", 20)
        .attr("width", 0)
        .attr("height", 10)
        .transition()
        .duration(500)
        // .attr("width", d.domesticGrossAdj * 6)
        .attr("width", profitScaler(d.domesticGrossAdj));

      // Budget line
      tipSVG.append("rect")
        .attr("fill", "gray")
        .attr("y", 10)
        .attr("width", 2)
        .attr("height", 30)
        .attr("x", profitScaler(d.budgetAdj));

      tipSVG.append("text")
        .text(d.domesticGrossAdj)
        .attr("x", 10)
        .attr("y", 30)
        .transition()
        .duration(1000)
        .attr("x", 6 + d.domesticGrossAdj * 6)

;}//tooltipOnProfitDollars

function tooltipOff(d) {
  d3.select(this)
      .classed("selected", false);
    tooltip.transition()
         .duration(500)
         .style("opacity", 0);
}//tooltipOff

// add x axis
svg.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + height + ")")
  .style("font-size", "125%")
  .call(d3.axisBottom(x));

// add y axis
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0 ,0)")
    .style("font-size", "110%")
    .call(yAxis);

// text label for the y axis
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "150%")
    .text("Count of Films");

// text label for the x axis
svg.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("y", height)
    .attr("y", height + (margin.bottom / 2))
    .attr("x", width / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "150%")
    .text("Combined RottenTomatoes.com Review Scores");

// d3.select("#alex-plot-group").append("text")
// // svg.append("text")
//     .attr("x", margin.left * 2)             
//     .attr("y", margin.top)
//     .attr("text-anchor", "middle")  
//     .style("font-size", "16px") 
//     .style("text-decoration", "underline")  
//     .text("Value vs Date Graph");