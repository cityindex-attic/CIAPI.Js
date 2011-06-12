/**
 * Contains the result of a ListCfdMarkets query
 * @constructor
 *
 * @param markets A list of CFD markets
 *
 * @returns a frozen readonly object
 */
CIAPI.dto.ListCfdMarketsResponseDTO = function(markets){

    this.Markets = markets;

    Object.freeze(this);
};

