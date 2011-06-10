/**
 * Response to a CreateSessionRequest
 * @constructor
 *
 * @param httpStatus Your session token (treat as a random string) Session tokens are valid for a set period from the time of their creation. The period is subject to change, and may vary depending on who you logon as.
 *
 * @returns a frozen readonly object
 */
CIAPI.dto.CreateSessionResponseDTO = function(session){
    /**
     * Your session token (treat as a random string) Session tokens are valid for a set period from the time of their creation. The period is subject to change, and may vary depending on who you logon as.
     * @type String
     */
    this.Session = session;

    Object.freeze(this);
}

