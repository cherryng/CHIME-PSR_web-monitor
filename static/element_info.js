elementArrayInfo.prototype = new widget();
function elementArrayInfo(mh, mg) {
    widget.call(this,mh,mg);
    this.ei = [];
    this.layout_connection = this.guid();
    this.snap_connection = this.guid();
    this.layout_data = new layoutData(mh,mg,this);
    this.snapshot_data = new snapshotData(mh,mg,this);
}


elementDiv.prototype = new widget();
function elementDiv(container, ea, corr_data, mh, mg) {
    var marg=3
    this.ea = ea;
    widget.call(this,mh,mg);
    this.corr_data=corr_data;
    this.jqcontainer = $("#"+container)
    this.div = $('<div/>')
        .appendTo(this.jqcontainer)
        .css({
            'border':'0px solid black',
            'margin':marg,
            'font-size':'10px',
            'font-family':'sans-serif',
            'text-align':'center'
        })
        .width(this.jqcontainer.width()-2*(marg+1))
        .height(this.jqcontainer.height()-2*(marg+1))
    this.spectrumCountdown = null;
    this.spectrum_div= $('<div/>')
    this.plot_type='corr_spec';
    this.idx=0
}


elementDiv.prototype.processEvent = 
    function(group_name, event_name,data) {
        switch (event_name){
            case "pathfinderCorrTriangle.crossSelect":
            case "crossChannelID.change":
            case "cylinderMap.change":
                this.idx=data[this.cross_select];
                this.updateDiv();
                break;
            case "layoutData.newData":
            case "snapshotData.newData":
                this.updateDiv()
                break;
            default:
                break;
        }
    }

elementDiv.prototype.updateDiv =
    function() {
        this.spectrum_div.empty();
        this.div.empty();
        this.ei=this.ea.ei[this.idx]
        if (typeof(this.ei) == 'undefined') {
            $('<p/>').text('Element Missing from Layout DB / Data File!')
                .css({'font-size':'14px'})
                .appendTo(this.div)
        } else {
            $('<p/>').text(this.ei.idx)
                .css({'font-size':'14px'})
                .appendTo(this.div)


            this.prop_list=$('<dl/>')
                .css({'margin-left' :20,
                      'margin-right':20,
                      'column-count':2
                    })
                .attr({'align':'left'})
                .appendTo(this.div)

            for (i in this.ei.p) {
                var d = this.ei.p[i]
                if (typeof d == 'number') d=d.toFixed(2)
                $('<dt/>').text(i).appendTo(this.prop_list)
                $('<dd/>').text(d).appendTo(this.prop_list)
                            .css({'color':this.ei.threshADC(i)});// ? 'black':'red'});
            }
            this.prop_list.children('dt').css({'float':'left'})
            this.prop_list.children('dd').css({'text-align':'right','margin-left':'10px'})

            var lookup={'corr_spec':0,'snap_spec':1,'snap_time':2,'snap_hist':3}
            var plot_titles={'corr_spec':'Correlated Spectrum',
                             'snap_spec':'Snapshot Spectrum',
                             'snap_time':'Snapshot Timestream',
                             'snap_hist':'Snapshot Histogram'}
            this.spectrum_div= $('<div/>')
                .text('Loading '+plot_titles[this.plot_type]+'...')
                .appendTo(this.div).uniqueId()
            this.resize();

            var cp=$('<select/>')
                .css({'font-size':5,'font-family':'sans-serif','float':'left','width':160})
                .append("<option value='corr_spec'>Correlated Spectrum</option>")
                .append("<option value='snap_spec'>Snapshot Spectrum</option>")
                .append("<option value='snap_time'>Snapshot Timestream</option>")
                .append("<option value='snap_hist'>Snapshot Histogram</option>")
                .appendTo(this.div)
            cp.prop("selectedIndex",lookup[this.plot_type]);
            cp.selectmenu({
                    change: function(event, data) {
                        this.setPlot(data.item.value) }.bind(this)})
                .selectmenu("menuWidget")
                .css({'font-size':12,'font-family':'sans-serif'})


            $('<button/>')
                .click(function(event) {
                        window.open("../chan_03/index.html?a="+this.ei.idx+"&b="+this.ei.idx)
                    }.bind(this))
                .button({'label':'Auto WF'})
                .css({'font-size':12,'font-family':'sans-serif','vertical-align':'top','margin-left':5})
                .appendTo(this.div)

            clearTimeout(this.spectrumCountdown);
            this.spectrumCountdown = setTimeout(this.addSpectrum.bind(this),1000);
        }
    }

