
/**
 * string helper
 * Helps with string opartions
 *
 * @module qui/utils/String
 * @author www.pcsg.de (Henning Leutz)
 */

define({

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
        str = str.split('?');

        if ( typeof str[1] === 'undefined' ){
            return {};
        }

        str = str[1].split('&');

        var i, len, sp;
        var r = {};

        for ( i = 0, len = str.length; i < len; i++ )
        {
            sp = str[i].split('=');

            r[ sp[0] ] = sp[1];
        }

        return r;
    }
});
