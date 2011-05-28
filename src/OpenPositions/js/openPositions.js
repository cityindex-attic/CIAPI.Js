(function($, undefined) {
    $.widget("CIAPI.CIAPI_OpenPositionsWidget", {
        options: {

        },
        _viewModel: {},
        _createViewModel: function(openPositions) {
           var viewModel = this._viewModel,
               widget = this;

           viewModel = this._viewModel = ko.mapping.fromJS({ openPositions : openPositions });

           ko.utils.arrayForEach(this._viewModel.openPositions(), function(item) {
                item.isSelected = ko.observable(false);
                item.isHighlighted = ko.observable(false);
            });
           this._viewModel.changeSelectedRow = function(openPosition, event) {
               //Ensure every rows .isSelected(false) except for the selected row
               ko.utils.arrayForEach(viewModel.openPositions(), function(item) {
                   if (item===openPosition)
                   {
                       item.isSelected(true);
                   }
                   else
                   {
                       item.isSelected(false);
                   }
               });
               widget._updateChart(openPosition);
           }
           this._viewModel.highlightRow = function (context, event) {
               context.isHighlighted(true);
           }
           this._viewModel.clearRowHighlight = function(context, event) {
               context.isHighlighted(false);
           }
        },
        _injectTemplate:function () {
            $('#OpenPositionsWidgetTemplate').tmpl({}).appendTo(this.element);
        },
        _create: function() {
            this.element.addClass('CIAPI_OpenPositionsWidget');

            var openPositions = [
                {
                    marketName: "Market 1",
                    openPrice: 1.3625,
                    currentPrice: { bid: 1.526 },
                    profit: 100,
                    priceHistory: CIAPI.services.GetPriceBars(1, 'minute', 1, 100)
                },
                {
                    marketName: "Market 2",
                    openPrice: 1.3625,
                    currentPrice: { bid: 1.526 },
                    profit: 100,
                    priceHistory: CIAPI.services.GetPriceBars(2, 'minute', 1, 100)
                },
                {
                    marketName: "Market 3",
                    openPrice: 1.3625,
                    currentPrice: { bid: 1.526 },
                    profit: 100,
                    priceHistory: CIAPI.services.GetPriceBars(3, 'minute', 1, 100)
                },
                {
                    marketName: "Market 4",
                    openPrice: 1.3625,
                    currentPrice: { bid: 1.526 },
                    profit: 100,
                    priceHistory: CIAPI.services.GetPriceBars(4, 'minute', 1, 100)
                },
                {
                    marketName: "Market 5",
                    openPrice: 1.3625,
                    currentPrice: { bid: 1.526 },
                    profit: 100,
                    priceHistory: CIAPI.services.GetPriceBars(5, 'minute', 1, 100)
                }
            ];
            this._createViewModel(openPositions);
            this._injectTemplate();
            ko.applyBindings(this._viewModel, this.element.get(0));

            this._viewModel.changeSelectedRow(this._viewModel.openPositions()[0]);
        },
        destroy: function() {
            this.element.removeClass('CIAPI_OpenPositionsWidget');
            $.Widget.prototype.destroy.call(this);
        },
        _updateChart:function (openPosition) {
            console.log('plotting chart for', openPosition);
            CIAPI.chart.plotCandlestickChart({
                id: 'chart',
                title: '1 minute',
                data: openPosition.priceHistory
            });
        }
    });
})(jQuery);
