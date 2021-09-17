/*
 * Adds the selector that allows the user choose the data refresh rate.
 */
refreshPanel.prototype = new widget();
function refreshPanel(container, mh,mg){
        widget.call(this,mh,mg);
        this.refreshInterval=null;
        var mins = [1e10,1,5,10,15,20,30,45,60];
        var marg = 8;
        var width = $("#" + container).width();
        var di = $("<div/>").appendTo("#" + container).css({margin:marg})
        $("<div/>").text("Refresh:").appendTo(di)
            .css({'font-size':'12pt',margin:5,'font-family':'sans-serif'})
        var cp = $("<select/>").appendTo(di).css({float:'right'})
        cp.attr("id", "refreshSelect");
        cp.selectmenu()
        cp.selectmenu({
            change: function(event, data) {
                        clearInterval(this.refreshInterval);
                        this.refreshInterval = setInterval(this.update.bind(this),
                                                mins[data.item.index] * 60 * 1000);
                    }.bind(this),
            width: "60%",
        })
        var h=di.height()-marg*2+1

        cp.append("<option>" + "Never" + "</option>");
        for (i=1; i<mins.length; i++)
            cp.append("<option>" + mins[i].toFixed() + " min" + "</option>");

        document.getElementById("refreshSelect").select = 0;
        $("#refreshSelect").selectmenu("refresh", true);

        cp.attr("id", "refreshSelect");
        document.getElementById("refreshSelect").select = 0;
        $("#refreshSelect").selectmenu("refresh", true);

        var cp = $("<button/>").appendTo(di).css({float:'right'})
        cp.button({
                label: "Now",
            })
            .css({width: "40%", height:h-12})
            .click(this.update.bind(this));
    }

refreshPanel.prototype.update = 
    function(){
        this.fireEvent("refreshPanel.update",{'conn':'all'})
    }
