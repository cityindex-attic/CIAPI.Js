/* */
CIAPI.dto.PriceDTO = function(marketId, tickDate, bid, offer, change) {

    this.MarketId = marketId;
    this.TickDate = tickDate;
    this.Bid = bid;
    this.Offer = offer;
    this.Change = change;

    Object.freeze(this);
};
