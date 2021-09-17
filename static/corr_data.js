/* 
 corrData is a general data handling class.
 It stores a sparse matrix of all received data,
 checks if new data is needed, manages the data socket,
 and builds images / arrays for rendering by passed-in
 callback functions.
*/
corrData.prototype = new dataSource();
function corrData(mh,mg){ 
    dataSource.call(this,mh,mg);
	this.n_elem = 256;
	this.n_freq = 1024;

	this.data_set = {};
	this.freq_list = [];
	this.freq_order = [];
	this.oldest_server_time = 0;
	this.freq_index = {};

	this.cb_stack = {};
	this.cb_ct = 0;
	this.cb_limit = 0;

	this.data_pipe = {};

	this.query_queue = [];

	this.eventCallList = [];
    this.initLookup();

	this.timeout = 1000;
	this.fireEvent("registerConnection",{name:"Correlation Data",id:this.uuid,'t_thresh':5});
	setInterval(this.timeoutCallback.bind(this), 100);
	setInterval(this.tickQueue.bind(this), 100);
	setInterval(function(){
					this.fireEvent("updateConnection",{'id':this.uuid,'status':this.connected(),
													   'ctime':this.times().slice(-1)[0],});
//					this.fireEvent("corrData.connectionStatusUpdate",this.connected());
				}.bind(this), 100);

	setInterval(this.expireData.bind(this), 5000);
	this.data_expiration = 3600 * 2 * 1000; //2hrs in ms
}

corrData.prototype.expireData = function(){
	var oldest_time = new Date(this.times()[0]*1000.);
	var newest_time = new Date(this.times().slice(-1)[0]*1000.);
	var dt = newest_time.getTime() - oldest_time.getTime();
	if (dt > this.data_expiration) {
		console.log("Expiring!", dt, dt/1000/3600, this.data_expiration)
		delete this.data_set[this.timekey(this.times()[0])];
		this.expireData();
	}
}

/*
  There are two ways to index into the elements of the triangle. The first
  way is to use a x and y coordinate system (i.e., 256 x 256) and the second way
  is to just enumerate them from left to right, row by row. The mini diagram
  illustrates the two ways to represent the coordinates.
  tri_lookup is just a translation lookup from 1->2.
 
  Method 1                  Method 2
  --------                  --------
  0,0 - 0,1 - 0,2           0 - 1 - 2
        1,1 - 1,2               3 - 4
              2,2                   5
*/
corrData.prototype.idxLookup = function(a,b)
{
	return this.tri_lookup[a][b];
}
corrData.prototype.initLookup = function()
{
	this.tri_lookup=[];
    var idx = 0;
    for (i=0; i<this.n_elem; i++)this.tri_lookup[i]=[];
    for (i=0; i<this.n_elem; i++){
        for (j=i; j<this.n_elem; j++){
            this.tri_lookup[i][j]=idx;
            this.tri_lookup[j][i]=idx++;
        }
    }
}


/*
 Utility functions.
- times()
- updateFreqList(freqs)

 I don't like how these are used, they're very hacky,
 things should be refactored to clean this up.
*/

corrData.prototype.times=function(){
	var t=[];
	for (timename in this.data_set) t.push(this.data_set[timename].ctime);
	return t.sort();
}

corrData.prototype.liveTimes=function(ctimes){
	var live=[]
	for (t of ctimes)
		if (t > this.oldest_server_time)
			live.push(t)
	return live;
}

corrData.prototype.timekey=function(ctime){
	return ctime.toString();
}

corrData.prototype.updateFreqList=function(freqs){
	this.n_freq = freqs.length/2
	var sf = freqs.slice(0,freqs.length/2)
	for (i=0; i<this.n_freq; i++)
	{
		this.freq_list[i]=[freqs[i]-freqs[i+this.n_freq], freqs[i]];
		this.freq_index[this.freq_list[i][0]]=i
	}
}


/*
 Helper function for plotting, this gives us some way of
 scaling complex data appropriately for display.
 Not clear this belongs here...
*/
corrData.prototype.scaleData = function(d,plot_type) {
    switch (plot_type){
		case 0: //magnitude
			return 10*Math.log10(d.mag)
		case 1: //phase
			return d.phi * 180./Math.PI
		case 2: //real
		case 3: //imag
			return 10*Math.log10(Math.abs(d.val(plot_type)))*Math.sign(d.val(plot_type))
	}
}


