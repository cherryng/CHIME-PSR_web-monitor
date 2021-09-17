/*
 * Adds the time parity selector and defines the logic on select change.
 */
timeParitySelect.prototype = new widget();
function timeParitySelect(target, mh,mg) {
        widget.call(this,mh,mg);
        var marg = 8;
        var width = $("#" + target).width();
        var cp = $("<select/>").appendTo($("<div/>").appendTo("#" + target).css({margin:marg}));
        cp.attr("id", "timeParitySelect");
        cp.selectmenu().selectmenu("menuWidget").addClass("overflow");
        cp.selectmenu({
            change: function(event, data) {
                        this.onchange(data.item.value);
                    }.bind(this),
            width: width - 2*marg,
        })
        cp.append("<option value=all>" + "All" + "</option>");
        cp.append("<option value=nson>" + "Noise source on" + "</option>");
        cp.append("<option value=nsoff>" + "Noise source off" + "</option>");
//        cp.append("<option>" + "On - Off" + "</option>");
        document.getElementById("timeParitySelect").options.selectedIndex = 0;
        $("#timeParitySelect").selectmenu("refresh", true);
    }

timeParitySelect.prototype.onchange =
    function(value){
        this.fireEvent("timeParitySelect.change", value)
    }
