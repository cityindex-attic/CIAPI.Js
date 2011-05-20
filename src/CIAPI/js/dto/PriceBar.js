/**
    @namespace DTOs relating to the API
*/
CIAPI.dtos = CIAPI.dtos || {};

/**
 * The details of a specific price bar, useful for plotting candlestick charts
 * @constructor
 *
 * @param barDate The date of the start of the price bar interval
 * @param open For the equities model of charting, this is the price at the start of the price bar interval.
 * @param high The highest price occurring during the interval of the price bar
 * @param low The lowest price occurring during the interval of the price bar
 * @param close The price at the end of the price bar interval
 *
 * @returns a frozen readonly object
 */
CIAPI.dtos.PriceBarDTO = function(barDate, open, high, low, high){
    /**
     * The date of the start of the price bar interval
     * @type Date
     */
    this.BarDate = barDate;

     /**
     * For the equities model of charting, this is the price at the start of the price bar interval.
     * @type Number
     */
    this.Open = open;

    /**
     * The highest price occurring during the interval of the price bar
     * @type Number
     */
    this.High = high;

    /**
     * The lowest price occurring during the interval of the price bar
     * @type Number
     */
    this.Low = low;

    /**
     * The price at the end of the price bar interval
     * @type Number
     */
    this.Close = close;



    Object.freeze(this);
}

