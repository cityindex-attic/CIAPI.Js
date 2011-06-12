/* */
CIAPI.dto.PriceDTO = function(marketId, tickDate, bid, offer) {

    this.MarketId = marketId;
    this.TickDate = tickDate;
    this.Bid = bid;
    this.Offer = offer;

    Object.freeze(this);
};
