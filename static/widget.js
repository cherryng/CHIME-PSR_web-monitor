function widget(message_handler,group){
	if (arguments.length == 0) return;
    this.uuid=this.guid();
    this.group=group;
    this.mh = message_handler;
    this.mh.attachListener(group,this)
}

widget.prototype.guid =
	function (){
	    function s4() {
	        return Math.floor((1 + Math.random()) * 0x10000)
	          .toString(16).substring(1);
	    }
	    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	           s4() + '-' + s4() + s4() + s4();
	}

widget.prototype.fireEvent =
    function(event_name,data) {
    	this.mh.fireEvent(this.group, event_name,data);
    }

//just a template. Inheritors should write this.
widget.prototype.processEvent = 
	function(group_name, event_name,data) {
		switch (event_name){
			default:
				break;
		}
	}
