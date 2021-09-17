channelID.prototype = new widget();
function channelID(container, title,mh,mg)
    {
        widget.call(this,mh,mg);
    	$("#"+container)
		    .append($('<p/>')
		        .text(title)
		        .css({'font-size':'28px',
		              'float':'left',
		              'font-family':'sans-serif',
		              'margin':'0px 4px 4px 4px',
		            }))
	}
