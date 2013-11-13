
/**
 * Utils for the controls
 * Helps the controls
 *
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/utils/Controls', [

    'qui/QUI'

], function(QUI)
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
            if ( ( icon.match( /icon-/ ) || icon.match( /fa-/ ) ) &&
                 !icon.match( /\./ ) ) {
                return true;
            }

            return false;
        },

        /**
         * Highlights a control
         *
         * @method QUI.lib.Controls#highlight
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
         * @method QUI.lib.Controls#normalize
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