elementDiv.prototype.setPlot =
    function(plot_type){
        this.plot_type=plot_type;
        this.updateDiv();
    }

elementDiv.prototype.resize =
    function(){
        this.spectrum_div.width( this.jqcontainer.width()-6)
        this.spectrum_div.height(this.jqcontainer.height()-150)
    }

elementDiv.prototype.addSpectrum =
    function () {
        switch(this.plot_type){
            case 'corr_spec':
                var vis=this.corr_data.idxLookup(this.ei.idx,this.ei.idx)
                var freq_list=[];
                var ctime = this.corr_data.times().slice(-1)[0];
                var plot_type=0 //magnitude
                for (i in this.corr_data.freq_index)
                    freq_list.push(this.corr_data.freq_list[this.corr_data.freq_index[i]][0])

                this.corr_data.renderSpectrum(ctime,freq_list, vis, plot_type,
                    function(spectrum) {
                        this.spectrum_div.empty();
                        var d = {data: spectrum,
                                 points: {show: true, symbol: "circle", fill: true, radius: 0.5},
                                 color: '#058DC7'};
                        $.plot(this.spectrum_div, [d], {
                                yaxis: {tickFormatter: function(a,b){return "";}}
                            },true);
                    }.bind(this),true);
                break;
            case 'snap_spec':
                this.ea.snapshot_data.timestream(this.ei.idx);
                this.ea.snapshot_data.timestream(this.ei.idx,
                    function(){
                        this.spectrum_div.empty();
                        var fft=new FFT(this.ei.ts.length, 800e6);
                        fft.forward(this.ei.ts)
                        var ts=[]
                        for (i=0; i<this.ei.ts.length/2; i++)
                                ts[i]=[ 800- i / this.ei.ts.length * 800,
                                        10*Math.log(fft.spectrum[i]*fft.spectrum[i])]
//                                            fft.spectrum[i][0]*fft.spectrum[i][0]+
//                                            fft.spectrum[i][1]*fft.spectrum[i][1]) ]
                        var d = {data: ts,
                                 points: {show: true, symbol: "circle", fill: true, radius: 0.5},
                                 color: '#058DC7'};
                        $.plot(this.spectrum_div, [d], {
                                yaxis: {tickFormatter: function(a,b){return "";}}
                            },true);
                    }.bind(this))
                console.log("Getting data!")
                break;
            case 'snap_time':
                console.log("Getting data timestream!")
                this.ea.snapshot_data.timestream(this.ei.idx,
                    function(){
                        this.spectrum_div.empty();
                        var ts=[]
                        for (i=0; i<this.ei.ts.length; i++) ts[i]=[i,this.ei.ts[i]]
                        var d = {data: ts,
                                 points: {show: true, symbol: "circle", fill: true, radius: 0.5},
                                 color: '#058DC7'};
                        $.plot(this.spectrum_div, [d], {
                                yaxis: {tickFormatter: function(a,b){return "";}}
                            },true);
                    }.bind(this))
                break;
            case 'snap_hist':
                console.log("Getting data timestream!")
                this.ea.snapshot_data.timestream(this.ei.idx,
                    function(){
                        this.spectrum_div.empty();
                        var hist=[]
                        for (i=-128; i<128; i++) hist[i+128]=[i,0];
                        for (i=0; i<this.ei.ts.length; i++) hist[this.ei.ts[i]+128][1]+=1
                        var d = {data: hist,
                                 points: {show: true, symbol: "circle", fill: true, radius: 0.5},
                                 color: '#058DC7'};
                        $.plot(this.spectrum_div, [d], {
                                yaxis: {tickFormatter: function(a,b){return "";}}
                            },true);
                    }.bind(this))                
        }
        return;
    }


function elementInfo(idx) {
    this.p = {};
    this.idx = idx;
}

elementInfo.prototype.threshADC = function(property){
    var lim_hi = {"adc_med":4,
                  "adc_mad":10,
                  "adc_mean":4,
                  "adc_std":16,
                  "adc_kurt":2,
                  }
    var lim_lo = {"adc_med":0,
                  "adc_mad":5,
                  "adc_mean":0,
                  "adc_std":7,
                  "adc_kurt":0,
                  }
    if (!(property in lim_hi) || !(property in this.p)) return 'black'
    if (Math.abs(this.p[property]) > lim_hi[property]) return 'red';
    if (Math.abs(this.p[property]) < lim_lo[property]) return 'aqua';
    return 'green';
}

