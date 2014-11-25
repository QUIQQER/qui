
/**
 * Utils for the controls
 * Helps the controls
 *
 * @module qui/utils/Controls
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 */

define('qui/utils/Controls', ['qui/QUI'], function(QUI)
{
    "use strict";

    return {

        /**
         * Checks if the string is a fontawesome css class
         *
         * @method qui/utils/Controls#isFontAwesomeClass
         * @param {String} icon - FontAweomse icon-class or an image path
         * @returns {Boolean}
         */
        isFontAwesomeClass : function(icon)
        {
            if ( !icon ) {
                return false;
            }

            return ( icon.match( /icon-/ ) || icon.match( /fa-/ ) ) && !icon.match( /\./ );
        },

        /**
         * Highlights a control
         *
         * @method qui/utils/Controls#highlight
         * @param {HTMLElement} Element
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
         * @param {HTMLElement} Element
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