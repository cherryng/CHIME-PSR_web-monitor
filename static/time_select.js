/*
 Adds a time dropdown.

Inputs:
- container -> name of a div / span / etc that houses the dropdown
- onchange -> function to execute when a new type is selected.
        Takes one argument, the new time list, and should be bound.
*/
timeSelect.prototype = new widget();
function timeSelect(container, mh,mg) {
        widget.call(this,mh,mg);
        var marg = 8;
        this.sel = $("<select/>")
                    .appendTo($("<div/>")
                    .appendTo("#" + container)
                    .css({margin:marg}));
        this.sel.selectmenu().selectmenu("menuWidget").css({'height':500})
        this.sel.selectmenu({
            change: function(event, data) {
                        this.onchange(data.item.value);
                    }.bind(this),
            width: "100%"
        })
    }

timeSelect.prototype.updateTimeSelect =
    function (ctimes) {
        var time_string_options = {timeZone: "UTC", month: "short", day: "numeric", 
                hour: "2-digit", hour12: false, minute: "2-digit", second: "2-digit"};
        this.sel.find('option').remove().end()
        for (i = 0; i < ctimes.length; i++){
            var d=new Date(ctimes[i]*1e3).toLocaleTimeString('en-US',time_string_options);
            this.sel.append("<option value="+ctimes[i]+">" + d + "</option>");
        }
        this.sel.prop("selectedIndex",ctimes.length-1);
        this.sel.selectmenu("refresh", true)
        this.onchange(ctimes.slice(-1)[0])
    }

timeSelect.prototype.onchange = 
    function(ctime){
        this.fireEvent("timeSelect.change",ctime)
    }

timeSelect.prototype.processEvent = 
    function(group_name, event_name,data) {
        switch (event_name){
            case "pathfinderCorrTriangle.timeListUpdate":
                this.updateTimeSelect(data);
                break;
            default:
                break;
        }
    }

