/*
 Adds the type dropdown.

Inputs:
- container -> name of a div / span / etc that houses the dropdown
- onchange -> function to execute when a new type is selected. Takes one argument, the new plot type.
*/
typeSelect.prototype = new widget();
function typeSelect(container, mh, mg) {
        widget.call(this,mh,mg);
        var types=['Magnitude','Phase','Real','Imaginary']

        var marg=8
        var cp=$("<select/>").appendTo($("<div/>").appendTo("#"+container).css({margin:marg}))
        for (i of types) cp.append("<option value="+i+">"+i+"</option>")
        cp.selectmenu({
            change: function(event, data){
                        this.onchange(data.item.value);
                    }.bind(this),
            width: "100%"}
        )
        this.onchange(types[0]);
    }

typeSelect.prototype.onchange =
    function(value){
        this.fireEvent("typeSelect.change", value)
    }
