(function($, undefined) {

    function init() {
		var idx, priceBarsMinute, currentBar;
		var idx, priceBarsMinute, currentBar;
        jQuery.jqplot.config.enablePlugins = true; // on the page before plot creation.
        priceBarsMinute = CIAPI.services.GetPriceBars(36246, 'minute', 1, 50);

        priceBarsMinute.RangeData = { Min: 1, Max:2 };
        for(idx in priceBarsMinute.PriceBars) {
            currentBar = priceBarsMinute.PriceBars[idx];

            if (currentBar.High > priceBarsMinute.RangeData.Max) {
                priceBarsMinute.RangeData.Max =  currentBar.High;
            }
            if (currentBar.Low < priceBarsMinute.RangeData.Min) {
                priceBarsMinute.RangeData.Min =  currentBar.Low;
            }
        }

        chart1 = $.jqplot('chart1', priceBarsMinute, {
          title:'1 minute',
          dataRenderer: $.jqplot.ciParser,
          axes: {
              xaxis: {
                  renderer:$.jqplot.DateAxisRenderer,
                  tickInterval: '1 minute',
                  tickOptions:{formatString:'%H:%m:%S'}
              },
              yaxis: {
                  tickOptions:{formatString:'%.4f'},
                  min: priceBarsMinute.RangeData.Min,
                  max: priceBarsMinute.RangeData.Max
              }
          },
          series: [
            {renderer:$.jqplot.OHLCRenderer, rendererOptions:{candleStick:true}},
            {renderer:$.jqplot.OHLCRenderer, rendererOptions:{candleStick:true}}]
        });
	};

    $(document).ready(function() {
       CIAPI.log('initialising charts');
       init();
    });

})(jQuery);