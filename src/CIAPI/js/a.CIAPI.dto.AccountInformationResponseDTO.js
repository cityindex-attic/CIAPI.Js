/**
 * response from an account information query
 * @constructor
 *
 *
 * @returns a frozen readonly object
 */
CIAPI.dto.AccountInformationResponseDTO = function(logonUserName, clientAccountId, clientAccountCurrency, tradingAccounts){
    /**
     * logon user name
     * @type String
     */
    this.LogonUserName = logonUserName; /**
     * logon user name
     * @type Number
     */
    this.ClientAccountId = clientAccountId;
    /**
     * client account id
     * @type String
     */
    this.ClientAccountCurrency = clientAccountCurrency;
    /**
     * Base currency of the client account
     * @type String
     */
    this.TradingAccounts = tradingAccounts;

    Object.freeze(this);
}

