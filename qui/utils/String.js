
/**
 * string helper
 * Helps with string operations
 *
 * @module qui/utils/String
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/utils/String', {

    /**
     * get params from an url
     *
     * @method qui/utils/String#getUrlParams
     *
     * @param {String} str - index.php?param1=12&param2=test
     * @return {Object}
     */
    getUrlParams : function(str)
    {
        "use strict";

        var params = str.split('?');

        if ( typeof params[1] === 'undefined' ){
            return {};
        }

        params = params[1].split('&');

        var i, len, sp;
        var r = {};

        for ( i = 0, len = params.length; i < len; i++ )
        {
            sp = params[i].split('=');

            r[ sp[0] ] = sp[1];
        }

        return r;
    }
});
