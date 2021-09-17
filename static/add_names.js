add_names.prototype = new widget();
function add_names(container, mh, wg){
    
    this.container=container
	this.jqcontainer=$("#"+this.container)

    this.draw(0);
    setInterval(this.draw.bind(this),5000);
}

add_names.prototype.draw =
    function(iter)  {
	if (iter==0){
	    //First box is the label
	    $('<div id="nails" align="center">').appendTo("#"+this.container)
	    $('<div/>')
		.css({
                    'cursor':'pointer',
                    'margin':0,
                    'width':50,
                    'height':50,
                    'float':'left',
                    'border':'0px solid black'
                })
	        .attr({'class':'labelpsr'})
		.appendTo("#"+this.container)
		.append($('<p/>').text('Last updated').css({'margin':'0px','font-size':'10pt', 'transform': 'rotate(-90deg)','float':'right', 'transform-origin': 'right top 0','margin-right': 40,'margin-top':10}))
	}
	    
	d3.csv("/static/Current10.csv"+'?' +(new Date()).getTime(), function(error, dataAll) {
	    
	    for (b=0; b<10;b++){
		if (document.getElementById("beam"+b) !== null) {
		    document.getElementById("beam"+b).remove();
		}
	    }
	    var current_time = new Date().getTime()/1000.;
//	    console.log("Time now", current_time);
	    dataAll.forEach(function(d) {
		var dt = current_time - d["Unix_utc_start"];
		$('<div/>')
		    .css({  'cursor':'pointer', 'margin':5,
			    'width':100, 'height':50,
			    'float':'left', 'border-width':'2px', 'border-style':'solid', 
			    'background':function(d) {if (dt>7200) {return "#FFF3F3";} else {return "#F4FFF3";};},
			    'border-color':function(d) {if (dt>7200) {return "red";} else {return "green";};} })
		    .attr({'id': d["beam"] })
		    .appendTo("#"+this.container)
		    .append($('<p/>').text(d["pulsarname"]).css({'margin':'5px','font-size':'11pt', 'text-align': 'center'}))
		    .append($('<p/>').text(d["lastupdate"]).css({'margin':'2px','font-size':'8pt', 'text-align': 'center' }))
//		console.log(d["pulsarname"]);
	    }.bind(this)); //close forEach function
	}.bind(this)); // close dataAll function	
    }

