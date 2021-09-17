 nodeFilter.prototype = new widget();
 function nodeFilter(target,mh,mg) {
	 widget.call(this,mh,mg);
	 this.target=target
	 this.node_mask = -1;

	 var svg= d3.select("#"+this.target)
	     .append("svg")
	     .attr("width",1300)
	     .attr("height",70);

	 //container for all buttons
	 var allButtons= svg.append("g")
	     .attr("id","allButtons") ;

	 var labels = [];
	 labels[0] = "ALL";
	 for (i = 1; i < 11; i++) {
             var name="psrtiming"+pad(i,2);
	     labels[i] = name;
	 }

	 //colors for different button states 
	 var defaultColor= "#6699CC"; //"#7777BB";
	 var hoverColor= "#2E5C8A"; //"#0000ff";
	 var pressedColor= "#000077";

	 //groups for each button (which will hold a rect and text)
	 var buttonGroups= allButtons.selectAll("g.button")
	     .data(labels)
	     .enter()
	     .append("g")
	     .attr("class","button")
	     .attr('id', function (i) {'d3-button' + i;})
	     .style("cursor","pointer")
	     .on("click", function (d,i) {
		     this.onchange(i-1);
		     console.log("Clicked on button", d,i, this.parentNode);
		     //		     updateButtonColors(d3.select("button").select()
		 }.bind(this))
	     .on("mouseover", function() {
		     if (d3.select(this).select("rect").attr("fill") != pressedColor) {
			 d3.select(this)
			 .select("rect")
			 .attr("fill",hoverColor);} })
	     .on("mouseout", function() {
		     if (d3.select(this).select("rect").attr("fill") != pressedColor) {
			 d3.select(this)
			 .select("rect")
			 .attr("fill",defaultColor);    } });
	     
	 var bWidth= [50,106,106,106,106,106,106,106,106,106,106]; //button width
	 var bHeight= 28; //button height
	 var bSpace= 7.5; //space between buttons
	 var x0= 0; //x offset
	 var y0= 5; //y offset

	 buttonGroups.append("rect")
	     .attr("class","buttonRect")
	     .attr("width", function(d,i) { return bWidth[i];})
	     .attr("height",bHeight)
	     .attr("x",function(d,i) { 
		     if (i ==0 ){return x0;}
                     else {return x0+(bWidth[0]+bSpace)+(bWidth[i]+bSpace)*(i-1);}})
	     .attr("y",y0)
	     .attr("rx",5) //rx and ry give the buttons rounded corners
	     .attr("ry",5)
	     .attr("fill",defaultColor)

	     buttonGroups.append("text")
	     .attr("class","buttonText")
	     .attr("x",function(d,i) {
		     if (i ==0 ){return x0 + bWidth[i]/2;}
		     else {return x0+(bWidth[0]+bSpace)+(bWidth[i]+bSpace)*(i-1) + bWidth[i]/2;}})
	     .attr("y",y0+bHeight/2)
	     .attr("text-anchor","middle")
	     .attr("dominant-baseline","central")
	     .attr("fill","white")
	     .text(function(d) {return d;});

	     function updateButtonColors(button, parent) {
	     parent.selectAll("rect")
		 .attr("fill",defaultColor)

		 button.select("rect")
		 .attr("fill",pressedColor)
		 }
 }


 nodeFilter.prototype.onchange = 
     function(value){
     this.fireEvent("nodeFilter.change", value);
     console.log("Hi two: THis is Cherry messing around.", value);
 }


/*	 var cp=$("<div/>")
	     .css({'cursor':'pointer','margin':0,
		   'float':'left','border':'0px solid black'})
	     .appendTo($("#"+this.target));
	 var ca=$("<input/>").attr({'type':'checkbox','id':-1})
	     .prop("checked",false)
	     cp.append(ca).append("<label for=-1> All </label>")

	     //$("<p/>").text("Node Mask:").css({'font-family':'sans-serif','font-size':'8pt','transform': 'rotate(-90deg)', 'transform-origin': 'left bottom 20','margin':'0px','float':'left','width':50}).appendTo(cp)

	     for (i = 0; i < 10; i++) {
	     var name="node "+pad(i,2);
	     var cb=$("<input/>").attr({'type':'radio','id':i, 'width':500})
	     .prop("checked",false)
	    cp.append(cb).append("<label for='"+i+"'>"+name+"</label>")
	    }

	cp.buttonset().css({'font-size':'12pt'})
            .change(function (event) {
		    for (i = 0; i < 10; i++) {
			if (i == event.target.id) {
			    $('#'+i).attr('checked','checked').prop('checked', true);
			    console.log("Clicked on i=",i,"property",$('#'+i).attr("checked"));
			}
			else {
			    $('#'+i).attr('checked',false).prop('checked', false);
			    console.log("Didnt clicked on i=",i,"property",$('#'+i).prop("checked"));
			    this.node_mask = i;
			}
		    }
		    //	this.node_mask[i] = 'false';}
		    //		    this.node_mask[event.target.id] = event.target.checked;

		    this.fireEvent("nodeFilter.change", event.target.id);
		    //		console.log("CHECK:", this.node_mask, event.target.id);
		}.bind(this));	
}

*/
function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}
