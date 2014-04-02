/// <reference path="jquery-2.1.0.js" />
/// <reference path="d3.v3.js" />
/// <reference path="topojson.js" />


function oV () {

    var data = d3.json("/data/districts.json");

    var self = this;

    self.init = function () {
        var w = 1000;
        var h = 600;

        //Define map projection
        //var projection = d3.geo.mercator();
                               //.translate([-400, 900])
                               //.scale([100]);

        var projection = d3.geo.albers()
            .center([13.5, 47.7])
            .rotate([ 0, 0])
            .parallels([42, 49])
            .scale(10000)
            .translate([w / 2, h / 2]);

        //Define path generator
        var path = d3.geo.path()
                         .projection(projection);



        //Create SVG element
        var svg = d3.select("body")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h);

        var data = d3.json("/data/oesterreich.json", function(json) {
            //Bind data and create one path per GeoJSON feature
            svg.selectAll("path")
               .data(json.features)
               .enter()
               .append("path")
               .attr("d", path)
               //.attr("transform", "translate(" + -400 + "," + 900 + ")")
               .style("fill", "steelblue");

        });


    };


    

}
