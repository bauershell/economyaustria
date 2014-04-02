/// <reference path="jquery-2.1.0.js" />
/// <reference path="d3.v3.js" />
/// <reference path="topojson.js" />


function oV() {

    var data = d3.json("/data/districts.json");

    var self = this;
    var w = 1000;
    var h = 600;
    var force, projection, path, svg, states;

    self.init = function () {

        //Define map projection
        projection = d3.geo.albers()
			.center([13.5, 47.7])
			.rotate([0, 0])
			.parallels([42, 49])
			.scale(10000)
			.translate([w / 2, h / 2]);

        path = d3.geo.path().projection(projection),
            force = d3.layout.force().size([w, h]);

        svg = d3.select("#map").append("svg:svg")
            .attr("id", "svg")
            .attr("width", w)
            .attr("height", h);

        // read info data
        d3.csv("/data/data.csv", function (csv) {
            data = csv;
        });

        d3.json("/data/oesterreich.json", function (json) {

            states = json;
            var nodes = [],
				links = [];

            states.features.forEach(function (d, i) {
                var centroid = path.centroid(d);
                centroid.x = centroid[0];
                centroid.y = centroid[1];
                centroid.feature = d;
                centroid.opendata = function () {
                    var result;
                    data.forEach(function (i) {
                        if (i.id === d.properties.iso)
                            result = i;
                    });
                    return result;
                };
                nodes.push(centroid);
            });

            d3.geom.delaunay(nodes).forEach(function (d) {
                links.push(self.edge(d[0], d[1]));
                links.push(self.edge(d[1], d[2]));
                links.push(self.edge(d[2], d[0]));
            });

            force
				.gravity(0)
				.nodes(nodes)
				.links(links)
				.linkDistance(function (d) { return d.distance; })
				.start();

            var node = svg.selectAll("g")
                .data(nodes)
                .enter().append("svg:g")
                .attr("transform", function (d) { return "translate(" + -d.x + "," + -d.y + ")"; })
                .attr("class", "state")
                .attr("id", function (d) {
                    return d.feature.properties.iso;
                })
                .call(force.drag)
                .append("svg:g")
                .attr("class", "statecontainer")

                .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
                .append("svg:path")
                .attr("d", function (d) { return path(d.feature); });

            d3.selectAll(".statecontainer")
                .append("svg:text")
                .attr("id", function (d) {
                    return "lbl_" + d.feature.properties.iso;
                })
                .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })

                .attr("class", "lbl");

            force.on("tick", function (e) {
                d3.selectAll(".statecontainer")

                .attr("transform", function (d) {
                    // console.log(d);
                    return "translate(" + d.x + "," + d.y + ")";
                });
            });

            self.go("BRP10");
        });
   };

    self.edge = function (a, b) {
        var dx = a[0] - b[0], dy = a[1] - b[1];
        return {
            source: a,
            target: b,
            distance: Math.sqrt(dx * dx + dy * dy)
        };
    }

    self.go = function (parameter) {

        var medi = d3.median(data, function (d) { return +d[parameter]; });
        var min = d3.min(data, function (d) { return +d[parameter]; });
        var max = d3.max(data, function (d) { return +d[parameter]; });

        colorScale = function (min, med, max) {
            return d3.scale.linear()
                .domain([min, med, max])
                .range(["white", "lightblue", "darkblue"]);
        };

        var cscale = colorScale(min, medi, max);

        d3.selectAll(".statecontainer path")
            .transition()
            .duration(2000)
            .style("fill", function (d) {
                return cscale(d.opendata()[parameter])
            });
        d3.selectAll(".statecontainer text")
            .transition()
            .duration(1000)
            .style("opacity", "0")
            .transition()
            .duration(1000)
            .style("opacity", "1")
            .text(function (d) {
                return d.opendata()[parameter];
            });

    };

}
