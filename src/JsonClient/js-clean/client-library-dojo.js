// <copyright file="ciapi.dojo.js" company="City Index Ltd">
// Copyright (c) 2010 All Right Reserved, http://cityIndex.co.uk/
//
// THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY 
// KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
// PARTICULAR PURPOSE.
//
// </copyright>
// <author>Sky Sanders</author>
// <email>sky.sanders@gmail.com</email>
// <date>2010-11-03</date>
// <summary>provides dojo functionality for the City Index REST api</summary>


dojo.require("dojox.rpc.Service");

ciapi.dojo = {
    initialize: function () {


        // follows ciapi specific patching

        // need to patch AFTER dojox.rpc.Service has been loaded

        /* 
        * MONKEY-PATCH: Make wcf json date quirks disappear!
        * sorry, monkey jacking seems a bit difficult here so
        * be careful if you need to patch json ch elsewhere
        * just add this code to your patch.
        */

        dojo._contentHandlers.json = (function (old) {

            // patch json content handler to handle wcf dates. 
            // Any other wcf specific json issues can be handled here as well
            return function (xhr) {
                var fixed = dojo._contentHandlers.text(xhr).replace(/"\\\/Date\((\d*)\)\\\/"/g, 'new Date($1)');
                var jsob = dojo.fromJson(fixed);
                return jsob;

            }
        })(dojo._contentHandlers.json);

        /*
        *  We are leveraging intercepted query params in place of headers in response
        *  to the limited availability of request headers on potential target platforms          
        */

        ciapi.request_log = function (request) { };

        //var oldGetTransport = dojox.rpc.transportRegistry.match("GET");
        dojox.rpc.transportRegistry.unregister("GET");
        dojox.rpc.transportRegistry.register("GET", function (str) { return str == "GET"; },
        {
            fire: function (r) {
                if (r.uriTemplate && r.uriTemplate !== '/') {
                    r.target = r.target + r.uriTemplate;
                }

                if (ciapi.io.requiresCrossDomain(r.target)) {
                    r.headers = { "X-Requested-With": null };
                }

                // HACK: work around WEBKIT bug (https://bugs.webkit.org/show_bug.cgi?id=50773) setting content-type on GET breaks CORS
                if ((ciapi.browser.CHROME || ciapi.browser.SAFARI) && ciapi.io.requiresCrossDomain(r.target)) {
                    r.contentType = "text/plain"; // see patch to dojo.xhr to enable nulling of contenttype
                }


                r.target = dojox.rpc.appendQuery(r.target, "UserName=" + ciapi.session.userName + "&Session=" + ciapi.session.sessionId);

                r.url = dojox.rpc.appendQuery(r.target, r.data);

                ciapi.request_log(r);


                var deferred = dojo.xhrGet(r);

                deferred.addCallback(function (result) {
                    if (typeof (result.ErrorCode) !== 'undefined') {
                        result.message = result.ErrorMessage;
                        throw (result);
                    }
                });

                return deferred;
            }
        });



        //var oldPostTransport = dojox.rpc.transportRegistry.match("POST");
        dojox.rpc.transportRegistry.unregister("POST");
        dojox.rpc.transportRegistry.register("POST", function (str) { return str == "POST"; },
        {
            fire: function (r) {

                if (ciapi.io.requiresCrossDomain(r.target)) {
                    r.headers = { "X-Requested-With": null };
                }

                if (r.uriTemplate && r.uriTemplate !== '/') {
                    r.target = r.target + r.uriTemplate;
                }

                if (r.target.indexOf(/\/session/i) == -1) {
                    r.target = dojox.rpc.appendQuery(r.target, "UserName=" + ciapi.session.userName + "&Session=" + ciapi.session.sessionId);
                }

          

                r.url = r.target;
                r.postData = r.data;

                ciapi.request_log(r);

                var deferred = dojo.rawXhrPost(r);

                deferred.addCallback(function (result) {
                    if (typeof (result.ErrorCode) !== 'undefined') {
                        result.message = result.ErrorMessage;
                        throw (result);
                    }
                });

                return deferred;
            }
        });



        ciapi.services = new dojox.rpc.Service(ciapi.smd);


        // wrap session methods so we can catch the session id and cache it
        var oldCreateSession = ciapi.services.CreateSession;

        ciapi.services.CreateSession = function (args) {
            ciapi.session.userName = args.UserName;
            var dfd = oldCreateSession(args);

            var result = new dojo.Deferred();

            dfd.then(function (token) {
                ciapi.session.sessionId = token.Session;
                ciapi.session.loggedIn = true;
                result.callback(token);
            }, function (error) {
                delete ciapi.session.sessionId;
                ciapi.session.loggedIn = false;
                result.errback(error);
            });

            return result;

        };

        var oldDeleteSession = ciapi.services.DeleteSession;

        ciapi.services.DeleteSession = function () {

            var dfd = oldDeleteSession({
                UserName: ciapi.session.userName,
                Session: ciapi.session.sessionId
            });

            var result = new dojo.Deferred();

            dfd.then(function (status) {
                delete ciapi.session.sessionId;
                ciapi.session.loggedIn = false;
                result.callback(status);
            }, function (error) {
                result.errback(error);
            });

            return result;

        };

    }
}





