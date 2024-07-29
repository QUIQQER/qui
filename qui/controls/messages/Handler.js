/**
 * Message Handler
 *
 * @module qui/controls/messages/Handler
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onAdd [ {this}, {qui/controls/messages/Message} ]
 * @event onAddAttention [ {this}, {qui/controls/messages/Attention} ]
 * @event onAddError [ {this}, {qui/controls/messages/Error} ]
 * @event onAddInformation [ {this}, {qui/controls/messages/Information} ]
 * @event onAddSuccess [ {this}, {qui/controls/messages/Success} ]
 *
 * @event onClear [ {this} ]
 * @event onClearNewMessages [ {this} ]
 * @event onLoad [ {this} ]
 */
define('qui/controls/messages/Handler', [

    'require',
    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/messages/Favico',
    'qui/classes/utils/Push',
    'qui/Locale',
    'qui/classes/storage/Storage',

    'css!qui/controls/messages/Handler.css'

], function(require, QUI, Control, Favico, Push, Locale) {
    'use strict';

    /**
     * @class qui/controls/messages/Handler
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type: 'qui/controls/messages/Handler',

        $messages: [],
        $newMessages: 0,

        $filter: {
            attention: true,
            error: true,
            information: true,
            success: true
        },

        options: {
            autosave: true,
            autoload: true,
            useFavicon: false,
            displayTimeMessages: 2500,
            showMessages: true
        },

        initialize: function(params) {
            const self = this;

            this.parent(params);

            this.Favico = null;
            this.$Parent = null;
            this.Push = new Push();

            // ie 9 and lower can't change the favicon
            if (!window.Browser.ie || (window.Browser.ie && window.Browser.version > 9)) {
                try {
                    this.Favico = new Favico({
                        animation: 'fade'
                    });
                } catch (e) {
                    // nothing
                }

                window.addEvent('unload', function() {
                    if (self.getAttribute('useFavicon') && self.Favico) {
                        self.Favico.badge(0);
                    }
                });
            }

            let data = null;

            try {
                data = window.localStorage.getItem('messageHandler');
            } catch (e) {
                return;
            }

            if (!data) {
                return;
            }

            data = JSON.decode(data);

            if (data.config) {
                this.setAttributes(data.config);
            }

            if (data.filter) {
                this.$filter = Object.merge(this.$filter, data.filter);
            }

            if (data.messages) {
                data.messages.sort(function(a, b) {
                    a = new Date(a.time);
                    b = new Date(b.time);

                    return a > b ? -1 : a < b ? 1 : 0;
                });

                require([
                    'qui/controls/messages/Attention',
                    'qui/controls/messages/Error',
                    'qui/controls/messages/Information',
                    'qui/controls/messages/Success',
                    'qui/controls/messages/Loading',
                    'qui/controls/messages/Message'
                ], function(Attention, Error, Information, Success, Loading, StandardMessage) {
                    var i, len, type, Data, Message;

                    for (i = 0, len = data.messages.length; i < len; i++) {
                        Data = data.messages[i];
                        type = Data.Type;

                        delete Data.Type;

                        switch (type) {
                            case 'qui/controls/messages/Attention':
                                Message = new Attention(Data);
                                break;

                            case 'qui/controls/messages/Error':
                                Message = new Error(Data);
                                break;

                            case 'qui/controls/messages/Information':
                                Message = new Information(Data);
                                break;

                            case 'qui/controls/messages/Success':
                                Message = new Success(Data);
                                break;

                            case 'qui/controls/messages/Loading':
                                Message = new Loading(Data);
                                break;

                            default:
                                Message = new StandardMessage(Data);
                                break;
                        }

                        Message.addEvent(
                            'onDestroy',
                            self.$onMessageDestroy.bind(self)
                        );

                        self.$messages.push(Message);
                    }
                });
            }

            if (data.newMessages && self.$messages.length) {
                this.$newMessages = data.newMessages;
                this.refreshFavicon();
            }

            if (this.getAttribute('autoload')) {
                this.load();
            }
        },

        /**
         * @method qui/controls/messages/Handler#bindeParent
         * @param {HTMLElement} Parent
         */
        bindParent: function(Parent) {
            this.$Parent = Parent;
        },

        /**
         * @method qui/controls/messages/Handler#unbindParent
         */
        unbindParent: function() {
            this.$Parent = null;
        },

        /**
         * Load the messages from the database
         *
         * @method qui/controls/messages/Handler#load
         * @deprecated
         */
        load: function() {
            if (typeof window.User === 'undefined' || !window.User) {
                return;
            }

            const self = this;

            require([
                'Ajax',
                'qui/controls/messages/Attention',
                'qui/controls/messages/Error',
                'qui/controls/messages/Information',
                'qui/controls/messages/Success',
                'qui/controls/messages/Loading'
            ], function(QUIAjax, Attention, Error, Information, Success, Loading) {
                QUIAjax.asyncPost('ajax_messages_get', function(result) {
                    let i, len, data, entry, Message;

                    for (i = 0, len = result.length; i < len; i++) {
                        entry = result[i];

                        data = {
                            message: entry.message,
                            time: entry.time
                        };

                        switch (entry.mtype) {
                            case 'QUI\\Messages\\Attention':
                                Message = new Attention(data);
                                break;

                            case 'QUI\\Messages\\Error':
                                Message = new Error(data);
                                break;

                            case 'QUI\\Messages\\Information':
                                Message = new Information(data);
                                break;

                            case 'QUI\\Messages\\Success':
                                Message = new Success(data);
                                break;

                            case 'QUI\\Messages\\Loading':
                                Message = new Loading(data);
                                break;

                            default:
                                continue;
                        }

                        self.add(Message);
                    }
                });

                self.fireEvent('load', [self]);
            });
        },

        /**
         * Create the DOMNode Element of the MessageHandler
         * It create the opener button
         *
         * If you want to open the message handler, use .open();
         *
         * @method qui/controls/messages/Handler#create
         * @return {HTMLElement}
         */
        create: function() {
            this.$Elm = new Element('div', {
                'class': 'message-handler-control',
                html: '<span class="icon-info"></span>' +
                    '<span class="message-handler-count"></span>',
                title: Locale.get('qui/controls/messages', 'handler.open'),
                events: {
                    click: this.open.bind(this)
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
        open: function() {
            if (document.getElement('.message-handler-container')) {
                return;
            }

            this.$newMessages = 0;

            let Parent = this.$Parent;

            if (!this.$Parent) {
                Parent = document.body;
            }

            const self = this;

            const Container = new Element('div', {
                'class': 'message-handler-container',
                html: '<div class="message-handler-container-title">' +
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
            }).inject(Parent);

            // trash
            Container.getElement('.icon-trash').addEvent(
                'click',
                this.clear.bind(this)
            );

            if (Parent !== document.body) {
                Container.setStyles({
                    border: 'none',
                    position: 'relative'
                });

                Container.getElement('.message-handler-container-title').destroy();

                Container.getElement('.message-handler-container-close').setStyle('display', 'none');
            }

            // filter
            const buttons = Container.getElements('.success,.information,.attention,.error');

            buttons.addEvent(
                'click', this.$switchFilterStatus.bind(this)
            );

            buttons.addClass('message-handler-container-buttons-active');

            // titles
            Container.getElement('.trash').set({
                title: Locale.get('qui/controls/messages', 'handler.button.clear')
            });

            Container.getElement('.success').set({
                title: Locale.get('qui/controls/messages', 'handler.button.success')
            });

            Container.getElement('.information').set({
                title: Locale.get('qui/controls/messages', 'handler.button.information')
            });

            Container.getElement('.attention').set({
                title: Locale.get('qui/controls/messages', 'handler.button.attention')
            });

            Container.getElement('.error').set({
                title: Locale.get('qui/controls/messages', 'handler.button.error')
            });


            // sizes
            const Messages = Container.getElement('.message-handler-container-messages'),
                Close = Container.getElement('.message-handler-container-close');


            new Element('div', {
                'class': 'button message-handler-container-close-btn',
                html: Locale.get('qui/controls/messages', 'handler.button.close'),
                events: {
                    click: function() {
                        self.close();
                    }
                }
            }).inject(Close);


            this.$onResize();

            QUI.addEvent('resize', this.$onResize);

            moofx(Container).animate({
                left: 0
            }, {
                callback: function() {
                    Messages.set('html', '');

                    self.$messages.sort(function(a, b) {
                        a = new Date(a.getAttribute('time'));
                        b = new Date(b.getAttribute('time'));

                        return a > b ? -1 : a < b ? 1 : 0;
                    });

                    // show messages
                    let len = self.$messages.length;

                    for (let i = 0; i < len; i++) {
                        self.$messages[i].inject(Messages);
                    }

                    if (!len) {
                        Messages.set(
                            'html',
                            '<p style="text-align: center;">' +
                            Locale.get('qui/controls/messages', 'handler.no.messages') +
                            '</p>'
                        );
                    }

                    if (Parent === document.body) {
                        Container.addClass('shadow');
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
        parse: function(params, callback) {
            require([
                'qui/controls/messages/Attention',
                'qui/controls/messages/Error',
                'qui/controls/messages/Information',
                'qui/controls/messages/Success',
                'qui/controls/messages/Loading',
                'qui/controls/messages/Message'
            ], function(Attention, Error, Information, Success, Loading, StandardMessage) {
                let data, Message;

                data = {
                    message: params.message,
                    time: params.time
                };

                switch (params.mtype) {
                    case 'QUI\\Messages\\Attention':
                        Message = new Attention(data);
                        break;

                    case 'QUI\\Messages\\Error':
                        Message = new Error(data);
                        break;

                    case 'QUI\\Messages\\Information':
                        Message = new Information(data);
                        break;

                    case 'QUI\\Messages\\Success':
                        Message = new Success(data);
                        break;

                    case 'QUI\\Messages\\Loading':
                        Message = new Loading(data);
                        break;

                    default:
                        Message = new StandardMessage(data);
                        break;
                }

                callback(Message);
            });
        },

        /**
         * Close the message handler
         *
         * @method qui/controls/messages/Handler#close
         */
        close: function() {
            const self = this;

            let Container = document.getElement('.message-handler-container');
            Container.removeClass('shadow');

            moofx(Container).animate({
                left: -500
            }, {
                callback: function() {
                    Container.destroy();
                    document.removeEvent('onResize', self.$onResize);
                }
            });
        },

        /**
         * delete all messages
         *
         * @method qui/controls/messages/Handler#clear
         */
        clear: function() {
            this.$messages = [];

            let Container = document.getElement('.message-handler-container-messages');

            if (Container) {
                Container.set(
                    'html',
                    '<p style="text-align: center;">' +
                    Locale.get('qui/controls/messages', 'handler.no.messages') +
                    '</p>'
                );
            }

            if (this.Favico) {
                this.Favico.reset();
            }

            this.fireEvent('clear', [this]);

            if (this.getAttribute('autosave')) {
                this.save();
            }
        },

        /**
         * Return the number of the messages
         *
         * @method qui/controls/messages/Handler#count
         * @return {Boolean}
         */
        count: function() {
            return this.$messages.length;
        },

        /**
         * Save the message handler to the storage
         *
         * @method qui/controls/messages/Handler#save
         */
        save: function() {
            let i, len, attr;

            let messages = [],
                params = {
                    config: this.getAttributes(),
                    filter: this.$filter,
                    newMessages: this.$newMessages
                };

            for (i = 0, len = this.$messages.length; i < len; i++) {
                attr = this.$messages[i].getAttributes();
                attr.Type = this.$messages[i].getType();

                messages.push(attr);
            }

            params.messages = messages;

            try {
                if ('localStorage' in window) {
                    window.localStorage.setItem(
                        'messageHandler',
                        JSON.encode(params)
                    );
                }
            } catch (e) {
                // maybe QUOTA_REACHED
            }
        },

        /**
         * Refresh the display and filter the messages
         *
         * @method qui/controls/messages/Handler#filter
         */
        filter: function() {
            const Container = document.getElement('.message-handler-container');

            if (!Container) {
                return;
            }

            let i, len, Message;

            let messages = Container.getElements('.messages-message'),
                filter = this.$filter;

            for (i = 0, len = messages.length; i < len; i++) {
                Message = messages[i];

                if (filter.attention && Message.hasClass('message-attention')) {
                    Message.setStyle('display', null);
                    continue;
                }

                if (filter.error && Message.hasClass('message-error')) {
                    Message.setStyle('display', null);
                    continue;
                }

                if (filter.information && Message.hasClass('message-information')) {
                    Message.setStyle('display', null);
                    continue;
                }

                if (filter.success && Message.hasClass('message-success')) {
                    Message.setStyle('display', null);
                    continue;
                }

                Message.setStyle('display', 'none');
            }
        },

        /**
         * Clear new messages - set it to 0
         *
         * @method qui/controls/messages/Handler#clearNewMessages
         */
        clearNewMessages: function() {
            this.$newMessages = 0;
            this.refreshFavicon();

            this.fireEvent('clearNewMessages');
        },

        /**
         * Returns the count of the new messages
         *
         * @method qui/controls/messages/Handler#getNewMessages
         * @return {Number}
         */
        getNewMessages: function() {
            return this.$newMessages;
        },

        /**
         * Return the messages array
         *
         * @method qui/controls/messages/Handler#getMessages
         * @return {Array}
         */
        getMessages: function() {
            return this.$messages;
        },

        /**
         * refresh the favicon and the counter
         *
         * @method qui/controls/messages/Handler#refreshFavicon
         */
        refreshFavicon: function() {
            if (this.Favico && this.getAttribute('useFavicon')) {
                this.Favico.badge(this.$newMessages);
            }

            if (!this.getElm()) {
                return;
            }

            const Count = this.getElm().getElement('.message-handler-count');

            if (!Count) {
                return;
            }

            Count.set({
                html: this.$newMessages,
                styles: {
                    display: this.$newMessages ? 'inline' : 'none'
                }
            });
        },

        /**
         * Add a message to the Handler
         *
         * @method qui/controls/messages/Handler#add
         * @param {Object} Message - qui/controls/messages/Message
         * @param {HTMLElement} [Parent] - optional, Parent Object, where to display the message
         * @return {Object} this (qui/controls/messages/Handler)
         */
        add: function(Message, Parent) {
            const self = this,
                Messages = document.getElement('.message-handler-container-messages');

            // spam detection - 1000 ms - same message - dont show it
            // mor wants: 1 second
            const lastIndex = this.$messages.length - 1;

            if (lastIndex && typeof this.$messages[lastIndex] !== 'undefined') {
                const LastMessage = this.$messages[this.$messages.length - 1];

                if (LastMessage.getAttribute('message') === Message.getAttribute('message')) {
                    const LastTime = LastMessage.getAttribute('time'),
                        Now = new Date();

                    Now.setSeconds(Now.getSeconds() - 2);

                    if (Now < LastTime) {
                        return this;
                    }
                }
            }


            this.$messages.push(Message);

            if (this.getAttribute('customMessageHandling')) {
                this.getAttribute('customMessageHandling')(Message, Parent);
                return this;
            }

            Message.addEvents({
                onDestroy: this.$onMessageDestroy.bind(this),
                onFinish: function() {
                    // for loading message
                    if (self.getAttribute('autosave')) {
                        self.save();
                    }
                }
            });

            // message handler is closed
            if (!Messages) {
                if (!this.getAttribute('showMessages')) {
                    return this;
                }

                this.$newMessages++;
                this.refreshFavicon();

                if (this.getAttribute('autosave')) {
                    this.save();
                }

                let pos, size;
                const Node = Message.createMessageElement();

                if (typeof Parent === 'undefined') {
                    Parent = document.body;
                }

                pos = Parent.getPosition();
                size = Parent.getSize();

                Node.setStyles({
                    left: pos.x,
                    position: 'absolute',
                    top: pos.y + size.y,
                    width: 280,
                    zIndex: 10000
                });

                if (Parent === document.body) {
                    Node.setStyles({
                        bottom: 10,
                        left: 10,
                        position: 'fixed',
                        top: null
                    });

                    // messages are shown?
                    const messages = document.body.getChildren('.messages-message');

                    if (messages.length) {
                        const sum = messages.map(function(Elm) {
                            return Elm.getSize().y + 10;
                        }).sum();

                        Node.setStyle('bottom', sum + 10);
                    }
                }

                // fined the highest zIndex
                const zIndexList = document.getElements('body > *').map(function(Elm) {
                    return Elm.getStyle('zIndex').toInt() || 1;
                });

                let max = Math.max.apply(null, zIndexList) + 1;

                if (!max || max < 10000) {
                    max = 10000;
                }

                if (max > QUI.Windows.$getmaxWindowZIndex()) {
                    max = QUI.Windows.$getmaxWindowZIndex() + 10;
                }

                Node.setStyle('zIndex', max);
                Node.addClass('animated');
                Node.inject(document.body);
                Node.addClass('fadeInDown');

                (function() {
                    moofx(Node).animate({
                        opacity: 0
                    }, {
                        callback: function() {
                            Node.destroy();
                        }
                    });
                }).delay(this.getAttribute('displayTimeMessages'));

                this.fireEvent('add', [
                    this,
                    Message,
                    Node
                ]);

                return this;
            }

            // message handler is open
            if (this.$messages.length === 1) {
                Messages.set('html', '');
            }

            Message.inject(Messages, 'top');

            new Fx.Scroll(Messages).toTop();

            Message.getElm().addClass('animated');
            Message.getElm().addClass('flash');

            if (this.getAttribute('autosave')) {
                this.save();
            }

            this.fireEvent('add', [
                this,
                Message,
                Node
            ]);

            return this;
        },

        /**
         * Add an attention
         *
         * @method qui/controls/messages/Handler#addAttention
         * @param {String} str - Message text
         * @param {HTMLElement} [Parent] - optional, Parent Object, where to display the message
         * @return {Object} this (qui/controls/messages/Handler)
         */
        addAttention: function(str, Parent) {
            const self = this;

            require(['qui/controls/messages/Attention'], function(Attention) {
                const Message = new Attention({
                    message: str
                });

                self.add(Message, Parent);
                self.fireEvent('addAttention', [
                    this,
                    Message
                ]);
            });

            return this;
        },

        /**
         * Add an error
         *
         * @method qui/controls/messages/Handler#addError
         * @param {String} str - Message text
         * @param {HTMLElement} [Parent] - optional, Parent Object, where to display the message
         * @return {Object} this (qui/controls/messages/Handler)
         */
        addError: function(str, Parent) {
            const self = this;

            require(['qui/controls/messages/Error'], function(Error) {
                const Message = new Error({
                    message: str
                });

                self.add(Message, Parent);
                self.fireEvent('addError', [
                    this,
                    Message
                ]);
            });

            return this;
        },

        /**
         * Add an exception
         *
         * @method qui/controls/messages/Handler#addException
         * @param {DOMException|Object} Exception - DOMException | qui/controls/messages/Message
         * @param {HTMLElement} [Parent] - optional, Parent Object, where to display the message
         * @return {Object} this (qui/controls/messages/Handler)
         */
        addException: function(Exception, Parent) {
            const self = this;

            require(['qui/controls/messages/Error'], function(Error) {
                const Message = new Error({
                    message: Exception.getMessage(),
                    code: Exception.getCode()
                });

                self.add(Message, Parent);
                self.fireEvent('addError', [
                    this,
                    Message
                ]);
            });

            return this;
        },

        /**
         * Add an information message
         *
         * @method qui/controls/messages/Handler#addInformation
         * @param {String} str - Message text
         * @param {HTMLElement} [Parent] - optional, Parent Object, where to display the message
         * @return {Object} this (qui/controls/messages/Handler)
         */
        addInformation: function(str, Parent) {
            const self = this;

            require(['qui/controls/messages/Information'], function(Information) {
                const Message = new Information({
                    message: str
                });

                self.add(Message, Parent);
                self.fireEvent('addInformation', [
                    this,
                    Message
                ]);
            });

            return this;
        },

        /**
         * Add an attention
         *
         * @method qui/controls/messages/Handler#addAttention
         * @param {String} str - Message text
         * @param {Function} [callback] - Callback Function, to get the Loading object
         * @param {HTMLElement} [Parent] - optional, Parent Object, where to display the message
         * @return {Promise}
         */
        addLoading: function(str, callback, Parent) {
            const self = this;

            return new Promise(function(resolve, reject) {
                require(['qui/controls/messages/Loading'], function(Loading) {
                    const Message = new Loading({
                        message: str
                    });

                    self.add(Message, Parent);
                    self.fireEvent('addLoadingMessage', [
                        this,
                        Message
                    ]);

                    if (typeof callback === 'function') {
                        callback(Message);
                    }

                    resolve(Message);
                }, reject);
            });
        },

        /**
         * Add a success message
         *
         * @method qui/controls/messages/Handler#addSuccess
         * @param {String} str - Message text
         * @param {HTMLElement} [Parent] - optional, Parent Object, where to display the message
         * @return {Object} this (qui/controls/messages/Handler)
         */
        addSuccess: function(str, Parent) {
            const self = this;

            require(['qui/controls/messages/Success'], function(Success) {
                const Message = new Success({
                    message: str
                });

                self.add(Message, Parent);
                self.fireEvent('addSuccess', [
                    this,
                    Message
                ]);
            });

            return this;
        },

        /**
         * Pushs a attention message
         *
         * @param {String} title
         * @param {String} message
         * @param {Number} [timeout]
         */
        pushAttention: function(title, message, timeout) {
            title = title || '';
            message = message || '';

            if (typeof timeout === 'undefined') {
                timeout = 5000;
            }

            const path = window.requirejs.s.contexts._.config.paths.qui;

            this.Push.create(title, {
                body: message,
                icon: {
                    x16: path + '/controls/messages/images/attention_16.png',
                    x32: path + '/controls/messages/images/attention_32.png'
                },
                timeout: timeout
            });
        },

        /**
         * Pushs a attention message
         *
         * @param {String} title
         * @param {String} message
         * @param {Number|Boolean} [timeout]
         */
        pushError: function(title, message, timeout) {
            title = title || '';
            message = message || '';

            if (typeof timeout === 'undefined') {
                timeout = 5000;
            }

            const path = window.requirejs.s.contexts._.config.paths.qui;


            this.Push.create(title, {
                body: message,
                icon: {
                    x16: path + '/controls/messages/images/error_16.png',
                    x32: path + '/controls/messages/images/error_32.png'
                },
                timeout: timeout
            });
        },

        /**
         * Pushs a exception
         *
         * @param {DOMException|Object} Exception
         * @param {Number|Boolean} [timeout]
         */
        pushException: function(Exception, timeout) {
            const title = Exception.getCode();
            const message = Exception.getMessage();

            if (typeof timeout === 'undefined') {
                timeout = 5000;
            }

            const path = window.requirejs.s.contexts._.config.paths.qui;

            this.Push.create(title, {
                body: message,
                icon: {
                    x16: path + '/controls/messages/images/error_16.png',
                    x32: path + '/controls/messages/images/error_32.png'
                },
                timeout: timeout
            });
        },

        /**
         * Pushs a information message
         *
         * @param {String} title
         * @param {String} message
         * @param {Number|Boolean} [timeout]
         */
        pushInformation: function(title, message, timeout) {
            title = title || '';
            message = message || '';

            if (typeof timeout === 'undefined') {
                timeout = 5000;
            }

            const path = window.requirejs.s.contexts._.config.paths.qui;

            this.Push.create(title, {
                body: message,
                icon: {
                    x16: path + '/controls/messages/images/information_16.png',
                    x32: path + '/controls/messages/images/information_32.png'
                },
                timeout: timeout
            });
        },

        /**
         * Pushs a success message
         *
         * @param {String} title
         * @param {String} message
         * @param {Number|Boolean} [timeout]
         */
        pushSuccess: function(title, message, timeout) {
            title = title || '';
            message = message || '';

            if (typeof timeout === 'undefined') {
                timeout = 5000;
            }

            const path = window.requirejs.s.contexts._.config.paths.qui;

            this.Push.create(title, {
                body: message,
                icon: {
                    x16: path + '/controls/messages/images/success_16.png',
                    x32: path + '/controls/messages/images/success_32.png'
                },
                timeout: timeout
            });
        },

        /**
         * Switch a filter status by its click event
         *
         * @method qui/controls/messages/Handler#$switchFilterStatus
         * @param {DOMEvent} event
         */
        $switchFilterStatus: function(event) {
            let Target = event.target,
                filter = false,
                active = Target.hasClass('message-handler-container-buttons-active');

            if (Target.hasClass('success')) {
                filter = 'success';
            } else {
                if (Target.hasClass('information')) {
                    filter = 'information';
                } else {
                    if (Target.hasClass('attention')) {
                        filter = 'attention';
                    } else {
                        if (Target.hasClass('error')) {
                            filter = 'error';
                        } else {
                            return;
                        }
                    }
                }
            }

            if (active) {
                Target.removeClass('message-handler-container-buttons-active');
            } else {
                Target.addClass('message-handler-container-buttons-active');
            }

            this.$filter[filter] = !active;
            this.filter();
        },

        /**
         * event : on message destroy
         *
         * @method qui/controls/messages/Handler#$onMessageDestroy
         * @param {Object} Message - qui/controls/messages/Message
         */
        $onMessageDestroy: function(Message) {
            let i, len;
            const messages = [];

            for (i = 0, len = this.$messages.length; i < len; i++) {
                if (this.$messages[i] !== Message) {
                    messages.push(this.$messages[i]);
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
        $onResize: function() {
            const Container = document.getElement('.message-handler-container');

            if (!Container) {
                return;
            }

            let height;
            let Parent = this.$Parent;

            if (!Parent) {
                Parent = document.body;
            }

            let size = Parent.getSize(),
                Title = Container.getElement('.message-handler-container-title'),
                Buttons = Container.getElement('.message-handler-container-buttons'),
                Messages = Container.getElement('.message-handler-container-messages'),
                Close = Container.getElement('.message-handler-container-close');

            // calc
            height = size.y - Title.getSize().y -
                Buttons.getSize().y - Close.getSize().y;

            Messages.setStyles({
                height: height
            });
        }
    });
});
