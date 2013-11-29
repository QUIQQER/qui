/**
 * Menu bar
 *
 * @author www.namerobot.com (Henning Leutz)
 *
 * @module qui/controls/contextmenu/Bar
 * @package com.pcsg.quiqqer.controls.contextmenu
 * @namespace QUI.controls.contextmenu
 */

define('qui/controls/contextmenu/Bar', [

    'qui/controls/Control',
    'qui/controls/contextmenu/BarItem',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/controls/contextmenu/Seperator',

    'css!qui/controls/contextmenu/Bar.css'

], function(Control, ContextBarItem, ContextMenu, ContextItem, ContextSeperator)
{
    "use strict";

    /**
     * @class qui/controls/contextmenu/Bar
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/contextmenu/Bar',

        Binds : [
            '$onItemEnter',
            '$onItemLeave',
            '$onItemClick',
            '$onItemBlur'
        ],

        options : {
            styles    : null,     // mootools css styles
            width     : 200,      // menü width
            openening : false,  // if open status = true, onmouseover opens the baritmes
            dragable  : false
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$items   = [];
            this.$Elm     = null;
            this.$Menu    = null;
            this.$cActive = null;
        },

        /**
         * Create the DOMNode Element
         *
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'qui-contextmenu-bar'
            });

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            return this.$Elm;
        },

        /**
         * Import children from a php callback
         *
         * @param {Array} list - new QUI\Controls\Contextmenu\Bar()->toArray()
         * @return {this}
         */
        insert : function(list)
        {
            for ( var i = 0, len = list.length; i < len; i++)
            {
                if ( this.getAttribute( 'dragable' ) ) {
                    list[ i ].dragable = true;
                }

                this.appendChild(
                    new ContextBarItem( list[ i ] )
                );
            }

            return this;
        },

        /**
         * Get an Child Element
         *
         * @method qui/controls/contextmenu/Bar#getChildren
         *
         * @param {String} name : [Name of the Children, optional, if no name given, returns all Children]
         * @return {Array|false|QUI.controls.contextmenu.Item}
         */
        getChildren : function(name)
        {
            if ( typeof name !== 'undefined' )
            {
                var i, len;
                var items = this.$items;

                for ( i = 0, len = items.length; i < len; i++ )
                {
                    if ( items[ i ].getAttribute( 'name' ) == name ) {
                        return items[ i ];
                    }
                }

                return false;
            }

            return this.$items;
        },

        /**
         * Return the first child Element
         *
         * @method qui/controls/contextmenu/Bar#firstChild
         * @return {false|QUI.controls.contextmenu.Item}
         */
        firstChild : function()
        {
            if ( this.$items[ 0 ] ) {
                return this.$items[ 0 ];
            }

            return false;
        },

        /**
         * Return the number of children
         *
         * @method qui/controls/contextmenu/Bar#count
         * @return {Integer}
         */
        count : function()
        {
            return this.$items.length;
        },

        /**
         * Add the Child to the Menü
         *
         * @method qui/controls/contextmenu/Bar#appendChild
         *
         * @param {qui/controls/contextmenu/BarItem} Child
         * @return {this}
         */
        appendChild : function(Child)
        {
            if ( !Child || typeof Child === 'undefined' ) {
                return this;
            }

            if ( this.getAttribute( 'dragable' ) ) {
                Child.setAttribute( 'dragable', true );
            }

            this.$items.push( Child );

            Child.addEvents({
                onMouseEnter : this.$onItemEnter,
                onMouseLeave : this.$onItemLeave,
                onClick      : this.$onItemClick,
                onBlur       : this.$onItemBlur
            });

            if ( this.$Elm ) {
                Child.inject( this.$Elm );
            }

            Child.setParent( this );

            return this;
        },

        /**
         * Destroy all children items
         *
         * @method qui/controls/contextmenu/Bar#clearChildren
         *
         * @return {this}
         */
        clearChildren : function()
        {
            for ( var i = 0, len = this.$items.length; i < len; i++ )
            {
                if ( this.$items[ i ] ) {
                    this.$items[ i ].destroy();
                }
            }

            this.$items = [];

            return this;
        },

        /**
         * Return the next children / item of the item
         *
         * @method qui/controls/contextmenu/Bar#getNext
         * @param {qui/controls/contextmenu/Item} Item
         * @return {qui/controls/contextmenu/Item|false}
         */
        getNext : function(Item)
        {
            for ( var i = 0, len = this.$items.length; i < len; i++ )
            {
                if ( this.$items[ i ] != Item ) {
                    continue;
                }

                if ( typeof this.$items[ i + 1 ] !== 'undefined' ) {
                    return this.$items[ i + 1 ];
                }
            }

            return false;
        },

        /**
         * Return the previous children / item of the item
         *
         * @method qui/controls/contextmenu/Bar#getPrevious
         * @param {qui/controls/contextmenu/BarItem} Item
         * @return {qui/controls/contextmenu/BarItem|false}
         */
        getPrevious : function(Item)
        {
            var i = this.$items.length - 1;

            for ( ; i >= 0; i-- )
            {
                if ( i === 0 ) {
                    return false;
                }

                if ( this.$items[ i ] == Item ) {
                    return this.$items[ i - 1 ];
                }
            }

            return false;
        },

        /**
         * event: on item enter
         * @param {qui/controls/contextmenu/BarItem} Item
         */
        $onItemEnter : function(Item)
        {
            if ( this.getAttribute( 'openening' ) === false ) {
                return;
            }

            if ( this.$Active == Item ) {
                return;
            }

            if ( this.$Active ) {
                this.$Active.blur();
            }

            if ( typeof this.$delay !== 'undefined' && this.$delay ) {
                clearTimeout( this.$delay );
            }

            Item.focus();
            this.$Active = Item;
        },

        /**
         * event: on item enter
         * @param {qui/controls/contextmenu/BarItem} Item
         */
        $onItemLeave : function(Item)
        {

        },

        /**
         * event: on item enter
         * @param {qui/controls/contextmenu/BarItem} Item
         */
        $onItemClick : function(Item)
        {
            this.setAttribute( 'openening', true );
        },

        /**
         * event: on item blur
         */
        $onItemBlur : function()
        {
            this.$Active = null;

            this.$delay = function()
            {
                if ( !this.$Active ) {
                    this.setAttribute( 'openening', false );
                }
            }.delay( 200, this );
        }
    });
});