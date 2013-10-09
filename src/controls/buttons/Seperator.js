/**
 * Button Seperator
 *
 * @author www.pcsg.de (Henning Leutz)
 *
 * @requires qui/controls/Control
 * @module qui/controls/buttons/Seperator
 * @package com.pcsg.qui.js.controls.buttons
 *
 * @event onResize [this]
 * @event onCreate [this]
 */

define('qui/controls/buttons/Seperator', [

    'qui/controls/Control'

], function(Control)
{
    "use strict";

    /**
     * @class qui/controls/buttons/Seperator
     *
     * @param {Object} options
     * @memberof! <global>
     */
    return new Class({

        Extebds : Control,
        Type    : 'qui/controls/buttons/Seperator',

        options : {
            height : false
        },

        initialize : function(options)
        {
            this.parent( options );

            // Events
            this.addEvent('resize', function(Toolbar)
            {
                var Elm = this.getElm();

                if ( Elm && Elm.getParent() ) {
                    Elm.setStyle( 'height', Elm.getParent().getSize().y );
                }
            });
        },

        /**
         * Create the DOMNode
         *
         * @method qui/controls/buttons/Seperator#create
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div.qui-buttons-seperator', {
                'data-quiid' : this.getId()
            });

            if ( this.getAttribute( 'height' ) ) {
                this.$Elm.setStyle( 'height', this.getAttribute( 'height' ) );
            }

            this.fireEvent( 'create', [ this ] );

            return this.$Elm;
        }
    });
});
