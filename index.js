(function (root) {
var jlib;
var jcore = {};
var jtypes = Object.create(jcore);
var defaults = {};
var TYPES = ['Arguments', 'Array', 'Boolean', 'Date', 'Error', 'Function', 'Null', 'Number', 'Object', 'RegExp', 'Map', 'Symbol', 'String', 'Undefined'];
jlib = function(subject) {
    var type = jlib.typer(subject);
    var j;
    jtypes[type] = jtypes[type] || {};
    j = Object.create(jtypes[type]);
    j.subject = jlib.clone(subject);
    j.type = type;

    return j;
};

jlib.typer = function(obj) { 
    var fancyType = Object.prototype.toString.call(obj);
    var normalType = fancyType.substring(8,fancyType.length-1);
    
    return normalType; 
};

jlib.clone = function(obj){
    type = jlib.typer(obj);
    switch(type){
        case 'RegExp':
            return new RegExp(obj);
        case 'Date':
            return new Date(obj.getTime());
        case 'Object':
        case 'Arguments':
            return jlib.extend(true, {}, obj);
        case 'Array':
            return jlib.extend(true, [], obj);
        case 'Undefined':
        case 'Boolean':
        case 'Null':
        case 'Error':
        case 'Number':
        case 'String':
            return obj;
        default:
            console.warn('jlib did not copy this subject, you are dealing with the original ' + type);
            return obj;
    }
};

jlib.interpolateArgs = function(func) {
    deps = func.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m);
    deps = deps && deps.length ? deps[1] : [];

    return deps.length ? deps.replace(/ /g, '').split(',') : [];
};

jlib.defaults = function(update) {
    if (!update) return defaults;
    jlib.extend(defaults, update);
    return defaults;
};

jlib.enhance = function(name, types, func, core) {
    if (!name) throw 'A name and a function are required';
    var args = [];
    var typeDeps = [];
    var key;
    var i;

    //JUST SHIFTING VARIABLES
    if (jlib.typer(types) === 'Function') {
        core = func;
        func = types;
        types = null;
    } else {
        core = false;
    }
    // CHECKING FOR DATA TYPE FUNCTION NAMES
    if (~TYPES.indexOf(name)) throw name + ' function can not be named after a data type';
    

    //DEPENDENCY INJECTION
    var deps = jlib.interpolateArgs(func);

    // creating injection variables
    for (key in jtypes)
        for (i in jtypes[key])
            typeDeps.push(key+'_'+i);

    // check for dependics in jtypes
    for (i = 0; i < deps.length; i++) {
        if ( ~typeDeps.indexOf(deps[i]) ) {
            depsSplit = deps[i].split('_');
            args.push( jtypes[ depsSplit[0] ][ depsSplit[1] ] );
        } else if ( jlib[deps[i]] ) {
            args.push(jlib[deps[i]]);
        } else {
            throw deps[i] + ' dependency doesnt exsist';
        }
    }
    //END DEPENDENCY INJECTION


    // CORE ENHANCEMENT
    if (core) {
        if (jlib[name]) throw 'jlib.' + name + ' is already a function';
        jlib[name] = func.apply(this, args);
        return this;
    }
    // END CORE ENHANCEMENT

    // PROTO ENHANCMENT
    //create array if only one type is passed so we can loop once.
    if (jlib.typer(types) === 'String') types = [types]; 


    if (jlib.typer(types) === 'Array') {
        //loop over types and append function to each type
        for (i = types.length - 1; i >= 0; i--) {
            var t = types[i];
            if (!jtypes[t]) jtypes[t] = {};
            if (jtypes[t][name]) throw t + ' ' +name + ' is already a function';

            jtypes[t][name] = func.apply(this, args);
        }
    } else {
        //append function to type
        if (jcore[name]) throw name + ' is already a function';
        jcore[name] = func.apply(this, args);
    }
    //END PROTO ENHANCMENT

    return this;
};

// Borrowed this from jQuery JavaScript Library v2.1.4 http://jquery.com/
jlib.extend = function() {
    var options;
    var name;
    var src;
    var copy;
    var copyIsArray;
    var clone;
    var target = arguments[0] || {};
    var type = jlib.typer(target);
    var i = 1;
    var length = arguments.length;
    var deep = false;

    // Handle a deep copy situation
    if ( type === "Boolean" ) {
      deep = target;

      // Skip the boolean and the target
      target = arguments[ i ] || {};
      i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( type !== "Array" && type !== "Object" && type !== 'Function' ) target = {}; 

    // Extend jlib itself if only one argument is passed
    if ( i === length ) {
      target = this;
      i--;
    }

    for ( ; i < length; i++ ) {
      // Only deal with non-null/undefined values
      if ( (options = arguments[ i ]) !== null ) {
        // Extend the base object
        for ( name in options ) {
          src = target[ name ];
          copy = options[ name ];

          // Prevent never-ending loop
          if ( target === copy ) continue;

          // Recurse if we're merging plain objects or arrays
          if ( deep && copy && ( jlib.typer(copy) === 'Object' || (copyIsArray = jlib.typer(copy) === 'Array') ) ) {
            if ( copyIsArray ) {
              copyIsArray = false;
              clone = src && jlib.typer(src) === 'Array' ? src : [];

            } else {
              clone = src && jlib.typer(src) === 'Object' ? src : {};
            }

            // Never move original objects, clone them
            target[ name ] = jlib.extend( deep, clone, copy );

            // Don't bring in undefined values
          } else if ( copy !== undefined ) {
            target[ name ] = copy;
          }
        }
      }
    }

    // Return the modified object
    return target;
};

root.jlib = root.J = jlib;

})(window); 
