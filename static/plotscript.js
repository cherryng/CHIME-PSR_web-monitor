plot1.prototype = new widget();
function plot1(container, title, mh, wg){
    widget.call(this,mh,wg);  //call messager to know if any updates
    this.container=container
	this.jqcontainer=$("#"+this.container)
    this.eventCallList=[];
    this.last_on_change_update = 0;
    this.time_parity = 0;
    this.node_mask = -1;
    this.plot_cate = 0; //or should it be -1
    this.DM1 = 0;
    this.DM2 = 1300;
    this.Flux1 = -1;
    this.Flux2 = 1300;

    this.margin = 10
    this.xaxis_height=50  //120
    this.yaxis_width=100   //100

    this.plot_size=[]
        this.plot_size[0]=this.jqcontainer.width() - this.yaxis_width - this.margin
        this.plot_size[1]=this.jqcontainer.height() - this.xaxis_height - this.margin

    var margin = {top: 20, right: 130, bottom: 80, left: 60},
        width = this.plot_size[0]-50,
	height = this.plot_size[1];
	//	console.log("Initial width", width, "height", height);

    var color = d3.scale.category10().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	//var color = d3.scale.category20();
    

// add the graph canvas to the body of the webpage
    var svg = d3.select("#"+this.container).append("svg")
	.style("position","absolute")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var xAxis = d3.svg.axis().tickValues([])    //original x-axis
	.scale(d3.scale.linear().range([0, width]))
    	.orient('bottom');
        svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(0," + height +")")
            .call(xAxis)
	    .append("text")
	    .attr("class", "label")
	    .attr("x", width/2)
	    .attr("y", 40)
	    .style("text-anchor", "middle")
	    .text("Unix_utc_time");
    var yAxis = d3.svg.axis().tickValues([])  //original y-axis
	.scale(d3.scale.linear().range([height, 0]))
	.orient('left');
        svg.append("g")
	    .attr('transform', 'translate(0,0)')
	    .attr("class", "axis")
	    .call(yAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 0 - margin.left)
	    .attr("x",0 - (height / 2))
	    .attr("dy", "1em")
	    .style("text-anchor", "middle")
	    .text("Declination (deg)");
    this.draw();
    setInterval(this.draw.bind(this),30000);
}

//"Draw" - although draw really happens in "Update"
plot1.prototype.draw =
    function()  {
    this.r=requestAnimationFrame(function(){
	this.updateplot();
    }.bind(this));
}

