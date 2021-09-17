/*
 * Adds the frequency filter (dropdownchecklist).
 */
spectrumPlot.prototype = new widget();
function spectrumPlot(target,dataset,palette,mh,mg) {
    widget.call(this,mh,mg);
    this.corr_data=dataset
    this.ctime=0
    this.freqs=[]
    this.vis=0
    this.plot_type=0
    this.pal=palette

    this.width = $("#"+target).width()
    this.height= $("#"+target).height()

    this.sp=$.plot("#"+target,[[0,0],[1,1]], {
        xaxis: {min:400, max:800, axisLabel: 'Freq [MHz]'},
        yaxis: {min:this.pal.min,max:this.pal.max},
        canvas: true,
        grid: {margin: {top:30}}
      });
}
spectrumPlot.prototype.draw =
    function(){
        this.corr_data.renderSpectrum(this.ctime,this.freqs, this.vis, this.plot_type,
            function(spectrum) {
                var d = {data: spectrum, points: { show: true, symbol: "circle", fill: true, radius: 0.5 }, color: '#058DC7'};
                this.sp.setData([d]);
                this.sp.getAxes().yaxis.options.min = this.pal.min;
                this.sp.getAxes().yaxis.options.max = this.pal.max;
                this.sp.getAxes().xaxis.options.min = 400.;
                this.sp.getAxes().xaxis.options.max = 800.;

                var time_string_options = {timeZone: "UTC", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit"};
                var t = new Date(this.ctime*1e3).toLocaleTimeString('en-US',time_string_options);

                this.sp.setupGrid();
                this.sp.draw();
                var c=this.sp.getCanvas().getContext("2d");
                c.textAlign='center';
                c.font="20px Arial";
                c.fillText("Spectrum: t="+t,this.width/2,20);
            }.bind(this));
    }
/*
 data should be an object containing:
    - ctime -> unix time, seconds since 1970
    - freqs -> array of frequency indices (NEED TO FIX)
*/
spectrumPlot.prototype.updateData =
    function(data){
        this.ctime=data.ctime
        this.freqs=data.freqs
        this.vis = data.vis
        this.draw()
    }
spectrumPlot.prototype.updateType =
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


spectrumPlot.prototype.processEvent = 
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

