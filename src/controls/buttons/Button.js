/**
 * QUI Control - Button
 *
 * @author www.namerobot.com (Henning Leutz)
 *
 * @requires qui/controls/Control
 * @requires qui/utils/NoSelect
 *
 * @module controls/buttons/Button
 * @package com.pcsg.qui.js.controls.buttons
 */

define('qui/controls/buttons/Button', [

    'qui/controls/Control',
    'qui/utils/Controls',
    'qui/utils/NoSelect',

    'css!qui/controls/buttons/Button.css'

], function(Control, Utils, NoSelect)
{
    "use strict";

    /**
     * @class qui/controls/buttons/Button
     *
     * @event onClick
     * @event onCreate
     * @event onDrawBegin
     * @event onDrawEnd
     * @event onSetNormal
     * @event onSetDisable
     * @event onSetActive
     *
     * @event onEnter     - event triggerd if button is not disabled
     * @event onLeave     - event triggerd if button is not disabled
     * @event onMousedown - event triggerd if button is not disabled
     * @event onMouseUp   - event triggerd if button is not disabled
     * @event onFocus
     * @event onBlur
     * @event onActive
     * @event onDisable
     * @event onEnable
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/buttons/Button',

        Binds : [
            'onSetAttribute'
        ],

        options : {
            'type'      : 'button',
            'image'     : false,   // (@depricated) use the icon attribute
            'icon'      : false,   // icon top of the text
            'style'     : {},      // mootools css style attributes
            'textimage' : false,   // Image left from text
            'text'      : false,   // Button text
            'title'     : false,
            'class'     : false    // extra CSS Class
        },

        params : {},

        initialize : function(options)
        {
            this.parent( options );

            this.$Menu  = null;
            this.$Drop  = null;
            this.$items = [];


            if ( options.events ) {
                delete options.events;
            }

            this.setAttributes(
                this.initV2( options )
            );

            this.addEvent('onSetAttribute', this.onSetAttribute);
            this.addEvent('onDestroy', function()
            {
                if ( this.$Menu ) {
                    this.$Menu.destroy();
                }
            }.bind( this ));
        },

        /**
         * Compatible to _ptools::Button v2
         *
         * @method qui/controls/buttons/Button#initV2
         * @ignore
         */
        initV2: function(options)
        {
            if ( options.onclick )
            {
                if ( typeOf( options.onclick ) === 'string' )
                {
                    options.onclick = function(p) {
                        eval(p +'(this);');
                    }.bind(this, [ options.onclick ]);
                }

                this.addEvent( 'onClick', options.onclick );
                delete options.onclick;
            }

            if ( options.oncreate )
            {
                this.addEvent( 'onCreate', options.oncreate );
                delete options.oncreate;
            }

            return options;
        },

        /**
         * Create the DOM Element
         *
         * @method qui/controls/buttons/Button#create
         * @return {DOMNode}
         */
        create : function()
        {
            var i, len;

            var self = this;

            var Elm = new Element('button.qui-button', {
                'type' : this.getAttribute('type'),
                'data-status' : 0,
                'data-quiid'  : this.getId()
            });

            if ( this.getAttribute( 'width' ) ) {
                Elm.setStyle( 'width', this.getAttribute( 'width' ) );
            }

            if ( this.getAttribute('height') ) {
                Elm.setStyle( 'height', this.getAttribute( 'height' ) );
            }

            if ( this.getAttribute( 'styles' ) ) {
                Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            if ( this.getAttribute( 'class' ) ) {
                Elm.addClass( this.getAttribute( 'class' ) );
            }

            Elm.style.outline = 0;
            Elm.setAttribute('tabindex', "-1");

            Elm.addEvents({

                click : function(event)
                {
                    if ( self.isDisabled() ) {
                        return;
                    }

                    self.onclick( event );
                },

                mouseenter : function()
                {
                    if ( self.isDisabled() ) {
                        return;
                    }

                    if ( !self.isActive() ) {
                        self.getElm().addClass( 'qui-button-over' );
                    }

                    self.fireEvent( 'enter', [ self ] );
                },

                mouseleave : function()
                {
                    if ( self.isDisabled() ) {
                        return;
                    }

                    if ( !self.isActive() ) {
                        self.getElm().removeClass( 'qui-button-over' );
                    }

                    self.fireEvent( 'leave', [ self ] );
                },

                mousedown : function(event)
                {
                    if ( self.isDisabled() ) {
                        return;
                    }

                    self.fireEvent( 'mousedown', [ self, event ] );

                },

                mouseup : function(event)
                {
                    if ( self.isDisabled() ) {
                        return;
                    }

                    self.fireEvent( 'mouseup', [ self, event ] );
                },

                blur : function(event)
                {
                    self.fireEvent( 'blur', [ self, event ] );
                },

                focus : function(event)
                {
                    self.fireEvent( 'focus', [ self, event ] );
                }
            });

            this.$Elm = Elm;


            // Elemente aufbauen
            if ( this.getAttribute( 'icon' ) ) {
                this.setAttribute( 'icon', this.getAttribute( 'icon' ) );
            }

            if ( !this.getAttribute( 'icon' ) && this.getAttribute( 'image' ) ) {
                this.setAttribute( 'icon', this.getAttribute( 'image' ) );
            }

            if ( this.getAttribute( 'styles' ) ) {
                this.setAttribute( 'styles', this.getAttribute( 'styles' ) );
            }

            if ( this.getAttribute( 'textimage' ) ) {
                this.setAttribute( 'textimage', this.getAttribute( 'textimage' ) );
            }

            if ( this.getAttribute( 'text' ) ) {
                this.setAttribute( 'text', this.getAttribute( 'text' ) );
            }

            if ( this.getAttribute( 'title' ) ) {
                this.$Elm.setAttribute( 'title', this.getAttribute( 'title' ) );
            }

            if ( this.getAttribute( 'disabled' ) ) {
                this.setDisable();
            }


            // sub menu
            len = this.$items.length;

            if ( len )
            {
                this.getContextMenu(function(Menu)
                {
                    for ( i = 0; i < len; i++ ) {
                        Menu.appendChild( self.$items[i] );
                    }

                    self.$Drop = new Element('div', {
                        'class' : 'qui-button-drop icon-chevron-down'
                    }).inject( self.$Elm );
                });
            }

            this.fireEvent( 'create', [ this ] );

            NoSelect.disable( Elm );

            return this.$Elm;
        },

        /**
         * Trigger the Click Event
         *
         * @method qui/controls/buttons/Button#onclick
         * @param {DOMEvent} event
         */
        click : function(event)
        {
            if ( this.isDisabled() ) {
                return;
            }

            this.fireEvent( 'click', [ this, event ] );
        },

        /**
         * @see qui/controls/buttons/Button#onclick
         */
        onclick : function(event)
        {
            this.click( event );
        },

        /**
         * Set the Button Active
         *
         * @method qui/controls/buttons/Button#setActive
         */
        setActive : function()
        {
            if ( this.isDisabled() ) {
                return;
            }

            var Elm = this.getElm();

            if ( !Elm ) {
                return;
            }

            Elm.addClass( 'qui-button-active' );
            Elm.set( 'data-status', 1 );

            this.fireEvent( 'active', [ this ] );
        },

        /**
         * is Button Active?
         *
         * @method qui/controls/buttons/Button#isActive
         * @return {Bool}
         */
        isActive : function()
        {
            if ( !this.getElm() ) {
                return false;
            }

            if ( this.getElm().get( 'data-status' ) == 1 ) {
                return true;
            }

            return false;
        },

        /**
         * Disable the Button
         * Most Events are no more triggered
         *
         * @method qui/controls/buttons/Button#disable
         * @return {qui/controls/buttons/Button}
         */
        disable : function()
        {
            var Elm = this.getElm();

            if ( !Elm ) {
                return;
            }

            Elm.set({
                'data-status' : -1,
                'disabled'    : 'disabled'
            });

            this.fireEvent( 'disable', [ this ] );

            return this;
        },

        /**
         * @depricated use disable
         * @method qui/controls/buttons/Button#setDisable
         * @return {qui/controls/buttons/Button}
         */
        setDisable : function()
        {
            return this.disable();
        },

        /**
         * is Button Disabled?
         *
         * @method qui/controls/buttons/Button#isDisabled
         * @return {Bool}
         */
        isDisabled : function()
        {
            if ( !this.getElm() ) {
                return false;
            }

            if ( this.getElm().get('data-status') == -1 ) {
                return true;
            }

            return false;
        },

        /**
         * If the Button was disabled, you can enable the Button
         *
         * @method qui/controls/buttons/Button#setEnable
         * @return {this}
         */
        enable : function()
        {
            if ( !this.getElm() ) {
                return false;
            }

            this.getElm().set({
                'data-status' : 0,
                'disabled'    : null
            });

            this.setNormal();

            return this;
        },

        /**
         * @depricated
         *
         * @method qui/controls/buttons/Button#setEnable
         * @return {this}
         */
        setEnable : function()
        {
            return this.enable();
        },

        /**
         * If the Button was active, you can normalize the Button
         * The Button must be enabled.
         *
         * @method qui/controls/buttons/Button#setNormal
         * @return {this}
         */
        setNormal : function()
        {
            if ( this.isDisabled() ) {
                return;
            }

            if ( !this.getElm() ) {
                return false;
            }

            var Elm = this.getElm();

            Elm.set({
                'data-status' : 0,
                'disabled'    : null
            });

            Elm.removeClass( 'qui-button-active' );

            this.fireEvent( 'normal', [ this ] );

            return this;
        },

        /**
         * Adds a Children to an Button Menu
         *
         * @method qui/controls/buttons/Button#appendChild
         *
         * @param {qui/controls/contextmenu/Item} Itm
         * @return {this}
         */
        appendChild : function(Itm)
        {
            this.$items.push( Itm );

            Itm.setAttribute( 'Button', this );

            if ( !this.$Elm ) {
                return this;
            }

            var self = this;

            this.getContextMenu(function(Menu)
            {
                Menu.appendChild( Itm );

                if ( !self.$Drop )
                {
                    self.$Drop = new Element('div', {
                        'class' : 'qui-button-drop icon-chevron-down'
                    }).inject( self.$Elm );
                }
            });

            return this;
        },

        /**
         * All Context Menu Items
         *
         * @method qui/controls/buttons/Button#getChildren
         * @return {Array}
         */
        getChildren : function()
        {
            return this.$items;
        },

        /**
         * Clear the Context Menu Items
         *
         * @method qui/controls/buttons/Button#clear
         * @return {this}
         */
        clear : function()
        {
            this.getContextMenu(function(Menu) {
                Menu.clearChildren();
            });

            this.$items = [];

            return this;
        },

        /**
         * Create the Context Menu if not exist
         *
         * @method qui/controls/buttons/Button#getContextMenu
         *
         * @param {Function} callback - callback function( {qui/controls/contextmenu/Menu} )
         * @return {this}
         */
        getContextMenu : function(callback)
        {
            if ( this.$Menu && typeof this.$createContextMenu === 'undefined' )
            {
                callback( this.$Menu );
                return this;
            }

            var self = this;

            if ( typeof this.$createContextMenu !== 'undefined' )
            {
                (function() {
                    self.getContextMenu( callback );
                }).delay( 10 );

                return this;
            }


            this.$createContextMenu = true;

            require(['qui/controls/contextmenu/Menu'], function(Menu)
            {
                self.$Menu = new Menu({
                    name   : self.getAttribute('name') +'-menu',
                    corner : 'top'
                });

                self.$Menu.inject( document.body );

                self.addEvents({
                    onClick : function()
                    {
                        if ( self.isDisabled() ) {
                            return;
                        }

                        var pos  = self.$Elm.getPosition(),
                            size = self.$Elm.getSize();

                        self.$Menu.setPosition(
                            pos.x - 20,
                            pos.y + size.y + 10
                        );

                        self.$Menu.show();
                        self.$Elm.focus();
                    },

                    onBlur : function()
                    {
                        self.$Menu.hide();
                    }
                });

                self.$Menu.setParent( self );

                delete self.$createContextMenu;

                callback( self.$Menu );
            });
        },

        /**
         * Method for changing the DOMNode if attributes are changed
         *
         * @method qui/controls/buttons/Button#onSetAttribute
         *
         * @param {String} k             - Attribute name
         * @param {unknown_type} value     - Attribute value
         *
         * @ignore
         */
        onSetAttribute : function(k, value)
        {
            var Elm = this.getElm();

            //this.options[k] = value;

            if ( !Elm ) {
                return;
            }

            // onclick overwrite
            if ( k === 'onclick' )
            {
                this.removeEvents('click');

                this.addEvent('click', function(p)
                {
                    eval(p +'(this);');
                }.bind( this, [value] ));

                return;
            }

            if ( k == 'image' ) {
                k = 'icon';
            }

            // Image
            if ( k === 'icon' )
            {
                if ( !Elm.getElement('.image-container') )
                {
                    new Element('div.image-container', {
                        align : 'center'
                    }).inject( Elm );
                }

                var Image = Elm.getElement('.image-container');

                Image.set( 'html', '' );

                if ( Utils.isFontAwesomeClass( value ) )
                {
                    new Element('span', {
                        'class' : value
                    }).inject( Image );
                } else
                {
                    new Element('img.qui-button-image', {
                        src    : value,
                        styles : {
                            'display' : 'block' // only image, fix
                        }
                    }).inject( Image );
                }

                return;
            }

            // Style Attributes
            if ( k === "styles" )
            {
                Elm.setStyles( value );
                return;
            }

            // Text
            if ( k === "title" )
            {
                Elm.setAttribute( 'title', value );
                return;
            }

            // Text and Text-Image
            if ( k !== 'textimage' && k !== 'text' ) {
                return;
            }

            // Text + Text Image
            if ( !Elm.getElement('.qui-button-text') ) {
                new Element('span.qui-button-text').inject( Elm );
            }

            var Txt = Elm.getElement('.qui-button-text');

            // Text
            if ( k === 'text' ) {
                Txt.set( 'html', value );
            }

            if ( k === 'textimage' )
            {
                var Img;

                if ( Elm.getElement('.qui-button-text-image') ) {
                    Elm.getElement('.qui-button-text-image').destroy();
                }

                if ( Utils.isFontAwesomeClass( value ) )
                {
                    Img = new Element('span', {
                        'class'  : 'qui-button-text-image '+ value,
                        styles : {
                            'margin-right': 0
                        }
                    }).inject( Txt, 'before' );
                } else
                {
                    Img = new Element('img', {
                        'class' : 'qui-button-text-image',
                        src     : value,
                        styles  : {
                            'margin-right': 0
                        }
                    }).inject( Txt, 'before' );
                }

                if ( this.getAttribute('text') ) {
                    Img.setStyle( 'margin-right', null );
                }
            }
        }
    });
});
