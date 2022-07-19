/**
 * @module qui/controls/buttons/ButtonMultiple
 *
 */
define('qui/controls/buttons/ButtonMultiple', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/NoSelect',
    'qui/utils/Controls',
    'qui/controls/contextmenu/Item',

    'css!qui/controls/buttons/ButtonMultiple.css'

], function (QUI, QUIControl, NoSelect, ControlUtils, QUIContextMenuItem) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'qui/controls/buttons/ButtonMultiple',

        Binds: [
            '$onSetAttribute'
        ],

        options: {
            disabled : false,
            textimage: false,   // Image left from text
            text     : false,        // Button text
            title    : false,
            class    : false        // extra CSS Class
        },

        initialize: function (options) {
            this.parent(options);

            this.$Menu = null;
            this.$Text = null;
            this.$TextImage = null;
            this.$DropDownContainer = null;

            this.$items = [];
            this.$disabled = false;

            this.addEvents({
                onSetAttribute: this.$onSetAttribute
            });
        },

        /**
         * Return the DOMNode Element
         *
         * @returns {HTMLDivElement}
         */
        create: function () {
            this.$Elm = new Element('div', {
                'class'     : 'qui-button-multiple',
                'data-quiid': this.getId(),
                html        : '<button></button>' +
                              '<div class="qui-button-multiple-dd">' +
                              '    <div class="qui-button-multiple-dd-line"></div>' +
                              '    <span class="fa fa-angle-down"></span>' +
                              '</div>'
            });

            this.$Elm.style.outline = 0;
            this.$Elm.setAttribute('tabindex', "-1");

            // nodes
            this.$Button = this.$Elm.getElement('button');
            this.$DropDownContainer = this.$Elm.getElement('.qui-button-multiple-dd');

            this.$TextImage = new Element('div', {
                'class': 'qui-button-multiple-textimage'
            }).inject(this.$Button);

            this.$Text = new Element('div', {
                'class': 'qui-button-multiple-text'
            }).inject(this.$Button);

            this.$Button.style.outline = 0;
            this.$Button.setAttribute('tabindex', "-1");

            // data
            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            if (this.getAttribute('title')) {
                this.$Elm.set('title', this.getAttribute('title'));
            }

            if (this.getAttribute('name')) {
                this.$Elm.set('name', this.getAttribute('name'));
            }

            if (this.getAttribute('textimage')) {
                this.setAttribute('textimage', this.getAttribute('textimage'));
            }

            if (this.getAttribute('text')) {
                this.setAttribute('text', this.getAttribute('text'));
            }

            if (this.getAttribute('disabled')) {
                this.disable();
            }

            // menu
            this.$DropDownContainer.addEvent('click', function () {
                this.openMenu();
            }.bind(this));

            if (this.$items.length) {
                this.getMenu().then(function (Menu) {
                    var len = this.$items.length;

                    for (var i = 0; i < len; i++) {
                        Menu.appendChild(this.$items[i]);
                    }
                }.bind(this));
            }

            // events
            this.$Elm.addEvents({
                blur: function () {
                    /*this.getMenu().then(function (Menu) {
                        Menu.hide();
                    }.bind(this));*/
                }.bind(this)
            });

            this.$Button.addEvents({
                click: function (event) {
                    if (this.isDisabled()) {
                        return;
                    }

                    this.click(event);
                }.bind(this)
            });


            this.fireEvent('create', [this]);

            NoSelect.disable(this.$Elm);

            return this.$Elm;
        },

        /**
         * Trigger the Click Event
         *
         * @param {DOMEvent} event
         */
        click: function (event) {
            if (this.isDisabled()) {
                return;
            }

            this.getElm().addClass('qui-button--click');
            this.fireEvent('click', [
                this,
                event
            ]);

            this.getElm().removeClass.delay(300, this.getElm(), 'qui-button--click');
        },


        /**
         * Disable the Button
         * Most Events are no more triggered
         */
        disable: function () {
            if (!this.$Elm) {
                return this;
            }

            this.$disabled = true;
            this.$Elm.addClass('qui-button-multiple-disabled');
            this.$Button.set('disabled', 'disabled');

            this.fireEvent('disable', [this]);
        },

        /**
         * Enable the Button
         */
        enable: function () {
            if (!this.$Elm) {
                return this;
            }

            this.$Elm.removeClass('qui-button-multiple-disabled');
            this.$Button.set('disabled', null);
            this.$disabled = false;

            this.fireEvent('enable', [this]);
        },

        /**
         * Is the button disabled
         *
         * @returns {Boolean}
         */
        isDisabled: function () {
            return this.$disabled;
        },

        /**
         * Adds a Children to an Button Menu
         *
         * @method qui/controls/buttons/Button#appendChild
         *
         * @param {Object} Itm - qui/controls/contextmenu/Item | object
         * @return {Promise}
         */
        appendChild: function (Itm) {
            if (typeOf(Itm) == 'object') {
                Itm = new QUIContextMenuItem(Itm);
            }

            this.$items.push(Itm);

            Itm.setAttribute('Button', this);

            if (!this.$Elm) {
                return Promise.resolve();
            }

            return this.getMenu().then(function (Menu) {
                Menu.appendChild(Itm);
            });
        },

        /**
         * All Context Menu Items
         *
         * @method qui/controls/buttons/Button#getChildren
         * @return {Array}
         */
        getChildren: function () {
            return this.$items;
        },

        /**
         * Clear the Context Menu Items
         *
         * @return {Promise}
         */
        clear: function () {
            this.$items = [];

            return this.getMenu().then(function (Menu) {
                Menu.clearChildren();
            });
        },

        /**
         * Create the Context Menu if not exist
         *
         * @return {Promise}
         */
        getMenu: function () {
            if (this.$Menu) {
                return Promise.resolve(this.$Menu);
            }

            return new Promise((resolve) => {
                require(['qui/controls/contextmenu/Menu'], (Menu) => {
                    this.$Menu = new Menu({
                        name  : this.getAttribute('name') + '-menu',
                        corner: 'top'
                    });

                    this.$Menu.addEvent('blur', () => {
                        this.$Menu.hide();
                    });
                    this.$Menu.inject(document.body);
                    this.$Menu.setParent(this);

                    resolve(this.$Menu);
                });
            });

            //
            //self.addEvents({
            //    onClick: function () {
            //        if (self.isDisabled()) {
            //            return;
            //        }
            //
            //        var pos = self.$Elm.getPosition(),
            //            size = self.$Elm.getSize(),
            //
            //            mpos = self.getAttribute('menuCorner'),
            //            msize = self.$Menu.getElm().getComputedSize();
            //
            //        if (mpos.contains('bottom')) {
            //            self.$Menu.setPosition(
            //                pos.x - 20,
            //                pos.y - size.y - msize.totalHeight + 10
            //            );
            //        } else {
            //            self.$Menu.setPosition(
            //                pos.x - 20,
            //                pos.y + size.y + 10
            //            );
            //        }
            //
            //        self.$Menu.show();
            //        self.$Elm.focus();
            //    },
            //
            //    onBlur: function () {
            //        self.$Menu.hide();
            //    }
            //});

        },

        /**
         * Opens the button menu
         *
         * @return {Promise}
         */
        openMenu: function () {
            if (this.isDisabled()) {
                return Promise.resolve();
            }

            return this.getMenu().then(function (Menu) {
                var pos  = this.$Elm.getPosition(),
                    size = this.$Elm.getSize();

                Menu.setPosition(
                    pos.x - 20,
                    pos.y + size.y + 10
                );

                Menu.show();
                Menu.focus();
            }.bind(this));
        },

        /**
         *
         * @param attribute
         * @param value
         */
        $onSetAttribute: function (attribute, value) {
            if (!this.$Elm) {
                return;
            }

            if (attribute === 'text') {
                this.$Text.set('html', value);
            }

            if (attribute === 'textimage') {
                if (ControlUtils.isFontAwesomeClass(value)) {
                    this.$TextImage.set('html', '<span class="' + value + '"></span>');
                } else {
                    this.$TextImage.set('html', '');

                    new Element('img', {
                        src: value
                    }).inject(this.$TextImage);
                }
            }
        }
    });
});
