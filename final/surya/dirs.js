    var movieData = {}

    // Set the dimensions of the canvas / graph
    var margin = {top: 20, right: 20, bottom: 70, left: 50};
    var width = 10000 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
    
    // Add the svgProfit canvas
    var svgProfit = d3.select("body")
                      .append("svg");

    // Add the svgOpening canvas
    var svgOpening = d3.select("body")
                       .append("svg");

    // Set the ranges
    var xScaleProfit = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    yScaleProfit = d3.scaleLinear().rangeRound([height, 0]);


    // Define the axes
    var xAxisScaleProfit = d3.axisBottom().scale(xScaleProfit);
    var yAxisScaleProfit = d3.axisLeft().scale(yScaleProfit);

    // Set the ranges
    var xScaleOpening = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    yScaleOpening = d3.scaleLinear().rangeRound([height, 0]);


    // Define the axes
    var xAxisScaleOpening = d3.axisBottom().scale(xScaleOpening);
    var yAxisScaleOpening = d3.axisLeft().scale(yScaleOpening);

    var slicelen = 947;

    d3.tsv("./surya/hollywoodStories_consol.csv", function(data) {
        movieData = data.map(function(d) {
            return {
                filmName : d.filmName,
                dirNames : d.Director,
                actorNames : d['Lead Actor'],
                openingWkndGross : +Math.round(d.openingWeekendGrossPerScreen * 100)/100,
                domesticProfitability : +Math.round(d.domesticProfitability * 100)/100,
                domesticGross: +Math.round(d.domesticGrossAdj * 100)/100
            };
        });
        var update = 0;
        movieProfitBars(movieData.slice(0,slicelen), 0);
        movieOpeningBars(movieData.slice(0,slicelen), 0);

        d3.selectAll(("input[name='filter']")).on("change", function(){
            modMovieData = movieData.slice(0);

            if (this.value === "reset") {
                modMovieData = movieData.slice(0);
            } else if (this.value === "profitability") {
                modMovieData = modMovieData.sort(function(a, b) { return b.domesticProfitability - a.domesticProfitability; })
            } else {
                modMovieData = modMovieData.sort(function(a, b) { return b.openingWkndGross - a.openingWkndGross; })                
            }

            movieProfitBars(modMovieData.slice(0,slicelen), 1);
            movieOpeningBars(modMovieData.slice(0,slicelen), 1);
        });
});

    var movieProfitBars = function(data, update) {


        // toolTip
        xScaleProfit.domain(data.map(function(d) { return d.filmName; }));
        yScaleProfit.domain([0, d3.max(data, function(d) { return d.domesticProfitability; })]);

        if (!update) {

            svgProfit.attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);

            var g = svgProfit.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

            g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxisScaleProfit)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 6)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");


            g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScaleProfit).ticks(10))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Opening Weekend Gross per screen");

            g.selectAll("rect")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return xScaleProfit(d.filmName);
            })
            .attr("y", function (d) {
                return yScaleProfit(d.domesticProfitability);
            })
            .attr("fill", function (d) {
                if (d.domesticProfitability >= 5.0) {
                    return "green";
                } else if (d.domesticProfitability >= 1.0) {
                    return "orange";                    
                } else {
                    return "red";
                }
            })
            .attr("width", xScaleProfit.bandwidth())
            .attr("height", function (d) {
                return height - yScaleProfit(d.domesticProfitability);
            })
            .on("mouseover", function(d) {
					//Get this bar's x/y values, then augment for the tooltip
					var xPosition = parseFloat(d3.select(this).attr("x")) + xScaleProfit.bandwidth() / 2;
					var yPosition = parseFloat(d3.select(this).attr("y")) + 14;
                    
                    //Update the tooltip position and value
					d3.select("#surya_tooltip1")
						.style("left", xPosition + "px")
						.style("top", yPosition + "px")						
						.select("#value")
						.text("Director: " + d.dirNames + '\n' + "Film:" + d.filmName);
			   
					//Show the tooltip
					d3.select("#surya_tooltip1").classed("hidden", false);
             })
            .on("mouseout", function() {   
                //Remove the tooltip
                d3.select("#surya_tooltip1").classed("hidden", true);
		   });
        } else {

            svgProfit.selectAll("rect")
            .data(data)
            .transition()
            .attr("x", function (d) {
                return xScaleProfit(d.filmName);
            })
            .attr("y", function (d) {
                return yScaleProfit(d.domesticProfitability);
            })
            .attr("fill", function (d) {
                if (d.domesticProfitability >= 5.0) {
                    return "green";
                } else if (d.domesticProfitability >= 1.0) {
                    return "orange";                    
                } else {
                    return "red";
                }
            })
            .attr("width", xScaleProfit.bandwidth())
            .attr("height", function (d) {
                return height - yScaleProfit(d.domesticProfitability);
            });

            svgProfit.select(".x.axis")
            .transition()
            .call(xAxisScaleProfit)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 6)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");
        }

    }

    var movieOpeningBars = function(data, update) {

        xScaleOpening.domain(data.map(function(d) { return d.filmName; }));
        yScaleOpening.domain([0, d3.max(data, function(d) { return d.openingWkndGross; })]);

        if (!update) {

            svgOpening.attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);

            var g = svgOpening.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

            g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxisScaleOpening)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 6)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");


            g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScaleOpening))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Opening Weekend Gross per screen");

            g.selectAll("rect")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return xScaleOpening(d.filmName);
            })
            .attr("y", function (d) {
                return yScaleOpening(d.openingWkndGross);
            })
            .attr("fill", function (d) {
                if (d.openingWkndGross >= 60000) {
                    return "green";
                } else if (d.openingWkndGross >= 20000) {
                    return "orange";                    
                } else {
                    return "red";
                }
            })
            .attr("width", xScaleOpening.bandwidth())
            .attr("height", function (d) {
                return height - yScaleOpening(d.openingWkndGross);
            })
            .on("mouseover", function(d) {
					//Get this bar's x/y values, then augment for the tooltip
					var xPosition = parseFloat(d3.select(this).attr("x")) + xScaleProfit.bandwidth() / 2;
					var yPosition = parseFloat(d3.select(this).attr("y")) + 14;
                    
                    //Update the tooltip position and value
					d3.select("#surya_tooltip1")
						.style("left", xPosition + "px")
						.style("top", yPosition + "px")						
						.select("#value")
						.text("Director: " + d.dirNames + '\n' + "Film:" + d.filmName);
			   
					//Show the tooltip
					d3.select("#surya_tooltip1").classed("hidden", false);
             })
            .on("mouseout", function() {   
                //Remove the tooltip
                d3.select("#surya_tooltip1").classed("hidden", true);
		   });
        } else {

            svgOpening.selectAll("rect")
            .data(data)
            .transition()
            .attr("x", function (d) {
                return xScaleOpening(d.filmName);
            })
            .attr("y", function (d) {
                return yScaleOpening(d.openingWkndGross);
            })
            .attr("fill", function (d) {
                if (d.openingWkndGross >= 100000) {
                    return "green";
                } else if (d.openingWkndGross >= 20000) {
                    return "orange";                    
                } else {
                    return "red";
                }
            })
            .attr("width", xScaleOpening.bandwidth())
            .attr("height", function (d) {
                return height - yScaleOpening(d.openingWkndGross);
            });

            svgOpening.select(".x.axis")
            .transition()
            .call(xAxisScaleOpening)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 6)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");
        }

    }

