function messageHandler(){ 
	this.eventCallList = {};
}

messageHandler.prototype.attachListener =
    function(group_name, listener) {
    	this.eventCallList[listener.uuid] =
    		{
    			'group':group_name,
    			'listener':listener
    		};
	}

messageHandler.prototype.fireEvent =
	function(group_name, event_name, data) {
//    console.log("Fire!", event_name, group_name, data)
    for (i in this.eventCallList)
            if (this.eventCallList[i]['group'] == group_name)
            	this.eventCallList[i]['listener'].processEvent(group_name, event_name,data);
	}
