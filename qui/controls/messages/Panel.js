
/**
 * Message-Manager Panel
 *
 * The panel displays the messages
 *
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/controls/messages/Panel', [

    'qui/QUI',
    'qui/controls/desktop/Panel',
    'qui/Locale',

    'css!qui/controls/messages/Panel.css'

], function(QUI, QUIPanel, Locale)
{
    "use strict";

    return new Class({

        Extends : QUIPanel,
        Type    : 'qui/controls/messages/Panel',

        Binds : [
            '$onCreate',
            '$toggleButton',
            '$onMessageHandlerAdd',
            '$onMessageHandlerClear'
        ],

        options : {
            title : 'Nachrichten',
            icon  : 'icon-bullhorn',

            showSucces      : true,
            showInformation : true,
            showAttention   : true,
            showError       : true
        },

        initialize : function(options)
        {
            this.parent( options );

            this.addEvents({
                onCreate : this.$onCreate
            });
        },

        /**
         * event : on creat
         */
        $onCreate : function()
        {
            var self = this;

            this.Loader.show();

            this.getButtonBar().getElm().addClass( 'qui-controls-messages-panel-buttons' );

            this.addButton({
                name   : 'ok',
                icon   : 'icon-ok',
                title  : Locale.get( 'qui/controls/messages', 'handler.button.success' ),
                alt    : Locale.get( 'qui/controls/messages', 'handler.button.success' ),
                events : {
                    onClick : self.$toggleButton
                }
            });

            this.addButton({
                name   : 'information',
                icon   : 'icon-info-sign',
                title  : Locale.get( 'qui/controls/messages', 'handler.button.information' ),
                alt    : Locale.get( 'qui/controls/messages', 'handler.button.information' ),
                events : {
                    onClick : self.$toggleButton
                }
            });

            this.addButton({
                name   : 'attention',
                icon   : 'icon-warning-sign',
                title  : Locale.get( 'qui/controls/messages', 'handler.button.attention' ),
                alt    : Locale.get( 'qui/controls/messages', 'handler.button.attention' ),
                events : {
                    onClick : self.$toggleButton
                }
            });

            this.addButton({
                name   : 'error',
                icon   : 'icon-bolt',
                title  : Locale.get( 'qui/controls/messages', 'handler.button.error' ),
                alt    : Locale.get( 'qui/controls/messages', 'handler.button.error' ),
                events : {
                    onClick : self.$toggleButton
                }
            });

            this.addButton({
                name   : 'clear',
                icon   : 'icon-trash',
                title  : Locale.get( 'qui/controls/messages', 'handler.button.clear' ),
                alt    : Locale.get( 'qui/controls/messages', 'handler.button.clear' ),
                events :
                {
                    onClick : function()
                    {
                        QUI.getMessageHandler(function(MessageHandler) {
                            MessageHandler.clear();
                        });
                    }
                }
            });


            if ( this.getAttribute('showSucces') ) {
                this.getButtons( 'ok' ).setActive();
            }

            if ( this.getAttribute('showInformation') ) {
                this.getButtons( 'information' ).setActive();
            }

            if ( this.getAttribute('showAttention') ) {
                this.getButtons( 'attention' ).setActive();
            }

            if ( this.getAttribute('showError') ) {
                this.getButtons( 'error' ).setActive();
            }


            QUI.getMessageHandler(function(MessageHandler)
            {
                MessageHandler.addEvents({
                    onAdd   : self.$onMessageHandlerAdd,
                    onClear : self.$onMessageHandlerClear
                });

                (function() {
                    self.refreshMessages();
                }).delay( 500 );
            });
        },

        /**
         * Refresh the messages display
         */
        refreshMessages : function()
        {
            var self = this;

            QUI.getMessageHandler(function(MessageHandler)
            {
                var Content  = self.getContent(),
                    messages = MessageHandler.getMessages();

                Content.set( 'html', '' );

                for ( var i = 0, len = messages.length; i < len; i++ )
                {
                    self.$onMessageHandlerAdd(
                        MessageHandler,
                        messages[ i ],
                        false
                    );
                }

                self.Loader.hide();
            });
        },

        /**
         * event on add message to the message-handler
         *
         * @param {qui/controls/messages/Handler} MessageHandler
         * @param {qui/controls/messages/Message} Message
         * @param {Bool} animate - [optional] animate the message or not; default = true
         */
        $onMessageHandlerAdd : function(MessageHandler, Message, animate)
        {
            var type = Message.getType();

            if ( typeof animate === 'undefined' ) {
                animate = true;
            }

            if ( type == 'qui/controls/messages/Success' &&
                 !this.getAttribute('showSucces') )
            {
                return;
            }

            if ( type == 'qui/controls/messages/Information' &&
                 !this.getAttribute('showInformation') )
            {
                return;
            }

            if ( type == 'qui/controls/messages/Attention' &&
                 !this.getAttribute('showAttention') )
            {
                return;
            }

            if ( type == 'qui/controls/messages/Error' &&
                 !this.getAttribute('showError') )
            {
                return;
            }


            var MessageElm = Message.createMessageElement();

            MessageElm.inject( this.getContent(), 'top' );

            if ( animate )
            {
                MessageElm.addClass( 'animated' );
                MessageElm.addClass( 'flash' );
            }
        },

        /**
         * event : on Message-Handler clearing
         */
        $onMessageHandlerClear : function()
        {
            this.getContent().set( 'html', '' );
        },

        /**
         * Toggle the button status
         *
         * @param {qui/controls/buttons/Button} Btn
         */
        $toggleButton : function(Btn)
        {
            if ( Btn.isActive() )
            {
                Btn.setNormal();
            } else
            {
                Btn.setActive();
            }

            switch ( Btn.getAttribute( 'name' ) )
            {
                case 'ok':
                    this.setAttribute( 'showSucces', Btn.isActive() );
                break;

                case 'information':
                    this.setAttribute( 'showInformation', Btn.isActive() );
                break;

                case 'attention':
                    this.setAttribute( 'showAttention', Btn.isActive() );
                break;

                case 'error':
                    this.setAttribute( 'showError', Btn.isActive() );
                break;
            }

            this.refreshMessages();
        }
    });

});