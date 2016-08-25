/**
 * @module qui/controls/buttons/ButtonSwitch
 * @author www.pcsg.de (Henning Leutz)
 *
 * Button with a on/off switch
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/buttons/Switch
 * @require css!qui/controls/buttons/ButtonSwitch.css
 */
define('qui/controls/buttons/ButtonSwitch', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Switch',

    'css!qui/controls/buttons/ButtonSwitch.css'

], function (QUI, QUIControl, QUISwitch) {
    "use strict";

    return new Class({
        Extends: QUIControl,
        Type   : 'qui/controls/buttons/ButtonSwitch',

        Binds: [
            '$onInject',
            '$onSetAttribute',
            'toggle'
        ],

        options: {
            status  : 0,
            text    : false,   // Button text
            title   : false,
            styles  : false,
            disabled: false
        },

        initialize: function (options) {
            this.parent(options);

            this.$Switch   = null;
            this.$disabled = this.getAttribute('disabled');

            this.addEvents({
                onInject      : this.$onInject,
                onSetAttribute: this.$onSetAttribute,
                onDestroy     : function () {
                    if (this.$Switch) {
                        this.$Switch.destroy();
                    }
                }.bind(this)
            });
        },

        /**
         * Create the DOMNode element
         *
         * @returns {HTMLDivElement}
         */
        create: function () {
            this.$Elm = new Element('button', {
                'class': 'qui-button-switch',
                html   : '<div class="qui-button-switch-switch"></div>' +
                         '<div class="qui-button-switch-text"></div>' +
                         '<div class="qui-button-switch--click"></div>'
            });

            this.$Text = this.$Elm.getElement('.qui-button-switch-text');

            this.$Switch = new QUISwitch().inject(
                this.$Elm.getElement('.qui-button-switch-switch')
            );

            this.$Elm.getElement('.qui-button-switch--click').addEvent('click', this.toggle);

            if (this.getAttribute('text')) {
                this.$Text.set('html', this.getAttribute('text'));
            }

            if (this.getAttribute('title')) {
                this.$Elm.set('title', this.getAttribute('title'));
            }

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            return this.$Elm;
        },

        /**
         * Event : on inject
         */
        $onInject: function () {
            if (this.getAttribute('status')) {
                this.$Switch.on();
            } else {
                this.$Switch.off();
            }

            if (this.$disabled) {
                this.disable();
            }
        },

        /**
         * Refresh the display / rendering - on / off button
         */
        resize: function () {
            if (this.$Switch) {
                this.$Switch.resize();
            }
        },

        /**
         * Toggle the status of the switch, from off to on or from on to off
         *
         * @param {Event} [event] - click event
         */
        toggle: function (event) {
            if (this.$disabled) {
                return;
            }

            if (typeOf(event) === 'domevent') {
                event.stop();
            }

            this.$Switch.toggle();
            this.fireEvent('change', [this]);
        },

        /**
         * Set the status to on
         *
         * @return {Promise}
         */
        on: function () {
            if (this.$disabled) {
                return Promise.resolve();
            }

            if (this.$Switch.getStatus()) {
                return Promise.resolve();
            }

            this.$Switch.on().then(function () {
                this.fireEvent('change', [this]);
            }.bind(this));
        },

        /**
         * Set the status to off
         *
         * @return {Promise}
         */
        off: function () {
            if (this.$disabled) {
                return Promise.resolve();
            }

            if (!this.$Switch.getStatus()) {
                return Promise.resolve();
            }

            return this.$Switch.off().then(function () {
                this.fireEvent('change', [this]);
            }.bind(this));
        },

        /**
         * Set status to "on" without triggering any events
         *
         * @returns {Promise}
         */
        setSilentOn: function () {
            return this.$Switch.setSilentOn();
        },

        /**
         * Set status to "off" without triggering any events
         *
         * @returns {Promise}
         */
        setSilentOff: function () {
            return this.$Switch.setSilentOff();
        },

        /**
         * Return the status
         *
         * @return {Boolean}
         */
        getStatus: function () {
            return this.$Switch.getStatus();
        },

        /**
         * Enable the
         */
        enable: function () {
            this.$disabled     = false;
            this.$Elm.disabled = false;
            this.$Switch.enable();
        },

        /**
         * Disable the buttonswitch
         * The button switch cant be changed
         */
        disable: function () {
            this.$disabled     = true;
            this.$Elm.disabled = true;
            this.$Switch.disable();
        },

        /**
         * event : on set attributes
         *
         * @param {String} name
         * @param value
         */
        $onSetAttribute: function (name, value) {
            if (name === "styles") {
                this.$Elm.setStyles(value);
                return;
            }

            if (name === "title") {
                this.$Elm.set('title', value);
                return;
            }

            if (name === "text") {
                this.$Text.set('html', value);
            }
        }
    });
});
