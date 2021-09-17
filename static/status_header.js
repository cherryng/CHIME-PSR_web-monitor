/*
 * Adds the status header.
 */
statusHeader.prototype = new widget();
function statusHeader(container, mh,mg) {
        widget.call(this,mh,mg);

        this.connection_list={}
        this.color_map = ['Red','Orange','Green']

        this.jqcontainer=$('#'+container)
        this.initHeader()

        this.internet_time = new internetTime(mh,mg)

        setInterval(this.internet_time.updateTime.bind(this.internet_time), 300);
        setInterval(this.refreshStatus.bind(this), 100);
    }

/*
 * Sets the status.
 */
statusHeader.prototype.setStatus = 
    function(status,style)
    {
        this.status_header.text(status).css(style)
    }

statusHeader.prototype.initHeader =
    function(){
        this.jqcontainer.empty();

        var w=(10+3+3)*Math.ceil(Object.keys(this.connection_list).length/3)
        this.light_div=$("<div/>")
            .css({'width':w,'height':'100%','float':'left','margin':4})
            .appendTo(this.jqcontainer);
        for (i in this.connection_list) {
            this.connection_list[i].icon = this.circle(10,'red')
                            .attr('id',this.connection_list[i].id)
                            .css({'margin':3,'margin-bottom':3,'float':'left'})
                            .qtip({
                                    content: {
                                        text: function (event, api) {
                                            var c=this.connection_list[event.target.id]
                                            d=$("<div/>").css({'font-family':'sans-serif','font-size':16})
                                            d.append($("<p/>").text("Connection: "+c.name))
                                            d.append($("<p/>").text("Connected: "+c.status))
                                            d.append($("<p/>").text("Timestamp Age: "+this.timeSince(c.ctime)))
                                            return d
                                        }.bind(this)
                                    },
                                    style: {'background-color':'white'},
                                    //classes: 'qtip-bootstrap ui-tooltip-wideimage'},
                                    position: {
                                        corner: {target: 'rightMiddle',tooltip: 'leftMiddle'}
                                    },
                                })
                this.light_div.append(this.connection_list[i].icon)
        }

        this.status_header=$('<p/>')
            .css({'font-size':'32px',
                  'float':'right',
                  'font-family':'sans-serif',
                  'margin':'4px 4px 4px 0px','display':'table-cell'
                })
            .appendTo(this.jqcontainer)
    }

statusHeader.prototype.timeSince =
    function(ctime) {
        var now = this.internet_time.getTime().getTime()/1000;
                //new Date().getTime() / 1000;
        var old = new Date(ctime*1000).getTime() / 1000;
        var ds = now - old;
        if (ds < 0) ds=0;
        var dstr = (ds % 60).toFixed() + ' seconds';
        if (ds > 60)            dstr = (ds / 60).toFixed() + ' mins';
        if (ds > 60 * 60)       dstr = (ds / (60 * 60)).toFixed() + ' hours';
        if (ds > 24 * 60 * 60)  dstr = (ds / (60 * 60 * 24)).toFixed() + ' days';
        return dstr
    }

/*
 * If the data is less than 5 mins, we display "live", otherwise we show how stale it is.
 */
statusHeader.prototype.refreshStatus =
    function () {
        var global_sec=-1
        var global_dt=0;
        for (i in this.connection_list) {
            var color='red'
            if (this.connection_list[i].status) {
//                var now = new Date().getTime()/1000;
                var now = this.internet_time.getTime().getTime()/1000;
                var conn_time = new Date(this.connection_list[i].ctime*1000).getTime()/1000;
                var dt = (now-conn_time)/60/this.connection_list[i].t_thresh
                if (dt < 1) color='green'; else color='orange'
                if ((global_sec > -10) && (dt > global_dt))
                    {global_dt=dt; global_sec=dt*this.connection_list[i].t_thresh*60;}
            } else global_sec = -101
            this.connection_list[i].icon.css({'background-color':color})
        }

        if (global_sec > -10) {
            if (global_sec > 0) {
                if (global_dt <= 1) this.setStatus('Simulation', {'color':'green'})
                else {
                    var dstr = this.timeSince(this.internet_time.getTime().getTime()/1000-global_sec)
                    this.setStatus('Stale (' + dstr + ')', {'color':'orange'});
                }
            } else {
                this.setStatus('Pending...',{'color':'orange'});
            }
        }
        else this.setStatus('Not Connected', {'color':'red'})
    }

statusHeader.prototype.circle = function(size,color){
    return $('<div/>').css({'border-radius': size/2, 'width': size, 'height': size})
                   .css({'background-color':color,'position':'relative'})
}

statusHeader.prototype.processEvent = 
    function(group_name, event_name,data) {
        switch (event_name){
            case "registerConnection":
                this.connection_list[data.id] = {'status':0, 'ctime':0};
                this.connection_list[data.id].id=data.id;
                this.connection_list[data.id].name=data.name;
                this.connection_list[data.id].t_thresh=data.t_thresh
                this.initHeader();
                break;
            case "unregisterConnection":
                delete this.connection_list[data.id];
                this.initHeader();
                break;
            case "updateConnection":
                this.connection_list[data.id].status=data.status;
                this.connection_list[data.id].ctime=data.ctime;
                break;
            default:
                break;
        }
    }
