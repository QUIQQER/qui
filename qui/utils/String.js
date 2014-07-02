
/**
 * string helper
 * Helps with string opartions
 *
 * @author www.namerobot.com (Henning Leutz)
 */

define('qui/utils/String', function()
{
    "use strict";

    return {

        /**
         * get params from an url
         *
         * @method QUI.lib.Utils#getUrlParams
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

    };
});