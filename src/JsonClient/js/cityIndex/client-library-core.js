// <copyright file="ciapi.core.js" company="City Index Ltd">
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
// <summary>provides core functionality for the City Index REST api</summary>


var ciapi = {
    session: {
        sessionId: null,
        userName: null,
        loggedIn: false
    },
    schema: null,
    smd: null,
    initialize: function (smd, schema) {
        ciapi.smd = smd;
        ciapi.schema = schema;

        if (typeof (ciapi.codeGeneration) !== 'undefined') {
            ciapi.codeGeneration.initialize();
        }

        if (typeof (ciapi.documentation) !== 'undefined') {
            ciapi.documentation.initialize();
        }

        if (typeof (ciapi.dojo) !== 'undefined') {
            ciapi.dojo.initialize();
        }
    },
    browser: {}
};

(function () {
    var ua = navigator.userAgent.toLocaleLowerCase();
    // warning: order of execution is important
    if (ua.indexOf("msie") > -1) {
        ciapi.browser.MSIE = true;
        // TODO: version
    }
    else if (ua.indexOf("opera") > -1) {
        ciapi.browser.OPERA = true;
    }
    else if (ua.indexOf("firefox") > -1) {
        ciapi.browser.FIREFOX = true;
    }
    else if (ua.indexOf("chrome") > -1) {
        ciapi.browser.CHROME = true;
    }
    else if (ua.indexOf("safari") > -1) {
        ciapi.browser.SAFARI = true;
    }
})();