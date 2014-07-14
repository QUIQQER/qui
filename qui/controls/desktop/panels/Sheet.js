/**
 * A panel Sheet
 *
 * @author www.pcsg.de (Henning Leutz)
 *
 * @module controls/desktop/panels/Sheet
 * @package com.pcsg.qui.js.controls.desktop.panels
 *
 * @event onOpen [this]
 * @event onClose [this]
 */

define('qui/controls/desktop/panels/Sheet', [

    'qui/controls/Control',
    'qui/controls/buttons/Button',

    'css!qui/controls/desktop/panels/Sheet.css'

], function(Control, Button)
{
    "use strict";

    /**
     * @class qui/controls/desktop/panels/Sheet
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/desktop/panels/Sheet',

        Binds : [
            '$fxComplete'
        ],

        options : {
            styles : false
        },

        initialize: function(options)
        {
            this.parent( options );

            this.$Elm     = null;
            this.$Header  = null;
            this.$Body    = null;
            this.$Buttons = null;
            this.$FX      = null;
        },

        /**
         * Create the DOMNode Element of the Sheet
         *
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div.qui-panel-sheet', {
                'data-quiid' : this.getId(),

                html : '<div class="qui-panel-sheet-header box"></div>' +
                       '<div class="qui-panel-sheet-body box"></div>' +
                       '<div class="qui-panel-sheet-btn-container box">' +
                            '<div class="qui-panel-sheet-buttons"></div>' +
                       '</div>',

               styles : {
                   visibility : 'hidden',
                   display    : 'none'
               }
            });

            if ( this.getAttribute('styles') ) {
                this.$Elm.setStyles( this.getAttribute('styles') );
            }

            this.$Header  = this.$Elm.getElement( '.qui-panel-sheet-header' );
            this.$Body    = this.$Elm.getElement( '.qui-panel-sheet-body' );
            this.$Buttons = this.$Elm.getElement( '.qui-panel-sheet-btn-container' );

            this.$Header.set( 'html', this.getAttribute( 'title' ) );

            this.$FX = moofx( this.$Elm );

            return this.$Elm;
        },

        /**
         * Return the panel content
         *
         * @return {DOMNode|null}
         */
        getContent : function()
        {
            return this.$Body;
        },

        /**
         * Return the panel content
         *
         * @return {DOMNode|null}
         */
        getBody : function()
        {
            return this.getContent();
        },

        /**
         * Return the button container
         *
         * @return {DOMNode|null}
         */
        getButtons : function()
        {
            return this.$Buttons;
        },

        /**
         * Add a button to the Sheet
         *
         * @param {qui/controls/buttons/Button|Object} Btn - QUI Button or QUI Button options
         * @return {this}
         */
        addButton : function(Btn)
        {
            if ( typeOf( Btn ) !== 'qui/controls/buttons/Button' ) {
                Btn = new Button( Btn );
            }

            var i, len, list;

            var Container = this.getButtons().getElement( '.qui-panel-sheet-buttons' ),
                width     = 0,
                styles    = Btn.getAttributes( 'styles' ) || {};

            styles.margin = '12px 5px';


            Btn.setAttribute( 'styles', styles );
            Btn.inject( Container );

            list = Container.getElements( 'button' );

            for ( i = 0, len = list.length; i < len; i++ ) {
                width = width + list[ i ].getComputedSize().totalWidth;
            }

            Container.setStyle( 'width', width );
        },

        /**
         * Show the panel sheet
         *
         * @return {this}
         */
        show : function()
        {
            var Elm     = this.getElm(),
                Parent  = Elm.getParent(),
                size    = Parent.getSize();

            Elm.setStyles({
                visibility : null,
                left       : (size.x + 50) * -1,
                height     : size.y
            });

            Elm.setStyle( 'display', null );


            var button_size = this.getButtons().getSize(),
                header_size = this.$Header.getSize();

            this.getBody().setStyles({
                height  : size.y - button_size.y - header_size.y,
                width   : '100%',
                'float' : 'left'
            });

            var CloseButton = new Button({
                text : 'schließen / abbrechen',
                textimage : 'icon-remove',
                events : {
                    onClick : this.hide.bind( this )
                }
            });

            new Button({
                icon : 'icon-remove',
                styles : {
                    'float' : 'right'
                },
                events : {
                    onClick : this.hide.bind( this )
                }
            }).inject( this.$Header );

            this.addButton( CloseButton );


            this.$FX.animate({
                left : 0
            }, {
                callback : this.$fxComplete
            });

            return this;
        },

        /**
         * Hide the panel sheet
         *
         * @return {this}
         */
        hide : function()
        {
            var Elm    = this.getElm(),
                Parent = Elm.getParent(),
                size   = Parent.getSize();

            this.$FX.animate({
                left : (size.x + 50) * -1
            }, {
                callback : this.$fxComplete
            });

            return this;
        },

        /**
         * fx complete action
         * if panel is closed or opened
         */
        $fxComplete : function(Sheet)
        {
            if ( this.getElm().getStyle('left').toInt() >= 0 )
            {
                this.fireEvent( 'open', [ this ] );
                return;
            }

            this.fireEvent( 'close', [ this ] );
            this.destroy();
        }
    });
});
