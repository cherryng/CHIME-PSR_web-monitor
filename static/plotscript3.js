function plot2(container, title, mh, wg){
    this.container=container
    this.jqcontainer=$("#"+this.container)
    this.margin = 10
	this.xaxis_height=50  //120
	this.yaxis_width=100   //100

    this.plot_size=[]
	this.plot_size[0]=this.jqcontainer.width() - this.yaxis_width - this.margin
	this.plot_size[1]=this.jqcontainer.height() - this.xaxis_height - this.margin
	$("<div/>").attr({'id':"y-axis_holder","class":"axis"})
	.css({"position":"absolute",
	      "height":this.plot_size[1]-this.margin,
	      "width":this.yaxis_width-this.margin})
	.appendTo(this.jqcontainer)

// setup x
	$("<div/>").attr({'id':"x-axis_holder","class":"axis"})
	.css({"position":"absolute",
	      "left":this.yaxis_width,
	      "top":this.plot_size[1]+this.margin,
	      "height":this.xaxis_height,
	      "width":this.plot_size[0]})
	.appendTo(this.jqcontainer)
	var time_scale = d3.scale.linear().range([0,this.plot_size[0]]).domain([0,24]);
    this.time_axisplot = d3.select("#x-axis_holder").append("svg")
        .style("position","absolute")
        .attr("width", this.plot_size[0] + 40)
        .append("g")
	.call(d3.svg.axis().scale(time_scale).orient("bottom"))
	.append("text")
	.attr("text-anchor","middle")
	.attr("font-size",20)
	.attr("x",this.plot_size[0]/2)
	.attr("y",50)
	.text("Time");

// setup y
    console.log(this.plot_size[1]);
    //    var yaxis_scale = d3.scale.linear().range([this.plot_size[1],0]).domain([0,24]);
    var yaxis_scale = d3.scale.linear().range([387,0]).domain([0,180]);
    this.yaxisplot=d3.select("#y-axis_holder").append("svg")
	.style("position", "absolute")
	.style("top",  this.margin-10)
	.attr("height", this.plot_size[1] + 18) // 18 for a bit of padding
	.append("g")
	.attr("transform", "translate(" + 100 + "," + 10 + ")")
	.call(d3.svg.axis().scale(yaxis_scale).orient("left"))

    this.yaxisplot.append("text")
	.attr("text-anchor", "middle")
	.attr("font-size", 20)
	.attr("y", -65)
	.attr("x", -this.plot_size[1] / 2)
	.attr("transform", "rotate(-90)")
	.text("");

// setup fill color
var cValue = function(d) { return d.Manufacturer;},
    color = d3.scale.category10();

// add the graph canvas to the body of the webpage
/*
var svg = d3.select("body").append("svg")
    .attr("width", this.plot_size[0] + 150)
    .attr("height", this.plot_size[1] + 150)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
*/

var svg=d3.select("#x-axis_holder").append("svg")
    .style("position","absolute")
    .attr("width", this.plot_size[0] + 150)
    .append("g")
    .call(d3.svg.axis().scale(time_scale).orient("bottom")
    .call(d3.svg.axis().scale(yaxis_scale).orient("left"))


// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.csv("Pulsar.csv", function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.utrise = +d.utrise;
    d.alt = +d.alt;
  });


  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", function(d) {return time_scale(d.utrise);})
      .attr("cy", function(d) {return yaxis_scale(d.alt);})
      .style("fill", function(d) { return color(cValue(d));}) 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["pulsar name"] + "<br/> (" + d["utrise"] 
		       + ", " + d["alt"] + ")")
	                 .style("left", (d3.event.pageX + 5) + "px")
	      .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
	  });

      });
  
}
