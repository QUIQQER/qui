/**
 * The main message class
 *
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onClick [this]
 */

define('qui/controls/messages/Message', [

    'qui/controls/Control',
    'qui/Locale',

    'css!qui/controls/messages/Message.css'

], function(Control, Locale)
{
    "use strict";

    return new Class({

        Extends : Control,
        Type    : 'qui/controls/messages/Message',

        options: {
            message  : '',
            code     : 0,
            time     : false,
            cssclass : false,
            styles   : false
        },

        initialize : function(options)
        {
            this.parent( options );

            if ( !this.getAttribute( 'time' ) )
            {
                this.setAttribute( 'time', new Date() );
            } else
            {
                this.setAttribute(
                    'time',
                    new Date( this.getAttribute( 'time' ) )
                );
            }
        },

        /**
         * Return the DOMNode of the message
         *
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = this.createMessageElement();

            var Destroy = this.$Elm.getElement( '.messages-message-destroy' );

            Destroy.set({
                title : Locale.get( 'namerobot/global', 'msg-handler-close-msg' )
            });

            Destroy.removeEvents( 'click' );

            Destroy.addEvent(
                'click',
                this.destroy.bind( this )
            );

            return this.$Elm;
        },

        /**
         * Return the message
         * -> getAttribute('message')
         *
         * @return {String}
         */
        getMessage : function()
        {
            return this.getAttribute( 'message' );
        },

        /**
         * Return the message code
         * -> getAttribute('code')
         *
         * @return {Integer}
         */
        getCode : function()
        {
            return this.getAttribute( 'code' );
        },

        /**
         * Create a DOMNode Element from the message attributes
         *
         * @return {DOMNode}
         */
        createMessageElement : function()
        {
            var self = this,
                time = '',
                Time = this.getAttribute( 'time' );

            time = Time.toLocaleDateString() +' '+ Time.toLocaleTimeString();

            var Elm = new Element('div', {
                'class' : 'messages-message box',
                html    : '<div class="messages-message-header">' +
                              '<span>' + time + '</span>' +
                              '<span class="messages-message-destroy icon-remove-circle"></span>' +
                          '</div>' +
                          '<div class="messages-message-text">' +
                              this.getAttribute( 'message' ) +
                          '</div>',
                events :
                {
                    click : function() {
                        self.fireEvent( 'click', [ self ] );
                    }
                }
            });

            if ( this.getAttribute( 'styles' ) ) {
                Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            if ( this.getAttribute( 'cssclass' ) ) {
                Elm.addClass( this.getAttribute( 'cssclass' ) );
            }

            var Destroy = Elm.getElement( '.messages-message-destroy' );

            Destroy.set({
                title : Locale.get( 'qui/controls/messages', 'message.close' )
            });

            Destroy.addEvent('click', function() {
                Elm.destroy();
            });

            return Elm;
        }
    });
});