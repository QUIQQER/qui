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

], function (QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'qui/controls/buttons/Switch',

        Binds: [
            'toggle',
            '$onInject',
            '$onSetAttribute'
        ],

        options: {
            name  : '',
            title : '',
            styles: false,
            status: true,

            switchTextOn     : '',
            switchTextOnIcon : 'icon-ok',
            switchTextOff    : '',
            switchTextOffIcon: 'icon-remove'
        },

        initialize: function (options) {
            this.parent(options);

            this.$Button   = false;
            this.$FxElm    = false;
            this.$FxButton = false;

            this.$status        = this.getAttribute('status');
            this.$triggerEvents = true;
            this.$disabled      = false;
            this.$activeColor   = '#0069b4';

            this.addEvents({
                onInject      : this.$onInject,
                onSetAttribute: this.$onSetAttribute
            });
        },

        /**
         * resize the switch
         *
         * @return {Promise}
         */
        resize: function () {
            return new Promise(function (resolve) {

                this.$Button.setStyle('width', this.$ButtonTextOff.getSize().x);

                this.$triggerEvents = false;

                var Prom = Promise.resolve();

                if (this.getStatus()) {
                    Prom = this.on();
                } else {
                    Prom = this.off();
                }

                this.$triggerEvents = true;

                Prom.then(function () {
                    moofx(this.$Elm).animate({
                        opacity: 1
                    }, {
                        callback: function () {
                            this.$Elm.setStyle('opacity', null);
                            resolve();
                        }.bind(this)
                    });
                }.bind(this));
            }.bind(this));
        },

        /**
         * Create the DOM Element
         *
         * @method qui/controls/buttons/Button#create
         * @return {HTMLElement}
         */
        create: function () {
            this.$Elm = new Element('div', {
                'class'     : 'qui-switch',
                html        : '<div class="qui-switch-off">' +
                              '<div class="qui-switch-icon-off"></div>' +
                              '<div class="qui-switch-text-off"></div>' +
                              '</div>' +
                              '<div class="qui-switch-on">' +
                              '<div class="qui-switch-icon-on"></div>' +
                              '<div class="qui-switch-text-on"></div>' +
                              '</div>' +
                              '<div class="qui-switch-button"></div>' +
                              '<input type="hidden" />',
                styles      : {
                    opacity: 0
                },
                'data-quiid': this.getId()
            });

            this.$InputStatus = this.$Elm.getElement('input');
            this.$Button      = this.$Elm.getElement('.qui-switch-button');

            this.$ButtonTextOn = this.$Elm.getElement('.qui-switch-on');
            this.$TextOn       = this.$Elm.getElement('.qui-switch-text-on');

            this.$ButtonTextOff = this.$Elm.getElement('.qui-switch-off');
            this.$TextOff       = this.$Elm.getElement('.qui-switch-text-off');

            this.$IconOn  = this.$Elm.getElement('.qui-switch-icon-on');
            this.$IconOff = this.$Elm.getElement('.qui-switch-icon-off');

            this.$IconOn.addClass(this.getAttribute('switchTextOnIcon'));
            this.$IconOff.addClass(this.getAttribute('switchTextOffIcon'));

            this.$TextOn.set('html', this.getAttribute('switchTextOn'));
            this.$TextOff.set('html', this.getAttribute('switchTextOff'));

            this.$Elm.addEvent('click', this.toggle);

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            if (this.getAttribute('switchTextOn') === '') {
                this.$TextOn.setStyles({
                    textAlign: 'center',
                    width    : '100%'
                });
            }

            if (this.getAttribute('switchTextOff') === '') {
                this.$TextOff.setStyles({
                    textAlign: 'center',
                    width    : '100%'
                });
            }

            if (this.getAttribute('title')) {
                this.$Elm.set('title', this.getAttribute('title'));
            }

            this.$FxElm    = moofx(this.$Elm);
            this.$FxButton = moofx(this.$Button);

            this.$InputStatus.set('name', this.getAttribute('name'));

            return this.$Elm;
        },

        /**
         * event : on inject
         */
        $onInject: function () {
            this.$Button.setStyle('left', 0);

            // fix for real resize
            (function () {
                var wasDisabled = this.$disabled;

                this.enable();

                this.resize().then(function () {
                    this.$Elm.setStyle('background', this.$activeColor);

                    if (wasDisabled) {
                        this.setSilentOff().then(function () {
                            this.disable();
                            this.$Elm.setStyle('background', this.$activeColor);
                        }.bind(this));
                    }

                }.bind(this));
            }).delay(100, this);
        },

        /**
         * Return the Status
         *
         * @returns {Boolean}
         */
        getStatus: function () {
            return this.$status ? true : false;
        },

        /**
         * Change the status of the Button
         *
         * @return {Promise}
         */
        toggle: function () {
            if (this.$status) {
                return this.off();
            }

            return this.on();
        },

        /**
         * Set the "on" status
         *
         * @return {Promise}
         */
        on: function () {
            if (this.$disabled) {
                return Promise.resolve();
            }

            this.$status      = 1;
            this.$activeColor = '#0069b4';

            if (this.$triggerEvents) {
                this.fireEvent('statusOn', [this]);
                this.fireEvent('change', [this]);
            }

            if (!this.$Elm) {
                return Promise.resolve();
            }

            return new Promise(function (resolve) {
                // Send the "on" switch status
                this.$InputStatus.addEvents('click', this.$InputStatus.set('value', '1'));

                var textWidth = this.$ButtonTextOff.getSize().x;

                this.$FxElm.animate({
                    background: this.$activeColor
                }, {
                    duration: 200,
                    equation: 'cubic-bezier(1,0,0,0)'
                });

                this.$FxButton.animate({
                    left : 0,
                    width: textWidth
                }, {
                    duration: 350,
                    equation: 'cubic-bezier(0.34,1.31,0.7,1)',
                    callback: resolve
                });
            }.bind(this));
        },

        /**
         * Set the "off" status
         *
         * @return {Promise}
         */
        off: function () {
            if (this.$disabled) {
                return Promise.resolve();
            }

            this.$status      = 0;
            this.$activeColor = '#ffffff';

            if (this.$triggerEvents) {
                this.fireEvent('statusOff', [this]);
                this.fireEvent('change', [this]);
            }

            if (!this.$Elm) {
                return Promise.resolve();
            }

            return new Promise(function (resolve) {
                // Send the "off" switch status
                this.$InputStatus.addEvents('click', this.$InputStatus.set('value', '0'));

                var onWidth  = this.$ButtonTextOn.getSize().x,
                    offWidth = this.$ButtonTextOff.getSize().x;

                this.$FxElm.animate({
                    background: this.$activeColor
                }, {
                    duration: 10,
                    equation: 'cubic-bezier(0,0,1,1)'
                });

                this.$FxButton.animate({
                    left : offWidth,
                    width: onWidth
                }, {
                    duration: 350,
                    equation: 'cubic-bezier(0.34,1.31,0.7,1)',
                    callback: resolve
                });
            }.bind(this));
        },

        /**
         * Set status to "on" without triggering any events
         *
         * @return {Promise}
         */
        setSilentOn: function () {
            this.$triggerEvents = false;

            return this.on().then(function () {
                this.$triggerEvents = true;
            }.bind(this));
        },

        /**
         * Set status to "off" without triggering any events
         *
         * @return {Promise}
         */
        setSilentOff: function () {
            this.$triggerEvents = false;

            return this.off().then(function () {
                this.$triggerEvents = true;
            }.bind(this));
        },

        /**
         * Enables the Switch so that the status can be switched
         */
        enable: function () {
            this.$disabled    = false;
            this.$activeColor = '#0069b4';
            this.getElm().removeClass('qui-switch-button-disabled');
        },

        /**
         * Disables the Switch: No status change possible
         */
        disable: function () {
            this.$disabled    = true;
            this.$activeColor = '#ddd';
            this.getElm().addClass('qui-switch-button-disabled');
        },

        /**
         * event : on set attribute
         *
         * @param {String} key   - attribute name
         * @param {String|Number|Object} value - attribute value
         */
        $onSetAttribute: function (key, value) {
            if (!this.$Elm) {
                return;
            }

            if (key == 'title') {
                this.$Elm.set('title', value);
            }
        }
    });
});
