/**
 * Response to a DeleteSession request
 * 
 * @returns a frozen readonly object
 */
CIAPI.dto.SessionDeletionResponseDTO = function (loggedOut) {
    /**
     * LogOut status
     * @type boolean
     */
    this.LoggedOut = loggedOut;

    Object.freeze(this);
}

