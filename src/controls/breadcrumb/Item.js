/**
 * A breadcrumb bar item
 *
 * @author www.pcsg.de (Henning Leutz)
 *
 * @requires qui/controls/Control
 *
 * @module qui/controls/breadcrumb/Item
 * @class qui/controls/breadcrumb/Item
 * @package com.pcsg.qui.js.controls.breadcrumb
 *
 * @event onClick [this, event]
 */

define('qui/controls/breadcrumb/Item', [

    'qui/controls/Control',
    'css!controls/breadcrumb/Item.css'

], function(Control)
{
    "use strict";

    /**
     * @class qui/controls/breadcrumb/Item
     * @desc A breadcrumb item
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/breadcrumb/Item',

        options : {
            text : '',
            icon : false
        },

        initialize : function(options)
        {
            this.parent( options );
        },

        /**
         * Create the DOMNode for the Item
         *
         * @method qui/controls/breadcrumb/Item#create
         * @return {DOMNode}
         */
        create : function()
        {
            var self = this;

            this.$Elm = new Element('div', {
                'class'      : 'qui-breadcrumb-item box smooth radius5',
                html         : '<span>'+ this.getAttribute( 'text' ) +'</span>',
                alt          : this.getAttribute( 'text' ),
                title        : this.getAttribute( 'text' ),
                'data-quiid' : this.getId(),
                events  :
                {
                    click : function(event) {
                        self.fireEvent( 'click', [ self, event ] );
                    }
                }
            });

            if ( this.getAttribute( 'icon' ) )
            {
                this.$Elm.getElement( 'span' ).setStyles({
                    backgroundImage : 'url('+ this.getAttribute('icon') +')',
                    paddingLeft     : 20
                });
            }

            return this.$Elm;
        }
    });
});
