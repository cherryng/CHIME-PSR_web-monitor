/*
 * Adds the frequency filter (dropdownchecklist).
 */
timeseriesPlot.prototype = new widget();
function timeseriesPlot(target,dataset,palette,mh,mg) {
    widget.call(this,mh,mg);
    this.corr_data=dataset
    this.ctimes=[]
    this.freq=0
    this.vis=0
    this.plot_type=0
    this.pal=palette

    this.width = $("#"+target).width()
    this.height= $("#"+target).height()

    this.tp=$.plot("#"+target,[[0,0],[1,1]], {
        xaxis: {min:0, max:1},// axisLabel: 'Freq [MHz]'},
        yaxis: {min:this.pal.min,max:this.pal.max},
        canvas: true,
        grid: {margin: {top:30}}
      });
}

timeseriesPlot.prototype.draw =
    function(){
        this.corr_data.renderTimestream(this.ctimes, this.freq, this.vis, this.plot_type,
            function(timeseries) {
                var d = {data: timeseries, points: { show: true, symbol: "circle", fill: true, radius: 1 }, color: '#058DC7'};
                this.tp.setData([d]);
                this.tp.getAxes().yaxis.options.min = this.pal.min;
                this.tp.getAxes().yaxis.options.max = this.pal.max;
                this.tp.getAxes().xaxis.options.min = Math.min.apply(null,this.ctimes);
                this.tp.getAxes().xaxis.options.max = Math.max.apply(null,this.ctimes);
                this.tp.getAxes().xaxis.options.tickFormatter = function xaxisFormat (x) { 
                    var time_string_options = {timeZone: "UTC", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit"};
                    return new Date(x*1000).toLocaleTimeString('en-US',time_string_options);
                };
                this.tp.setupGrid();
                this.tp.draw();
                var c=this.tp.getCanvas().getContext("2d");
                c.textAlign='center';
                c.font="20px Arial";
                c.fillText("Timeseries: f="+this.freq.toFixed(1)+"MHz", this.width/2,20);
            }.bind(this));
    }
/*
 data should be an object containing:
    - ctime -> unix time, seconds since 1970
    - freqs -> array of frequency indices (NEED TO FIX)
*/
timeseriesPlot.prototype.updateData =
    function(data){
        this.ctimes=data.ctimes
        this.freq= data.freq
        this.vis = data.vis
        this.draw()
    }
timeseriesPlot.prototype.updateType =
    function(type){
        var img_range = {'Magnitude':[0,100],
                         'Phase':[-180,180],
                         'Real':[-100,100],
                         'Imaginary':[-100,100]};
        var img_range_description = {'Magnitude':'[dB]',
                                     'Phase':'[degrees]',
                                     'Real':'[+- abs dB]',
                                     'Imaginary':'[+- abs dB]'};
        var type_lookup = {'Magnitude':0, 'Phase':1, 'Real':2, 'Imaginary':3};
        this.plot_type = type_lookup[type];
        this.draw()
    }

timeseriesPlot.prototype.processEvent = 
    function(group_name, event_name,data) {
        switch (event_name){
            case "pathfinderWaterfall.selectionUpdate":
                this.updateData(data);
                break;
            case "typeSelect.change":
                this.updateType(data);
                break;
            case "colorHandler.change":
                this.draw();
                break;
            case "pathfinderWaterfall.draw":
                this.draw();
                break;
            default:
                break;
        }
    }


