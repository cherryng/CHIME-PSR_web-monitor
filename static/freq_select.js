/*
 Adds a frequency dropdown.

Inputs:
- container -> name of a div / span / etc that houses the dropdown
- onchange -> function to execute when a new type is selected.
        Takes one argument, the new frequency list, and should be bound.
*/
freqSelect.prototype = new widget();
function freqSelect(container, mh,mg) {
        widget.call(this,mh,mg);
        var marg = 8;
        this.sel = $("<select/>")
                    .appendTo($("<div/>")
                    .appendTo("#" + container)
                    .css({margin:marg}));
        this.sel.selectmenu().selectmenu("menuWidget").css({'height':500})
        this.sel.selectmenu({
            change: function(event, data) {
                        this.f=data.item.index
                        this.onchange(data.item.value);
                    }.bind(this),
            width: "100%"
        })
        this.f=500
    }

freqSelect.prototype.updateFreqSelect =
    function (freqs) {
        console.log("Updating frequency list...")
        this.sel.find('option').remove().end()
        for (i = 0; i < freqs.length; i++) {
            var d = i.toFixed(0) + ': ' +
                    freqs[i][0].toFixed(2) + " - " +
                    freqs[i][1].toFixed(2) + "MHz";
            this.sel.append("<option value="+(freqs[i][0]+freqs[i][1])/2+">" + d + "</option>");
        }
        this.sel.prop("selectedIndex",this.f);
        this.sel.selectmenu("refresh", true)
        this.onchange(freqs[this.f][0])
    }

freqSelect.prototype.onchange = 
    function(freq){
        console.log("onchange!",freq)
        this.fireEvent("freqSelect.change",freq)
    }

freqSelect.prototype.processEvent = 
    function(group_name, event_name,data) {
        switch (event_name){
            case "pathfinderCorrTriangle.freqListUpdate":
                this.updateFreqSelect(data);
                break;
            default:
                break;
        }
    }

