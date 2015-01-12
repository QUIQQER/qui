
/**
 * QUI list control
 *
 * @module qui/controls/elements/List
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onClick [ self, {Object} itemData, {HTMLElement} Item ]
 */

define('qui/controls/elements/List', [

    'qui/QUI',
    'qui/controls/Control',

    'css!qui/controls/elements/List'

], function (QUI, QUIControl)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'qui/controls/elements/List',

        Binds : [
            '$itemClick'
        ],

        options : {
            styles : false
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$items = [];
        },

        /**
         * Return the domnode element
         *
         * @return {HTMLElement}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'qui-elements-list'
            });

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            return this.$Elm;
        },

        /**
         * Refresh the list
         */
        refresh : function()
        {
            this.$Elm.set( 'html', '' );

            var self = this;
            var i, len, icon, item, text, title;

            var itemClick = function(event)
            {
                var Target = event.target;

                if ( !Target.hasClass( 'qui-elements-list-item' ) ) {
                    Target = Target.getParent( '.qui-elements-list-item' );
                }

                self.$itemClick( Target );
            };

            for ( i = 0, len = this.$items.length; i < len; i++ )
            {
                item = this.$items[ i ];

                icon  = '';
                title = '';
                text  = '';

                if ( "icon" in item ) {
                    icon  = item.icon;
                }

                if ( "title" in item ) {
                    title = item.title;
                }

                if ( "text" in item ) {
                    text = item.text;
                }

                new Element('section', {
                    'class' : 'qui-elements-list-item smooth',
                    'html' : '<div class="qui-elements-list-item-icon">' +
                                 '<span class="'+ icon +'"></span>' +
                             '</div>' +
                             '<div class="qui-elements-list-item-text">' +
                                 '<header>' +
                                     title +
                                 '</header>'+
                                 '<div class="qui-elements-list-item-description">' +
                                     text +
                                '</div>' +
                             '</div>',
                    events : {
                        click : itemClick
                    },
                    'data-id' : i
                }).inject( this.$Elm );
            }
        },

        /**
         * Add an item
         *
         * @param {Object} item
         */
        addItem : function(item)
        {
            this.$items.push( item );
            this.refresh();

            return this;
        },

        /**
         * Add an list of items
         *
         * @param {Array} arrList - list of items
         */
        addItems : function(arrList)
        {
            for ( var i = 0, len = arrList.length; i < len; i++ ) {
                this.$items.push( arrList[ i ] );
            }

            this.refresh();

            return this;
        },

        /**
         * Clear the list
         */
        clear : function()
        {
            this.$items = [];
            this.$Elm.set( 'html', '' );
        },

        /**
         * event : on item click
         *
         * @param {HTMLElement} Item
         */
        $itemClick : function(Item)
        {
            var id = Item.get( 'data-id' );

            if ( typeof this.$items[ id ] !== 'undefined' ) {
                this.fireEvent( 'click', [ this, this.$items[ id ], Item ] );
            }
        }
    });

});