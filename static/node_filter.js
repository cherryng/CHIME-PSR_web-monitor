/*
 * Adds the frequency filter (dropdownchecklist).
 */
nodeFilter.prototype = new widget();
function nodeFilter(target,mh,mg) {
        widget.call(this,mh,mg);
        this.target=target
        this.onchange=onchange

        this.node_mask = [];
        for (var i = 0; i < 16; i++) this.node_mask[i] = false;

        var marg = 8;
        var width = $("#" + target).width();
        var cp=$("<div/>").css({'margin':marg}).appendTo($("#"+this.target))
        $("<div/>").text("Node Mask:").css({'font-family':'sans-serif','font-size':'12pt',margin:5,}).appendTo(cp)
        for (i = 0; i < 16; i++) {
            var name="chi"+pad(i+1,2);
            var cb=$("<input/>").attr({'type':'checkbox','id':i}).prop("checked",this.node_mask[i])
            cp.append(cb).append("<label for='"+i+"'>"+name+"</label>")
        }

        cp.buttonset().css({'font-size':'11pt'})
            .change(function (event) {
                        this.node_mask[event.target.id] = event.target.checked;
                        this.fireEvent("nodeFilter.change", this.node_mask)
                     }.bind(this));
    }

function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}
