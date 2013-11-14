/**
 * Context Menu Item
 *
 * @author www.namerobot.com (Henning Leutz)
 *
 * @requires qui/controls/Control
 * @requires qui/classes/utils/DragDrop
 * @requires qui/controls/contextmenu/Menu
 * @requires qui/controls/contextmenu/Item
 * @requires qui/controls/contextmenu/Seperator
 *
 * @module controls/contextmenu/Item
 * @package com.pcsg.qui.js.controls.contextmenu
 */

define('qui/controls/contextmenu/Item', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/classes/utils/DragDrop',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/controls/contextmenu/Seperator',
    'qui/utils/Controls',

    'css!qui/controls/contextmenu/Item.css'

], function(QUI, Control, DragDrop, ContextMenu, ContextMenuItem, ContextMenuSeperator, Utils)
{
    "use strict";

    /**
     * @class qui/controls/contextmenu/Item
     *
     * @event onClick [this, event]
     * @event onMouseDown [this, event]
     * @event onMouseUp [this, event]
     * @event onActive [this]
     * @event onNormal [this]
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/contextmenu/Item',

        Binds : [
            '$onSetAttribute',
            '$stringEvent',
            '$onClick',

            '$onMouseEnter',
            '$onMouseLeave',
            '$onMouseUp',
            '$onMouseDown',
        ],

        options : {
            text   : '',
            icon   : '',
            styles : null,

            dragable : false
        },

        initialize : function(options)
        {
            var items  = options.items || [],
                events = options.events || false;

            delete options.items;
            delete options.events;

            this.parent( options );

            this.$items = [];
            this.$Elm   = null;
            this.$Menu  = null;
            this.$path  = '';

            this.addEvent( 'onSetAttribute', this.$onSetAttribute );

            if ( items.length ) {
                this.insert( items );
            }

            if ( !events ) {
                return;
            }

            for ( var event in events )
            {
                if ( typeof events[ event ] === 'string' )
                {
                    this.addEvent(event, this.$stringEvent.bind(
                        this,
                        events[ event ]
                    ));

                    continue;
                }

                this.addEvent( event, events[ event ] );
            }
        },

        /**
         * Create the DOMNode for the Element
         *
         * @method qui/controls/contextmenu/Item#create
         *
         * @return {DOMNode}
         */
        create : function()
        {
            var i, len;

            this.$Elm = new Element('div.qui-contextitem', {
                html   : '<div class="qui-contextitem-container">' +
                            '<span class="qui-contextitem-icon"></span>' +
                            '<span class="qui-contextitem-text"></span>' +
                         '</div>',

                'data-quiid' : this.getId(),
                tabindex : -1,

                events :
                {
                    click : this.$onClick,

                    mousedown  : this.$onMouseDown,
                    mouseup    : this.$onMouseUp,
                    mouseenter : this.$onMouseEnter,
                    mouseleave : this.$onMouseLeave
                }
            });

            if ( this.getAttribute( 'icon' ) && this.getAttribute( 'icon' ) !== '' )
            {
                var Icon = this.$Elm.getElement( '.qui-contextitem-icon' ),
                    icon = this.getAttribute( 'icon' );

                // font awesome
                if ( Utils.isFontAwesomeClass( icon ) )
                {
                    Icon.addClass( icon );
                } else
                {
                    Icon.setStyle( 'background-image', 'url('+ icon +')' );
                }
            }

            if ( this.getAttribute( 'text' ) && this.getAttribute( 'text' ) !== '' )
            {
                var Text = this.$Elm.getElement( '.qui-contextitem-text' );

                Text.set( 'html', this.getAttribute( 'text' ) );
            }

            // drag drop for the item
            if ( this.getAttribute( 'dragable' ) )
            {
                new DragDrop( this.$Elm, {
                    dropables : '.qui-contextitem-dropable',
                    events   :
                    {
                        onEnter : function(Element, Droppable)
                        {
                            if ( !Droppable ) {
                                return;
                            }

                            var quiid = Droppable.get( 'data-quiid' );

                            if ( !quiid ) {
                                return;
                            }

                            QUI.Controls.getById( quiid ).highlight();
                        },

                        onLeave : function(Element, Droppable)
                        {
                            if ( !Droppable ) {
                                return;
                            }

                            var quiid = Droppable.get( 'data-quiid' );

                            if ( !quiid ) {
                                return;
                            }

                            QUI.Controls.getById( quiid ).normalize();
                        },

                        onDrop : function(Element, Droppable, event)
                        {
                            if ( !Droppable ) {
                                return;
                            }
                            var quiid = Droppable.get( 'data-quiid' );

                            if ( !quiid ) {
                                return;
                            }

                            var Bar = QUI.Controls.getById( quiid );

                            Bar.normalize();
                            Bar.appendChild( this );

                        }.bind( this )
                    }
                });
            }

            // Create sub menu, if sub items exist
            len = this.$items.length;

            if ( len )
            {
                this.$Elm.addClass( 'haschildren' );

                var Menu = this.getContextMenu();

                for ( i = 0; i < len; i++ )
                {
                    Menu.appendChild(
                        this.$items[i]
                    );
                }
            }

            return this.$Elm;
        },

        /**
         * Import children
         * from a php callback or an array
         *
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

                if ( list[ i ].type == 'Controls_Contextmenu_Seperator' )
                {
                    this.appendChild(
                        new ContextMenuSeperator( list[ i ] )
                    );

                    continue;
                }

                this.appendChild(
                    new ContextMenuItem( list[i] )
                );
            }

            return this;
        },

        /**
         * trigger a click
         *
         * @method qui/controls/contextmenu/Item#click
         */
        click : function()
        {
            this.$onClick();
        },

        /**
         * Add a Child to the Item
         *
         * @method qui/controls/contextmenu/Item#appendChild
         *
         * @param {qui/controls/contextmenu/Item} Child
         * @return {this} self
         */
        appendChild : function(Child)
        {
            this.$items.push( Child );

            Child.setParent( this );

            if ( this.$Elm )
            {
                this.$Elm.addClass( 'haschildren' );
                Child.inject( this.getContextMenu() );
            }

            return this;
        },

        /**
         * Set the Item active
         *
         * @method qui/controls/contextmenu/Item#setActive
         * @return {this}
         */
        setActive : function()
        {
            if ( this.$Elm && this.$Elm.hasClass('qui-contextitem-active') ) {
                return this;
            }

            if ( this.$Elm )
            {
                if ( this.$Menu )
                {
                    this.$Elm
                        .getChildren('.qui-contextitem-container')
                        .addClass('qui-contextitem-active');
                } else
                {
                    this.$Elm.addClass('qui-contextitem-active');
                }
            }

            this.fireEvent( 'active', [ this ] );

            return this;
        },

        /**
         * Normalize the item
         *
         * @method qui/controls/contextmenu/Item#setNormal
         * @return {this}
         */
        setNormal : function()
        {
            if ( !this.$Elm ) {
                return this;
            }

            if ( this.$Menu )
            {
                this.$Elm
                    .getChildren( '.qui-contextitem-container' )
                    .removeClass( 'qui-contextitem-active' );
            } else
            {
                this.$Elm.removeClass( 'qui-contextitem-active' );
            }

            this.fireEvent( 'normal', [ this ] );

            return this;
        },

        /**
         * All Context Menu Items
         *
         * @method qui/controls/contextmenu/Item#getChildren
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
         * @method qui/controls/contextmenu/Item#clear
         * @return {this}
         */
        clear : function()
        {
            this.getContextMenu().clear();
            this.$items = [];

            return this;
        },

        /**
         * Create the Context Menu if not exist
         *
         * @method qui/controls/contextmenu/Item#getContextMenu
         * @return {QUI.controls.contextmenu.Menu}
         */
        getContextMenu : function()
        {
            if ( this.$Menu ) {
                return this.$Menu;
            }

            console.log( ContextMenu );

            this.$Menu = new ContextMenu({
                name   : this.getAttribute( 'name' ) +'-menu',
                events :
                {
                    onShow : function(Menu)
                    {
                        var children = Menu.getChildren();

                        for ( var i = 0, len = children.length; i < len; i++ ) {
                            children[i].setNormal();
                        }
                    }
                }
            });

            this.$Menu.inject( this.$Elm );
            this.$Menu.hide();
            this.$Menu.setParent( this.getParent() );

            return this.$Menu;
        },

        /**
         * onSetAttribute Event
         * Set the attribute to the DOMElement if setAttribute is execute
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
                this.$Elm.getElement( '.qui-contextitem-text' )
                         .set( 'html', value );

                return;
            }

            if ( key == 'icon' )
            {
                var Icon = this.$Elm.getElement( '.qui-contextitem-icon' );

                Icon.className = 'qui-contextitem-icon';
                Icon.setStyle( 'background-image', null );

                if ( Utils.isFontAwesomeClass( value ) )
                {
                    Icon.addClass( value );
                } else
                {
                    this.$Elm.getElement( '.qui-contextitem-container' )
                             .setStyle( 'background-image', 'url('+ value +')' );

                }

                return;
            }
        },

        /**
         * interpret a string event
         *
         * @param {String} event
         */
        $stringEvent : function(event)
        {
            eval( '('+ event +'(this));' );
        },

        /**
         * event : onclick
         *
         * @param {DOMEvent} event
         * @ignore
         */
        $onClick : function(event)
        {
            this.fireEvent( 'click', [ this, event ] );
        },

        /**
         * event: mouse enter
         *
         * @param {DOMEvent} event - optional
         */
        $onMouseEnter : function(event)
        {
            if ( this.$Menu )
            {
                var size   = this.$Elm.getSize(),
                    Parent = this.$Menu.getParent();

                this.$Menu.setPosition( size.x, 0 );
                this.$Menu.show();

                if ( Parent )
                {
                    var MenuElm = this.$Menu.getElm(),

                        elm_pos   = MenuElm.getPosition(),
                        elm_size  = MenuElm.getSize(),
                        body_size = document.body.getSize();

                    if ( elm_pos.x + size.x > body_size.x )
                    {
                        // show the menü left
                        this.$Menu.setPosition( 0 - elm_size.x, 0 );
                    }
                }

                this.$Elm
                    .getChildren( '.qui-contextitem-container' )
                    .addClass( 'qui-contextitem-active' );
            }

            this.setActive();
        },

        /**
         * event: mouse leave
         *
         * @param {DOMEvent} event - optional
         */
        $onMouseLeave : function(event)
        {
            if ( this.$Menu ) {
                this.$Menu.hide();
            }

            this.$Elm
                .getChildren( '.qui-contextitem-container' )
                .removeClass( 'qui-contextitem-active' );

            this.setNormal();
        },

        /**
         * event: mouse up
         *
         * @param {DOMEvent} event - optional
         */
        $onMouseUp : function(event)
        {
            this.fireEvent( 'mouseUp', [ this, event ] );
            event.stop();
        },

        /**
         * event: mouse down
         *
         * @param {DOMEvent} event - optional
         */
        $onMouseDown : function(event)
        {
            this.fireEvent( 'mouseDown', [ this, event ] );
            event.stop();
        }
    });
});