
/**
 * QUI Control - On / Off Slide Button
 *
 * @module qui/controls/buttons/Switch
 * @author www.pcsg.de
 *
 * @require qui/controls/Control
 * @require css!Switch.css
 *
 * @event onClick
 * @event onCreate
 */

define('qui/controls/buttons/Switch', [

    'qui/controls/Control',

    'css!qui/controls/buttons/Switch.css'

], function(QUIControl)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Types   : 'qui/controls/buttons/Switch',

        Binds : [
            'toggle',
            '$onInject'
        ],

        options : {
            name   : '',
            text   : 'on',
            styles : false,

            switchTextOn      : '',
            switchTextOnIcon  : false,
            switchTextOff     : '',
            switchTextOffIcon : false
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$Button   = false;
            this.$FxElm    = false;
            this.$FxButton = false;

            this.$status = 'on';

            this.addEvents({
                onInject : this.$onInject
            });
        },

        /**
         * Create the DOM Element
         *
         * @method qui/controls/buttons/Button#create
         * @return {HTMLElement}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'qui-switch',
                html    : '<div class="qui-switch-off">' +
                              '<div class="qui-switch-icon-off"></div>' +
                              '<div class="qui-switch-text-off"></div>' +
                          '</div>' +
                          '<div class="qui-switch-on">' +
                              '<div class="qui-switch-icon-on"></div>' +
                              '<div class="qui-switch-text-on"></div>' +
                          '</div>' +
                          '<div class="qui-switch-button"></div>' +
                          '<input type="hidden" />',
                styles : {
                    opacity : 0
                }
            });

            this.$Button        = this.$Elm.getElement( '.qui-switch-button' );
            this.$ButtonTextOn  = this.$Elm.getElement( '.qui-switch-on' );
            this.$TextOn        = this.$Elm.getElement( '.qui-switch-text-on' );
            this.$ButtonTextOff = this.$Elm.getElement( '.qui-switch-off' );
            this.$TextOff       = this.$Elm.getElement( '.qui-switch-text-off' );
            this.$InputStatus   = this.$Elm.getElement( 'input' );
            this.$IconOn        = this.$Elm.getElement( '.qui-switch-icon-on' );
            this.$IconOff       = this.$Elm.getElement( '.qui-switch-icon-off' );

            this.$IconOn.addClass( this.getAttribute( 'switchTextOnIcon' ) );
            this.$IconOff.addClass( this.getAttribute( 'switchTextOffIcon' ) );
            this.$TextOn.set( 'html', this.getAttribute( 'switchTextOn' ) );
            this.$TextOff.set( 'html', this.getAttribute( 'switchTextOff' ) );

            this.$Elm.addEvent( 'click', this.toggle );

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            if ( this.getAttribute( 'switchTextOn' ) === '' )
            {
                this.$TextOn.setStyles({
                    textAlign : 'center',
                    width     : '100%'
                });
            }

            if ( this.getAttribute( 'switchTextOff' ) === '' )
            {
                this.$TextOff.setStyles({
                    textAlign : 'center',
                    width     : '100%'
                });
            }

            this.$FxElm    = moofx( this.$Elm );
            this.$FxButton = moofx( this.$Button );

            this.$InputStatus.set( 'name', this.getAttribute( 'name' ) );

            return this.$Elm;
        },

        /**
         * event : on inject
         */
        $onInject : function()
        {
            this.$Button.setStyle( 'left', 0 );
            this.$Elm.setStyle( 'background', '#0069b4' );

            (function()
            {
                this.$Button.setStyle( 'width', this.$ButtonTextOff.getSize().x );
                this.on();

                moofx( this.$Elm ).animate({
                    opacity : 1
                });

            }).delay( 100, this );
        },

        /**
         * Change the status of the Button
         */
        toggle : function()
        {
            if ( this.$status == 'on' )
            {
                this.off();
            } else
            {
                this.on();
            }
        },

        /**
         * Set the "on" status
         */
        on : function()
        {
            this.$status = 'on';
            this.fireEvent( 'statusOn' );

            if ( !this.$Elm ) {
                return;
            }

            // Send the "on" switch status
            this.$InputStatus.addEvents('click', this.$InputStatus.set('value', '1'));

            var textWidth = this.$ButtonTextOff.getSize().x;

            this.$FxElm.animate({
                background : '#0069b4'
            }, {
                duration : 200,
                equation : 'cubic-bezier(1,0,0,0)'
            });

            this.$FxButton.animate({
                left  : 0,
                width : textWidth
            }, {
                duration : 350,
                equation : 'cubic-bezier(0.34,1.31,0.7,1)'
            });
        },

        /**
         * Set the "off" status
         */
        off : function()
        {
            this.$status = 'off';
            this.fireEvent( 'statusOff' );

            if ( !this.$Elm ) {
                return;
            }

            // Send the "off" switch status
            this.$InputStatus.addEvents('click', this.$InputStatus.set('value', '0'));

            var onWidth  = this.$ButtonTextOn.getSize().x,
                offWidth = this.$ButtonTextOff.getSize().x;

            this.$FxElm.animate({
                background : '#fff'
            }, {
                duration : 10,
                equation : 'cubic-bezier(0,0,1,1)'
            });

            this.$FxButton.animate({
                left  : offWidth,
                width : onWidth
            }, {
                duration : 350,
                equation : 'cubic-bezier(0.34,1.31,0.7,1)'
            });
        }
    });
});