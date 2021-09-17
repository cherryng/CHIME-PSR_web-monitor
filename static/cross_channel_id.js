/*
 * Adds the status header.
 */
crossChannelID.prototype = new widget();
function crossChannelID(target, title, a,b, mh, mg)
    {
        widget.call(this,mh,mg);
        this.title=title
        this.a = a
        this.b = b
        this.n = 256
        var header = $('<div/>').css({'margin':10})
                .appendTo($('#'+target))
                .append($('<p/>')
                    .text(this.title+' - ')
                    .css({'font-size':'32px',
                          'float':'left',
                          'font-family':'sans-serif',
                          'margin':'0px',
                        }))

        var a_sel=$("<select/>").appendTo(header)
        for (i=0; i<this.n; i++){a_sel.append("<option>"+i+"</option>")}
        a_sel.val(this.a)
        var am=a_sel.selectmenu({
            change: function(event, data){
                        this.a = data.item.index
                        this.onchange(this.a,this.b)
                    }.bind(this),
            width: 100}
        )
        am.selectmenu('menuWidget').css({'height':400})
        am.selectmenu('widget').css({'margin-left':20,'margin-top':-2,'float':'left'})

        $('<p/>').text('x').appendTo(header)
            .css({'font-size':'32px',
                          'float':'left',
                          'font-family':'sans-serif',
                          'margin':'0px 10px 0px 10px',
            })
        var b_sel=$("<select/>").appendTo(header)
        for (i=0; i<this.n; i++){b_sel.append("<option>"+i+"</option>")}
        b_sel.val(this.b)
        var bm=b_sel.selectmenu({
            change: function(event, data){
                        this.b = data.item.index
                        this.onchange(this.a,this.b)
                    }.bind(this),
            width: 100}
        )
        bm.selectmenu('menuWidget').css({'height':400})
        bm.selectmenu('widget').css({'margin-right':20,'margin-top':-2,'float':'left'})
    }

crossChannelID.prototype.onchange =
    function(a,b){
        this.fireEvent("crossChannelID.change", {'a':a, 'b':b})
    }
