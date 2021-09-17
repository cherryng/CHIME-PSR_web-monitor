/*
 * Adds the color slider and defines the logic on slider change.
 */
sliderbar.prototype = new widget();
function sliderbar(target,mh,mg){
    widget.call(this,mh,mg);
    this.target=target
    this.jqtarget=$("#"+this.target)

 
    //var width = 100;
    var width = this.jqtarget.width() -0 ;
    var height = this.jqtarget.height() -0 ;
    console.log("Hi from bars. width=",width);

    var cp=$("<div/>")
        .attr({'id':'main'})
        .css({'cursor':'pointer'})
        //,'margin':0,'width':360,
          .appendTo($("#"+this.target));


    $("#"+this.target).append( "<p>DM range</p>" );

    this.slider=$("<div/>").uniqueId()
                           .appendTo($("#"+this.target))
                           .css({'left':'90px','top':'-10px',
                                 'width':"65%",'height':'5%',
                                 'border': 'solid 1px red'
                             })

    this.slider.slider({min:0,max:1300,range:true,
                        values:[  0,1300 ],
                        slide:function(event, ui){
                            this.vals=ui.values;
                            console.log("Slider got new values",this.vals);
                            this.slider.find(".ui-slider-handle:first").text(this.vals[0]);
                            this.slider.find(".ui-slider-handle:last").text(this.vals[1]);
                            this.fireEvent("DMrange.change",this.vals)
                            //this.draw(this.vals);
                        }.bind(this)})

   $("#"+this.target).append( "<p>Flux range</p>" );

    this.sliderFlux=$("<div/>").uniqueId()
                           .appendTo($("#"+this.target))
                           .css({'left':'90px','top':'-10px',
                                 'width':"65%",'height':'5%',
                                 'border': 'solid 1px blue'
                             })

    this.sliderFlux.slider({min:0,max:1300,range:true,
                        values:[  0,1300 ],
                        slide:function(event, ui){
                            this.valsFlux=ui.values;
                            console.log("Slider Flux got new values",this.valsFlux);
                            this.sliderFlux.find(".ui-slider-handle:first").text(this.valsFlux[0]);
                            this.sliderFlux.find(".ui-slider-handle:last").text(this.valsFlux[1]);
                            this.fireEvent("Flux.change",this.valsFlux)
                            //this.draw(this.vals);
                        }.bind(this)})


}


sliderbar.prototype.processEvent =
    function(group_name, event_name,data) {
    switch (event_name){
    }
}
