/*
 * Adds the frequency filter (dropdownchecklist).
 */
plot2.prototype = new widget();
function plot2(target,title,mh,mg) {
    widget.call(this,mh,mg);
    this.target = target
	this.jqtarget =$("#"+this.target)

    var margin = {top: 10, right: 10, bottom: 60, left: 50},
        width = this.jqtarget.width() - 50,
        height = this.jqtarget.height() - 50;

    var svg = d3.select("#"+this.target).append("svg")
	.style("position","absolute")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
        .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
    var x = d3.scale.linear()
	.domain([-15,15])
	.range([ 0, width ]);
    
    var y = d3.scale.linear()
	.domain([0, 20])
	.range([ height, 0 ]);
    
	// x-axis
    var xAxis = d3.svg.axis()
	.scale(x)
	.orient('bottom');
	svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0," + height +")")
	.call(xAxis)
    .append("text")
	.attr("x", width/2)
    .attr("y",35)
	.style("text-anchor", "middle")
	.text("days from today");


    // y-axis
    var yAxis = d3.svg.axis()
	.scale(y)
	.orient('left');
    	svg.append('g')
	.attr('transform', 'translate(0,0)')
	.attr('class', 'main axis date')
	.call(yAxis)
	.append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("x", 0 -  height +35)
	    .attr("y", - 30)
	    .style("text-anchor", "top")
	    .text("Time observed (min)");     

	svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - margin.top + 60 )
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
	    .style("fill","gray")
            .text("Click on points on main plot");
	svg.append("text")
	    .attr("x", (width / 2))
	    .attr("y", 0 - margin.top + 75 )
	    .attr("text-anchor", "middle")
            .style("font-size", "14px")
	    .style("fill","gray")
            .text("to see specific pulsars");

}

plot2.prototype.redraw = 
    function(newname) {
    this.newname = newname;

    //Use random data for now
    var data = [];  
    var numDataPoints = 30; 
    var maxRange = Math.random() * 20;  // Max range of new values
    for(var i=0; i<numDataPoints; i++) {
	var newNumber1 = i-15;
	var newNumber2 = Math.floor(Math.random() * maxRange);  // New random integer
	data.push([newNumber1, newNumber2]);  // Add new number to array
    }

    var data2 = data.filter(function (d) {
	    return d[0] >= 0});

    var margin = {top: 10, right: 10, bottom: 60, left: 50},
        width = this.jqtarget.width() - 50,
        height = this.jqtarget.height() - 50;

    d3.select("#"+this.target).select("svg").remove();

    var svg = d3.select("#"+this.target).append("svg")
	.style("position","absolute")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
        .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
    var x = d3.scale.linear()
	.domain([-15,15])
	.range([ 0, width ]);
    
    var y = d3.scale.linear()
	.domain([0, d3.max(data, function(d) { return d[1]; })+1])
	.range([ height, 0 ]);
    
	// x-axis
    var xAxis = d3.svg.axis()
	.scale(x)
	.orient('bottom');
	svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0," + height +")")
	.call(xAxis)
    .append("text")
	.attr("x", width/2)
    .attr("y",35)
	.style("text-anchor", "middle")
	.text("days from today");


    // y-axis
    var yAxis = d3.svg.axis()
	.scale(y)
	.orient('left');
    	svg.append('g')
	.attr('transform', 'translate(0,0)')
	.attr('class', 'main axis date')
	.call(yAxis)
	.append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("x",0 - height -10)
	    .attr("y", -35)
	    .style("text-anchor", "top")
	    .text("Time observed (min)");     

    /*	svg.selectAll(".dot")
	    .data(data)
	    .enter().append("circle")
	    .attr("class", "dot")
	    .attr("r", 3)
	    .attr("cx", function (d,i) { return x(d[0]); } )
	    .attr("cy", function (d) { return y(d[1]); } )*/

    var line = d3.svg.line() 
    .x(function(d) { return x(d[0]); })
    .y(function(d) { return y(d[1]); });

        svg.append("path")
           .datum(data)
           .attr("fill", "none")
           .attr("stroke", "steelblue")
           .attr("stroke-linejoin", "round")
           .attr("stroke-linecap", "round")
           .attr("stroke-width", 1.5)
           .attr("d", line);

        svg.append("path")
           .datum(data2)
           .attr("fill", "none")
           .attr("stroke", "gray")
           .attr("stroke-linejoin", "round")
           .attr("stroke-linecap", "round")
           .attr("stroke-width", 1.5)
           .attr("d", line);


	svg.append("text")
	    .attr("x", (width / 2))             
	    .attr("y", 0 - margin.top + 15 )
	    .attr("text-anchor", "middle")  
            .attr('class','nametitle')
	    .style("font-size", "16px") 
	    .style("text-decoration", "underline")  
	    .text(this.newname);

    //	console.log("new name at the end is", this.newname);
    }

plot2.prototype.changePulsar = 
    function(name){
    var newname = name;
    console.log("Plot pulsar",newname);
    this.redraw(newname);
}

plot2.prototype.processEvent =
    function(group_name, event_name,data) {
    switch (event_name){
    case "pulsar.change":
        this.changePulsar(data);
        console.log("HI This is timeseries-plot-psr", data);
    break;
    default:
    break;
    }}