/*
 Functions to stuff new info into the local data cache.
- addTime      (ctime ,seq)
- addCorrtri   (ctime ,seq,freq    ,arr)
- addSpectrum  (ctime ,seq,freq    ,arr)
- addTimestream(ctimes,seq,freq,vis,arr)

 They use a standard set of inputs, either singular or plural:
=> ctime - the time, as a unixtime double-precision float, seconds since 1970
=> seq - the FPGA sequence number associated with the ctime
=> freq - the desired freq, currently an index         TODO: CHANGE IMMEDIATELY!
=> vis - the visiblity, enumerated as in idxLookup	   TODO: CHANGE TO A/B?
=> cb - a callback to be pushed onto the stack and called when a reply comes through.
*/
corrData.prototype.addTime=function(ctime,seq){
	var key = this.timekey(ctime);
	if (!(key in this.data_set)) {
		this.data_set[key]={"ctime":ctime,
							"seq":seq,
							"data":[]};
	}
	return key;
}

corrData.prototype.addCorrtri = function(ctime,seq,freq,arr){
	var key=this.addTime(ctime,seq);

	this.data_set[key].data[freq]=[];
	for (var i = 0; i < arr.length; i++) {
		this.data_set[key].data[freq][i] = new Complex(arr[2*i],arr[2*i+1])
	}
}

corrData.prototype.addSpectrum = function(ctime,seq,vis,arr){
	var time=this.addTime(ctime,seq);

	for (var i = 0; i < arr.length/2; i++) {
		if (!(Array.isArray(this.data_set[time].data[i]))) this.data_set[time].data[i]=[];
		this.data_set[time].data[i][vis] = new Complex(arr[2*i],arr[2*i+1])
	}
}

corrData.prototype.addTimestream = function(ctimes,seq,freq,vis,arr){
	var f = this.freq_index[freq]
	for (var i=0; i<ctimes.length; i++){
		var key = this.addTime(ctimes[i],seq[i]);
		if (!(Array.isArray(this.data_set[key].data[f]))) this.data_set[key].data[f]=[];
		this.data_set[key].data[f][vis] = new Complex(arr[2*i],arr[2*i+1])
	}
	this.oldest_server_time = Math.min.apply(null,ctimes);
}


/*
 Data request functions.
 These go through cached data and request additional info from the server to fill in gaps.
 Only complete spectra and triangles are currently used for these updates.
- requestSpectrum (ctime       ,vis,cb)
- requestWaterfall(ctimes,freqs,vis,cb)
- requestCorrtri  (ctime ,freq     ,cb)

 They use a standard set of inputs, either singular or plural:
=> ctime - the desired time, as a unixtime double-precision float, seconds since 1970
=> freq - the desired freq, as a float
=> vis - the visiblity, enumerated as in idxLookup	   TODO: CHANGE TO A/B?
=> cb - a callback to be pushed onto the stack and called when a reply comes through.
*/

corrData.prototype.requestSpectrum = function(ctime,vis,cb) {
	var time = this.timekey(ctime)
	//console.log("Asking for spectrum!",time,vis)
    var msgout={ 'data':'spectrum',
                 'time':time,
                 'vis':vis};
	this.sendMessage(msgout,cb);
}

corrData.prototype.requestTimestream = function(freq,vis,callback) {
	//console.log("Asking for timestream!",freq,vis)
    var msgout={ 'data':'timestream',
				 'freq':freq,
                 'vis':vis};
    this.sendMessage(msgout,callback);
}

