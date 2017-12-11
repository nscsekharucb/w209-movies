    var movieData = {}

        d3.tsv("hollywoodStories_consol.csv", function(data) {
            movieData = data.map(function(d) {
                return {
                    filmName : d.filmName,
                    rottenScore : Number(d.scoreRotten),
                    audienceScore : Number(d.scoreAudience),
                    openingWkndGross : +Math.round(d.openingWeekendGrossPerScreen * 100)/100,
                    domesticProfitability : +Math.round(d.domesticProfitability * 100)/100
                };
            });
            profitabilityPlot(movieData.slice(0,800));
            //rottenScorePlot(movieData.slice(0,800));

        });

    var profitabilityPlot = function(data) {
        // Set the dimensions of the canvas / graph
        var margin = {top: 20, right: 20, bottom: 70, left: 20};
        var width = 10000 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;

        var max = d3.max(data, function(d)
        {
            return d.rottenScore;
        })

        // Set the ranges
        var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

        var lineRotten = d3.line()
            .x(function(d) { return x(d.filmName); })
            .y(function(d) { return y(d.rottenScore); });

        var lineAudience = d3.line()
            .x(function(d) { return x(d.filmName); })
            .y(function(d) { return y(d.audienceScore); });

        x.domain(data.map(function(d) { return d.filmName; }));
        y.domain([0, d3.max(data, function(d) { return d.rottenScore; })]);

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

        g.append("path")
              .datum(data)
              .attr("fill", "none")
              .attr("stroke", "steelblue")
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-width", 1.5)
              .attr("d", lineRotten);

        g.append("path")
              .datum(data)
              .attr("fill", "none")
              .attr("stroke", "green")
              .attr("stroke-linejoin", "round")
              .attr("stroke-linecap", "round")
              .attr("stroke-width", 1.5)
              .attr("d", lineAudience);

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

    var rottenScorePlot = function(data) {
        // Set the dimensions of the canvas / graph
        var margin = {top: 20, right: 20, bottom: 70, left: 20};
        var width = 10000 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;

        var max = d3.max(data, function(d)
        {
            return d.domesticProfitability;
        })

        // Set the ranges
        var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

        x.domain(data.map(function(d) { return d.filmName; }));
        y.domain([0, d3.max(data, function(d) { return d.domesticProfitability; })]);

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
