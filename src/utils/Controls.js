
/**
 * Utils for the controls
 * Helps the controls
 *
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/utils/Controls', function()
{
    "use strict";

    return {

        /**
         * Checks if the string is a fontawesome css class
         *
         * @param {String} str - FontAweomse icon-class or an image path
         * @returns {Bool}
         */
        isFontAwesomeClass : function(icon)
        {
            if ( icon.match( /icon-/ ) && !icon.match( /\./ ) ) {
                return true;
            }

            return false;
        }
    };
});