corrData.prototype.requestWaterfall = function(ctimes,freqs,vis,cb){
	var complete=true;
//	console.log("Rendering...")
	for (i=0; i<ctimes.length; i++){
		var time = this.timekey(ctimes[ctimes.length-i-1]);
		if (time in this.data_set) {
			for (j=0; j<freqs.length; j++){
				f=this.freq_index[freqs[j]]
				if (!(Array.isArray(this.data_set[time].data[f]))) this.data_set[time].data[f]=[];
				if (this.data_set[time].data[f][vis] instanceof Complex) continue;
				if ((this.data_set[time].data[f][vis] instanceof Date) &&
				    ((new Date().getTime() - this.data_set[time].data[f][vis].getTime()) < this.timeout))
						continue;
			    var msgout={ 'data':'spectrum',
		                     'time':time,
		                     'vis':vis};
		        this.enqueueQuery(msgout,cb)
				for (; j<freqs.length; j++) {
					f=this.freq_index[freqs[j]]
					if (!(Array.isArray(this.data_set[time].data[f]))) this.data_set[time].data[f]=[];
					if (!(this.data_set[time].data[f][vis] instanceof Complex))
						this.data_set[time].data[f][vis] = new Date();
				}
		        complete=false
			}
		}
		else console.log("Request for an old spectrum! Ingoring.")
	}
	if (complete) cb();
}

corrData.prototype.requestCorrtri = function(ctime, freq, cb) {
	var nvis=this.n_elem*(this.n_elem+1) / 2
	var complete=true;
	var f=this.freq_index[freq]
	time = this.timekey(ctime)

	//check if we have the data already, otherwise go get it
	if (time in this.data_set) {
		if (!(Array.isArray(this.data_set[time].data[f]))) this.data_set[time].data[f]=[] 
		for (var i=0; i<nvis; i++){
			if (this.data_set[time].data[f][i] instanceof Complex) continue;
			if (((this.data_set[time].data[f][i] instanceof Date) &&
			    ((new Date().getTime() - this.data_set[time].data[f][i].getTime()) < this.timeout)))
				{complete=false; continue;}
		    var msgout={ 'data':'corrtri',
	                     'time':time,
	                     'freq':f};
		    this.sendMessage(msgout,cb);
		    for (; i<nvis; i++)
		    	if (!(this.data_set[time].data[f][i] instanceof Complex))
		    		this.data_set[time].data[f][i] = new Date();
		    complete=false;
		}
	}
	else console.log("Request for an old triangle! Ignoring.")
	if (complete) cb();
}


/*
 Info request functions.
 These are simple functions to request additional information
 from the server, e.g. available times, frequencies, or element info.
- requestTimes(cb)
- requestFreqs(cb)
- requestArray(cb)
 Inputs:
=> cb - a callback to be pushed onto the stack and called when a reply comes through.

 Note: These should be expanded to support things like gating info, etc.
*/
corrData.prototype.requestTimes =
	function(cb) {this.sendMessage({'info':'times'}, cb);}

corrData.prototype.requestFreqs =
	function(cb) {this.sendMessage({'info':'freqs'}, cb);}

corrData.prototype.requestArray =
	function(cb) {this.sendMessage({'info':'array'}, cb);}



/*
 Rendering functions.
 These each generate an image or array which is then passed to a callback renderfunc.
- renderWaterfall (ctimes,freqs,vis,palette,plot_type,renderfunc)
- renderTriangle  (ctime ,freq ,    palette,plot_type,renderfunc)
- renderTimestream(ctimes,freq ,vis,        plot_type,renderfunc)
- renderSpectrum  (ctime ,freqs,vis,        plot_Type,renderfunc)

 They use a standard set of inputs, either singular or plural:
=> ctime - the desired time, as a unixtime double-precision float, seconds since 1970
=> freq - the desired freq, currently an index         TODO: CHANGE IMMEDIATELY!
=> vis - the visiblity, enumerated as in idxLookup	   TODO: CHANGE TO A/B?
=> plot_type - mag/phase/real/imag, given as 0/1/2/3   TODO: CHANGE THIS
=> renderfunc - a function that gets called to do something useful with the result

 Note: These are strange hybrid sync/async functions!
 They immediately execute with renderfunc with a partial image built from whatever
 data is on hand, then ask for more data.
 Timestream/Spectrum/Triangle call themselves again when the full data comes in.
	-> These requests happen immediately, so a new copy with be drawn shortly.
 Waterfall is too big, so just adds a bunch of requests to the queue and returns.
 	-> These requests just go on the queue, so may be a long time, and new calls
 		are required to update the rendering.
*/

