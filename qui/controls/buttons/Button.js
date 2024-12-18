/**
 * QUI Control - Button
 *
 * @module qui/controls/buttons/Button
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onClick
 * @event onCreate
 * @event onDrawBegin
 * @event onDrawEnd
 * @event onSetNormal
 * @event onSetDisable
 * @event onSetActive
 *
 * @event onEnter     - event triggerd if button is not disabled
 * @event onLeave     - event triggerd if button is not disabled
 * @event onMousedown - event triggerd if button is not disabled
 * @event onMouseUp   - event triggerd if button is not disabled
 * @event onFocus
 * @event onBlur
 * @event onActive
 * @event onDisable
 * @event onEnable
 */

var needle = [
    'qui/controls/Control',
    'qui/utils/Controls',
    'qui/utils/NoSelect',
    'qui/controls/contextmenu/Item'
];

if (!('QUI' in window) || !window.QUI.getAttribute('control-buttons-dont-load-css')) {
    needle.push('css!qui/controls/buttons/Button.css');
}


define('qui/controls/buttons/Button', needle, function(Control, Utils, NoSelect, ContextMenuItem) {
    'use strict';

    /**
     * @class qui/controls/buttons/Button
     *
     * @event onClick
     * @event onCreate
     * @event onDrawBegin
     * @event onDrawEnd
     * @event onSetNormal
     * @event onSetDisable
     * @event onSetActive
     *
     * @event onEnter     - event triggerd if button is not disabled
     * @event onLeave     - event triggerd if button is not disabled
     * @event onMousedown - event triggerd if button is not disabled
     * @event onMouseUp   - event triggerd if button is not disabled
     * @event onFocus
     * @event onBlur
     * @event onActive
     * @event onDisable
     * @event onEnable
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type: 'qui/controls/buttons/Button',

        Binds: [
            'onSetAttribute'
        ],

        options: {
            'type': 'button',
            'image': false,   // (@depricated) use the icon attribute
            'icon': false,   // icon top of the text
            'style': {},      // mootools css style attributes
            'textimage': false,   // Image left from text
            'text': false,   // Button text
            'title': false,
            'class': false,    // extra CSS Class
            'buttonCSSClass': true, // should have the button the qui-button css class?
            'menuCorner': 'top',
            'dropDownIcon': true
        },

        params: {},

        initialize: function(options) {
            options = options || {};

            this.parent(options);

            this.$Menu = null;
            this.$Drop = null;
            this.$items = [];


            if (options.events) {
                delete options.events;
            }

            this.setAttributes(
                this.initV2(options)
            );

            this.addEvent('onSetAttribute', this.onSetAttribute);
            this.addEvent('onDestroy', function() {
                if (this.$Menu) {
                    this.$Menu.destroy();
                }
            }.bind(this));
        },

        /**
         * Compatible to _ptools::Button v2
         *
         * @method qui/controls/buttons/Button#initV2
         * @param {Object} options
         * @ignore
         */
        initV2: function(options) {
            if (typeof options.onclick !== 'undefined') {
                if (typeOf(options.onclick) === 'string') {
                    options.onclick = function(p) {
                        eval(p + '(this);');
                    }.bind(this, [options.onclick]);
                }

                this.addEvent('onClick', options.onclick);
                delete options.onclick;
            }

            if (typeof options.oncreate !== 'undefined') {
                this.addEvent('onCreate', options.oncreate);
                delete options.oncreate;
            }

            return options;
        },

        /**
         * Create the DOM Element
         *
         * @method qui/controls/buttons/Button#create
         * @return {HTMLElement}
         */
        create: function() {
            var self = this;

            var Elm = new Element('button', {
                'type': this.getAttribute('type'),
                'data-status': 0,
                'data-quiid': this.getId()
            });

            Elm.addClass('qui-button--no-icon');

            if (this.getAttribute('buttonCSSClass')) {
                Elm.addClass('qui-button');
            }

            if (this.getAttribute('width')) {
                Elm.setStyle('width', this.getAttribute('width'));
            }

            if (this.getAttribute('height')) {
                Elm.setStyle('height', this.getAttribute('height'));
            }

            if (this.getAttribute('styles')) {
                Elm.setStyles(this.getAttribute('styles'));
            }

            if (this.getAttribute('class')) {
                Elm.addClass(this.getAttribute('class'));
            }

            Elm.style.outline = 0;
            Elm.setAttribute('tabindex', '-1');

            Elm.addEvents({

                click: function(event) {
                    if (self.isDisabled()) {
                        return;
                    }

                    self.onclick(event);
                },

                mouseenter: function() {
                    if (self.isDisabled()) {
                        return;
                    }

                    if (!self.isActive()) {
                        self.getElm().addClass('qui-button-over');
                    }

                    self.fireEvent('enter', [self]);
                },

                mouseleave: function() {
                    if (self.isDisabled()) {
                        return;
                    }

                    self.getElm().removeClass('qui-button-over');
                    self.fireEvent('leave', [self]);
                },

                mousedown: function(event) {
                    if (self.isDisabled()) {
                        return;
                    }

                    self.fireEvent('mousedown', [self, event]);

                },

                mouseup: function(event) {
                    if (self.isDisabled()) {
                        return;
                    }

                    self.fireEvent('mouseup', [self, event]);
                },

                blur: function(event) {
                    self.fireEvent('blur', [self, event]);
                },

                focus: function(event) {
                    self.fireEvent('focus', [self, event]);
                }
            });

            this.$Elm = Elm;


            // Elemente aufbauen
            if (this.getAttribute('icon')) {
                this.setAttribute('icon', this.getAttribute('icon'));
            }

            if (!this.getAttribute('icon') && this.getAttribute('image')) {
                this.setAttribute('icon', this.getAttribute('image'));
            }

            if (this.getAttribute('styles')) {
                this.setAttribute('styles', this.getAttribute('styles'));
            }

            if (this.getAttribute('textimage')) {
                this.setAttribute('textimage', this.getAttribute('textimage'));
            }

            if (this.getAttribute('text')) {
                this.setAttribute('text', this.getAttribute('text'));
            }

            if (this.getAttribute('title')) {
                this.$Elm.set('title', this.getAttribute('title'));
            }

            if (this.getAttribute('name')) {
                this.$Elm.set('name', this.getAttribute('name'));
            }

            if (this.getAttribute('disabled')) {
                this.disable();
            }


            // sub menu
            var i;
            var len = this.$items.length;

            if (len) {
                this.getContextMenu(function(Menu) {
                    for (i = 0; i < len; i++) {
                        Menu.appendChild(self.$items[i]);
                    }

                    if (self.getAttribute('dropDownIcon')) {
                        self.$Drop = new Element('div', {
                            'class': 'qui-button-drop icon-chevron-down fa fa-chevron-down'
                        }).inject(self.$Elm);
                    }
                });
            }

            this.fireEvent('create', [this]);

            NoSelect.disable(Elm);

            return this.$Elm;
        },

        /**
         * Trigger the Click Event
         *
         * @method qui/controls/buttons/Button#onclick
         * @param {DOMEvent} event
         */
        click: function(event) {
            if (this.isDisabled()) {
                return;
            }

            this.getElm().addClass('qui-button--click');
            this.getElm().removeClass('qui-button-over');

            this.fireEvent('click', [this, event]);

            this.getElm().removeClass.delay(300, this.getElm(), 'qui-button--click');
        },

        /**
         * @see #click()
         */
        onclick: function(event) {
            this.click(event);
        },

        /**
         * Set the Button Active
         *
         * @method qui/controls/buttons/Button#setActive
         */
        setActive: function() {
            if (this.isDisabled()) {
                return;
            }

            var Elm = this.getElm();

            if (!Elm) {
                return;
            }

            Elm.addClass('qui-button-active');
            Elm.set('data-status', 1);

            this.fireEvent('active', [this]);
        },

        /**
         * is Button Active?
         *
         * @method qui/controls/buttons/Button#isActive
         * @return {Boolean}
         */
        isActive: function() {
            if (!this.getElm()) {
                return false;
            }

            return parseInt(this.getElm().get('data-status')) === 1;
        },

        /**
         * Disable the Button
         * Most Events are no more triggered
         *
         * @method qui/controls/buttons/Button#disable
         * @return {Object} this (qui/controls/buttons/Button)
         */
        disable: function() {
            var Elm = this.getElm();

            if (!Elm) {
                return this;
            }

            Elm.set({
                'data-status': -1,
                'disabled': 'disabled'
            });

            this.fireEvent('disable', [this]);

            return this;
        },

        /**
         * @deprecated use disable
         * @method qui/controls/buttons/Button#setDisable
         * @return {Object} this (qui/controls/buttons/Button)
         */
        setDisable: function() {
            return this.disable();
        },

        /**
         * is Button Disabled?
         *
         * @method qui/controls/buttons/Button#isDisabled
         * @return {Boolean}
         */
        isDisabled: function() {
            if (!this.getElm()) {
                return false;
            }

            return parseInt(this.getElm().get('data-status')) === -1;
        },

        /**
         * If the Button was disabled, you can enable the Button
         *
         * @method qui/controls/buttons/Button#setEnable
         * @return {Object} this (qui/controls/buttons/Button)
         */
        enable: function() {
            if (!this.getElm()) {
                return this;
            }

            this.getElm().set({
                'data-status': 0,
                'disabled': null
            });

            this.fireEvent('enable', [this]);
            this.setNormal();

            return this;
        },

        /**
         * @deprecated
         *
         * @method qui/controls/buttons/Button#setEnable
         * @return {Object} this (qui/controls/buttons/Button)
         */
        setEnable: function() {
            return this.enable();
        },

        /**
         * If the Button was active, you can normalize the Button
         * The Button must be enabled.
         *
         * @method qui/controls/buttons/Button#setNormal
         * @return {Object} this (qui/controls/buttons/Button)
         */
        setNormal: function() {
            if (this.isDisabled()) {
                return this;
            }

            if (!this.getElm()) {
                return this;
            }

            var Elm = this.getElm();

            Elm.set({
                'data-status': 0,
                'disabled': null
            });

            Elm.removeClass('qui-button-active');
            Elm.removeClass('qui-button-over');

            this.fireEvent('normal', [this]);

            return this;
        },

        /**
         * Adds a Children to an Button Menu
         *
         * @method qui/controls/buttons/Button#appendChild
         *
         * @param {Object} Itm - qui/controls/contextmenu/Item | object
         * @return {Object} this (qui/controls/buttons/Button)
         */
        appendChild: function(Itm) {
            if (typeOf(Itm) === 'object') {
                Itm = new ContextMenuItem(Itm);
            }

            this.$items.push(Itm);

            Itm.setAttribute('Button', this);

            if (!this.$Elm) {
                return this;
            }

            var self = this;

            this.getContextMenu(function(Menu) {
                Menu.appendChild(Itm);

                Itm.addEvent('click', function(Itm) {
                    self.fireEvent('change', [self, Itm]);
                });

                if (self.getAttribute('dropDownIcon') && !self.$Drop) {
                    self.$Drop = new Element('div', {
                        'class': 'qui-button-drop icon-chevron-down fa fa-chevron-down'
                    }).inject(self.$Elm);
                }
            });

            return this;
        },

        /**
         * All Context Menu Items
         *
         * @method qui/controls/buttons/Button#getChildren
         * @return {Array}
         */
        getChildren: function() {
            return this.$items;
        },

        /**
         * Clear the Context Menu Items
         *
         * @method qui/controls/buttons/Button#clear
         * @return {Object} this (qui/controls/buttons/Button)
         */
        clear: function() {
            this.getContextMenu(function(Menu) {
                Menu.clearChildren();
            });

            this.$items = [];

            return this;
        },

        /**
         * Create the Context Menu if not exist
         *
         * @method qui/controls/buttons/Button#getContextMenu
         *
         * @param {Function} callback - callback function( {qui/controls/contextmenu/Menu} )
         * @return {Object} this (qui/controls/buttons/Button)
         */
        getContextMenu: function(callback) {
            if (this.$Menu && typeof this.$createContextMenu === 'undefined') {
                callback(this.$Menu);
                return this;
            }

            var self = this;

            if (typeof this.$createContextMenu !== 'undefined') {
                (function() {
                    self.getContextMenu(callback);
                }).delay(10);

                return this;
            }


            this.$createContextMenu = true;

            require(['qui/controls/contextmenu/Menu'], function(Menu) {
                self.$Menu = new Menu({
                    name: self.getAttribute('name') + '-menu',
                    corner: self.getAttribute('menuCorner')
                });

                self.$Menu.setParent(self);
                self.$Menu.inject(document.body);

                self.addEvents({
                    onClick: function(Instance, event) {
                        if (self.isDisabled()) {
                            return;
                        }

                        if (typeof event === 'object') {
                            event.stop();

                            let triggerNode = event.target;

                            if (triggerNode.nodeName !== 'BUTTON') {
                                triggerNode = triggerNode.getParent('button');
                            }

                            if (triggerNode.nodeName !== 'BUTTON') {
                                return;
                            }

                            if (triggerNode !== self.$Elm) {
                                return;
                            }
                        } else {
                            if (typeof Instance.getElm === 'function' && self.$Elm !== Instance.getElm()) {
                                return;
                            }
                        }

                        var pos = self.$Elm.getPosition(),
                            size = self.$Elm.getSize(),
                            mpos = self.getAttribute('menuCorner'),
                            msize = self.$Menu.getElm().getComputedSize();

                        if (mpos.contains('bottom')) {
                            self.$Menu.setPosition(
                                pos.x - 20,
                                pos.y - size.y - msize.totalHeight + 10
                            );
                        } else {
                            self.$Menu.setPosition(
                                pos.x - 20,
                                pos.y + size.y + 10
                            );
                        }

                        self.$Menu.show();
                        self.$Elm.focus();
                    },

                    onBlur: function() {
                        self.$Menu.hide();
                    }
                });

                self.$Menu.setParent(self);

                delete self.$createContextMenu;

                callback(self.$Menu);
            });
        },

        /**
         * Method for changing the DOMNode if attributes are changed
         *
         * @method qui/controls/buttons/Button#onSetAttribute
         *
         * @param {String} k - Attribute name
         * @param {Object|String|Boolean|Number} value - Attribute value
         *
         * @ignore
         */
        onSetAttribute: function(k, value) {
            var Elm = this.getElm();

            //this.options[k] = value;

            if (!Elm) {
                return;
            }

            // onclick overwrite
            if (k === 'onclick') {
                this.removeEvents('click');

                this.addEvent('click', function(p) {
                    eval(p + '(this);');
                }.bind(this, [value]));

                return;
            }

            if (k === 'image') {
                k = 'icon';
            }

            // Image
            if (k === 'icon') {
                if (!Elm.getElement('.image-container')) {
                    new Element('div.image-container', {
                        align: 'center'
                    }).inject(Elm);
                }

                var Image = Elm.getElement('.image-container');

                Image.set('html', '');

                if (Utils.isFontAwesomeClass(value)) {
                    new Element('span', {
                        'class': value
                    }).inject(Image);
                } else {
                    new Element('img.qui-button-image', {
                        src: value,
                        styles: {
                            'display': 'block' // only image, fix
                        }
                    }).inject(Image);
                }

                return;
            }

            // Style Attributes
            if (k === 'styles') {
                Elm.setStyles(value);
                return;
            }

            // Text
            if (k === 'title') {
                Elm.set('title', value);
                return;
            }

            // Text and Text-Image
            if (k !== 'textimage' && k !== 'text') {
                return;
            }

            // Text + Text Image
            if (!Elm.getElement('.qui-button-text')) {
                new Element('span.qui-button-text').inject(Elm);
            }

            var Txt = Elm.getElement('.qui-button-text');

            // Text
            if (k === 'text') {
                Txt.set('html', value);

                if (!Elm.getAttribute('title')) {
                    Elm.set('title', value);
                }
            }

            if (k === 'textimage') {
                var Img;

                if (Elm.getElement('.qui-button-text-image')) {
                    Elm.getElement('.qui-button-text-image').destroy();
                    Elm.addClass('qui-button--no-icon');
                }

                if (Utils.isFontAwesomeClass(value)) {

                    Elm.removeClass('qui-button--no-icon');

                    Img = new Element('span', {
                        'class': 'qui-button-text-image ' + value,
                        styles: {
                            'margin-right': 0
                        }
                    }).inject(Txt, 'before');

                } else {

                    Elm.removeClass('qui-button--no-icon');

                    Img = new Element('img', {
                        'class': 'qui-button-text-image',
                        src: value,
                        styles: {
                            'margin-right': 0
                        }
                    }).inject(Txt, 'before');
                }

                if (this.getAttribute('text')) {
                    Img.setStyle('margin-right', null);
                }
            }
        }
    });
});
