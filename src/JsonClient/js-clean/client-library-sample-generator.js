// <copyright file="ciapi.sample.generator.js" company="City Index Ltd">
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
// <summary>provides sample code and type exemplar generation for the City Index REST API Explorer</summary>

// simply include this file and exemplars and samples will be generated 

// NOTE: this code is not general purpose code. i.e. it will likely not
// generate sample code or type exemplars for schema/smd that do not closely
// resemble those that it was written against (ciapi smd and schema)



ciapi.codeGeneration = {
    smd: null,
    schema: null,
    methods: {
        jquery: {
            samples: {},
            tests: {}
        },
        ciapi: {
            samples: {},
            tests: {}
        }
    },
    initialize: function () {

        ciapi.codeGeneration.generateTypes();
        ciapi.codeGeneration.generateMethods();
    },

    generateTypes: function () {
        /// <summary>returns an array of exemplar instances of each schema type</summary>
        try {
            // deep clone - and expose the copy for future use
            var localSchema = ciapi.codeGeneration.schema = JSON.parse(JSON.stringify(ciapi.schema));


            // resolve all first generation properties
            // inheritance will be applied recursively and
            // exemplar types will be built from demoValue, if present,
            // and the type default if not

            for (var schemaName in localSchema) {
                ciapi.codeGeneration.internal.resolve_schema(localSchema, "#." + schemaName);
            }


        } catch (e) {
            debugger;
            console.error(e.message);
            throw { message: "type exemplar generation error", inner: e };
        }
    },


    generateMethods: function () {
        // TODO: change jquery deleteSession (DELETE) to use post with parameters
        try {
            // alias

            // make a deep clone and expose it for future use
            var smd = ciapi.codeGeneration.smd = JSON.parse(JSON.stringify(ciapi.smd));

            var internal = ciapi.codeGeneration.internal;
            var templates = ciapi.codeGeneration.templates;

            var root_target = smd.target;
            var session_params = smd.services.CreateSession.parameters;



            var auth_ci = internal.apply_credentials_template(root_target, session_params, templates.auth_template_ci);
            var auth_jq = internal.apply_credentials_template(root_target, session_params, templates.auth_template_jq);



            for (var method_name in smd.services) {
                var method = smd.services[method_name];

                method.samples = {};
                method.tests = {};

                var svc_target = method.target;

                if (svc_target.indexOf("session") > -1) {
                    // authentication is special case. handle it and move on. 
                    // these are not the droids, errr.. methods, that you are looking for.

                    var auth_test_jq = internal.apply_test_wrapper(auth_jq, method_name);
                    var auth_test_ci = internal.apply_test_wrapper(auth_ci, method_name);

                    ciapi.codeGeneration.methods.jquery.samples[method_name] = auth_jq;
                    ciapi.codeGeneration.methods.jquery.tests[method_name] = auth_test_jq;
                    ciapi.codeGeneration.methods.ciapi.samples[method_name] = auth_ci;
                    ciapi.codeGeneration.methods.ciapi.tests[method_name] = auth_test_ci;

                    continue;
                }


                var demo_values = internal.build_demo_values(method);
                var svc_template = method.uriTemplate || "";
                var method_httpMethod = method.transport;
                var jqueryMethod = internal.apply_method_template(templates.method_template_jq, method_name, demo_values, root_target, svc_target + svc_template, session_params, method_httpMethod.toUpperCase());
                var ciapiMethod = internal.apply_method_template(templates.method_template_ci, method_name, demo_values, root_target, svc_target, session_params);
                var jqueryTest = internal.apply_test_wrapper(jqueryMethod, method_name);
                var ciapiTest = internal.apply_test_wrapper(ciapiMethod, method_name);

                ciapi.codeGeneration.methods.jquery.samples[method_name] = jqueryMethod;
                ciapi.codeGeneration.methods.jquery.tests[method_name] = jqueryTest;
                ciapi.codeGeneration.methods.ciapi.samples[method_name] = ciapiMethod;
                ciapi.codeGeneration.methods.ciapi.tests[method_name] = ciapiTest;

            }
        }
        catch (e) {
            debugger;
            throw { message: "sample code generation error", inner: e };
        }

    },
    internal: {
        resolve_schema: function (schema, ref) {
            if (ref == "#.ErrorCode") {
                var breakTarget = "";
            }
            var schema_type = ciapi.codeGeneration.internal.get_schema_type(schema, ref);
            if (schema_type == undefined)
                throw { message: "unable to find schema information for reference type: " + ref + " Perhaps you have left off a <jschema> tag?" };

            if (schema_type["extends"]) {
                var base = schema_type["extends"];
                // recursively apply resolved inheritance, if any
                var baseType = ciapi.codeGeneration.internal.resolve_schema(schema, base.$ref);
                ciapi.codeGeneration.internal.apply_properties(schema_type.properties, baseType.properties);

                // we want to remove the reference but retain a pointer to keep things simple
                delete schema_type["extends"];
                schema_type.base = base.$ref;
            }

            for (var pname in schema_type.properties) {
                var prop = schema_type.properties[pname];

                if (prop.$ref && !prop.resolved) {
                    var baseRef = prop.$ref;
                    // resolve references 
                    var referenceType = ciapi.codeGeneration.internal.resolve_schema(schema, baseRef);

                    ciapi.codeGeneration.internal.apply_properties(prop, referenceType);
                    delete prop.$ref;
                    prop.references = baseRef;
                }

                if (prop.type) {

                    if (prop.type == "array") {
                        if (prop.items) {
                            if (prop.items.$ref) {
                                // is a schema reference
                                var item = prop.items.$ref;
                                ciapi.codeGeneration.internal.apply_properties(prop.items, ciapi.codeGeneration.internal.resolve_schema(schema, item));
                                delete prop.items.$ref;
                                prop.items.references = item;
                            }
                            else {
                                // should be a scalar type - not supporting union types 
                                if (typeof (prop.items["type"]) === 'undefined') {
                                    debugger;
                                    throw { message: "union types in arrays not supported" };
                                }
                                switch (prop.items["type"]) {
                                    case "string":
                                    case "boolean":
                                    case "integer":
                                    case "number":
                                        break;
                                    default:
                                        debugger;
                                        throw { message: "unsupported array type: " + prop.items["type"] };
                                        break;
                                }
                            }
                        }
                    }
                }
            }

            // is this an enum?
            if (schema_type["enum"]) {

                var breakTarget = "";
                if (typeof (schema_type['exemplar']) == 'undefined') {
                    if (typeof (schema_type['demoValue']) !== 'undefined') {
                        schema_type.exemplar = schema_type['demoValue'];
                    }
                }
            }
            else {
                // take a second pass over the properties to build exemplar
                // this needs to be recursive but I think two levels will suffice for now
                schema_type.exemplar = {};
                for (var pname2 in schema_type.properties) {
                    var prop2 = schema_type.properties[pname2];

                    if (typeof (prop2['exemplar']) !== 'undefined') {
                        schema_type.exemplar[pname2] = prop2.exemplar;
                    } else if (typeof (prop2['demoValue']) !== 'undefined') {
                        schema_type.exemplar[pname2] = ciapi.codeGeneration.HtmlEncode(prop2.demoValue);
                    }
                    else if ((typeof (prop2['type']) !== 'undefined') && prop2.type == "array") {
                        if ((typeof (prop2['items']) !== 'undefined') && (typeof (prop2.items['exemplar']) !== 'undefined')) {
                            schema_type.exemplar[pname2] = [];
                            schema_type.exemplar[pname2].push(prop2.items.exemplar);
                        }
                        else {
                            debugger;
                            throw { message: "array property does not have exemplar" };
                        }
                    }
                    else {
                        debugger;
                        throw { message: "unsupported property type: "
                                    + JSON.stringify(prop2) + " on " + ref
                        };
                    }
                }
            }


            return schema_type;
        },

        get_schema_type: function (schema, ref) {
            return eval("(schema" + ref.substring(1) + ")");
        },

        apply_properties: function (target, source) {
            for (var name in source) {
                if (source.hasOwnProperty(name) && typeof (target[name]) === 'undefined') {
                    target[name] = JSON.parse(JSON.stringify(source[name]));
                }
            }
        },

        build_demo_values: function (method) {
            var results = {};
            for (var i = 0; i < method.parameters.length; i++) {
                var item = method.parameters[i];
                if (item.demoValue && item.demoValue != null) {
                    results[item.name] = ciapi.codeGeneration.HtmlEncode(item.demoValue);
                }
            }
            return results;
        },

        apply_method_template: function (value, method_name, demo_values, root_target, svc_target, session_params, httpMethod) {
            var url = ciapi.codeGeneration.internal.apply_uri_template(svc_target, demo_values).target;
            if (url.indexOf('?') == -1) {
                url = url + "?";
                // a bit of a hack to prevent parameterless urls in templates
                // from looking like this /session&username=xxxx , rather an ugly but functional url /session?&username=xxx
                // elsewise would need to inject a bit more logic in the code templating
            }

            // 
            var template = ciapi.codeGeneration.internal.apply_credentials_template(root_target, session_params, value, httpMethod);
            if (httpMethod == "GET") {
                template = template.replace("data: '~Paramters~',\n", "");
            }
            return template
                .replace(new RegExp("~method_name~", "g"), method_name)
                .replace(new RegExp("~Paramters~", "g"), JSON.stringify(demo_values))
                .replace(new RegExp("~Target~", "g"), root_target)
                .replace(new RegExp("~Method~", "g"), httpMethod)
                .replace(new RegExp("~Url~", "g"), url)
                .replace("/?&", "?");
            

        },

        apply_credentials_template: function (root_target, session_params, value) {
            var userName = ciapi.codeGeneration.internal.get_demo_value(session_params, "UserName");
            var password = ciapi.codeGeneration.internal.get_demo_value(session_params, "Password");

            return value
                .replace(new RegExp("~Password~", "g"), password)
                .replace(new RegExp("~UserName~", "g"), userName)
                .replace(new RegExp("~Target~", "g"), root_target);
        },

        get_demo_value: function (params, name) {
            for (var i = 0; i < params.length; i++) {
                if (params[i].name.toLowerCase() == name.toLowerCase())
                    return params[i].demoValue;
            }
        },

        apply_test_wrapper: function (value, method_name) {
            return ciapi.codeGeneration.templates.qunit_test_wrapper
                .replace(new RegExp("~method_body~", "g"), value)
                .replace(new RegExp("~method_name~", "g"), method_name);
        },




        apply_uri_template: function (target, data) {
            // TODO: remove unused templates and collapse/remove orphaned '&'
            var returnData = {};
            for (var key in data) {
                var uriTemplateRx = new RegExp("{" + key + "}", "gi");
                if (uriTemplateRx.test(target)) {
                    target = target.replace(uriTemplateRx, encodeURIComponent(data[key]));
                }
                else {
                    returnData[key] = data[key];
                }
            }
            target = target.replace(/(\w+=({\w+}))/gi, "");
            target = target.replace("&&", "&");
            return {
                target: target,
                data: returnData
            };
        }


    },

    // NOTE: we could simply use real methods and .toString() them but would lose comments
    // in most browsers.

    templates: {
        qunit_test_wrapper: "\n\
asyncTest('~method_name~', function ()\n\
{\n\
    ~method_body~\n\
});\n\
    ",
        auth_template_jq: "\n\
    // workflow begins with logging in and receiving a session token\n\
    \n\
    var userName = \"~UserName~\";\n\
    var password = \"~Password~\";\n\
    \n\
    // login\n\
    $.ajax({ url: \"~Target~session\", type: \"POST\", contentType: \"application/json\",\n\
        data: '{\"UserName\": \"' + userName + '\", \"Password\": \"' + password + '\"}',\n\
        dataType: \"json\",\n\
        transport: \"ciapi\",\n\
        error: logError,\n\
        success: function (token)\n\
        {\n\
            // you are logged in \n\
            logResponse(\"log in\", token);\n\
    \n\
            // insert creamy client app filling here\n\
    \n\
            // and then logout\n\
            $.ajax({ url: \"~Target~session/deleteSession?userName=\" + userName + \"&session=\" + token.Session,\n\
                type: \"POST\",\n\
                dataType: \"json\",\n\
                transport: \"ciapi\",\n\
                data: \"{}\",\n\
                error: logError,\n\
                success: function (status)\n\
                {\n\
                    logResponse(\"logout\", status, true);\n\
                    // workflow complete\n\
                }\n\
            });\n\
        }\n\
    });",

        method_template_jq: "\n\
    // workflow begins with logging in and receiving a session token\n\
    \n\
    var userName = \"~UserName~\";\n\
    var password = \"~Password~\";\n\
    \n\
    $.ajax({ url: \"~Target~session\", type: \"POST\", contentType: \"application/json\",\n\
        data: '{\"UserName\": \"' + userName + '\", \"Password\": \"' + password + '\"}',\n\
        dataType: \"json\",\n\
        transport: \"ciapi\",\n\
        error: logError,\n\
        success: function (token)\n\
        {\n\
            // you are logged in \n\
    \n\
            logResponse(\"log in\", token);\n\
    \n\
            // now get your data\n\
    \n\
            $.ajax({\n\
                url: \"~Target~~Url~&userName=\" + userName + \"&session=\" + token.Session,\n\
                contentType: \"application/json\",\n\
                data: '~Paramters~',\n\
                type: \"~Method~\",\n\
                transport: \"ciapi\",\n\
                dataFilter: function (responseText)\n\
                {\n\
                    // format dates and deserialize response text\n\
                    return eval(\"(\" + responseText.replace(/\"\\\/Date\((.*?)\)\\\/\"/g, 'new Date($1)') + \")\")\n\
                },\n\
                error: logError,\n\
                success: function (response)\n\
                {\n\
                    // do something with your response\n\
\n\
                    logResponse(\"~method_name~\", response);\n\
\n\
                    // and then logout\n\
\n\
                    $.ajax({ url: \"~Target~session/deleteSession?userName=\" + userName + \"&session=\" + token.Session,\n\
                        type: \"POST\",\n\
                        dataType: \"json\",\n\
                        transport: \"ciapi\",\n\
                        data: \"{}\",\n\
                        error: logError,\n\
                        success: function (status)\n\
                        {\n\
                            logResponse(\"logout\", status, true);\n\
                            // workflow complete\n\
                        }\n\
                    });\n\
                }\n\
            });\n\
        }\n\
    });",

        auth_template_ci: "\n\
    // workflow begins with logging in and receiving a session token\n\
    \n\
    var password = '~Password~';\n\
    var userName = '~UserName~'; \n\
    \n\
    // login\r\
    ciapi.services.CreateSession({ UserName: userName, Password: password })\r\
    .then(function (token) {\r\
    \r\
        // you are logged in\r\
        logResponse('login', token);\r\
    \r\
        // insert creamy client app filling here\r\
    \r\
        // log out\r\
        ciapi.services.DeleteSession()\r\
            .then(function (status) {\r\
    \r\
                // workflow complete\r\
                logResponse('logout', status, true);\r\
    \r\
            }, logError);\r\
    }, logError);",

        method_template_ci: "\n\
        // workflow begins with logging in and receiving a session token\n\
\n\
        var password = 'password';\n\
        var userName = 'CC735158';\n\
\n\
        // login\n\
        ciapi.services.CreateSession({ UserName: userName, Password: password })\n\
        .then(function (token) {\n\
\n\
        // you are logged in\n\
        logResponse('login', token);\n\
\n\
        // invoke service method \n\
        ciapi.services.~method_name~(~Paramters~)\n\
        .then(function (response) {\n\
\n\
            // do something with your response \n\
            logResponse('~method_name~', response);\n\
            // wash, rinse, repeat.... \n\
\n\
            // then logout \n\
            ciapi.services.DeleteSession()\n\
            .then(function (status) {\n\
\n\
                // workflow complete\n\
                logResponse('logout', status, true);\n\
\n\
            }, logError);\n\
        }, logError);\n\
    }, logError);"
    }
};