corrData.prototype.renderWaterfall = function(ctimes,freqs,vis,palette, plot_type,renderfunc){
    this.requestWaterfall(ctimes,freqs,vis,function(){});

//    console.log("renderWaterfall...",ctimes,freqs,vis)

	var nt = ctimes.length;
	var nf = freqs.length;
    var image_buffer=$('<canvas>')
    				.css('display','none')
                    .attr('width', nt)
                    .attr('height',nf);
	var ctx=image_buffer[0].getContext('2d');
    var image_data = ctx.createImageData(nt,nf);
	for (i=0; i<ctimes.length; i++){
		var time = this.timekey(ctimes[i]);
		if (time in this.data_set)
			for (j=0; j<freqs.length; j++){
				f=this.freq_index[freqs[j]]//this.freq_order[freqs[j]]				
				if ((Array.isArray(this.data_set[time].data[f]) &&
					 (this.data_set[time].data[f][vis] instanceof Complex)))
				{
				   	var d=this.scaleData(this.data_set[time].data[f][vis],plot_type)
		            palette.setPixel(image_data,i,j,d)
				}
			}
		else console.log("Request for a bad time in waterfall! Ingoring.", time)
	}
    ctx.putImageData(image_data, 0, 0);
	renderfunc(image_buffer[0])
	delete image_buffer
}

corrData.prototype.renderTriangle=function(ctime,freq,palette,plot_type,renderfunc){ 
	//go get the data, then draw it to image_buffer, then call the renderer
	this.requestCorrtri(ctime,freq,
		function(){
		    var image_buffer=$('<canvas>')
		    				.css('display','none')
		                    .attr('width', this.n_elem)
		                    .attr('height',this.n_elem);
		    var f=this.freq_index[freq];
			var ctx=image_buffer[0].getContext('2d');
		    var image_data = ctx.createImageData(this.n_elem,this.n_elem);
		    var data = this.data_set[this.timekey(ctime)].data[f];
		    var idx=0;
		    for (i=0; i<this.n_elem; i++)
		        for (j=i; j<this.n_elem; j++){
		        	var d=this.scaleData(data[idx++],plot_type)
		        	palette.setPixel(image_data,j,i,d)
		        }
		    ctx.putImageData(image_data, 0, 0);
			renderfunc(image_buffer[0])
		}.bind(this)
	)
} 

corrData.prototype.renderTimestream = function(ctimes,freq,vis,plot_type,renderfunc,do_callback) {
//    console.log("renderTimestream...",ctimes,freq,vis)
	var func = function(){}
	if ((typeof do_callback != 'undefined') && do_callback)
		func = function(){this.renderTimestream(ctimes,freq,vis,plot_type,renderfunc)}.bind(this);

	var timestream=[]
	var ltimes = ctimes//this.liveTimes(ctimes)
	var f = this.freq_index[freq]
	if (f < this.freq_list.length){
		for (time of ltimes) {
			tk=this.timekey(time)
			if ((tk in this.data_set) &&
				(Array.isArray(this.data_set[tk].data[f]) &&
				(this.data_set[tk].data[f][vis] instanceof Complex)))
					timestream.push([this.data_set[tk].ctime,
									 this.scaleData(this.data_set[tk].data[f][vis],
													plot_type)]);
		}
		if (timestream.length != ltimes.length)
			this.requestTimestream(this.freq_index[freq],vis,func);
//				function(){this.renderTimestream(ltimes,freq,vis,plot_type,renderfunc)}.bind(this));
		renderfunc(timestream);
	}
	else console.log("Request for out-of-bounds freq! Ignoring", freq)
}

corrData.prototype.renderSpectrum = function(ctime,freqs,vis,plot_type,renderfunc,do_callback) {
	var func=function(){}
	if ((typeof do_callback != 'undefined') && do_callback)
		func=function(){this.renderSpectrum(ctime,freqs,vis,plot_type,renderfunc)}.bind(this);

	var time = this.timekey(ctime);
	var spectrum = []
	if (time in this.data_set){
		for (j=0; j<freqs.length; j++) {
			var f=this.freq_index[freqs[j]]//this.freq_order[freqs[j]]
			if ((Array.isArray(this.data_set[time].data[f]) &&
				 (this.data_set[time].data[f][vis] instanceof Complex)))
					spectrum.push([(this.freq_list[f][0]+this.freq_list[f][1])/2,
									this.scaleData(this.data_set[time].data[f][vis],
								   				   plot_type)]);
		}
		if (spectrum.length != freqs.length)
	    	this.requestSpectrum(time,vis,func);
//	    		function(){this.renderSpectrum(ctime,freqs,vis,plot_type,renderfunc)}.bind(this));
//		if (!blocking) renderfunc(spectrum);
		renderfunc(spectrum);
	}
	else console.log("Request for an old spectrum! Ingoring.", time)
}


