(function () {

    function hasXDR() {
        if (ciConfig && ciConfig.DISABLEXDR) {
            return false;
        }
        return typeof (XDomainRequest) !== "undefined";
    }

    function hasCORS() {
        if (ciConfig && ciConfig.DISABLECORS) {
            return false;
        }
        return "withCredentials" in new XMLHttpRequest();
    }

    function hasFlXHR() {
        if (ciConfig && ciConfig.DISABLEFLXHR) {
            return false;
        }
        return (typeof (flensed) !== 'undefined' && flensed.flXHR);
    }

    function requiresCrossDomain(url) {
        var result = false;
        if (ciConfig && ciConfig.XDRTEST) {
            result = true;
        }

        else {
            var hereHost = window.location.hostname.toLowerCase();
            var thereHost = /(http|https):\/\/([\w\.]+)/i.exec(url)[2].toLowerCase();
            if (ciapi.browser.MSIE) {
                // ie xhr considers same host local
                result = hereHost != thereHost;
            }
            else {
                // other implementations consider same host, same port local
                var herePort = window.location.port || "80";
                var therePort = /(http|https):\/\/[\w\.]+:(\d+)/i.exec(url);

                if (therePort) {
                    therePort = therePort[2];
                }
                else {
                    therePort = "80";
                }
                result = hereHost != thereHost || herePort != therePort;
            }
        }

        return result;

    }

    function isApiRequest(url) {
        return url.toUpperCase().indexOf(ciapi.smd.target.toUpperCase()) == -1;
    }

    function xhrSuccess(xhr) {
        // currently unused but will be needed 
        var ok = false;
        try {
            // IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
            // Opera returns 0 when status is 304
            ok = !xhr.status && location.protocol === "file:" || (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || xhr.status === 1223 || xhr.status === 0;

        } catch (e) {
            alert("error");
        }
        return ok;

    }

    function toAbsoluteUrl(baseUrl, relativeUrl) {
        if (relativeUrl.match(/\w+:\/\//)) {
            return relativeUrl;
        }
        if (relativeUrl.charAt(0) == '/') {
            baseUrl = baseUrl.match(/.*\/\/[^\/]+/);
            return baseUrl ? baseUrl[0] + relativeUrl : relativeUrl; // TODO: TEST THIS
        }
        baseUrl = baseUrl.substring(0, baseUrl.length - baseUrl.match(/[^\/]*$/)[0].length); // clean off the trailing path
        if (relativeUrl == '.') {
            return baseUrl;
        }
        while (relativeUrl.substring(0, 3) == '../') {
            baseUrl = baseUrl.substring(0, baseUrl.length - baseUrl.match(/[^\/]*\/$/)[0].length);
            relativeUrl = relativeUrl.substring(3);
        }
        return baseUrl + relativeUrl;
    }


    CIAPI.io = {
        requiresCrossDomain: requiresCrossDomain,
        applyUriTemplate: function (target, data) {
            var returnData = {};
            for (var key in data) {
                var uriTemplateRx = new RegExp("{" + key + "}", "gi")
                if (uriTemplateRx.test(target)) {
                    target = target.replace(uriTemplateRx, encodeURIComponent(data[key]));
                }
                else {
                    returnData[key] = data[key];
                }
            }
            return {
                target: target,
                data: returnData
            };
        },
        appendQuery: function (url, query) {
            var result = url + (query ? (url.indexOf('?') > -1 ? '&' : '?') + query : '');
            return result;
        },
        queryString: function () {
            var qsParm = [];
            var query = window.location.search.substring(1);
            var parms = query.split('&');
            for (var i = 0; i < parms.length; i++) {
                var pos = parms[i].indexOf('=');
                if (pos > 0) {
                    var key = parms[i].substring(0, pos);
                    var val = parms[i].substring(pos + 1);
                    qsParm[key] = val;
                }
            }
            return qsParm;
        },
        getTransport: function (url) {
            url = toAbsoluteUrl(location.href, url);
            if (!requiresCrossDomain(url) || hasCORS() || isApiRequest(url)) {
                return "XHR" + (requiresCrossDomain(url) ? "-CORS" : "");
            }
            if (hasXDR()) {
                return "XDR";
            }
            if (hasFlXHR()) {
                return "FLXHR";
            }
            return "ERROR";
        },
        xhr: function (args) {
            var url = toAbsoluteUrl(location.href, args.url);
            var transport = ciapi.io.getTransport(url);
            switch (transport) {
                case "XHR":
                case "XHR-CORS":

                    var xhr = typeof (ciapi.io.xhr.originalXHR) !== 'undefined'
                    ? ciapi.io.xhr.originalXHR.apply(this, arguments)
                    : new XMLHttpRequest();




                    return xhr;

                case "XDR":
                    var xdr = new XDomainRequest();
                    xdr.readyState = 1;
                    xdr.setRequestHeader = function () { }; // just absorb them, we can't set headers :/
                    xdr.getResponseHeader = function (header) { // this is the only header we can access 
                        return header.toLowerCase() == "content-type" ? "application/json" : null;
                    }
                    // adapt the xdr handlers to xhr
                    function handler(status, readyState) {
                        return function () {
                            xdr.readyState = readyState;
                            xdr.status = status;
                            if (xdr.onreadystatechange) { xdr.onreadystatechange(); }
                        }
                    }
                    xdr.onload = handler(200, 4);
                    xdr.onprogress = handler(200, 3);
                    xdr.onerror = handler(404, 4); // an error, who knows what the real status is
                    return xdr;
                case "FLXHR":
                    // TODO: use object pooling
                    var flproxy = new flensed.flXHR({ autoUpdatePlayer: true });
                    flproxy.oldOpen = flproxy.open;
                    flproxy.open = function (method, url, async) {
                        flproxy.oldOpen(method, url, async);
                        var origin = location.protocol + "//" + location.host;
                    };

                    flproxy.xmlResponseText = false;

                    // need to monkey-patch this to behave consistently regardless of platform

                    // need to monkey-patch this to behave consistently regardless of platform
                    var getResponseHeader = flproxy.getResponseHeader;

                    flproxy.getResponseHeader = function (header) {
                        return header.toLowerCase() == "content-type" ? "application/json" : null;
                    }

                    return flproxy;
                case "ERROR":
                default:
                    throw {
                        message: "cross domain capability required but not present",
                        args: args
                    };
            }
        }
    }

    // now plug in to frameworks
    if (typeof (jQuery) !== 'undefined') {
        jQuery.xhr.register('ciapi', ciapi.io.xhr);
    }

    if (typeof (dojo) !== 'undefined') {
        ciapi.io.xhr.originalXHR = dojo._xhrObj;
        dojo._xhrObj = ciapi.io.xhr;
    }

})(); 