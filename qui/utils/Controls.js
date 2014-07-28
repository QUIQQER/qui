
/**
 * Utils for the controls
 * Helps the controls
 *
 * @module qui/utils/Controls
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 */

define(['qui/QUI'], function(QUI, Panel)
{
    "use strict";

    return {

        /**
         * Checks if the string is a fontawesome css class
         *
         * @method qui/utils/Controls#isFontAwesomeClass
         * @param {String} str - FontAweomse icon-class or an image path
         * @returns {Bool}
         */
        isFontAwesomeClass : function(icon)
        {
            if ( !icon ) {
                return false;
            }

            if ( ( icon.match( /icon-/ ) || icon.match( /fa-/ ) ) &&
                 !icon.match( /\./ ) )
            {
                return true;
            }

            return false;
        },

        /**
         * Highlights a control
         *
         * @method qui/utils/Controls#highlight
         * @param {DOMNode} Element
         */
        highlight : function(Element)
        {
            if ( !Element ) {
                return;
            }

            var quiid = Element.get( 'data-quiid' );

            if ( !quiid ) {
                return;
            }

            QUI.Controls.getById( quiid ).highlight();
        },

        /**
         * Normalize a control, if it is was highlighted
         *
         * @method qui/utils/Controls#normalize
         * @param {DOMNode} Element
         */
        normalize : function(Element)
        {
            if ( !Element ) {
                return;
            }

            var quiid = Element.get( 'data-quiid' );

            if ( !quiid ) {
                return;
            }

            QUI.Controls.getById( quiid ).normalize();
        }

    };
});