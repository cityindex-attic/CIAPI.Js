var CIAPI = CIAPI || {};
CIAPI.chart = (function($, undefined) {

    console.log('initialising CIAPI.chart');
    /**
     * Class: $.jqplot.ciParser
     * Data Renderer function which converts a custom JSON data object into jqPlot data format.
     * Set this as a callable on the jqplot dataRenderer plot option:
     *
     * > plot = $.jqplot('mychart', [data], { dataRenderer: $.jqplot.ciParser, ... });
     *
     * Where data is an object in JSON format or a JSON encoded string conforming to the
     * City Index API spec.
     *
     * Note that calling the renderer function is handled internally by jqPlot.  The
     * user does not have to call the function.  The parameters described below will
     * automatically be passed to the ciParser function.
     *
     * Parameters:
     * data - JSON encoded string or object.
     * plot - reference to jqPlot Plot object.
     *
     * Returns:
     * data array in jqPlot format.
     *
     */
    $.jqplot.ciParser = function (data, plot) {
        var ret = [],
            line,
            i, j, k, kk;

         if (typeof(data) == "string") {
             data =  $.jqplot.JSON.parse(data, handleStrings);
         }

         else if (typeof(data) == "object") {
             for (k in data) {
                 for (i=0; i<data[k].length; i++) {
                     for (kk in data[k][i]) {
                         data[k][i][kk] = handleStrings(kk, data[k][i][kk]);
                     }
                 }
             }
         }

         else {
             return null;
         }

         // function handleStrings
         // Checks any JSON encoded strings to see if they are
         // encoded dates.  If so, pull out the timestamp.
         // Expects dates to be represented by js timestamps.

         function handleStrings(key, value) {
            var a;
            if (value != null) {
                if (value.toString().indexOf('Date') >= 0) {
                    //here we will try to extract the ticks from the Date string in the "value" fields of JSON returned data
                    a = /^\/Date\((-?[0-9]+)\)\/$/.exec(value);
                    if (a) {
                        return parseInt(a[1], 10);
                    }
                }
                return value;
            }
         }

        for (var prop in data) {
            line = [];
            temp = data[prop];
            switch (prop) {
                case "PartialPriceBar":
                        line.push([handleStrings(null, temp['BarDate']), temp['Open'], temp['High'], temp['Low'], temp['Close']]);
                    break;
                case "PriceBars":
                    for (i=0; i<temp.length; i++) {
                        line.push([temp[i]['BarDate'], temp[i]['Open'], temp[i]['High'], temp[i]['Low'], temp[i]['Close']]);
                    }
                    break;
            }
            ret.push(line);
        }
        return ret;
    };

    function sanitise(data) {
        if (data.PriceBars["__ko_proto__"] === undefined)
        {
            return data;
        }

        var priceBars = ko.mapping.toJS(data);
        return priceBars;
    }

    var createdCharts = {};
    function plotCandleStickChart(chartInfo) {
		var rangeInfo, theChart, standardRenderOptions, theChart, chartData;
        jQuery.jqplot.config.enablePlugins = true; // on the page before plot creation.
        standardRenderOptions = {
                renderer:$.jqplot.OHLCRenderer,
                rendererOptions: {
                    candleStick:true,
                    fillUpBody:true,
                    upBodyColor:'#66FF00',
                    downBodyColor:'#FF0000'}
                };

        try
        {
            chartData = sanitise(chartInfo.data);
            if (!createdCharts[chartInfo.id]) {
              createdCharts[chartInfo.id] = $.jqplot(chartInfo.id, chartData, {
              title: chartInfo.title,
              dataRenderer: $.jqplot.ciParser,
              grid: {
                gridLineColor: '#555555',
                background: '#000000',
                borderColor:'#000000',
                shadow: false
              },
              cursor:{
                show: true,
                style: 'crosshair',
                zoom:true,
                showTooltip:true,
                tooltipLocation: 'sw'

              },
              axesDefaults: {
                  tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                  tickOptions: {
                    fontSize: '12px'
                  }
              },
              axes: {
                  xaxis: {
                      renderer:$.jqplot.DateAxisRenderer,
                      tickInterval: '5 minute',
                      tickOptions:{
                          formatString:'%H:%m:%S',
                          angle: -60
                      }
                  },
                  yaxis: {
                      tickOptions:{
                          formatString:'%.2f'
                      }
                  }
              },
              series: [
                  standardRenderOptions,
                  standardRenderOptions
              ],
              highlighter: {
                  show: true,
                  showMarker:false,
                  tooltipAxes: 'xy',
                  yvalues: 4,
                  formatString:'<table class="jqplot-highlighter">' +
                                '<tr><td>Date:</td><td>%s</td></tr>' +
                                '<tr><td>Open:</td><td>%s</td></tr>' +
                                '<tr><td>Hi:</td><td>%s</td></tr>' +
                                '<tr><td>Low:</td><td>%s</td></tr> ' +
                                '<tr><td>Close:</td><td>%s</td></tr></table>'
                }
            });
          }
          else {
                var newData = $.jqplot.ciParser(chartData);
                var theChart = createdCharts[chartInfo.id];

                theChart.series[0].data = newData[0];
                theChart.series[1].data = newData[1];

                theChart.replot({resetAxes:true})
          }
        }
        catch(error)
        {
            console.log(error);
        }

	};

    return {
        plotCandlestickChart: plotCandleStickChart
    };

})(jQuery);
