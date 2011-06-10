(function(amplify, $, undefined) {

    var xhrProps = [ "status", "statusText", "responseText", "responseXML", "readyState" ],
        rurlData = /\{([^\}]+)\}/g;

    amplify.request.types.cors = function( defnSettings ) {
        defnSettings = $.extend({
            type: "GET"
        }, defnSettings );

        return function( settings, request ) {
            var xhr,
                url = defnSettings.url,
                data = settings.data,
                abort = request.abort,
                ajaxSettings = {},
                mappedKeys = [],
                aborted = false,
                ampXHR = {
                    readyState: 0,
                    setRequestHeader: function( name, value ) {
                        return xhr.setRequestHeader( name, value );
                    },
                    getAllResponseHeaders: function() {
                        return xhr.getAllResponseHeaders();
                    },
                    getResponseHeader: function( key ) {
                        return xhr.getResponseHeader( key );
                    },
                    overrideMimeType: function( type ) {
                        return xhr.overrideMideType( type );
                    },
                    abort: function() {
                        aborted = true;
                        try {
                            xhr.abort();
                        // IE 7 throws an error when trying to abort
                        } catch( e ) {}
                        handleResponse( null, "abort" );
                    },
                    success: function( data, status ) {
                        settings.success( data, status );
                    },
                    error: function( data, status ) {
                        settings.error( data, status );
                    }
                };

            if ( typeof data !== "string" ) {
                data = $.extend( true, {}, defnSettings.data, data );

                url = url.replace( rurlData, function ( m, key ) {
                    if ( key in data ) {
                        mappedKeys.push( key );
                        return data[ key ];
                    }
                });

                // We delete the keys later so duplicates are still replaced
                $.each( mappedKeys, function ( i, key ) {
                    delete data[ key ];
                });
            }

            $.extend( ajaxSettings, defnSettings, {
                url: url,
                type: defnSettings.type,
                data: data,
                dataType: defnSettings.dataType,
                success: function( data, status ) {
                    handleResponse( data, status );
                },
                error: function( _xhr, status ) {
                    handleResponse( null, status );
                },
                beforeSend: function( _xhr, _ajaxSettings ) {
                    xhr = _xhr;
                    ajaxSettings = _ajaxSettings;
                    var ret = defnSettings.beforeSend ?
                        defnSettings.beforeSend.call( this, ampXHR, ajaxSettings ) : true;
                    return ret && amplify.publish( "request.before.ajax",
                        defnSettings, settings, ajaxSettings, ampXHR );
                }
            });
            $.ajax( ajaxSettings );

            function handleResponse( data, status ) {
                $.each( xhrProps, function( i, key ) {
                    try {
                        ampXHR[ key ] = xhr[ key ];
                    } catch( e ) {}
                });
                // Playbook returns "HTTP/1.1 200 OK"
                // TODO: something also returns "OK", what?
                if ( /OK$/.test( ampXHR.statusText ) ) {
                    ampXHR.statusText = "success";
                }
                if ( data === undefined ) {
                    // TODO: add support for ajax errors with data
                    data = null;
                }
                if ( aborted ) {
                    status = "abort";
                }
                if ( /timeout|error|abort/.test( status ) ) {
                    ampXHR.error( data, status );
                } else {
                    ampXHR.success( data, status );
                }
                // avoid handling a response multiple times
                // this can happen if a request is aborted
                // TODO: figure out if this breaks polling or multi-part responses
                handleResponse = $.noop;
            }

            request.abort = function() {
                ampXHR.abort();
                abort.call( this );
            };
        };
    };
})(amplify, jQuery);