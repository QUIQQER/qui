
/**
 * Helper for DOMNode Elements
 *
 * @module qui/utils/Elements
 * @author www.pcsg.de (Henning Leutz)
 */

define({

    /**
     * checks if the element is in the viewport
     *
     * @method qui/utils/Elements#isInViewport
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

    /**
     *
     */
    isInBody : function(Elm)
    {
        var bodySize = document.body.getSize(),
            elmCords = Elm.getCoordinates();


        console.log( elmCords );
        console.log( bodySize );



        return false;
    },

    /**
     * Return the z-index of an Element
     *
     * @method qui/utils/Elements#getComputedZIndex
     * @return {Integer}
     */
    getComputedZIndex : function(Elm)
    {
        var i, z, len, max = 0;
        var parents = Elm.getParents();

        for ( i = 0, len = parents.length; i < len; i++)
        {
            z = parents[ i ].getStyle( 'zIndex' );

            if ( z == 'auto' ) {
                continue;
            }

            if ( z > max ) {
                 max = z;
            }
        }

        return max;
    },

    /**
     * Return the index of the child from its parent
     *
     * @param {DOMNode} Elm
     * @return {Integer}
     */
    getChildIndex : function(Elm)
    {
        return Array.prototype.indexOf.call(
            Elm.getParent().children,
            Elm
        );
    }
});
