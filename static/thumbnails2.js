add_thumbnails2.prototype = new widget();
function add_thumbnails2(container, mh, wg){
    this.container=container
	this.jqcontainer=$("#"+this.container)
    nails_list={
        '00':'Pulsar 0',
	'01':'01',
	'02':'02',
	'03':'J1546-4552',
	'04':'J1705-1908',
	'05':'Pulsar 5',
	'06':'Pulsar 6',
	'07':'07',
	'08':'Pulsar 8',
	'09':'Pulsar 9',
    }

    keys=Object.keys(nails_list).sort()

    $('<div id="nails" align="center">').appendTo("#"+this.container)

    //First box is the label
    $('<div/>')
	.css({
		'cursor':'pointer',
                    'margin':0,
                    'width':50,
                    'height':70,
                    'float':'left',
                    'border':'0px solid black'
		    })
	.appendTo("#"+this.container)
	.append($('<p/>').text('Time scrunched').css({'margin':'0px','font-size':'10pt', 'transform': 'rotate(-90deg)','float':'right', 'transform-origin': 'right top 0','margin-right': 40,'margin-top':10}))
    
        this.loadplot();
        setInterval(this.loadplot.bind(this),30000);


}

add_thumbnails2.prototype.loadplot = 
    function(){
	for (j=0; j<keys.length; j++){
            var elem = document.getElementById("PlotfT"+j);
	    var url = '/static/Image/thumb0'+j+'-fT.png?rnd='+Math.random();
	    if (elem != null) {
		elem.remove();
            }
	    i=keys[j]
	    na=nails_list[i]
	    $('<div/>')
	    .css({
		    'cursor':'pointer',
		    'margin':5,
		    'width':100,
		    'height':70,
		    'float':'left',
		    'background':'black',
		    'border':'2px solid black'
		})
            .attr({'id':'PlotfT'+j})
	    .appendTo("#"+this.container)
	    .append(
		    $('<img/>')
		    .attr('src', url)
		    .attr({'id':'PlotfTimag'+j})
		    .css({
			    'max-width':100,'max-height':70,'margin-left':0
			    }))

	    .data({'nail':j})
	    .click(function(event){
		window.open('/static/Image/thumb0'+$(this).data('nail')+'-fT.png')})
		//window.open('/static/Image/thumb0'+j+'-fT.png')})
	    }
	}
