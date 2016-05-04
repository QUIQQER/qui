/**
 * QUI Control - Select Box DropDown
 *
 * @module qui/controls/buttons/Select
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require qui/utils/Controls
 * @require qui/controls/contextmenu/Menu
 * @require qui/controls/contextmenu/Item
 * @require qui/utils/Element
 * @require css!qui/controls/buttons/Select.css
 *
 * @event onChange [value, this]
 * @event onClick [this, event]
 */
define('qui/controls/buttons/Select', [

    'qui/controls/Control',
    'qui/utils/Controls',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/utils/Elements',

    'css!qui/controls/buttons/Select.css'

], function (Control, Utils, QUIMenu, QUIMenuItem, QUIElementUtils) {
    "use strict";

    document.id(document.body).set('tabindex', -1);

    /**
     * @class qui/controls/buttons/Select
     *
     * @param {Object} options
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type   : 'qui/controls/buttons/Select',

        Binds: [
            'open',
            'set',
            '$set',
            '$onDestroy',
            '$onBlur',
            '$onKeyUp',
            '$disableScroll',
            '$enableScroll',
            '$showSearch',
            '$hideSearch'
        ],

        options: {
            name                 : 'select-box',
            'style'              : {},      // mootools css style attributes
            'class'              : false,   // extra CSS Class
            menuWidth            : 200,
            menuMaxHeight        : 300,
            showIcons            : true,
            searchable           : false,
            placeholderText      : false,
            placeholderIcon      : false,
            placeholderSelectable: true // placeholder is standard selectable menu child
        },

        params: {},

        initialize: function (options) {
            this.parent(options);

            this.$Menu = new QUIMenu({
                width    : this.getAttribute('menuWidth'),
                maxHeight: this.getAttribute('menuMaxHeight'),
                showIcons: this.getAttribute('showIcons'),
                events   : {
                    onHide: function () {
                        this.$opened = false;
                    }.bind(this)
                }
            });

            this.$value    = null;
            this.$disabled = false;
            this.$opened   = false;

            this.$Elm    = null;
            this.$Select = null;
            this.$Text   = null;
            this.$Icon   = null;
            this.$Search = null;

            this.$children = [];

            this.$placeholderText = this.getAttribute('placeholderText');
            this.$placeholderIcon = this.getAttribute('placeholderIcon');

            this.addEvent('onDestroy', this.$onDestroy);
        },

        /**
         * Create the DOMNode Element
         *
         * @method qui/controls/buttons/Select#create
         * @return {HTMLElement}
         */
        create: function () {
            var self = this;

            this.$Elm = new Element('div.qui-select', {
                html    : '<div class="icon"></div>' +
                          '<div class="text"></div>' +
                          '<div class="drop-icon"></div>' +
                          '<div class="qui-select-click-event"></div>' +
                          '<select></select>',
                tabindex: -1,
                styles  : {
                    outline: 0,
                    cursor : 'pointer'
                },

                'data-quiid': this.getId()
            });

            var EventClick = this.$Elm.getElement('.qui-select-click-event');

            EventClick.setStyles({
                left    : 0,
                height  : '100%',
                position: 'absolute',
                top     : 0,
                width   : '100%',
                zIndex  : 2
            });

            // es lebe die touch geräte \(^^)/
            EventClick.addEvents({
                click     : function (event) {
                    if (!!('ontouchstart' in window)) {
                        event.stop();
                    }

                    event.stop();
                    self.$Elm.focus();
                },
                touchstart: function (event) {
                    if (!!('ontouchstart' in window)) {
                        event.stop();
                    }

                    self.$Elm.focus();
                }
            });

            this.$Text = this.$Elm.getElement('.text');
            this.$Icon = this.$Elm.getElement('.icon');

            if (this.getAttribute('showIcons') === false) {
                this.$Elm.addClass('qui-select-no-icons');
            }

            this.$Select = this.$Elm.getElement('select');

            this.$Select.setStyles({
                height  : 30,
                left    : 0,
                opacity : 0,
                position: 'absolute',
                top     : 0,
                zIndex  : 1,
                width   : 'auto'
            });

            this.$Select.addEvents({
                change: function () {
                    self.setValue(this.value);
                }
            });

            // ie8 / 9 fix
            this.$Elm.getElements('div').addEvents({
                click: function () {
                    self.$Elm.focus();
                }
            });

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            if (this.getAttribute('class')) {
                this.$Elm.addClass(this.getAttribute('class'));
            }

            this.$Elm.addEvents({
                focus: this.open,
                click: this.open,
                blur : this.$onBlur,
                keyup: this.$onKeyUp
            });

            this.$placeholderText = this.getAttribute('placeholderText');
            this.$placeholderIcon = this.getAttribute('placeholderIcon');

            this.$Menu.inject(document.body);
            this.$Menu.hide();

            this.$Menu.getElm().addClass('qui-dropdown');

            this.$Menu.getElm().addEvent('mouseleave', function () {
                var Option = self.$Menu.getChildren(
                    self.getAttribute('name') + self.getValue()
                );

                if (Option) {
                    Option.setActive();
                }
            });

            if (this.getAttribute('placeholderSelectable')) {
                if (this.$placeholderText && this.$placeholderText !== '') {
                    this.appendChild(
                        this.$placeholderText,
                        '',
                        this.$placeholderIcon || false
                    );
                }
            }

            this.selectPlaceholder();

            if (this.$children.length) {

                for (var i = 0, len = this.$children.length; i < len; i++) {
                    this.appendChild(
                        this.$children[i].text,
                        this.$children[i].value,
                        this.$children[i].icon
                    );
                }
            }

            return this.$Elm;
        },

        /**
         * Set the value and select the option
         *
         * @method qui/controls/buttons/Select#setValue
         * @param {String} value
         * @return {Object} this (qui/controls/buttons/Select)
         */
        setValue: function (value) {

            var i, len, childvalue;
            var children = this.$Menu.getChildren();

            for (i = 0, len = children.length; i < len; i++) {
                if (children[i].getAttribute('value') == value) {
                    this.$set(children[i]);
                    return this;
                }
            }

            if (typeOf(value) === 'boolean') {
                value = value.toString();

                for (i = 0, len = children.length; i < len; i++) {
                    if (children[i].getAttribute('value') == value) {
                        this.$set(children[i]);
                        return this;
                    }
                }
            }

            if (typeOf(value) === 'string') {
                childvalue = children[i].getAttribute('value');

                if (typeOf(childvalue) === 'boolean') {
                    childvalue = childvalue.toString();
                }

                for (i = 0, len = children.length; i < len; i++) {
                    if (childvalue == value) {
                        this.$set(children[i]);
                        return this;
                    }
                }
            }

            this.selectPlaceholder();

            return this;
        },

        /**
         * Sets placeholder as current value
         *
         * @returns {void}
         */
        selectPlaceholder: function () {
            if (!this.$Text) {
                return;
            }

            if (!this.$placeholderText || this.$placeholderText === '') {
                return;
            }

            this.$Text.set('html', this.$placeholderText);

            var Icon = this.$Elm.getElement('.icon');

            if (this.$placeholderIcon && this.$placeholderIcon !== '') {

                Icon.className = '';
                Icon.addClass('icon');
                Icon.setStyle('background', null);

                if (Utils.isFontAwesomeClass(this.$placeholderIcon)) {
                    Icon.addClass(this.$placeholderIcon);

                } else {
                    Icon.setStyle(
                        'background',
                        'url("' + this.$placeholderIcon + '") center center no-repeat'
                    );
                }

            } else if (Icon) {
                Icon.className = '';
                Icon.addClass('icon');
                Icon.setStyle('background', null);
            }
        },

        /**
         * Reset the value
         */
        resetValue: function () {
            this.$value = '';
            this.setValue('');
        },

        /**
         * Return the current value of the select box
         *
         * @method qui/controls/buttons/Select#getValue
         * @return {String|Boolean}
         */
        getValue: function () {
            return this.$value;
        },

        /**
         * Set the placeholder text / image
         * @param {String} text - Text
         * @param {String} icon - Image : eq. "fa fa-home"
         */
        setPlaceholder: function (text, icon) {
            this.$placeholderText = text;
            this.$placeholderIcon = icon;
        },

        /**
         * Add a option to the select box
         *
         * @method qui/controls/buttons/Select#appendChild
         *
         * @param {String} text - Text of the child
         * @param {String} value - Value of the child
         * @param {String} [icon] - optional
         * @return {Object} this (qui/controls/buttons/Select)
         */
        appendChild: function (text, value, icon) {

            if (!this.$Elm) {
                this.$children.push({
                    text : text,
                    value: value,
                    icon : icon
                });

                return this;
            }

            this.$Menu.appendChild(
                new QUIMenuItem({
                    name  : this.getAttribute('name') + value,
                    text  : text,
                    value : value,
                    icon  : icon || false,
                    events: {
                        onMouseDown: this.$set
                    }
                })
            );

            if (typeOf(value) === 'boolean') {
                value = value.toString();
            }

            new Element('option', {
                html : text,
                value: value
            }).inject(this.$Select);

            return this;
        },

        /**
         * Return the first option child
         *
         * @method qui/controls/buttons/Select#firstChild
         * @return {Object|Boolean} qui/controls/contextmenu/Item | false
         */
        firstChild: function () {
            if (!this.$Menu) {
                return false;
            }

            return this.$Menu.firstChild();
        },

        /**
         * Remove all children
         *
         * @method qui/controls/buttons/Select#clear
         */
        clear: function () {

            this.$Menu.clearChildren();
            this.$Select.set('html', '');

            if (this.$Text) {
                this.$Text.set('html', '');
            }

            if (this.$Icon) {
                this.$Icon.setStyle('background', null);
            }

            // re-append placeholder item
            if (this.getAttribute('placeholderSelectable')) {
                if (this.$placeholderText && this.$placeholderText !== '') {
                    this.appendChild(
                        this.$placeholderText,
                        '',
                        this.$placeholderIcon || false
                    );
                }
            }

            this.resetValue();
        },

        /**
         * Opens the select box
         *
         * @method qui/controls/buttons/Select#open
         * @return {Object} this (qui/controls/buttons/Select)
         */
        open: function () {
            if (this.isDisabled()) {
                return this;
            }

            if (this.$opened) {
                return this;
            }

            if (document.activeElement != this.getElm()) {
                // because onclick and mouseup events makes a focus at the body
                (function () {
                    this.getElm().focus();
                }).delay(100, this);

                return this;
            }

            this.$opened = true;

            var Elm     = this.getElm(),
                MenuElm = this.$Menu.getElm(),
                pos     = Elm.getPosition(document.body),
                size    = Elm.getSize();

            // is mobile?
            if (!!('ontouchstart' in window)) {
                QUIElementUtils.simulateEvent(this.$Select, 'mousedown');
                return this;
            }


            Elm.addClass('qui-select-open');

            this.$Menu.setAttribute(
                'maxHeight',
                this.getAttribute('menuMaxHeight')
            );

            var x = pos.x - 20,
                y = pos.y + size.y;

            this.$Menu.setAttribute('width', size.x);
            this.$Menu.show();

            MenuElm.setStyle('top', y);
            MenuElm.setStyle('left', x);
            MenuElm.setStyle('width', size.x + 20);
            MenuElm.setStyle('zIndex', QUIElementUtils.getComputedZIndex(this.getElm()) + 1);
            MenuElm.addClass('qui-select-container');

            MenuElm.addEvent('mouseenter', this.$disableScroll);
            MenuElm.addEvent('mouseleave', this.$enableScroll);

            if (this.getAttribute('searchable')) {
                document.body.addEvent('keydown', this.$showSearch);
            }

            var Option = this.$Menu.getChildren(
                this.getAttribute('name') + this.getValue()
            );

            if (Option) {
                Option.setActive();
            }

            return this;
        },

        /**
         * hide the dropdown menu
         *
         * @method qui/controls/buttons/Select#close
         */
        close: function () {

            if (this.$opened === false) {
                return this;
            }

            this.$opened = false;
            this.$onBlur();
        },

        /**
         * Disable the select
         *
         * @method qui/controls/buttons/Select#disable
         * @return {Object} this (qui/controls/buttons/Select)
         */
        disable: function () {
            this.$disabled = true;
            this.getElm().addClass('qui-select-disable');
            this.$Menu.hide();
        },

        /**
         * Is the select disabled?
         *
         * @method qui/controls/buttons/Select#isDisabled
         */
        isDisabled: function () {
            return this.$disabled;
        },

        /**
         * Enable the select
         *
         * @method qui/controls/buttons/Select#enable
         * @return {Object} this (qui/controls/buttons/Select)
         */
        enable: function () {
            this.$disabled = false;
            this.getElm().removeClass('qui-select-disable');
        },

        /**
         * internal click, mousedown event of the context menu item
         * set the value to the select box
         *
         * @method qui/controls/buttons/Select#$set
         * @param {Object} Item - qui/controls/contextmenu/Item
         */
        $set: function (Item) {
            this.$value = Item.getAttribute('value');

            if (this.$Text) {
                this.$Text.set('html', Item.getAttribute('text'));
            }

            if (Item.getAttribute('icon') && this.$Icon) {
                var value = Item.getAttribute('icon');

                this.$Icon.className = '';
                this.$Icon.addClass('icon');
                this.$Icon.setStyle('background', null);

                if (Utils.isFontAwesomeClass(value)) {
                    this.$Icon.addClass(value);
                } else {
                    this.$Icon.setStyle(
                        'background',
                        'url("' + value + '") center center no-repeat'
                    );
                }
            }

            this.$hideSearch();
            this.$onBlur();

            this.fireEvent('change', [this.$value, this]);
        },

        /**
         * event : on control destroy
         *
         * @method qui/controls/buttons/Select#$onDestroy
         */
        $onDestroy: function () {
            this.$Menu.destroy();
        },

        /**
         * event : on menu blur
         *
         * @method qui/controls/buttons/Select#$onBlur
         */
        $onBlur: function () {

            // we need a delay, becaus between the blur and the focus, the activeElement is body
            (function () {
                if (document.activeElement == this.$Search) {
                    return;
                }

                if (document.activeElement == this.getElm()) {
                    return;
                }

                // ie11 focus fix
                if (document.activeElement == this.$Menu.getElm() ||
                    document.activeElement == this.$Menu.$Container) {
                    this.focus();
                    return;
                }

                this.$Menu.removeEvent('mouseenter', this.$disableScroll);
                this.$Menu.removeEvent('mouseleave', this.$enableScroll);

                document.body.removeEvent('keydown', this.$showSearch);

                this.$Menu.hide();

                this.getElm().removeClass('qui-select-open');
            }).delay(100, this);
        },

        /**
         * event : on key up
         * if the element has the focus
         *
         * @method qui/controls/buttons/Select#$onKeyUp
         * @param {HTMLElement} event
         */
        $onKeyUp: function (event) {
            if (typeof event === 'undefined') {
                return;
            }

            if (event.key !== 'down' &&
                event.key !== 'up' &&
                event.key !== 'enter') {
                return;
            }

            this.$Menu.show();

            if (event.key === 'down') {
                this.$Menu.down();
                return;
            }

            if (event.key === 'up') {
                this.$Menu.up();
                return;
            }

            if (event.key === 'enter') {
                this.$Menu.select();
            }
        },

        /**
         * Disable the scrolling to the window
         */
        $disableScroll: function () {
            var x = window.scrollX || window.pageXOffset;
            var y = window.scrollY || window.pageYOffset;

            this.$windowScroll = function () {
                window.scrollTo(x, y);
            };

            //this.$windowMouseWheel = function (event) {
            //    event.stop();
            //
            //    console.warn(event.event.deltaY);
            //    console.warn(event.deltaY);
            //
            //    this.$Menu;
            //}.bind(this);

            //window.addEvent('mousewheel', this.$windowMouseWheel);
            window.addEvent('scroll', this.$windowScroll);
        },

        /**
         * Enable the scrolling to the window
         */
        $enableScroll: function () {
            if (typeof this.$windowScroll !== 'undefined') {
                window.removeEvent('scroll', this.$windowScroll);
            }

            //if (typeof this.$windowMouseWheel !== 'undefined') {
            //    window.removeEvent('mousewheel', this.$windowMouseWheel);
            //}
        },

        /**
         * DropDown Search
         */

        /**
         * Show the search
         */
        $showSearch: function (event) {
            if (this.$Search) {
                return;
            }

            var self     = this,
                children = this.$Menu.getChildren(),
                value    = event.key;

            var found = children.filter(function (Child) {
                return Child.getAttribute('text').toString().substr(0, 1) == value;
            });

            if (!found.length) {
                return;
            }

            this.$Search = new Element('input', {
                'class': 'qui-select-search',
                events : {
                    blur : this.$hideSearch,
                    keyup: function (event) {
                        var value    = this.value,
                            Menu     = self.$Menu,
                            children = Menu.getChildren();

                        children.each(function (Child) {
                            var text = Child.getAttribute('text');

                            if (!text.toString().match(value)) {
                                Child.hide();
                            } else {
                                Child.show();
                            }
                        });

                        self.$Menu.show();
                    }
                }
            }).inject(this.getElm());

            this.$Search.focus();
        },

        /**
         * hide the search
         */
        $hideSearch: function () {
            if (!this.$Search) {
                return;
            }

            this.$Search.destroy();
            this.$Search = null;

            this.$Menu.getChildren().each(function (Child) {
                Child.show();
            });

            this.$onBlur();
        }
    });
});
