/*
 * Adds the time parity selector and defines the logic on select change.
 */
cate_Select.prototype = new widget();
function cate_Select(target, mh,mg) {
        widget.call(this,mh,mg);
        var marg = 8;
        var width = $("#" + target).width();
        var cp = $("<select/>").appendTo($("<div/>").appendTo("#" + target).css({margin:marg}));
        cp.attr("id", "cate_Select");
        cp.selectmenu().selectmenu("menuWidget").addClass("overflow");
        cp.selectmenu({
            change: function(event, data) {
                        this.onchange(data.item.value);
                    }.bind(this),
            width: width - 2*marg,
        })
	    cp.append("<option value=All class=all>" + "All on sky" + "</option>");
        cp.append("<option value=NotObs>" + "Not observed" + "</option>");
        cp.append("<option value=NANOGrav>" + "NANOGrav" + "</option>");
        cp.append("<option value=RRAT>" + "RRAT" + "</option>");
        cp.append("<option value=Magnetar>" + "Magnetar" + "</option>");
        cp.append("<option value=Binary>" + "Binary" + "</option>");
	cp.append("<option value=gc>" + "Globular Cluster" + "</option>");
        document.getElementById("cate_Select").options.selectedIndex = 0;
        $("#cate_Select").selectmenu("refresh", true);


}

cate_Select.prototype.onchange =
    function(value){
    this.fireEvent("cate_Select.change", value);
    console.log("Hi THis is Cherry messing around.", value);
}

