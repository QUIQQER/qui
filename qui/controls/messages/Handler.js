
/**
 * Message Handler
 *
 * @module qui/controls/messages/Handler
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require require
 * @require qui/controls/Control',
 * @require qui/controls/messages/Favico',
 * @require qui/Locale',
 * @require qui/classes/storage/Storage',
 * @require css!qui/controls/messages/Handler'
 *
 * @event onAdd [ {this}, {qui/controls/messages/Message} ]
 * @event onAddAttention [ {this}, {qui/controls/messages/Attention} ]
 * @event onAddError [ {this}, {qui/controls/messages/Error} ]
 * @event onAddInformation [ {this}, {qui/controls/messages/Information} ]
 * @event onAddSuccess [ {this}, {qui/controls/messages/Success} ]
 *
 * @event onClear [ {this} ]
 * @event onLoad [ {this} ]
 */

define([

    'require',
    'qui/controls/Control',
    'qui/controls/messages/Favico',
    'qui/Locale',
    'qui/classes/storage/Storage',

    'css!qui/controls/messages/Handler.css'

], function(require, Control, Favico, Locale)
{
    "use strict";

    /**
     * @class qui/controls/messages/Handler
     *
     * @memberof! <global>
     */
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
            autosave   : true,
            autoload   : true,
            useFavicon : false
        },

        initialize : function(params)
        {
            var self = this;


            this.parent( params );

            this.Favico  = null;
            this.$Parent = null;

            // ie 9 and lower can't change the favicon
            if ( !Browser.ie || ( Browser.ie && Browser.version > 9 ) )
            {
                try
                {
                    this.Favico = new Favico({
                        animation : 'fade'
                    });
                } catch ( e ) {
                    // nothing
                }

                window.addEvent('unload', function()
                {
                    if ( self.getAttribute( 'useFavicon' ) && self.Favico )  {
                        self.Favico.badge( 0 );
                    }
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
                     'qui/controls/messages/Loading',
                     'qui/controls/messages/Message'
                ], function(Attention, Error, Information, Success, Loading, StandardMessage)
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

                            case 'qui/controls/messages/Loading':
                                Message = new Loading( Data );
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
         * @method qui/controls/messages/Handler#bindeParent
         * @param {DOMNode} Parent
         */
        bindParent : function(Parent)
        {
            this.$Parent = Parent;
        },

        /**
         * @method qui/controls/messages/Handler#unbindParent
         */
        unbindParent : function()
        {
            this.$Parent = null;
        },

        /**
         * Load the messages from the database
         *
         * @method qui/controls/messages/Handler#load
         * @depricated
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
                'qui/controls/messages/Success',
                'qui/controls/messages/Loading'
            ], function(Attention, Error, Information, Success, Loading)
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

                            case 'QUI\\Messages\\Loading':
                                Message = new Loading( data );
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
         * @method qui/controls/messages/Handler#create
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'message-handler-control',
                html    : '<span class="icon-info"></span>' +
                          '<span class="message-handler-count"></span>',
                title   : Locale.get( 'qui/controls/messages', 'handler.open' ),
                events  : {
                    click : this.open.bind( this )
                }
            });

            this.refreshFavicon();

            return this.$Elm;
        },

        /**
         * Opens the message handler
         *
         * @method qui/controls/messages/Handler#open
         */
        open : function()
        {
            if ( document.getElement( '.message-handler-container' ) ) {
                return;
            }

            this.$newMessages = 0;

            var Parent = this.$Parent;

            if ( !this.$Parent ) {
                Parent = document.body;
            }

            var self = this,
                size = Parent.getSize();

            var Container = new Element('div', {
                'class' : 'message-handler-container',
                html    : '<div class="message-handler-container-title">'+
                              'Nachrichten' +
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
            }).inject( Parent );

            // trash
            Container.getElement( '.icon-trash' ).addEvent(
                'click',
                this.clear.bind( this )
            );

            if ( Parent != document.body )
            {
                Container.setStyles({
                    border   : 'none',
                    position : 'relative'
                });

                Container.getElement( '.message-handler-container-title' )
                         .destroy();

                Container.getElement( '.message-handler-container-close' )
                         .setStyle( 'display', 'none' );
            }

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
                title : Locale.get( 'qui/controls/messages', 'handler.button.clear' )
            });

            Container.getElement( '.success' ).set({
                title : Locale.get( 'qui/controls/messages', 'handler.button.success' )
            });

            Container.getElement( '.information' ).set({
                title : Locale.get( 'qui/controls/messages', 'handler.button.information' )
            });

            Container.getElement( '.attention' ).set({
                title : Locale.get( 'qui/controls/messages', 'handler.button.attention' )
            });

            Container.getElement( '.error' ).set({
                title : Locale.get( 'qui/controls/messages', 'handler.button.error' )
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
                html    : Locale.get( 'qui/controls/messages', 'handler.button.close' ),
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
                                Locale.get( 'qui/controls/messages', 'handler.no.messages' ) +
                            '</p>'
                        );
                    }

                    if ( Parent == document.body ) {
                        Container.addClass( 'shadow' );
                    }

                    self.refreshFavicon();
                    self.save();
                }
            });
        },

        /**
         * Parse an array / object to their message type
         * The Array are often from the php message handler
         *
         * @method qui/controls/messages/Handler#parse
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
                 'qui/controls/messages/Loading',
                 'qui/controls/messages/Message'
            ], function(Attention, Error, Information, Success, Loading, StandardMessage)
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

                    case 'QUI\\Messages\\Loading':
                        Message = new Loading( data );
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
         *
         * @method qui/controls/messages/Handler#close
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
         *
         * @method qui/controls/messages/Handler#clear
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
                        Locale.get( 'qui/controls/messages', 'handler.no.messages' ) +
                    '</p>'
                );
            }

            if ( this.Favico ) {
                this.Favico.reset();
            }

            this.fireEvent( 'clear', [ this ] );

            if ( this.getAttribute( 'autosave' ) ) {
                this.save();
            }
        },

        /**
         * Return the number of the messages
         *
         * @method qui/controls/messages/Handler#count
         * @return {Integer}
         */
        count : function()
        {
            return this.$messages.length;
        },

        /**
         * Save the message handler to the storage
         *
         * @method qui/controls/messages/Handler#save
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

            window.localStorage.setItem( 'messageHandler', JSON.encode( params ) );
        },

        /**
         * Refresh the display and filter the messages
         *
         * @method qui/controls/messages/Handler#filter
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
         * @method qui/controls/messages/Handler#getNewMessages
         * @return {Integer}
         */
        getNewMessages : function()
        {
            return this.$newMessages;
        },

        /**
         * Return the messages array
         *
         * @method qui/controls/messages/Handler#getMessages
         * @return {Array}
         */
        getMessages : function()
        {
            return this.$messages;
        },

        /**
         * refresh the favicon and the counter
         *
         * @method qui/controls/messages/Handler#refreshFavicon
         */
        refreshFavicon : function()
        {
            if ( this.Favico && this.getAttribute( 'useFavicon' ) ) {
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
         * @method qui/controls/messages/Handler#add
         * @param {qui/controls/messages/Message} Message
         * @param {DOMNode} Parent - [optional] Parent Object, where to display the message
         * @return {this}
         */
        add : function(Message, Parent)
        {
            var self     = this,
                Messages = document.getElement( '.message-handler-container-messages' );

            this.$messages.push( Message );

            Message.addEvents({
                onDestroy : this.$onMessageDestroy.bind( this ),
                onFinish  : function()
                {
                    // for loading message
                    if ( self.getAttribute( 'autosave' ) ) {
                        self.save();
                    }
                }
            });

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
         * @method qui/controls/messages/Handler#addAttention
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
         * @method qui/controls/messages/Handler#addError
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
         * Add an exception
         *
         * @method qui/controls/messages/Handler#addException
         * @param {Exception} Exception
         * @param {DOMNode} Parent - [optional] Parent Object, where to display the message
         * @return {this}
         */
        addException : function(Exception, Parent)
        {
            var self = this;

            require(['qui/controls/messages/Error'], function(Error)
            {
                var Message = new Error({
                    message : Exception.getMessage(),
                    code    : Exception.getCode()
                });

                self.add( Message, Parent );
                self.fireEvent( 'addError', [ this, Message ] );
            });

            return this;
        },

        /**
         * Add an information message
         *
         * @method qui/controls/messages/Handler#addInformation
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
         * Add an attention
         *
         * @method qui/controls/messages/Handler#addAttention
         * @param {String} str - Message text
         * @param {Function} callback - Callback Function, to get the Loading object
         * @param {DOMNode} Parent - [optional] Parent Object, where to display the message
         * @return {this}
         */
        addLoading : function(str, callback, Parent)
        {
            var self = this;

            require(['qui/controls/messages/Loading'], function(Loading)
            {
                var Message = new Loading({
                    message : str
                });

                self.add( Message, Parent );
                self.fireEvent( 'addLoadingMessage', [ this, Message ] );

                if ( typeof callback !== 'undefined' &&
                     typeOf( callback ) == 'function' )
                {
                    callback( Message );
                }
            });

            return this;
        },

        /**
         * Add a success message
         *
         * @method qui/controls/messages/Handler#addSuccess
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
         * @method qui/controls/messages/Handler#$switchFilterStatus
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
         * @method qui/controls/messages/Handler#$onMessageDestroy
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
         *
         * @method qui/controls/messages/Handler#$onResize
         */
        $onResize : function()
        {
            var Container = document.getElement( '.message-handler-container' );

            if ( !Container ) {
                return;
            }

            var height;
            var Parent = this.$Parent;

            if ( !Parent ) {
                Parent = document.body;
            }

            var size = Parent.getSize(),

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