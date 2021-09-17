//diskspace.prototype = new JS_BRAMUS.jsProgressBar();
//diskspace.prototype = new initProgressBarHandler();
//diskspace.prototype = new widget();
function diskspace(container, mh, wg){
    this.container=container
	this.jqcontainer=$("#"+this.container)
    nodes_list={
	'01':'J0620-5857',
	'02':'J1406-4656',
	'03':'J1546-4552',
	'04':'J1705-1908',
	'05':'Pulsar 5',
        '06':'Pulsar 6',
        '07':'Pulsar 7',
	'08':'Pulsar 8',
	'09':'Pulsar 9',
	'10':'Pulsar 10',
    }

    keys=Object.keys(nodes_list).sort()

    $('<div id="nodes" align="center">').appendTo("#"+this.container)
	
    //First box is the label
    $('<div/>')
        .css({
                'cursor':'pointer',
                    'margin':0,
                    'width':50,
                    'height':50,
                    'float':'left',
                    'border':'0px solid black'
                    })
        .appendTo("#"+this.container)
        .append($('<p/>').text('Disk space').css({'margin':'0px','font-size':'13pt', 'transform': 'rotate(-90deg)','float':'center'}))
	//,'float':'left', 'transform-origin': 'right bottom 0'}))

    for (j=0; j<keys.length; j++){
	i=keys[j]
	na=nodes_list[i]
		//nail_dir='chan_'+i+'/'
	    
	    $('<div/>')
	    .css({
		    'cursor':'pointer',
		    'margin':7,
		    'width':100,
		    'height':50,
		    'float':'left',
		    //		    'border':'1px solid black'
		})
	.appendTo("#"+this.container)
		
	.append($('<p/>').text('Node '+i).css({'margin':'3px','font-size':'14pt'}))

	<div class="progress">
	<div class="progress-bar" role="progressbar" aria-valuenow="70"
	aria-valuemin="0" aria-valuemax="100" style="width:70%">
	70%
	</div>
	</div>
	.appendTo("#"+this.container)

	    // .append($('<p/>').text(ch).css({'margin':'5px','font-size':'12pt'}))
       	//.append('<span class="progressBar" id="myElementId">15%</span>');


	    }
    
    //    $('<div style="clear:both"/>').appendTo("#"+this.container)
    //	$('<hr>').appendTo("#"+this.container)
	
	}
