copyright.prototype = new widget();
function copyright(container,mh,mg)
    {
        widget.call(this,mh,mg);
    	$("#"+container)
	    	.css({'font-size':'12px',
	              'float':'left',
	              'font-family':'sans-serif',
	            })
		    .append($('<p/>')
		    	.css({'margin':5})
		        .text("Bug report? Feature request? Don't email! Post to the ")
			    .append($('<a/>')
			    	.text("BitBucket Issue Page!")
			    	.attr('href','https://bitbucket.org/chime/ch_www/issues?status=new&status=open')
			    	)
			    )
		    .append($('<p/>'))
/*
		    	.css({'margin':5})
		        .text("Seriously. Don't email, go ")
			    .append($('<a/>')
			    	.text("post")
			    	.attr('href','https://bitbucket.org/chime/ch_www/issues?status=new&status=open')
			    	)
		    	.append($('<a/>').text(" it."))
			    )
*/
	}
