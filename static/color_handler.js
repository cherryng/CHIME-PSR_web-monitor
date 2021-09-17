/*
 * Adds the color slider and defines the logic on slider change.
 */
colorHandler.prototype = new widget();
function colorHandler(target,palette,mh,mg){
    widget.call(this,mh,mg);
    this.wrapper=$("#"+target)
    this.inrange=[-1000,1000]
    this.pal = palette
    this.vals= this.inrange
    this.slider_heading="[dB]"

    var cb_height=50
    var sl_height=50
    var label_hgt=50
    var width=this.wrapper.width()
    var marg=8
    var rr
    var cp
    var cb2use = this.pal.knownColormaps();

    cp=$("<select/>").appendTo($("<div/>").appendTo(this.wrapper).css({margin:marg}))
    for (var newcm of cb2use){
        if (newcm in this.pal.colormaps){
            cp.append("<option>"+newcm+"</option>")}
        else {console.log(newcm+" not a known colormap!")}
    }
    var self=this
    cp.selectmenu({
            change: function(event, data){
                this.pal.gradientScale(this.pal.colormaps[data.item.label]);
                this.cb_rect.attr({fill:this.pal.cb_grad})
                this.draw();
            }.bind(this),
            width: "100%"
        })
        .data("ui-selectmenu")

        ._renderItem=function(ul, item) {
            self.li = $( "<li>", {text: item.label});
            var im = $( "<span/>").appendTo(self.li).css('float','right');
            rr = Raphael(im[0],width/2,Math.ceil(this.button[0].clientHeight/2));
                rr.setStart();
                rr.rect(0,0,"100%","100%").attr({fill:self.pal.gradString(self.pal.colormaps[item.label])});
            rr.setFinish();

            return self.li.appendTo(ul);
        };

    cp=$( "<div/>").uniqueId().appendTo(this.wrapper)

    rr = Raphael(cp[0].id, width,cb_height);
        rr.setStart()
        this.cb_rect=rr.rect(marg,0,width-2*marg,30).attr({fill:this.pal.cb_grad});
        this.cb_tags=[]
        var ntags=5
        for (i=0; i<ntags; i++)
            this.cb_tags[i]=rr.text( i/(ntags-1)*(width-2*marg), 40,
                                    (i/(ntags-1)*(this.pal.max-this.pal.min)+this.pal.min).toFixed(2))
                              .attr({'text-anchor':'start'});    
    rr.setFinish();

    this.slider=$("<div/>").uniqueId()
                           .appendTo(this.wrapper)
                           .css({'left':marg,
                                 'width':"90%"
                             })

    this.slider.slider({min:this.inrange[0],max:this.inrange[1],range:true,
                        values:this.inrange,
                        slide:function(event, ui){
                            this.vals=ui.values;
                            console.log("DM Slider values",ui.values);
                            this.draw();
                        }.bind(this)})

    rr=Raphael($("<div style='position:relative'/>").uniqueId().css({'height':label_hgt})
                        .appendTo(this.wrapper)[0].id,width,sl_height);
        rr.canvas.style.position="absolute";
        rr.canvas.style.zIndex="100";
        rr.setStart();
        this.slider_text=[rr.text(0,13,'').attr({'font-size': 12}),
                          rr.text(0,13,'').attr({'font-size': 12})];
        this.slider_title = rr.text(width/2,30,"").attr({'font-size':14});
    rr.setFinish();

    this.plot_type = 'Magnitude';
    this.changeSliderType(this.plot_type);
    this.changeRange(this.range)
}


colorHandler.prototype.changeRange = function(range){
    this.range=range
    this.scale=(this.inrange[1]-this.inrange[0])/(this.range[1]-this.range[0])
    this.vals = this.inrange
    this.slider.slider("values",this.vals);
    this.draw()
}

colorHandler.prototype.changeSliderType = function(type){
    var img_range = {'Magnitude':[0,100],
                     'Phase':[-180,180],
                     'Real':[-100,100],
                     'Imaginary':[-100,100]};
    var img_range_description = {'Magnitude':'[dB]',
                                 'Phase':'[degrees]',
                                 'Real':'[+- abs dB]',
                                 'Imaginary':'[+- abs dB]'};
    this.slider_heading=img_range_description[type]
    this.changeRange(img_range[type])
    this.draw()
}


colorHandler.prototype.draw = function(){
    var width=this.wrapper.width()
    var marg=20

    this.pal.min=(this.vals[0]-this.inrange[0])/this.scale+this.range[0];
    this.pal.max=(this.vals[1]-this.inrange[0])/this.scale+this.range[0];

    this.slider_text[0].attr({"text":this.pal.min.toFixed(2)});
    this.slider_text[0].attr({"x":(this.vals[0]-this.inrange[0])/(this.inrange[1]-this.inrange[0])*(width-2*marg)+marg});
    this.slider_text[1].attr({"text":this.pal.max.toFixed(2)});
    this.slider_text[1].attr({"x":(this.vals[1]-this.inrange[0])/(this.inrange[1]-this.inrange[0])*(width-2*marg)+marg});    

    this.slider_title.attr({"text":'Color Bar Range '+this.slider_heading})

    for (i=0; i<this.cb_tags.length; i++)
        this.cb_tags[i].attr({"text":(i/(this.cb_tags.length-1)*(this.pal.max-this.pal.min)+this.pal.min).toFixed(2)});

    this.fireEvent("colorHandler.change",[])
}


colorHandler.prototype.processEvent = 
    function(group_name, event_name,data) {
        switch (event_name){
            case "typeSelect.change":
                this.changeSliderType(data);
                break;
            default:
                break;
        }
    }
