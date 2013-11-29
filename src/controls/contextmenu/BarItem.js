/**
 * Context Menu Bar Item
 *
 * @author www.namerobot.com (Henning Leutz)
 *
 * @module qui/controls/contextmenu/BarItem
 * @package com.pcsg.qui.js.controls.contextmenu
 *
 * @event onClick [ {this}, {DOMEvent} ]
 * @event onFocus [ {this} ]
 * @event onBlur [ {this} ]
 * @event onMouseLeave [ {this} ]
 * @event onMouseEnter [ {this} ]
 */

define('qui/controls/contextmenu/BarItem', [

    'qui/controls/Control',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/controls/contextmenu/Seperator',

    'css!qui/controls/contextmenu/BarItem.css'

], function(Control, ContextMenu, ContextMenuItem, ContextMenuSeperator)
{
    "use strict";

    /**
     * @class qui/controls/contextmenu/BarItem
     *
     * @event onClick [this, event]
     * @event onMouseDown [this, event]
     * @event onActive [this]
     * @event onNormal [this]
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/contextmenu/BarItem',

        Binds : [
            '$onSetAttribute',
            '$onClick',
            '$onMouseEnter',
            '$onMouseLeave',
            'blur',
            'focus',
            'appendChild'
        ],

        options : {
            text     : '',
            icon     : '',
            styles   : null,
            dragable : false
        },

        initialize : function(options)
        {
            var items = options.items || [];
            delete options.items;

            this.parent( options );

            this.$Elm   = null;
            this.$Menu  = null;
            this.$show  = false;

            this.addEvents({
                'onSetAttribute' : this.$onSetAttribute
            });

            if ( items.length ) {
                this.insert( items );
            }
        },

        /**
         * Create the DOMNode for the Element
         *
         * @method qui/controls/contextmenu/BarItem#create
         * @return {DOMNode}
         */
        create : function()
        {
            var i, len;

            var self = this;

            this.$Elm = new Element('div', {
                'class'      : 'qui-contextmenu-baritem smooth',
                html         : '<span class="qui-contextmenu-baritem-text smooth"></span>',
                'data-quiid' : this.getId(),
                tabindex     : -1,

                styles : {
                    outline : 0
                },

                events :
                {
                    click : this.$onClick,

                    blur  : function()
                    {
                        self.blur();
                        return true;
                    },

                    focus : function(event)
                    {
                        self.focus();
                        return true;
                    },

                    mouseenter : this.$onMouseEnter,
                    mouseleave : this.$onMouseLeave,

                    mousedown : function(event) {
                        event.stop();
                    },
                    mouseup : function(event) {
                        event.stop();
                    }
                }
            });

            if ( this.getAttribute( 'icon' ) &&
                 this.getAttribute( 'icon' ) !== '' )
            {
                this.$Elm.setStyle(
                    'background-image',
                    'url('+ this.getAttribute( 'icon' ) +')'
                );
            }

            if ( this.getAttribute( 'text' ) &&
                 this.getAttribute( 'text' ) !== '' )
            {
                this.$Elm.getElement( '.qui-contextmenu-baritem-text' )
                         .set( 'html', this.getAttribute('text') );
            }

            // Create sub menu, if it exist
            if ( this.$Menu ) {
                this.$Menu.inject( this.$Elm );
            }

            return this.$Elm;
        },

        /**
         * Focus the item
         *
         * @method qui/controls/contextmenu/BarItem#focus
         * @return {this}
         */
        focus : function()
        {
            if ( this.$show ) {
                return this;
            }

            this.$Elm.focus();
            this.fireEvent( 'focus', [ this ] );

            this.show();
            this.setActive();

            return this;
        },

        /**
         * Blur the item
         *
         * @method qui/controls/contextmenu/BarItem#blur
         * @return {this}
         */
        blur : function()
        {
            this.fireEvent( 'blur', [ this ] );

            this.hide();
            this.setNormal();

            return this;
        },

        /**
         * Import children
         * from a php callback or an array
         *
         * @method qui/controls/contextmenu/BarItem#insert
         * @param {Array} list
         * @return {this}
         */
        insert : function(list)
        {
            for ( var i = 0, len = list.length; i < len; i++)
            {
                if ( this.getAttribute( 'dragable' ) ) {
                    list[ i ].dragable = true;
                }

                if ( list[ i ].type == 'qui/controls/contextmenu/Seperator' )
                {
                    this.appendChild(
                        new ContextMenuSeperator( list[ i ] )
                    );

                    continue;
                }

                this.appendChild(
                    new ContextMenuItem( list[ i ] )
                );
            }

            return this;
        },

        /**
         * Opens the submenu
         *
         * @method qui/controls/contextmenu/BarItem#show
         * @return {this}
         */
        show : function()
        {
            if ( this.isActive() ) {
                return this;
            }

            if ( this.$show ) {
                return this;
            }

            this.$show = true;

            if ( this.getContextMenu().count() )
            {
                if ( this.getContextMenu().$Active ) {
                    this.getContextMenu().$Active.setNormal();
                }

                this.getContextMenu().show();
                this.getElm().addClass( 'bar-menu' );
            }

            return this;
        },

        /**
         * Close the submenu
         *
         * @method qui/controls/contextmenu/BarItem#hide
         */
        hide : function()
        {
            this.$show = false;

            this.getElm().removeClass( 'bar-menu' );
            this.getContextMenu().hide();
        },

        /**
         * Add a Child to the Item
         *
         * @method qui/controls/contextmenu/BarItem#appendChild
         *
         * @param {qui/controls/contextmenu/Item} Child
         * @return {this}
         */
        appendChild : function(Child)
        {
            if ( this.getAttribute( 'dragable' ) ) {
                Child.setAttribute( 'dragable', true );
            }

            this.getContextMenu().appendChild( Child );
            Child.setParent( this );

            return this;
        },

        /**
         * All Context Menu Items
         *
         * @method qui/controls/contextmenu/BarItem#getChildren
         * @param {String} name : [Name of the Children, optional, if no name given, returns all Children]
         * @return {Array}
         */
        getChildren : function(name)
        {
            if ( typeof name !== 'undefined' ) {
                return this.getContextMenu().getChildren( name );
            }

            return this.getContextMenu().getChildren();
        },

        /**
         * Clear the Context Menu Items
         *
         * @method qui/controls/contextmenu/BarItem#clear
         * @return {this}
         */
        clear : function()
        {
            this.getContextMenu().clear();

            return this;
        },

        /**
         * Create the Context Menu if not exist
         *
         * @method qui/controls/contextmenu/BarItem#getContextMenu
         * @return {qui/controls/contextmenu/Menu}
         */
        getContextMenu : function()
        {
            if ( !this.$Menu )
            {
                this.$Menu = new ContextMenu({
                    name   : this.getAttribute( 'name' ) +'-menu',
                    shadow : true,
                    corner : 'top',
                    events :
                    {
                        onShow : function(Menu)
                        {
                            var children = Menu.getChildren();

                            for ( var i = 0, len = children.length; i < len; i++ ) {
                                children[ i ].setNormal();
                            }
                        }
                    }
                });
            }

            if ( this.$Elm )
            {
                this.$Menu.inject( this.$Elm );
                this.$Menu.hide();
                this.$Menu.setPosition( 0, this.$Elm.getSize().y + 20 );
            }

            if ( this.getAttribute( 'dragable' ) ) {
                this.$Menu.setAttribute( 'dragable', true );
            }

            return this.$Menu;
        },

        /**
         * Set the Item active
         *
         * @method qui/controls/contextmenu/BarItem#setActive
         * @return {this}
         */
        setActive : function()
        {
            if ( this.isActive() ) {
                return this;
            }

            this.fireEvent( 'active', [ this ] );
            this.$Elm.addClass( 'qui-contextmenu-baritem-active' );

            return this;
        },

        /**
         * Is the Item active?
         *
         * @method qui/controls/contextmenu/BarItem#isActive
         * @return {Boolean}
         */
        isActive : function()
        {
            if ( this.$Elm && this.$Elm.hasClass( '.qui-contextmenu-baritem-active' ) ) {
                return true;
            }

            return false;
        },

        /**
         * Set the Item active
         *
         * @method qui/controls/contextmenu/BarItem#setNormal
         */
        setNormal : function()
        {
            this.$Elm.removeClass( 'qui-contextmenu-baritem-active' );
            this.fireEvent( 'normal', [ this ] );

            return this;
        },

        /**
         * onSetAttribute Event
         * Set the attribute to the DOMElement if setAttribute is execute
         *
         * @method qui/controls/contextmenu/BarItem#$onSetAttribute
         *
         * @param {String} key
         * @param {unknown_type} value
         *
         * @ignore
         */
        $onSetAttribute : function(key, value)
        {
            if ( !this.$Elm ) {
                return;
            }

            if ( key == 'text' )
            {
                this.$Elm.getElement('.qui-contextmenu-baritem-text')
                         .set('html', value);

                return;
            }

            if ( key == 'icon' )
            {
                this.$Elm.setStyle('background-image', 'url('+ value +')');
                return;
            }
        },

        /**
         * event : onclick
         *
         * @method qui/controls/contextmenu/BarItem#$onClick
         */
        $onClick : function(event)
        {
            this.fireEvent( 'click', [ this, event ] );
            this.focus();
        },

        /**
         * event : on mouse enter
         *
         * @method qui/controls/contextmenu/BarItem#$onMouseEnter
         */
        $onMouseEnter : function()
        {
            this.fireEvent( 'mouseEnter', [ this ] );
        },

        /**
         * event : on mouse leave
         *
         * @method qui/controls/contextmenu/BarItem#$onMouseLeave
         */
        $onMouseLeave : function()
        {
            this.fireEvent( 'mouseLeave', [ this ] );
        }
    });
});