/*
 Query queue functions, used in long requests such as the waterfall.
- tickQueue()
- enqueueQuery(msg,cb)

 Inputs:
=> msg - a struct describing the desired message. Should contain either 'data' or 'info' entry.
=> cb - a callback to be pushed onto the stack and called when a reply comes through.

 Note that the contents of the Queue expire quickly, in this.timeout milliseconds,
 so repeated calls are likely necessary to e.g. complete a waterfall.
 The idea is to allow user interaction and interruption without having an
 endless queue of requests build up.
*/
corrData.prototype.tickQueue = function(){
	//clean out old queue items
	var newqueue=[];
	var now=new Date();
	for (i=0; i<this.query_queue.length; i++){
		var dt = now.getTime() - this.query_queue[i].timestamp.getTime(); 
		if (dt < this.timeout)
			newqueue.push(this.query_queue[i]);
	}
	this.query_queue=newqueue;

	//don't choke the server: only send a few calls at once
	var issue_limit = 4
	while (Object.keys(this.cb_stack).length < issue_limit){
		query=this.query_queue.shift()
		if (typeof query == 'undefined') break;
		this.sendMessage(query.msg,query.cb);
	}
}
corrData.prototype.enqueueQuery = function(msg,cb){
//	console.log("enqueue",this.query_queue.length)
	this.query_queue.push({'msg':msg,'cb':cb,'timestamp':new Date()});
}




/*
 Socket Functions Follow!
- connected()
- sendMessage(msg,cb)
- timeoutCallback()
- parseMessages(e)
- initDataPipe(cb)
 These do the actual communication with the server.
 They are asynchronous, as the reply from the server may come at any time, or even time out.
 A stack of callbacks is used to resume operations once a piece of data is received.
 Inputs:
=> msg - a struct describing the desired message. Should contain either 'data' or 'info' entry.
=> cb - a callback to be pushed onto the stack and called when a reply comes through.
=> e - an event, fired when a message is received from the correlation server

 Note: Firefox doesn't auto-translate from typed arrays to arrays!
 Strip by [0] or with Array.prototype.slice.call()
*/


corrData.prototype.connected = function()
{
	return (this.data_pipe.socket != null) && 
		   (this.data_pipe.socket.readyState == this.data_pipe.socket.OPEN);
}

corrData.prototype.sendMessage =
	function(msg,cb) {
		//console.log("sending",msg)
		var tryAgain = function(){
			window.setTimeout(this.sendMessage.bind(this),100,msg,cb)}.bind(this)
		if (Object.keys(this.cb_stack).length > 32) {
			tryAgain();
			return;
		}
	    msg['id']=this.cb_ct;
	    this.cb_stack[this.cb_ct]={'cb':cb, 'time':new Date()};
	    this.cb_ct=(this.cb_ct+1)%256;
        if ((typeof this.data_pipe.socket == 'undefined') || (this.data_pipe.socket == null))
			this.initDataPipe(tryAgain);
		switch (this.data_pipe.socket.readyState) {
			case this.data_pipe.socket.OPEN:
			    this.data_pipe.socket.send(JSON.stringify(msg));
			    break;
			case this.data_pipe.socket.CLOSED:
				this.initDataPipe(tryAgain);
			case this.data_pipe.socket.CONNECTING:
			case this.data_pipe.socket.CLOSING:
				tryAgain();
				break;
		}
	}

