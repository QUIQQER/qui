
/**
 * QUI Control - On / Off Slide Button
 *
 * @module qui/controls/buttons/Switch
 * @author www.pcsg.de ( Michael Danielczok )
 * @author www.pcsg.de ( Henning Leutz )
 *
 * @require qui/controls/Control
 * @require css!qui/controls/buttons/Switch.css
 *
 * @event onCreate
 * @event onStatusOff
 * @event onStatusOn
 * @event onChange
 */

define('qui/controls/buttons/Switch', [

    'qui/controls/Control',

    'css!qui/controls/buttons/Switch.css'

], function(QUIControl)
{
    "use strict";

    return new Class({

        Extends : QUIControl,
        Type    : 'qui/controls/buttons/Switch',

        Binds : [
            'toggle',
            '$onInject',
            '$onSetAttribute'
        ],

        options : {
            name   : '',
            title  : '',
            styles : false,
            status : true,

            switchTextOn      : '',
            switchTextOnIcon  : 'icon-ok',
            switchTextOff     : '',
            switchTextOffIcon : 'icon-remove'
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$Button   = false;
            this.$FxElm    = false;
            this.$FxButton = false;

            this.$status = this.getAttribute( 'status' );
            this.$triggerEvents = true;

            this.addEvents({
                onInject       : this.$onInject,
                onSetAttribute : this.$onSetAttribute
            });
        },

        /**
         * resize the switch
         */
        resize : function()
        {
            this.$Button.setStyle( 'width', this.$ButtonTextOff.getSize().x );

            this.$triggerEvents = false;

            if ( this.getStatus() )
            {
                this.on();
            } else
            {
                this.off();
            }

            this.$triggerEvents = true;

            moofx( this.$Elm ).animate({
                opacity : 1
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
                },
                'data-quiid' : this.getId()
            });

            this.$InputStatus = this.$Elm.getElement( 'input' );
            this.$Button      = this.$Elm.getElement( '.qui-switch-button' );

            this.$ButtonTextOn  = this.$Elm.getElement( '.qui-switch-on' );
            this.$TextOn        = this.$Elm.getElement( '.qui-switch-text-on' );

            this.$ButtonTextOff = this.$Elm.getElement( '.qui-switch-off' );
            this.$TextOff       = this.$Elm.getElement( '.qui-switch-text-off' );

            this.$IconOn  = this.$Elm.getElement( '.qui-switch-icon-on' );
            this.$IconOff = this.$Elm.getElement( '.qui-switch-icon-off' );

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

            if ( this.getAttribute( 'title' ) ) {
                this.$Elm.set( 'title', this.getAttribute( 'title' ) );
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
            var self = this;

            this.$Button.setStyle( 'left', 0 );
            this.$Elm.setStyle( 'background', '#0069b4' );

            // fix for real resize
            (function() {
                self.resize();
            }).delay( 100 );
        },

        /**
         * Return the Status
         *
         * @returns {Boolean}
         */
        getStatus : function()
        {
            return this.$status ? true : false;
        },

        /**
         * Change the status of the Button
         */
        toggle : function()
        {
            if ( this.$status )
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
            this.$status = 1;

            if ( this.$triggerEvents )
            {
                this.fireEvent( 'statusOn', [ this ]  );
                this.fireEvent( 'change', [ this ]  );
            }

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
            this.$status = 0;

            if ( this.$triggerEvents )
            {
                this.fireEvent( 'statusOff', [ this ] );
                this.fireEvent( 'change', [ this ] );
            }

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
        },

        /**
         * event : on set attribute
         *
         * @param {String} key   - attribute name
         * @param {String|Number|Object} value - attribute value
         */
        $onSetAttribute : function(key, value)
        {
            if ( !this.$Elm ) {
                return;
            }

            if ( key == 'title' ) {
                this.$Elm.set( 'title', value );
            }
        }
    });
});
