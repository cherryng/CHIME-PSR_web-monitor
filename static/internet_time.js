internetTime.prototype = new dataSource();
function internetTime(mh,mg) {
    dataSource.call(this,mh,mg);

    this.fireEvent("registerConnection", {id:this.uuid, name:"Internet Time",t_thresh:5})
	this.last_request = new Date(0)
	this.local_time = new Date(0)
	this.updateTime()
}

internetTime.prototype.timeSinceUpdate = 
	function() {
		var current_time = new Date()
		var dt = new Date().getTime() - this.local_time.getTime()
		return dt/1000 //dt in seconds
	}

internetTime.prototype.getTime =
	function() {
		var corrected_time = new Date(new Date().getTime() + this.delta_time)
		return corrected_time
	}

internetTime.prototype.updateTime = 
	function() {
		var self=this

		if ((new Date().getTime() - this.last_request.getTime())/1000 < 30) return;
		this.last_request = new Date()

	/* JSON / timeapi.or version */
    /*
		$.ajax({
		    url: 'https://www.timeapi.org/utc/now.json',
		    dataType: 'jsonp'
		})
		.done(function(response) {
		    // response = {"dateString":"2012-03-06T02:18:25+00:00"}
			self.true_time = new Date(response.dateString)
			self.local_time = new Date()
			self.delta_time = self.true_time.getTime() - self.local_time.getTime()
			console.log("Time Synchronized with www.timeapi.org, ", self.true_time)
			console.log("  local time approximate offset: "+self.delta_time+"ms")
		});
    */

        // Google version does work :)
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open("HEAD", "https://www.googleapis.com", true);
        xmlhttp.onreadystatechange = function () {
	            if (xmlhttp.readyState == 4) {
                	self.true_time = new Date(xmlhttp.getResponseHeader("Date"));
	                self.local_time = new Date();
	                self.delta_time = self.true_time.getTime() - self.local_time.getTime()
	                console.log("Time Synchronized with www.googleapis.com, ", self.true_time)
	                console.log("  local time approximate offset: "+self.delta_time+"ms")
			        this.fireEvent("updateConnection",
			            {
			                'id':this.uuid,
			                'status':(this.timeSinceUpdate() < 300),
			                'ctime':this.last_request.getTime()/1000,
			            })
	            }
	        }.bind(this)
        xmlhttp.send();

	}

