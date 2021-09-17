layoutData.prototype = new dataSource();
function layoutData(mh,mg,ea) {
    dataSource.call(this,mh,mg,ea);

    this.fireEvent("registerConnection", {id:this.uuid, name:"Layout Data",t_thresh:15})
    this.ea=ea

	this.data_pipe = {};
    this.openSocket();
    this.update_time=0

	setInterval(function(){
					this.fireEvent("updateConnection",{'id':this.uuid,'status':this.connected(),
													   'ctime':this.update_time});
				}.bind(this), 100);

}

layoutData.prototype.openSocket =
    function () {
        this.isopen=false;
        this.data_pipe.socket = new WebSocket(config.layoutdb);
        this.data_pipe.socket.onopen = function() {
           console.log("Connected layoutdb!");
           this.isopen = true;
        }.bind(this)
        this.data_pipe.socket.onmessage = function(e) {
//            console.log("New layoutData!")
            if (typeof e.data == "string") {
                msg=JSON.parse(e.data)
                this.n_elements=msg.length
                this.update_time=new Date().getTime()/1000
                for (var m in msg) {
                 	if (m=="ctime"){
                		this.update_time=msg[m]
                 		continue;
                 	}
                    var idx=parseInt(msg[m]['datidx'])
                    if (!(this.ea.ei[idx] instanceof elementInfo))
                        this.ea.ei[idx] = new elementInfo(idx)
                    this.ea.ei[idx].p['cyl']=msg[m]['ref']
                    this.ea.ei[idx].p['pol']=msg[m]['pol']
                    this.ea.ei[idx].p['pos']=msg[m]['pos'].toFixed(2)
                    this.ea.ei[idx].p['ant']=msg[m]['ant']
                    this.ea.ei[idx].p['fpga']=msg[m]['fpga']
                    this.ea.ei[idx].p['pow']=msg[m]['pow']
//                    this.ea.ei[idx].p['hk']=msg[m]['hk']
                }
            } else {
                var arr = new Int32Array(e.data);
                for (var i=0; i<this.nsq; i++) {
                    this.cross_array[i] = new Complex(arr[2*i],arr[2*i+1])
                }
            }
            this.fireEvent("layoutData.newData",{ctime:this.update_time})
        }.bind(this)
        this.data_pipe.socket.onclose = function(e) {
           console.log("Connection closed.");
           this.data_pipe.socket = null;
           this.isopen = false;
        }.bind(this)
    }

layoutData.prototype.connected = function()
{
	return (this.data_pipe.socket != null) && 
		   (this.data_pipe.socket.readyState == this.data_pipe.socket.OPEN);
}


layoutData.prototype.closeSocket =
    function() {
        this.data_pipe.socket.close()
    }


layoutData.prototype.sendMessage =
    function(msg,cb) {
        console.log("sending",msg)
        var tryAgain = function(){
            window.setTimeout(this.sendMessage.bind(this),100,msg,cb)}.bind(this)
        if ((typeof this.data_pipe.socket == 'undefined') || (this.data_pipe.socket == null))
            this.openSocket(tryAgain);
        switch (this.data_pipe.socket.readyState) {
            case this.data_pipe.socket.OPEN:
                this.data_pipe.socket.send(JSON.stringify(msg));
                break;
            case this.data_pipe.socket.CLOSED:
                this.openSocket();
            case this.data_pipe.socket.CONNECTING:
            case this.data_pipe.socket.CLOSING:
                tryAgain();
                break;
        }
    }

layoutData.prototype.processEvent = 
    function(group_name, event_name,data) {
        switch (event_name){
            case "refreshPanel.update":
                if (!((data['conn']=='all') || (data['conn']=='layout'))) break;
                this.sendMessage("update");
                break;
            default:
                break;
        }
    }


