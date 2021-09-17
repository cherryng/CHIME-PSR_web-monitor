snapshotData.prototype = new dataSource();
function snapshotData(mh,mg,ea) {
    dataSource.call(this,mh,mg);

    this.fireEvent("registerConnection", {id:this.uuid, name:"Snapshot Data",t_thresh:5})
    this.ea=ea

	this.data_pipe = {};
    this.openSocket();
    this.update_time=0

	setInterval(function(){
					this.fireEvent("updateConnection",{'id':this.uuid,'status':this.connected(),
													   'ctime':this.update_time});
				}.bind(this), 100);

}

snapshotData.prototype.openSocket = 
    function() {
        this.data_pipe.isopen=false;
        this.data_pipe.socket = new WebSocket(config.snapshot);
        this.data_pipe.socket.binaryType = "arraybuffer";
        this.data_pipe.socket.onopen = function(e) {
            console.log("Connected snapshots!");
            this.isopen = true;
        }.bind(this)
        this.data_pipe.socket.onmessage = function(e) {
            console.log("New snapshotData!")
            if (typeof e.data == "string") {
                 msg=JSON.parse(e.data)
            } else {
                var header = new Uint8Array(e.data.slice(0, 4));
                switch (header[0]) {
                    case 0xf0: //highspeed info
                        var nt = (e.data.byteLength-4-8) / (1+4+4+4+4.);
                        var d_med = new Int8Array(e.data.slice(4,4+nt));
                        var d_mad = new Float32Array(e.data.slice(4+nt,4+5*nt));
                        var d_mean= new Float32Array(e.data.slice(4+nt*5,4+9*nt));
                        var d_std = new Float32Array(e.data.slice(4+nt*9,4+13*nt));
                        var d_kurt= new Float32Array(e.data.slice(4+nt*13,4+17*nt));
                        var ctime = new Float64Array(e.data.slice(4+17*nt,4+17*nt+8));
                        this.update_time = ctime[0];
                        for (i=0; i<nt; i++){
                            if (!(this.ea.ei[i] instanceof elementInfo))
                                this.ea.ei[i] = new elementInfo(i)
                            this.ea.ei[i].p['adc_med' ]=d_med[i];
                            this.ea.ei[i].p['adc_mad' ]=d_mad[i];
                            this.ea.ei[i].p['adc_mean']=d_mean[i];
                            this.ea.ei[i].p['adc_std' ]=d_std[i];
                            this.ea.ei[i].p['adc_kurt']=d_kurt[i];
                        }
                        this.fireEvent("snapshotData.newData",{ctime:this.update_time})
                        break;
                    case 0xf1: //highspeed raw
                        var nt = (e.data.byteLength-4-4);
                        var ts = new Int8Array(e.data.slice(4,nt+4));
                        var idx = new Int32Array(e.data.slice(4+nt,4+nt+4));
                        this.ea.ei[idx[0]].ts=ts
                        console.log("Recieved new highspeed timestream!",nt)
                        this.cb()
                        break;
                }
            }
        }.bind(this)
        this.data_pipe.socket.onclose = function(e) {
           console.log("Connection closed.");
           this.data_pipe.socket = null;
           this.data_pipe.isopen = false;
        }.bind(this)
    }

snapshotData.prototype.connected = 
    function() {
        return (this.data_pipe.socket != null) && 
               (this.data_pipe.socket.readyState == this.data_pipe.socket.OPEN);
    }

snapshotData.prototype.timestream =
    function(idx,cb) {
        this.cb=cb
        this.sendMessage({"info":"timestream","idx":idx,cb});
    }

snapshotData.prototype.closeSocket =
    function() {
        this.data_pipe.socket.close()
    }

snapshotData.prototype.sendMessage =
    function(msg,cb) {
//        console.log("sending",msg)
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

snapshotData.prototype.processEvent = 
    function(group_name, event_name,data) {
        switch (event_name){
            case "refreshPanel.update":
                if (!((data['conn']=='all') || (data['conn']=='snap'))) break;
                this.sendMessage({"info":"update"});
                break;
            default:
                break;
        }
    }

