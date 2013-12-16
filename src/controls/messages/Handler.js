
/**
 * Message Handler
 *
 * @author www.namerobot.de (Henning Leutz)
 *
 * @event onAdd [ {this}, {qui/controls/messages/Message} ]
 * @event onAddAttention [ {this}, {qui/controls/messages/Attention} ]
 * @event onAddError [ {this}, {qui/controls/messages/Error} ]
 * @event onAddInformation [ {this}, {qui/controls/messages/Information} ]
 * @event onAddSuccess [ {this}, {qui/controls/messages/Success} ]
 *
 * @event onLoad [ {this} ]
 */

define('qui/controls/messages/Handler', [

    'require',
    'qui/controls/Control',
    'qui/controls/messages/Favico',
    'qui/Locale',
    'qui/classes/storage/Storage',

    'css!qui/controls/messages/Handler'

], function(require, Control, Favico, Locale)
{
    "use strict";

    return new Class({

        Extends : Control,
        Type    : 'qui/controls/messages/Handler',

        $messages    : [],
        $newMessages : 0,

        $filter : {
            attention   : true,
            error       : true,
            information : true,
            success     : true
        },

        options : {
            autosave : true,
            autoload : true
        },

        initialize : function(params)
        {
            var self = this;


            this.parent( params );

            this.Favico = null;

            // ie 9 and lower can't change the favicon
            if ( !Browser.ie || ( Browser.ie && Browser.version > 9 ) )
            {
                this.Favico = new Favico({
                    animation : 'fade'
                });

                window.addEvent('unload', function() {
                    self.Favico.badge( 0 );
                });
            }

            var data = window.localStorage.getItem( 'messageHandler' );

            if ( !data ) {
                return;
            }

            data = JSON.decode( data );

            if ( data.config ) {
                this.setAttributes( data.config );
            }

            if ( data.filter ) {
                this.$filter = Object.merge( this.$filter, data.filter );
            }

            if ( data.messages )
            {
                data.messages.sort(function(a, b)
                {
                    a = new Date( a.time );
                    b = new Date( b.time );

                    return a > b ? -1 : a < b ? 1 : 0;
                });

                require([
                     'qui/controls/messages/Attention',
                     'qui/controls/messages/Error',
                     'qui/controls/messages/Information',
                     'qui/controls/messages/Success',
                     'qui/controls/messages/Message'
                ], function(Attention, Error, Information, Success, StandardMessage)
                {
                    var i, len, type, Data, Message;

                    for ( i = 0, len = data.messages.length; i < len; i++ )
                    {
                        Data = data.messages[ i ];
                        type = Data.Type;

                        delete Data.Type;

                        switch ( type  )
                        {
                            case 'qui/controls/messages/Attention':
                                Message = new Attention( Data );
                            break;

                            case 'qui/controls/messages/Error':
                                Message = new Error( Data );
                            break;

                            case 'qui/controls/messages/Information':
                                Message = new Information( Data );
                            break;

                            case 'qui/controls/messages/Success':
                                Message = new Success( Data );
                            break;

                            default:
                                Message = new StandardMessage( Data );
                            break;
                        }

                        Message.addEvent(
                            'onDestroy',
                            self.$onMessageDestroy.bind( self )
                        );

                        self.$messages.push( Message );
                    }
                });
            }

            if ( data.newMessages && self.$messages.length )
            {
                this.$newMessages = data.newMessages;
                this.refreshFavicon();
            }

            if ( this.getAttribute( 'autoload' ) ) {
                this.load();
            }
        },

        /**
         * Load the messages from the database
         */
        load : function()
        {
            if ( typeof User === 'undefined' || !User ) {
                return;
            }

            var self = this;

            require([
                'qui/controls/messages/Attention',
                'qui/controls/messages/Error',
                'qui/controls/messages/Information',
                'qui/controls/messages/Success'
            ], function(Attention, Error, Information, Success)
            {
                _Ajax.asyncPost('ajax_messages_get', function(result)
                {
                    var i, len, data, entry, Message;

                    for ( i = 0, len = result.length; i < len; i++ )
                    {
                        entry = result[ i ];

                        data = {
                            message  : entry.message,
                            time     : entry.time
                        };

                        switch ( entry.mtype )
                        {
                            case 'QUI\\Messages\\Attention':
                                Message = new Attention( data );
                            break;

                            case 'QUI\\Messages\\Error':
                                Message = new Error( data );
                            break;

                            case 'QUI\\Messages\\Information':
                                Message = new Information( data );
                            break;

                            case 'QUI\\Messages\\Success':
                                Message = new Success( data );
                            break;

                            default:
                                continue;
                        }

                        self.add( Message );
                    }
                });

                self.fireEvent( 'load', [ self ] );
            });
        },

        /**
         * Create the DOMNode Element of the MessageHandler
         * It create the opener button
         *
         * If you want to open the message handler, use .open();
         *
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'message-handler-control',
                html    : '<span class="icon-info"></span>' +
                          '<span class="message-handler-count"></span>',
                title   : Locale.get( 'namerobot/global', 'msg-handler-open' ),
                events  : {
                    click : this.open.bind( this )
                }
            });

            this.refreshFavicon();

            return this.$Elm;
        },

        /**
         * Opens the message handler
         */
        open : function()
        {
            if ( document.getElement( '.message-handler-container' ) ) {
                return;
            }

            this.$newMessages = 0;


            var self = this,
                size = document.body.getSize();

            var Container = new Element('div', {
                'class' : 'message-handler-container',
                html    : '<div class="message-handler-container-title">'+
                              Locale.get( 'namerobot/global', 'msg-handler-title' ) +
                          '</div>' +
                          '<div class="message-handler-container-buttons">' +
                              '<div class="success message-handler-container-button grid-20 mobile-grid-20 icon-ok"></div>' +
                              '<div class="information message-handler-container-button grid-20 mobile-grid-20 icon-info-sign"></div>' +
                              '<div class="attention message-handler-container-button grid-20 mobile-grid-20 icon-warning-sign"></div>' +
                              '<div class="error message-handler-container-button grid-20 mobile-grid-20 icon-bolt"></div>' +
                              '<div class="trash message-handler-container-button grid-20 mobile-grid-20 icon-trash"></div>' +
                          '</div>' +
                          '<div class="message-handler-container-messages"></div>' +
                          '<div class="message-handler-container-close"></div>'
            }).inject( document.body );

            // trash
            Container.getElement( '.icon-trash' ).addEvent(
                'click',
                this.clear.bind( this )
            );

            // filter
            var buttons = Container.getElements(
                '.success,.information,.attention,.error'
            );

            buttons.addEvent(
                'click', this.$switchFilterStatus.bind( this )
            );

            buttons.addClass( 'message-handler-container-buttons-active' );

            // titles
            Container.getElement( '.trash' ).set({
                title : Locale.get( 'namerobot/global', 'msg-handler-clear' )
            });

            Container.getElement( '.success' ).set({
                title : Locale.get( 'namerobot/global', 'msg-handler-toggle-success' )
            });

            Container.getElement( '.information' ).set({
                title : Locale.get( 'namerobot/global', 'msg-handler-toggle-information' )
            });

            Container.getElement( '.attention' ).set({
                title : Locale.get( 'namerobot/global', 'msg-handler-toggle-attention' )
            });

            Container.getElement( '.error' ).set({
                title : Locale.get( 'namerobot/global', 'msg-handler-toggle-error' )
            });


            // sizes
            var Messages = Container.getElement(
                    '.message-handler-container-messages'
                ),

                Close = Container.getElement(
                    '.message-handler-container-close'
                );


            new Element('div', {
                'class' : 'button message-handler-container-close-btn',
                html    : Locale.get( 'namerobot/global', 'msg-handler-close' ),
                events  :
                {
                    click : function() {
                        self.close();
                    }
                }
            }).inject( Close );


            this.$onResize();

            window.addEvent( 'resize', this.$onResize );


            moofx( Container ).animate({
                left : 0
            }, {
                callback : function()
                {
                    Messages.set( 'html', '' );

                    self.$messages.sort(function(a, b)
                    {
                        a = new Date( a.getAttribute( 'time' ) );
                        b = new Date( b.getAttribute( 'time' ) );

                        return a > b ? -1 : a < b ? 1 : 0;
                    });

                    // show messages
                    for ( var i = 0, len = self.$messages.length; i < len; i++ ) {
                        self.$messages[ i ].inject( Messages );
                    }

                    if ( !len )
                    {
                        Messages.set(
                            'html',
                            '<p style="text-align: center;">'+
                                Locale.get( 'namerobot/global', 'msg-handler-no-messages' ) +
                            '</p>'
                        );
                    }

                    Container.addClass( 'shadow' );

                    self.refreshFavicon();
                    self.save();
                }
            });
        },

        /**
         * Parse an array / object to their message type
         * The Array are often from the php message handler
         *
         * @param {Object} params
         * @param {Function} callback function
         */
        parse : function(params, callback)
        {
            require([
                 'qui/controls/messages/Attention',
                 'qui/controls/messages/Error',
                 'qui/controls/messages/Information',
                 'qui/controls/messages/Success',
                 'qui/controls/messages/Message'
            ], function(Attention, Error, Information, Success, StandardMessage)
            {
                var data, Message;

                data = {
                    message  : params.message,
                    time     : params.time
                };

                switch ( params.mtype )
                {
                    case 'QUI\\Messages\\Attention':
                        Message = new Attention( data );
                    break;

                    case 'QUI\\Messages\\Error':
                        Message = new Error( data );
                    break;

                    case 'QUI\\Messages\\Information':
                        Message = new Information( data );
                    break;

                    case 'QUI\\Messages\\Success':
                        Message = new Success( data );
                    break;

                    default:
                        Message = new StandardMessage( data );
                    break;
                }

                callback( Message );
            });
        },

        /**
         * Close the message handler
         */
        close : function()
        {
            var self      = this,
                Container = document.getElement( '.message-handler-container' );

            Container.removeClass( 'shadow' );

            moofx( Container ).animate({
                left : -500
            }, {
                callback : function()
                {
                    Container.destroy();
                    document.removeEvent( 'onResize', self.$onResize );
                }
            });
        },

        /**
         * delete all messages
         */
        clear : function()
        {
            this.$messages = [];

            var Container = document.getElement( '.message-handler-container-messages' );

            if ( Container )
            {
                Container.set(
                    'html',
                    '<p style="text-align: center;">'+
                        Locale.get( 'namerobot/global', 'msg-handler-no-messages' ) +
                    '</p>'
                );
            }

            if ( this.getAttribute( 'autosave' ) ) {
                this.save();
            }
        },

        /**
         * Return the number of the messages
         *
         * @return {Integer}
         */
        count : function()
        {
            return this.$messages.length;
        },

        /**
         * Save the message handler to the storage
         */
        save : function()
        {
            var i, len, attr;

            var messages = [],
                params   = {
                    config      : this.getAttributes(),
                    filter      : this.$filter,
                    newMessages : this.$newMessages
                };

            for ( i = 0, len = this.$messages.length; i < len; i++ )
            {
                attr      = this.$messages[ i ].getAttributes();
                attr.Type = this.$messages[ i ].getType();

                messages.push( attr );
            }

            params.messages = messages;

            window.localStorage.setItem(
                'messageHandler',
                JSON.encode( params )
            );
        },

        /**
         * Refresh the display and filter the messages
         */
        filter : function()
        {
            var Container = document.getElement( '.message-handler-container' );

            if ( !Container ) {
                return;
            }

            var i, len, Message;

            var messages = Container.getElements( '.messages-message' ),
                filter   = this.$filter;

            for ( i = 0, len = messages.length; i < len; i++ )
            {
                Message = messages[ i ];

                if ( filter.attention && Message.hasClass( 'message-attention' ) )
                {
                    Message.setStyle( 'display', null );
                    continue;
                }

                if ( filter.error && Message.hasClass( 'message-error' ) )
                {
                    Message.setStyle( 'display', null );
                    continue;
                }

                if ( filter.information && Message.hasClass( 'message-information' ) )
                {
                    Message.setStyle( 'display', null );
                    continue;
                }

                if ( filter.success && Message.hasClass( 'message-success' ) )
                {
                    Message.setStyle( 'display', null );
                    continue;
                }

                Message.setStyle( 'display', 'none' );
            }
        },

        /**
         * Returns the count of the new messages
         *
         * @return {Integer}
         */
        getNewMessages : function()
        {
            return this.$newMessages;
        },

        /**
         * refresh the favicon and the counter
         */
        refreshFavicon : function()
        {
            if ( this.Favico ) {
                this.Favico.badge( this.$newMessages );
            }

            if ( !this.getElm() ) {
                return;
            }

            var Count = this.getElm().getElement( '.message-handler-count' );

            if ( !Count ) {
                return;
            }

            Count.set({
                html : this.$newMessages,
                styles : {
                    display : this.$newMessages ? 'inline' : 'none'
                }
            });
        },

        /**
         * Add a message to the Handler
         *
         * @param {qui/controls/messages/Message} Message
         * @param {DOMNode} Parent - [optional] Parent Object, where to display the message
         * @return {this}
         */
        add : function(Message, Parent)
        {
            var Messages = document.getElement( '.message-handler-container-messages' );

            this.$messages.push( Message );

            Message.addEvent(
                'onDestroy',
                this.$onMessageDestroy.bind( this )
            );

            // message handler is closed
            if ( !Messages )
            {
                this.$newMessages++;
                this.refreshFavicon();

                if ( this.getAttribute( 'autosave' ) ) {
                    this.save();
                }

                var pos, size;
                var Node = Message.createMessageElement();

                if ( typeof Parent === 'undefined' ) {
                    Parent = document.body;
                }

                pos  = Parent.getPosition();
                size = Parent.getSize();

                Node.setStyles({
                    left     : pos.x,
                    position : 'absolute',
                    top      : pos.y + size.y,
                    width    : 280,
                    zIndex   : 10000
                });

                if ( Parent == document.body )
                {
                    Node.setStyles({
                        bottom   : 10,
                        left     : 10,
                        position : 'fixed',
                        top      : null
                    });
                }

                Node.addClass( 'animated' );
                Node.inject( document.body );
                Node.addClass( 'fadeInDown' );

                (function()
                {
                    moofx( Node ).animate({
                        opacity : 0
                    }, {
                        callback : function() {
                            Node.destroy();
                        }
                    });
                }).delay( 2000 );

                this.fireEvent( 'add', [ this, Message ] );

                return this;
            }

            // message handler is open
            if ( this.$messages.length == 1 ) {
                Messages.set( 'html', '' );
            }

            Message.inject( Messages, 'top' );

            new Fx.Scroll( Messages ).toTop();

            Message.getElm().addClass( 'animated' );
            Message.getElm().addClass( 'flash' );

            if ( this.getAttribute( 'autosave' ) ) {
                this.save();
            }

            this.fireEvent( 'add', [ this, Message ] );

            return this;
        },

        /**
         * Add an attention
         *
         * @param {String} str - Message text
         * @param {DOMNode} Parent - [optional] Parent Object, where to display the message
         * @return {this}
         */
        addAttention : function(str, Parent)
        {
            var self = this;

            require(['qui/controls/messages/Attention'], function(Attention)
            {
                var Message = new Attention({
                    message : str
                });

                self.add( Message, Parent );
                self.fireEvent( 'addAttention', [ this, Message ] );
            });

            return this;
        },

        /**
         * Add an error
         *
         * @param {String} str - Message text
         * @param {DOMNode} Parent - [optional] Parent Object, where to display the message
         * @return {this}
         */
        addError : function(str, Parent)
        {
            var self = this;

            require(['qui/controls/messages/Error'], function(Error)
            {
                var Message = new Error({
                    message : str
                });

                self.add( Message, Parent );
                self.fireEvent( 'addError', [ this, Message ] );
            });

            return this;
        },

        /**
         * Add an information message
         *
         * @param {String} str - Message text
         * @param {DOMNode} Parent - [optional] Parent Object, where to display the message
         * @return {this}
         */
        addInformation : function(str, Parent)
        {
            var self = this;

            require(['qui/controls/messages/Information'], function(Information)
            {
                var Message = new Information({
                    message : str
                });

                self.add( Message, Parent );
                self.fireEvent( 'addInformation', [ this, Message ] );
            });

            return this;
        },

        /**
         * Add a success message
         *
         * @param {String} str - Message text
         * @param {DOMNode} Parent - [optional] Parent Object, where to display the message
         * @return {this}
         */
        addSuccess : function(str, Parent)
        {
            var self = this;

            require(['qui/controls/messages/Success'], function(Success)
            {
                var Message = new Success({
                    message : str
                });

                self.add( Message, Parent );
                self.fireEvent( 'addSuccess', [ this, Message ] );
            });

            return this;
        },

        /**
         * Switch a filter status by its click event
         *
         * @param {DOMEvent} event
         */
        $switchFilterStatus : function(event)
        {
            var Target = event.target,
                filter = false,
                active = Target.hasClass( 'message-handler-container-buttons-active' );

            if ( Target.hasClass( 'success' ) )
            {
                filter = 'success';
            } else if ( Target.hasClass( 'information' ) )
            {
                filter = 'information';
            } else if ( Target.hasClass( 'attention' ) )
            {
                filter = 'attention';
            } else if ( Target.hasClass( 'error' ) )
            {
                filter = 'error';
            } else
            {
                return;
            }

            if ( active )
            {
                Target.removeClass( 'message-handler-container-buttons-active' );
            } else
            {
                Target.addClass( 'message-handler-container-buttons-active' );
            }

            this.$filter[ filter ] = active ? false : true;
            this.filter();
        },

        /**
         * event : on message destroy
         *
         * @param {qui/controls/messages/Message} Message
         */
        $onMessageDestroy : function(Message)
        {
            var i, len;
            var messages = [];

            for ( i = 0, len = this.$messages.length; i < len; i++ )
            {
                if ( this.$messages[ i ] != Message ) {
                    messages.push( this.$messages[ i ] );
                }
            }

            this.$messages = messages;
            this.save();
        },

        /**
         * Calc the dimensions for the message handler display
         */
        $onResize : function()
        {
            var Container = document.getElement( '.message-handler-container' );

            if ( !Container ) {
                return;
            }

            var height;

            var size = document.body.getSize(),

                Title = Container.getElement(
                    '.message-handler-container-title'
                ),

                Buttons = Container.getElement(
                    '.message-handler-container-buttons'
                ),

                Messages = Container.getElement(
                    '.message-handler-container-messages'
                ),

                Close = Container.getElement(
                    '.message-handler-container-close'
                );

            // calc
            height = size.y - Title.getSize().y -
                     Buttons.getSize().y - Close.getSize().y;

            Messages.setStyles({
               height : height
            });
        }
    });
});