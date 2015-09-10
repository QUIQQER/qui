/**
 * The main message class
 *
 * @module qui/controls/messages/Message
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require qui/Locale
 * @require css!qui/controls/messages/Message.css
 *
 * @event onClick [this]
 */

define('qui/controls/messages/Message', [

    'qui/controls/Control',
    'qui/Locale',

    'css!qui/controls/messages/Message.css'

], function (Control, Locale) {
    "use strict";

    /**
     * @class qui/controls/messages/Message
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type   : 'qui/controls/messages/Message',

        options: {
            message : '',
            code    : 0,
            time    : false,
            cssclass: false,
            styles  : false,
            hideTime: false
        },

        initialize: function (options) {
            this.parent(options);

            this.$elements = [];

            if (!this.getAttribute('time')) {
                this.setAttribute('time', new Date());
            } else {
                this.setAttribute(
                    'time',
                    new Date(this.getAttribute('time'))
                );
            }
        },

        /**
         * Return the DOMNode of the message
         *
         * @method qui/controls/messages/Message#create
         * @return {HTMLElement}
         */
        create: function () {
            this.$Elm = this.createMessageElement();

            var Destroy = this.$Elm.getElement('.messages-message-destroy');

            Destroy.set({
                title: Locale.get('quiqqer/qui', 'msg-handler-close-msg')
            });

            Destroy.removeEvents('click');

            Destroy.addEvent(
                'click',
                this.destroy.bind(this)
            );

            return this.$Elm;
        },

        /**
         * Return the message
         * -> getAttribute('message')
         *
         * @method qui/controls/messages/Message#getMessage
         * @return {String}
         */
        getMessage: function () {
            return this.getAttribute('message');
        },

        /**
         * Return the message code
         * -> getAttribute('code')
         *
         * @method qui/controls/messages/Message#getCode
         * @return {Number}
         */
        getCode: function () {
            return this.getAttribute('code');
        },

        /**
         * Create a DOMNode Element from the message attributes
         *
         * @method qui/controls/messages/Message#createMessageElement
         * @return {HTMLElement}
         */
        createMessageElement: function () {
            var self = this,
                Time = this.getAttribute('time');

            //var time = Time.toLocaleDateString() +' '+ Time.toLocaleTimeString();

            var time = ('0' + Time.getDate()).slice(-2) + '.' +
                       ('0' + (Time.getMonth() + 1)).slice(-2) + '.' +
                       Time.getFullYear();

            var hours   = ('0' + Time.getHours()).slice(-2);
            var seconds = ('0' + Time.getSeconds()).slice(-2);

            time = time + ' ' + hours + ':' + seconds;

            var Elm = new Element('div', {
                'class': 'messages-message box',
                html   : '<div class="messages-message-header">' +
                         '<span class="messages-message-header-time">' + time + '</span>' +
                         '<span class="messages-message-destroy icon-remove-circle"></span>' +
                         '</div>' +
                         '<div class="messages-message-text">' +
                         this.getAttribute('message') +
                         '</div>',
                events : {
                    click: function () {
                        self.fireEvent('click', [self]);
                    }
                }
            });

            if (this.getAttribute('styles')) {
                Elm.setStyles(this.getAttribute('styles'));
            }

            if (this.getAttribute('cssclass')) {
                Elm.addClass(this.getAttribute('cssclass'));
            }

            if (this.getAttribute('hideTime')) {
                Elm.getElement(
                    '.messages-message-header-time'
                ).setStyle('display', 'none');
            }

            var Destroy = Elm.getElement('.messages-message-destroy');

            Destroy.set({
                title: Locale.get('qui/controls/messages', 'message.close')
            });

            Destroy.addEvent('click', function () {
                self.fireEvent('destroy', [self]);
                Elm.destroy();
            });

            this.$elements.push(Elm);

            return Elm;
        }
    });
});
