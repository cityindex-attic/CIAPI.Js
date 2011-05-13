var CIAPI = CIAPI || {};
CIAPI.dojo = {};

(function(){
    var d = CIAPI.dojo, opts = Object.prototype.toString;

    d.isArray = function(/*anything*/ it){
		//	summary:
		//		Return true if it is an Array.
		//		Does not work on Arrays created in other windows.
		return it && (it instanceof Array || typeof it == "array"); // Boolean
	};

    d.isFunction = function(/*anything*/ it){
		// summary:
		//		Return true if it is a Function
		return opts.call(it) === "[object Function]";
	};

    d._extraNames = extraNames = extraNames || ["hasOwnProperty", "valueOf", "isPrototypeOf",
		"propertyIsEnumerable", "toLocaleString", "toString", "constructor"];
    var extraNames = d._extraNames, extraLen = extraNames.length, empty = {};
    d.clone = function(/*anything*/ o) {
        // summary:
        //		Clones objects (including DOM nodes) and all children.
        //		Warning: do not clone cyclic structures.
        if (!o || typeof o != "object" || d.isFunction(o)) {
            // null, undefined, any non-object, or function
            return o;	// anything
        }
        if (o.nodeType && "cloneNode" in o) {
            // DOM Node
            return o.cloneNode(true); // Node
        }
        if (o instanceof Date) {
            // Date
            return new Date(o.getTime());	// Date
        }
        if (o instanceof RegExp) {
            // RegExp
            return new RegExp(o);   // RegExp
        }
        var r, i, l, s, name;
        if (d.isArray(o)) {
            // array
            r = [];
            for (i = 0,l = o.length; i < l; ++i) {
                if (i in o) {
                    r.push(d.clone(o[i]));
                }
            }
// we don't clone functions for performance reasons
//		}else if(d.isFunction(o)){
//			// function
//			r = function(){ return o.apply(this, arguments); };
        } else {
            // generic objects
            r = o.constructor ? new o.constructor() : {};
        }
        for (name in o) {
            // the "tobj" condition avoid copying properties in "source"
            // inherited from Object.prototype.  For example, if target has a custom
            // toString() method, don't overwrite it with the toString() method
            // that source inherited from Object.prototype
            s = o[name];
            if (!(name in r) || (r[name] !== s && (!(name in empty) || empty[name] !== s))) {
                r[name] = d.clone(s);
            }
        }
        // IE doesn't recognize some custom functions in for..in
        if (extraLen) {
            for (i = 0; i < extraLen; ++i) {
                name = extraNames[i];
                s = o[name];
                if (!(name in r) || (r[name] !== s && (!(name in empty) || empty[name] !== s))) {
                    r[name] = s; // functions only, we don't clone them
                }
            }
        }
        return r; // Object
    };

})();