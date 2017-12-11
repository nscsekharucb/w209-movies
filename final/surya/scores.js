
// Add the svgProfit canvas
var svgScore = d3.select("body")
    .append("svg");

d3.tsv("./surya/hollywoodStories_consol.csv", function (data) {
    var slicelen = 947;
    var movieData = data.map(function (d) {
        return {
            filmName: d.filmName,
            rottenScore: Number(d.scoreRotten),
            audienceScore: Number(d.scoreAudience),
            domesticProfitability: +Math.round(d.domesticProfitability * 100) / 20
        };
    });

    profitabilityPlot(movieData.slice(0, slicelen), 0);
    //rottenScorePlot(movieData.slice(0,800));

    d3.selectAll(("input[name='scorefilter']")).on("change", function () {
        var modMovieData = movieData.slice(0);

        if (this.value === "reset") {
            modMovieData = movieData.slice(0);
        } else if (this.value === "profitability") {
            modMovieData = modMovieData.sort(function (a, b) { return b.domesticProfitability - a.domesticProfitability; })
        } else if (this.value === "tomatoes") {
            modMovieData = modMovieData.sort(function (a, b) { return b.rottenScore - a.rottenScore; })
        } else if (this.value === "audience") {
            modMovieData = modMovieData.sort(function (a, b) { return b.audienceScore - a.audienceScore; })
        }

        profitabilityPlot(modMovieData.slice(0, slicelen), 1);
    });

});

var profitabilityPlot = function (data, update) {
    // Set the dimensions of the canvas / graph
    var margin = { top: 20, right: 20, bottom: 70, left: 50 };
    var width = 10480 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var max = d3.max(data, function (d) {
        return d.rottenScore;
    })

    // Set the ranges
    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var lineRotten = d3.line()
        .x(function (d) { return x(d.filmName); })
        .y(function (d) { return y(d.rottenScore); });

    var lineAudience = d3.line()
        .x(function (d) { return x(d.filmName); })
        .y(function (d) { return y(d.audienceScore); });

    x.domain(data.map(function (d) { return d.filmName; }));
    y.domain([0, d3.max(data, function (d) { return d.rottenScore; })]);

    // Define the axes
    var xAxis = d3.axisBottom().scale(x);
    var yAxis = d3.axisLeft().scale(y);

    if (!update) {
        // Add the svg canvas
        svgScore.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var g = svgScore.append("g")
            .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 6)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");


        g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(10));

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("dy", "0.71em")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .style("text-anchor", "middle")
            .text("Profitability/Score");

        /*    g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .attr("y", 0)
                .attr("x", 6)
                .attr("dy", ".35em")
                .attr("transform", "rotate(90)")
                .style("text-anchor", "start");
        
        
            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y).ticks(10, "%"))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Opening Weekend Gross per screen");
        */
        g.append("path")
            .datum(data)
            .attr("class", "rotten")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", lineRotten);

        g.append("path")
            .datum(data)
            .attr("class", "audience")
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", lineAudience);

        g.selectAll("rect")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) {
                return x(d.filmName);
            })
            .attr("y", function (d) {
                return y(d.domesticProfitability);
            })
            .attr("fill", function (d) {
                if (d.domesticProfitability >= 50) {
                    return "green";
                } else if (d.domesticProfitability >= 10) {
                    return "orange";
                } else {
                    return "red";
                }
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return height - y(d.domesticProfitability);
            }).on("mouseover", function (d) {
                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = parseFloat(d3.select(this).attr("x")) + x.bandwidth() / 2;
                var yPosition = parseFloat(d3.select(this).attr("y")) + 14;

                //Update the tooltip position and value
                d3.select("#surya_tooltip1")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .select("#value")
                    .text("Film:" + d.filmName + "Rotten Score:" + d.rottenScore + "Audience Score:" + d.audienceScore);

                //Show the tooltip
                d3.select("#surya_tooltip1").classed("hidden", false);
            })
            .on("mouseout", function () {
                //Remove the tooltip
                d3.select("#surya_tooltip1").classed("hidden", true);
            });
    } else {
        svgScore.selectAll("rect")
            .data(data)
            .transition()
            .duration(1000)
            .delay(100)
            .attr("x", function (d) {
                return x(d.filmName);
            })
            .attr("y", function (d) {
                return y(d.domesticProfitability);
            })
            .attr("fill", function (d) {
                if (d.domesticProfitability >= 50) {
                    return "green";
                } else if (d.domesticProfitability >= 10) {
                    return "orange";
                } else {
                    return "red";
                }
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return height - y(d.domesticProfitability);
            });

        svgScore.select(".x.axis")
            .transition()
            .duration(1000)
            .call(xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 6)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

        svgScore.select(".rotten")
            .datum(data)
            .transition()
            .duration(1000)            
            .attr("d", lineRotten);

        svgScore.select(".audience")
            .datum(data)
            .transition()
            .duration(1000)            
            .attr("d", lineAudience);

    }
}

var rottenScorePlot = function (data) {
    // Set the dimensions of the canvas / graph
    var margin = { top: 20, right: 20, bottom: 70, left: 20 };
    var width = 10000 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var max = d3.max(data, function (d) {
        return d.domesticProfitability;
    })

    // Set the ranges
    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    x.domain(data.map(function (d) { return d.filmName; }));
    y.domain([0, d3.max(data, function (d) { return d.domesticProfitability; })]);

    // Define the axes
    var xAxis = d3.axisBottom().scale(x);
    var yAxis = d3.axisLeft().scale(y);

    // Add the svg canvas
    var svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var g = svg.append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 6)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");


    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "%"))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Opening Weekend Gross per screen");

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.filmName);
        })
        .attr("y", function (d) {
            return y(d.domesticProfitability);
        })
        .attr("color", "green")
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d.domesticProfitability);
        });

    debugger
}
