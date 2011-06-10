/**
 * Details of an error
 * @constructor
 *
 * @param httpStatus The (desired) HTTP status of the error message
 * @param errorCode The (detailed) error code
 * @param errorMessage A description of the error
 *
 * @returns a frozen readonly object
 */
CIAPI.dto.ApiErrorResponseDTO = function(httpStatus, errorCode, errorMessage){
    /**
     * The (desired) HTTP status of the error message
     * @type Number
     */
    this.HttpStatus = httpStatus;

     /**
     * The (detailed) error code
     * @type Number
     */
    this.ErrorCode = errorCode;

    /**
     * A description of the error
     * @type String
     */
    this.ErrorMessage = errorMessage;

    Object.freeze(this);
}

