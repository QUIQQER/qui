/**
 * A breadcrumb bar item
 *
 * @author www.namerobot.com (Henning Leutz)
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
    'css!qui/controls/breadcrumb/Item.css'

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
            var self = this,
                icon = this.getAttribute( 'icon' );

            this.$Elm = new Element('div', {
                'class'      : 'qui-breadcrumb-item box smooth',
                html         : '<span class="qui-breadcrumb-item-text">'+
                                   this.getAttribute( 'text' ) +
                               '</span>',
                alt          : this.getAttribute( 'text' ),
                title        : this.getAttribute( 'text' ),
                'data-quiid' : this.getId(),
                events :
                {
                    click : function(event) {
                        self.fireEvent( 'click', [ self, event ] );
                    }
                }
            });

            if ( icon )
            {
                var Icon = this.$Elm.getElement( '.qui-breadcrumb-item-icon' );

                if ( !Icon )
                {
                    Icon = new Element('span', {
                        'class' : 'qui-breadcrumb-item-icon'
                    }).inject(
                        this.$Elm, 'top'
                    );
                }

                // font awesome
                if ( icon.match( /icon-/ ) && !icon.match( /\./ ) )
                {
                    Icon.addClass( icon );
                } else
                {
                    Icon.setStyles({
                        backgroundImage : 'url('+ this.getAttribute( 'icon' ) +')',
                        paddingLeft     : 20
                    });
                }
            }

            return this.$Elm;
        }
    });
});