plot1.prototype.updateplot = 
    function() {
    var newpulsar = "00000";
    var width = this.plot_size[0] -50 ,
        height = this.plot_size[1];

	var color = d3.scale.category10().domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
//	console.log("color",color);
    var color2 = ["#4B87CB","#913EC8","#E19525","#A9C01E","black","black","black","#C0C1A8","black","#50CCAE"];
    color_list = {
	 'd':0, // for normal
	 'n':1, // for nanograv
	 'b':2, // for binary
	 'r':3, // for rrat
	 'm':4, // for magnetar
	 'g':6, // for GC
	 'u':8,  // undefined
	 'c':9, // candidates
    }
    color_list_rv = {
	 '0':'d', // for normal
	 '1':'n', // for nanograv
	 '2':'b', // for binary
	 '3':'r', // for rrat
	 '4':'m', // for magnetar
	 '6':'g', // for GC
	 '8':'u'  // undefined
    }

//    var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
//    var parseDate = d3.time.format("%H:%M:%S").parse;
    var parseDate = d3.time.format("%H:%M %p").parse;

    var yScale = d3.scale.linear().range([height, 0 ]);
    var yValue = function(d) { return d["dec"];};
    yMap = function(d) { return yScale(yValue(d));},
    yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(3);

  //  var xScale = d3.scale.linear().range([0, width]);
    var xScale = d3.time.scale().range([0, width]);
    //var xValue = function(d) { return d.Unix_utc_start;};
    var xValue = function(d) { return d.time;};
    xMap = function(d) { return xScale(xValue(d));};
    xAxis = d3.svg.axis().scale(xScale).orient("bottom")
//	.tickFormat(function(d) { return new Date(d.Unix_utc_start*1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); })
//	.tickFormat(function(d) { return d.dm;})
//	.tickFormat(new Date(d.Unix_utc_start*1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))
	    //.tickFormat(function(d) { return parseDate.parse(new Date(1544412240.47*1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})); })
	.tickFormat(d3.time.format("%b%d %H:%M"))
	.ticks(5)
	.tickSize(10);
//.ticks(5);
//	.tickFormat(d3.time.format("%H:%M")).ticks(5);

    var xMinorAxis = d3.svg.axis().scale(xScale)
    .ticks(d3.time.hours,1)
    .orient("bottom");

    var margin = {top: 20, right: 130, bottom: 80, left: 60};

    d3.select("#"+this.container).select("svg").remove();
    d3.select("#"+this.container).select("div").remove();

    var svg = d3.select("#"+this.container).append("svg")
        .style("position","absolute")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var ordinal = d3.scale.ordinal()
	.domain(["All", 'Normal', "NANOGrav", "Binary", "Cands","RRAT"])
	.range([ color2[7], color2[0], color2[1], color2[2], color2[9], color2[3] ]);
    var legend = svg.append("g")
	.attr("class", "legend");
	legend.append("rect")
	    .attr("stroke-width", 0.8)
	    .attr("x",  width + 4)
	    .attr("y", 10)
	    .attr("width", 100)
	    .attr("height", 125)
	    .attr("fill","white")
	    .attr("opacity",0.8)
	    .attr("stroke","black");
	legend.append("g")
	    .attr("class", "legendOrdinal")
	    .attr("transform", "translate(" + (width + 10) + ", 20)");
    var legendOrdinal = d3.legend.color()
        .shape("path", d3.svg.symbol().type("dot").size(50)())
	.shapePadding(10)
	.scale(ordinal)
	.on("cellclick", function (d) {
    	    this.legendClick(d);
    	}.bind(this));
    
    plot1.prototype.legendClick = 
	    function (passedInLegend) {
		this.fireEvent("cate_Select.change",passedInLegend);
	    }
    svg.select(".legendOrdinal")
	    .call(legendOrdinal);
	svg.append("text")
	    .attr("x", width-3)
	    .attr("y", 147 )
	    .attr("text-anchor", "left")
	    .style("font-size", "14px")
	    .style("fill","#C0C1A8")
//	    .text("Click on legend");
	svg.append("text")
	    .attr("x", width-3)
	    .attr("y", 159 )
	    .attr("text-anchor", "left")
	    .style("font-size", "14px")
	    .style("fill","gray")
//	    .text("to filter type");

    var type_now = color_list_rv[this.plot_cate];
    var node_now = this.node_mask;
    var DM1 = this.DM1;
    var DM2 = this.DM2;
    var Flux1 = this.Flux1;
    var Flux2 = this.Flux2;

    var tooltip = d3.select("#"+this.container).append("div")
	    .attr("class", "tooltip")
	    .style("opacity", 0);
    var formatDecimal = d3.format(".2f");
    var parseDate = d3.time.format("%m/%d, %H:%M");
    //Load all sky
      d3.csv("/static/Planned_Obs.csv"+'?' +(new Date()).getTime(), function(error, dataAll) {
	dataAll.forEach(function(d) {
	    d.Unix_utc_start = +d.Unix_utc_start;
	    //d.time = parseDate.parse(new Date(d.Unix_utc_start*1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
	    d.time = parseDate.parse(new Date(d.Unix_utc_start*1000).toLocaleTimeString([], {month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit', hour12:false}))
											
	    //console.log("Time", d.time);
	    d["dec"] = +d["dec"];
//	    console.log("TEST", new Date(d.Unix_utc_start*1000).toLocaleTimeString([], {month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit', hour12:false}));
	});
//	xScale.domain([d3.min(dataAll, xValue)-1, d3.max(dataAll, xValue)+1]);
        xScale.domain(d3.extent(dataAll, function(d) { return d.time; }));
//	console.log("Extent", d3.extent(dataAll, function(d) { return d.Unix_utc_start; }));
//	xScale.domain(d3.extent(dataAll, function(d) { return d.Unix_utc_start; }));
	yScale.domain([d3.min(dataAll, yValue)-1, d3.max(dataAll, yValue)+1]);
//	console.log("Dec", d3.min(dataAll, yValue)-1, d3.max(dataAll, yValue)+1);
	var xlim1 = d3.min(dataAll, xValue)-1;
	var xlim2 = d3.max(dataAll, xValue)-1;
	//console.log("limits,",xlim1, xlim2);
	// draw dots
	svg.selectAll(".dotall")
	    .data(dataAll)
	    .enter().append("circle")
//	    .filter(function(d) { return ( ((d["type"] == type_now) || (type_now >= 0)) && ( (d["dm"] > DM1) && (d["dm"] < DM2) ) && ( (d["flux600"] > Flux1) && (d["flux600"] < Flux2) ));}) //check this used to be <0
	    .on("mouseover", function(d) {
		tooltip.transition()
		    .duration(200)
		    .style("opacity", .9);
		tooltip.html(  d["psrname"] + "<br/> ("+
			       "Satus;"+d["status"]+" type:"+d["type"]+"<br/> "+
			       "DM="+formatDecimal(d["dm"])+"; S600="+d["flux600"]+" )")
		    .style("left", (d3.event.pageX -20 ) + "px")
		    .style("top", (d3.event.pageY - 70 ) + "px");})
	    .attr("class", "dotall")
	    .attr("r", 3)
	  //  .attr("cx", xMap)
	    .attr("cx", function(d) { return xScale(d.time); })
	    .attr("cy", yMap)
//	    .style("fill", "#C2C2C2")
	    .style("fill", function(d) {
		if (d["status"]<0) {
		    return "#C2C2C2";}
		else {
		    return color2[color_list[d["type"]]] ;};})


	//Load current 10
	d3.csv("/static/Current10.csv"+'?' +(new Date()).getTime(), function(error, data10) {
	//d3.csv("/static/Current10.csv"+'?' + csvext, function(error, data10) {
	    data10.forEach(function(d) {
		d.Unix_utc_start = +d.Unix_utc_start;
		d.time = parseDate.parse(new Date(d.Unix_utc_start*1000).toLocaleTimeString([], {month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit', hour12:false}))
		d["dec"] = +d["dec"]; 
		//console.log("TEST2", new Date(d.Unix_utc_start*1000).toLocaleTimeString([], {month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit', hour12:false}));
//		console.log("max", d3.max(xValue.map(d=>d.month)) );
		//console.log("d",d.Unix_utc_start);
	    });
            svg.append("line")
		.data(data10.filter(function(d) {return d.time < xlim2 && d.time > xlim1 ; } ))
		.attr("x1", function(d) {return xScale(d3.max(data10, xValue));})
		.attr("y1", 0)
		.attr("x2", function(d) {return xScale(d3.max(data10, xValue));})
		.attr("y2", height)
		.style("stroke-width", 2)
		.style("stroke", "black")
		.style("fill", "none");
//	    console.log("limits,",xlim1, xlim2);
	    // draw dots
            svg.selectAll(".dot10")
//		.data(data10.filter(function(d) {return d.Unix_utc_start < xlim2 && d.Unix_utc_start > xlim1 ; } ))
		.data(data10.filter(function(d) {return d.time < xlim2 && d.time > xlim1 ; } ))
		.enter().append("circle")
		.on("mouseover", function(d) {
                    tooltip.transition()
			.duration(200)
			.style("opacity", .9);
                    tooltip.html(  d["pulsarname"] + "<br/> ("+
				   "Observed by:"+d["beam"]+")")
			.style("left", (d3.event.pageX -20 ) + "px")
			.style("top", (d3.event.pageY - 70 ) + "px");})
		.attr("class", "dot10")
		.attr("r", 3)
//		.attr("cx", xMap)
		.attr("cx", function(d) { return xScale(d.time); })
		.attr("cy", yMap)
		.style("fill", "none" );
	}); //close read 10

	// x-axis
	svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(0," + height +")")
	    .call(xAxis)
	    .append("text")
	    .attr("class", "label")
	    .attr("x", width/2)
	    .attr("y", 40)
	    .style("text-anchor", "middle")
	    .text("ET time");
        svg.append("g")
	      .attr("class","xMinorAxis")
	      .attr("transform", "translate(0," + height + ")")
	      .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '1px'})
	      .call(xMinorAxis)
	      .selectAll("text").remove();
	// y-axis
	svg.append("g")
	    .attr("class", "axis")
	    .call(yAxis)
	    .append("text")
	    .attr("class", "label")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 0 - margin.left)
	    .attr("x",0 - (height / 2))
	    .attr("dy", "1em")
	    .style("text-anchor", "middle")
	    .text("Declination (deg)");


    });//close read planned_obs

} //close function draw


plot1.prototype.onclickpsr = 
    function(value){
    this.fireEvent("pulsar.change",value);
    //    console.log("Fire event", value);
}

plot1.prototype.changeCate =
    function(new_type){
    var cate_lookup = {'All':0, 'Normal':0, 'NotObs':7, 'NANOGrav':1, 'Binary':2, 'gc':6, 'RRAT':3, 'Magnetar':4} ;
    var cate_id = cate_lookup[new_type];
        this.plot_cate=cate_id
        console.log("Going to redraw with category of", this.plot_cate);
    this.draw();

}


plot1.prototype.changeNodes =
    function(node_mask){
        this.node_mask=node_mask;
//	console.log("In changeNode, this.node_mask is", this.node_mask);
	this.draw();
    }
plot1.prototype.changeDM =
    function(DMval){
        this.DM1=DMval[0];
        this.DM2=DMval[1];
    //console.log("In changeDM, this.DM1 is", this.DM1);
    this.draw();
    }
plot1.prototype.changeFlux =
    function(Fluxval){
        this.Flux1=Fluxval[0];
        this.Flux2=Fluxval[1];
    this.draw();
    }


plot1.prototype.processEvent =
    function(group_name, event_name,data) {
    //    console.log("THIS IS PROCESS EVENT", event_name)
    switch (event_name){
        case "cate_Select.change":
        this.changeCate(data);
        break;

        case "nodeFilter.change":
	    this.changeNodes(data);
//	    console.log("NODE CHANGED TO:", data);
        break;

        case "DMrange.change":
        this.changeDM(data);
//        console.log("Going to change DM range",data);
	    break;

        case "Flux.change":
        this.changeFlux(data);
//        console.log("Going to change Flux range",data);
        break;

    default:
	break;
    }
    //    console.log("After processEvent");
  }
