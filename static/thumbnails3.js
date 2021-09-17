function add_thumbnails3(container, mh, wg){
    this.container=container
	this.jqcontainer=$("#"+this.container)
    nails_list={
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

    keys=Object.keys(nails_list).sort()

    $('<div id="nails" align="center">').appendTo("#"+this.container)
	//console.log(nails_list);
    //console.log(keys.length);
	//    container=$("#nails").attr({'align':'center'})
	

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
	.append($('<p/>').text('Bandpass').css({'margin':'0px','font-size':'12pt', 'transform': 'rotate(-90deg)','float':'right', 'transform-origin': 'right top 0','margin-right': 20,'margin-top':10}))



    for (j=0; j<keys.length; j++){
	i=keys[j]
	na=nails_list[i]

		//nail_dir='chan_'+i+'/'
	    
	    $('<div/>')
	    .css({
		    'cursor':'pointer',
		    'margin':5,
		    'width':100,
		    'height':70,
		    'float':'left',
   		    'background':'black',
		    'border':'1px solid black'
		})
	    .appendTo("#"+this.container)
		
	    //.append($('<p/>').text(nails_list[i]).css({'margin':'3px','font-size':'14pt'}))
	    //$('<div/>').append($('<p/>').text("Ft").css({'margin':'5px','font-size':'12pt'}))
	    .append(
		    $('<img/>')
		    .attr('src','/static/Image/bp'+i+'.png')
                    //.attr('src',"{{url_for('static', filename='Image/bp'"+i+"'.png' }}")
		    .css({
			    'max-width':100,
			    'max-height':70,'margin-left':3
			    }))

	    .data({'nail':i})
	    .click(function(event){
		    window.open('/static/Image/bp'+$(this).data('nail')+'.png')})
	   
	//	console.log('bp'+i+'.png');
	    }
    
    //    $('<div style="clear:both"/>').appendTo("#"+this.container)
    //	$('<hr>').appendTo("#"+this.container)
	
	}
