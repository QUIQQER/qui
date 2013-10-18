
/**
 * Utils for objects
 * Helps with objects -> {}
 *
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/utils/Object', function()
{
    "use strict";

    return {

        /**
         * Combines two Object
         *
         * @method QUI.lib.Utils#combine
         *
         * @param {Object} first - First Object
         * @param {Object} second - Second Object
         * @return {Object}
         */
        combine : function(first, second)
        {
            first  = first || {};
            second = second || {};

            return Object.append(first, second);
        }
    };
});