(function () {
    // to support re-encoding of demo value for documentation
    // can be simplified
    var _applyEncodingMap = function (str, map) {
        var mapper, regexp;
        if (map._encCache &&
			map._encCache.regexp &&
			map._encCache.mapper &&
			map.length == map._encCache.length) {
            mapper = map._encCache.mapper;
            regexp = map._encCache.regexp;
        } else {
            mapper = {};
            regexp = ["["];
            var i;
            for (i = 0; i < map.length; i++) {
                mapper[map[i][0]] = "&" + map[i][1] + ";";
                regexp.push(map[i][0]);
            }
            regexp.push("]");
            regexp = new RegExp(regexp.join(""), "g");
            map._encCache = {
                mapper: mapper,
                regexp: regexp,
                length: map.length
            };
        }
        str = str.replace(regexp, function (c) {
            return mapper[c];
        });
        return str;
    };

    var _applyDecodingMap = function (str, map) {
        var mapper, regexp;
        if (map._decCache &&
			map._decCache.regexp &&
			map._decCache.mapper &&
			map.length == map._decCache.length) {
            mapper = map._decCache.mapper;
            regexp = map._decCache.regexp;
        } else {
            mapper = {};
            regexp = ["("];
            var i;
            for (i = 0; i < map.length; i++) {
                var e = "&" + map[i][1] + ";";
                if (i) { regexp.push("|"); }
                mapper[e] = map[i][0];
                regexp.push(e);
            }
            regexp.push(")");
            regexp = new RegExp(regexp.join(""), "g");
            map._decCache = {
                mapper: mapper,
                regexp: regexp,
                length: map.length
            };
        }
        str = str.replace(regexp, function (c) {
            return mapper[c];
        });
        return str;
    };

    ciapi.codeGeneration.html = [
		["\u0026", "amp"], ["\u0022", "quot"], ["\u003C", "lt"], ["\u003E", "gt"],
		["\u00A0", "nbsp"]
	];

    ciapi.codeGeneration.latin = [
		["\u00A1", "iexcl"], ["\u00A2", "cent"], ["\u00A3", "pound"], ["\u20AC", "euro"],
		["\u00A4", "curren"], ["\u00A5", "yen"], ["\u00A6", "brvbar"], ["\u00A7", "sect"],
		["\u00A8", "uml"], ["\u00A9", "copy"], ["\u00AA", "ordf"], ["\u00AB", "laquo"],
		["\u00AC", "not"], ["\u00AD", "shy"], ["\u00AE", "reg"], ["\u00AF", "macr"],
		["\u00B0", "deg"], ["\u00B1", "plusmn"], ["\u00B2", "sup2"], ["\u00B3", "sup3"],
		["\u00B4", "acute"], ["\u00B5", "micro"], ["\u00B6", "para"], ["\u00B7", "middot"],
		["\u00B8", "cedil"], ["\u00B9", "sup1"], ["\u00BA", "ordm"], ["\u00BB", "raquo"],
		["\u00BC", "frac14"], ["\u00BD", "frac12"], ["\u00BE", "frac34"], ["\u00BF", "iquest"],
		["\u00C0", "Agrave"], ["\u00C1", "Aacute"], ["\u00C2", "Acirc"], ["\u00C3", "Atilde"],
		["\u00C4", "Auml"], ["\u00C5", "Aring"], ["\u00C6", "AElig"], ["\u00C7", "Ccedil"],
		["\u00C8", "Egrave"], ["\u00C9", "Eacute"], ["\u00CA", "Ecirc"], ["\u00CB", "Euml"],
		["\u00CC", "Igrave"], ["\u00CD", "Iacute"], ["\u00CE", "Icirc"], ["\u00CF", "Iuml"],
		["\u00D0", "ETH"], ["\u00D1", "Ntilde"], ["\u00D2", "Ograve"], ["\u00D3", "Oacute"],
		["\u00D4", "Ocirc"], ["\u00D5", "Otilde"], ["\u00D6", "Ouml"], ["\u00D7", "times"],
		["\u00D8", "Oslash"], ["\u00D9", "Ugrave"], ["\u00DA", "Uacute"], ["\u00DB", "Ucirc"],
		["\u00DC", "Uuml"], ["\u00DD", "Yacute"], ["\u00DE", "THORN"], ["\u00DF", "szlig"],
		["\u00E0", "agrave"], ["\u00E1", "aacute"], ["\u00E2", "acirc"], ["\u00E3", "atilde"],
		["\u00E4", "auml"], ["\u00E5", "aring"], ["\u00E6", "aelig"], ["\u00E7", "ccedil"],
		["\u00E8", "egrave"], ["\u00E9", "eacute"], ["\u00EA", "ecirc"], ["\u00EB", "euml"],
		["\u00EC", "igrave"], ["\u00ED", "iacute"], ["\u00EE", "icirc"], ["\u00EF", "iuml"],
		["\u00F0", "eth"], ["\u00F1", "ntilde"], ["\u00F2", "ograve"], ["\u00F3", "oacute"],
		["\u00F4", "ocirc"], ["\u00F5", "otilde"], ["\u00F6", "ouml"], ["\u00F7", "divide"],
		["\u00F8", "oslash"], ["\u00F9", "ugrave"], ["\u00FA", "uacute"], ["\u00FB", "ucirc"],
		["\u00FC", "uuml"], ["\u00FD", "yacute"], ["\u00FE", "thorn"], ["\u00FF", "yuml"],
		["\u0192", "fnof"], ["\u0391", "Alpha"], ["\u0392", "Beta"], ["\u0393", "Gamma"],
		["\u0394", "Delta"], ["\u0395", "Epsilon"], ["\u0396", "Zeta"], ["\u0397", "Eta"],
		["\u0398", "Theta"], ["\u0399", "Iota"], ["\u039A", "Kappa"], ["\u039B", "Lambda"],
		["\u039C", "Mu"], ["\u039D", "Nu"], ["\u039E", "Xi"], ["\u039F", "Omicron"],
		["\u03A0", "Pi"], ["\u03A1", "Rho"], ["\u03A3", "Sigma"], ["\u03A4", "Tau"],
		["\u03A5", "Upsilon"], ["\u03A6", "Phi"], ["\u03A7", "Chi"], ["\u03A8", "Psi"],
		["\u03A9", "Omega"], ["\u03B1", "alpha"], ["\u03B2", "beta"], ["\u03B3", "gamma"],
		["\u03B4", "delta"], ["\u03B5", "epsilon"], ["\u03B6", "zeta"], ["\u03B7", "eta"],
		["\u03B8", "theta"], ["\u03B9", "iota"], ["\u03BA", "kappa"], ["\u03BB", "lambda"],
		["\u03BC", "mu"], ["\u03BD", "nu"], ["\u03BE", "xi"], ["\u03BF", "omicron"],
		["\u03C0", "pi"], ["\u03C1", "rho"], ["\u03C2", "sigmaf"], ["\u03C3", "sigma"],
		["\u03C4", "tau"], ["\u03C5", "upsilon"], ["\u03C6", "phi"], ["\u03C7", "chi"],
		["\u03C8", "psi"], ["\u03C9", "omega"], ["\u03D1", "thetasym"], ["\u03D2", "upsih"],
		["\u03D6", "piv"], ["\u2022", "bull"], ["\u2026", "hellip"], ["\u2032", "prime"],
		["\u2033", "Prime"], ["\u203E", "oline"], ["\u2044", "frasl"], ["\u2118", "weierp"],
		["\u2111", "image"], ["\u211C", "real"], ["\u2122", "trade"], ["\u2135", "alefsym"],
		["\u2190", "larr"], ["\u2191", "uarr"], ["\u2192", "rarr"], ["\u2193", "darr"],
		["\u2194", "harr"], ["\u21B5", "crarr"], ["\u21D0", "lArr"], ["\u21D1", "uArr"],
		["\u21D2", "rArr"], ["\u21D3", "dArr"], ["\u21D4", "hArr"], ["\u2200", "forall"],
		["\u2202", "part"], ["\u2203", "exist"], ["\u2205", "empty"], ["\u2207", "nabla"],
		["\u2208", "isin"], ["\u2209", "notin"], ["\u220B", "ni"], ["\u220F", "prod"],
		["\u2211", "sum"], ["\u2212", "minus"], ["\u2217", "lowast"], ["\u221A", "radic"],
		["\u221D", "prop"], ["\u221E", "infin"], ["\u2220", "ang"], ["\u2227", "and"],
		["\u2228", "or"], ["\u2229", "cap"], ["\u222A", "cup"], ["\u222B", "int"],
		["\u2234", "there4"], ["\u223C", "sim"], ["\u2245", "cong"], ["\u2248", "asymp"],
		["\u2260", "ne"], ["\u2261", "equiv"], ["\u2264", "le"], ["\u2265", "ge"],
		["\u2282", "sub"], ["\u2283", "sup"], ["\u2284", "nsub"], ["\u2286", "sube"],
		["\u2287", "supe"], ["\u2295", "oplus"], ["\u2297", "otimes"], ["\u22A5", "perp"],
		["\u22C5", "sdot"], ["\u2308", "lceil"], ["\u2309", "rceil"], ["\u230A", "lfloor"],
		["\u230B", "rfloor"], ["\u2329", "lang"], ["\u232A", "rang"], ["\u25CA", "loz"],
		["\u2660", "spades"], ["\u2663", "clubs"], ["\u2665", "hearts"], ["\u2666", "diams"],
		["\u0152", "Elig"], ["\u0153", "oelig"], ["\u0160", "Scaron"], ["\u0161", "scaron"],
		["\u0178", "Yuml"], ["\u02C6", "circ"], ["\u02DC", "tilde"], ["\u2002", "ensp"],
		["\u2003", "emsp"], ["\u2009", "thinsp"], ["\u200C", "zwnj"], ["\u200D", "zwj"],
		["\u200E", "lrm"], ["\u200F", "rlm"], ["\u2013", "ndash"], ["\u2014", "mdash"],
		["\u2018", "lsquo"], ["\u2019", "rsquo"], ["\u201A", "sbquo"], ["\u201C", "ldquo"],
		["\u201D", "rdquo"], ["\u201E", "bdquo"], ["\u2020", "dagger"], ["\u2021", "Dagger"],
		["\u2030", "permil"], ["\u2039", "lsaquo"], ["\u203A", "rsaquo"]
	];

    ciapi.codeGeneration.HtmlEncode = function (str/*string*/, m /*array?*/) {
        if (str && (typeof (str) === 'string')) {
            if (!m) {
                str = _applyEncodingMap(str, ciapi.codeGeneration.html);
                str = _applyEncodingMap(str, ciapi.codeGeneration.latin);

            } else {
                str = _applyEncodingMap(str, m);
            }
        }
        return str;
    };

    ciapi.codeGeneration.htmlDecode = function (str/*string*/, m /*array?*/) {
        if (str && (typeof (str) === 'string')) {
            if (!m) {
                str = _applyDecodingMap(str, ciapi.codeGeneration.html);
                str = _applyDecodingMap(str, ciapi.codeGeneration.latin);

            } else {
                str = _applyDecodingMap(str, m);
            }
        }
        return str;
    };
})();