corrData.prototype.timeoutCallback = function()
{
	var now = new Date();
	for (id in this.cb_stack) {
		var dt = now.getTime() - this.cb_stack[id].time.getTime(); 
		if (dt > this.timeout){
			//console.log("Deleted old callback",id,dt)
			delete this.cb_stack[id]
		}
	}
}
corrData.prototype.parseMessage = function(e) {
    var f = 0;
    if (typeof e.data == "string") {
        msg = JSON.parse(e.data);
        console.log(msg);
    } else {
       	var header = new Uint8Array(e.data.slice(0, 4));
       	switch (header[0]) {
       		case 0x1: //time list
//                console.log("Got time list")
       			var nt = (e.data.byteLength-4) / (4+8);
       			var seqs = new Uint32Array(e.data.slice(4,4+4*nt));//seq numbers
            	var times = new Float64Array(e.data.slice(4+4*nt));//ctimes
       			for (i=0; i<nt; i++) this.addTime(times[i],seqs[i]);
       			break;
       		case 0x2: //freq list
//                console.log("Got freq list")
            	var freqs = new Float64Array(e.data.slice(4));
            	this.updateFreqList(Array.prototype.slice.call(freqs));
       			break;
       		case 0x3: //element list
       			console.log("Element list not yet implemented");
       			//???
       			break;
       		case 0x4: //corr triangle
//       			console.log("Got triangle")
       			var seq = new Uint32Array(e.data.slice(4,8));	//seq number
            	var time = new Float64Array(e.data.slice(8,16));//ctime
            	var freq = new Int32Array(e.data.slice(16,20));	//freq
            	var arr = new Int32Array(e.data.slice(20));		//corr tri
        		this.addCorrtri(time[0],seq[0],freq[0],arr)
            	break;
       		case 0x5: //spectrum
//                console.log("Got spectrum")
       			var seq = new Uint32Array(e.data.slice(4,8));	//seq number
            	var time = new Float64Array(e.data.slice(8,16));//ctime
            	var vis = new Int32Array(e.data.slice(16,20));	//vis
            	var arr = new Int32Array(e.data.slice(20));		//freq spectrum
				this.addSpectrum(time[0],seq[0],vis[0],arr);
            	break;
       		case 0x6: //timestream
            	var nt   = (e.data.byteLength-12) / (4+8+8);	//number of times
//                console.log("Got timestream")
            	var vis  = new Int32Array(e.data.slice(4,8));	//vis index
            	var freq = new Int32Array(e.data.slice(8,12));	//freq
       			var seq  = new Uint32Array(e.data.slice(12,12+4*nt));			//seq number
            	var time = new Float64Array(e.data.slice(12+4*nt,12+4*nt+8*nt));//ctime
            	var arr  = new Int32Array(e.data.slice(12+4*nt+8*nt));			//timestream
				this.addTimestream(Array.prototype.slice.call(time),
								   Array.prototype.slice.call(seq),
								   this.freq_list[freq[0]][0],vis[0],arr);
				//console.log(time,freq,this.freq_list[freq[0]][0],vis)
            	break;
       		case 0x9: //old time!
            	var time = String.fromCharCode.apply(null, new Uint8Array(e.data.slice(4)));//strtime
//       			console.log("Got an old time! Deleting it!!!", time)
       			delete this.data_set[time]
       			break;
        }
        if (header[1] in this.cb_stack){
        	this.cb_stack[header[1]].cb();
        	delete this.cb_stack[header[1]];
        } else {
        	//console.log("Callback expired?", header[1],this.cb_stack)
        }
    }
}

corrData.prototype.initDataPipe =
    function(cb) {
    	this.data_pipe.isopen=false;
        this.data_pipe.socket = new WebSocket(config.full_corr);
        this.data_pipe.socket.binaryType = "arraybuffer";
        this.data_pipe.socket.onopen = function() {
        	console.log("CorrData Connection established!");
           	this.data_pipe.opened_before = true;
           	this.data_pipe.isopen = true;
           	cb();
        }.bind(this)
        this.data_pipe.socket.onclose = function(e) {
		    console.log("CorrData Connection closed!");
		    this.socket = null;
		    this.isopen = false;
		}.bind(this)
        this.data_pipe.socket.onmessage = function(e) {
			//console.log("CorrData Message Received!")
        	this.parseMessage(e);
        }.bind(this)
    }


corrData.prototype.processEvent = 
    function(group_name, event_name,data) {
        switch (event_name){
            case "refreshPanel.update":
            	if (!((data['conn']=='all') || (data['conn']=='corr'))) break;
		        this.requestTimes(function(){this.fireEvent("corrData.newTimes")}.bind(this))
		        this.requestFreqs(function(){this.fireEvent("corrData.newFreqs")}.bind(this))
                break;
            case "changeExpiry":
            	this.data_expiration=data[0];
            	break;
            default:
                break;
        }
    }

