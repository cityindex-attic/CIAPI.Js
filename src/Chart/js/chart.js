(function($, undefined) {

    function calculateRangeData(priceBars)
    {
        var idx, currentBar,
            rangeData = { Min: 99999, Max:-99999 };
        for(idx in priceBars.PriceBars) {
            currentBar = priceBars.PriceBars[idx];

            if (currentBar.High > rangeData.Max) {
                rangeData.Max =  currentBar.High * 1.5;
            }
            if (currentBar.Low < rangeData.Min) {
                rangeData.Min = currentBar.Low * 0.9;
            }
        }
        return rangeData;
    }

    function plotCandleStickChart(chartInfo) {
		var rangeInfo, theChart, myRenderOptions;
        jQuery.jqplot.config.enablePlugins = true; // on the page before plot creation.

        rangeInfo = calculateRangeData(chartInfo.data);
        myRenderOptions = {
                renderer:$.jqplot.OHLCRenderer,
                rendererOptions: {
                    candleStick:true,
                    fillUpBody:true,
                    upBodyColor:'#66FF00',
                    downBodyColor:'#FF0000'}
                };
        theChart = $.jqplot(chartInfo.id, chartInfo.data, {
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
              },
              pad: 1.05
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
                      formatString:'%.4f'
                  }
              }
          },
          series: [
              myRenderOptions,
              myRenderOptions
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
	};

    $(document).ready(function() {
       CIAPI.log('initialising charts');
       plotCandleStickChart({
           id: 'chart1',
           title: '1 minute',
           data: CIAPI.services.GetPriceBars(36246, 'minute', 1, 100)
       });
       plotCandleStickChart({
           id: 'chart2',
           title: '1 minute',
           data: CIAPI.services.GetPriceBars(36246, 'minute', 1, 10)
       });
    });

})(jQuery);