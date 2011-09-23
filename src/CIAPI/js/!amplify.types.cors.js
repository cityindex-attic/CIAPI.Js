/*  jQuery.flXHRproxy 2.0a <http://flxhr.flensed.com/>
    Copyright (c) 2009-2011 Kyle Simpson
    Contributions by Julian Aubourg
    This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>

    This plugin causes jQuery to treat flXHR as an XHR object, as a replacement of the native XHR, additionally
    allowing authorized cross-domain communication through flash's crossdomain.xml policy model.

    This plugin allows an author to register a set of flXHR configuration options to be tied to each URL
    that will be communicated with. Typical usage might be:

    jQuery.flXHRproxy.registerOptions('http://www.mydomain.com/',{xmlResponseText:false...});
    jQuery.flXHRproxy.registerOptions('http://rss.mydomain.com/',{xmlResponseText:true...});
    ...
    jQuery.ajax({url:'http://www.mydomain.com/something.html'...});
    ...
    jQuery.ajax({url:'http://rss.mydomain.com/feed.html'...});

*/

(function($){
    $.flXHRproxy = flensed.flXHR;   // make jQuery.flXHRproxy a reference alias to flensed.flXHR, for convenience

    var _opts = [],
        r_type = /^(?:post|get)$/i,
        defaultOptions = {
            instancePooling: true,
            autoUpdatePlayer: true
        }
    ;

    $.flXHRproxy.registerOptions = function(url,fopts) {    // call to define a set of flXHR options to be applied to a
                                                            // matching request URL
        fopts = $.extend( {}, defaultOptions, fopts || {} );

        _opts.push(function(callUrl) {  // save this set of options with a matching function for the target URL
            if (callUrl.substring(0,url.length)===url) return fopts;
        });
    };

    // Prefilter to control if we need to use flXHR
    $.ajaxPrefilter(function( as ) {
        var useopts, tmp;
        if ( as.async && r_type.test( as.type ) ) {
            for (var i=0; i<_opts.length; i++) {    // loop through all registered options for flXHR
                if (tmp = _opts[i](as.url)) useopts = tmp;  // if URL match is found, use those flXHR options
            }

            // Use flXHR if we have options OR if said to do so
            // with the explicit as.flXHR option
            if ( useopts || as.flXHR ) {
                as.flXHROptions = useopts || defaultOptions;
                // Derail the transport selection
                return "__flxhr__";
            }
        }
    });

    // flXHR transport
    $.ajaxTransport( "__flxhr__", function( as, _, jqXHR ) {
        // Remove the fake dataType
        as.dataTypes.shift();
        // Make sure it won't be trigerred for async requests
        // if the dataType is set manually (users can be crazy)
        if ( !as.async ) {
            return;
        }
        // The flXHR instance
        var callback;
        // The transport
        return {
            send: function( headers, complete ) {
                var options = as.flXHROptions || defaultOptions,
                    xhr = jqXHR.__flXHR__ = new $.flXHRproxy( options ),
                    isError;
                // Define callback
                callback = function( status, error ) {
                    if ( callback && ( error || xhr.readyState === 4 ) ) {
                        callback = xhr.onreadystatechange = xhr.onerror = null;
                        if ( error ) {
                            if (! ( isError = ( error !== "abort" ) ) ) {
                                xhr.abort();
                            }
                            complete( status, error );
                        } else {
                            var responses = {},
                                responseXML = xhr.responseXML;
                            if ( responseXML && responseXML.documentElement ) {
                                responses.xml = responseXML;
                            }
                            responses.text = xhr.responseText;
                            complete( xhr.status, xhr.statusText, responses, xhr.getAllResponseHeaders() );
                        }
                    }
                };
                // Attach onerror handler
                if ( $.isFunction( options.onerror ) ) {
                    jqXHR.fail(function() {
                        if ( isError ) {
                            options.onerror.apply( this, arguments );
                        }
                    });
                }
                // Attach xhr handlers
                xhr.onreadystatechange = callback;
                xhr.onerror = function( flXHR_errorObj ) {
                    complete( -1, flXHR_errorObj );
                };
                // Issue the request
                xhr.open( as.type, as.url, as.async, as.username, as.password );
                for ( var i in headers ) {
                    xhr.setRequestHeader( i, headers[ i ] );
                }
                xhr.send( ( as.hasContent && as.data ) || null );
            },
            abort: function() {
                if ( callback ) {
                    callback( 0, "abort" );
                }
            }
        };
    });

})(jQuery);

/**** the amplify.request.types.cors type *****/

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
                        if (xhr.__flXHR__) console.log("WARNING: This browser requires the use of flXHR for CORS requests, which does not allow setting request headers.  Either use a different browser, or do not set request headers");
                        return xhr.setRequestHeader( name, value );
                    },
                    getAllResponseHeaders: function() {
                        if (xhr.__flXHR__) {
                            console.log("WARNING: This browser requires the use of flXHR for CORS requests, which does not allow access to response headers.  Either use a different browser, or do not attempt to access response headers");
                            return "";
                        }
                        var headers = xhr.getAllResponseHeaders();
                        if (!headers)
                        {
                            console.log("WARNING: This browser isn't allowing access to the response headers.  This could be because the browser doesn't allow accessing response headers in CORS requests; or the server is not returning the Access-Control-Expose-Headers: header1, header2, etc...");
                            return "";
                        }
                        return headers;
                    },
                    getResponseHeader: function( key ) {
                        if (xhr.__flXHR__) {
                            console.log("WARNING: This browser requires the use of flXHR for CORS requests, which does not allow access to response headers.  Either use a different browser, or do not attempt to access response headers");
                            return "";
                        }
                        var header =  xhr.getResponseHeader( key );
                        if (!header)
                        {
                            console.log("WARNING: This browser isn't allowing access to the  " + key + " response header.  This could be because the browser doesn't allow accessing response headers in CORS requests; or the server is not returning the Access-Control-Expose-Headers: " + key + " header");
                            return "";
                        }
                        return header;
                        return
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
            if (!$.support.cors) {
               ajaxSettings.flXHR = true;
            }
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