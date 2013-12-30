
/**
 * Helper for DOMNode Elements
 *
 * @author www.namerobot.com (Henning Leutz)
 */

define('qui/utils/Elements', function()
{
    "use strict";

    return {

        /**
         * checks if the element is in the viewport
         *
         * @param {DOMNode} el
         */
        isInViewport : function(el)
        {
            var rect = el.getBoundingClientRect();

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },


        isInBody : function(Elm)
        {
            var bodySize = document.body.getSize(),
                elmCords = Elm.getCoordinates();


            console.log( elmCords );
            console.log( bodySize );



            return false;
        }

    };
});