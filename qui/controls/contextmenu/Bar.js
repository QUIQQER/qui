/**
 * Menu bar
 *
 * @module qui/controls/contextmenu/Bar
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onChildClick
 */

define('qui/controls/contextmenu/Bar', [

    'qui/controls/Control',
    'qui/controls/contextmenu/BarItem',

    'css!qui/controls/contextmenu/Bar.css'

], function(Control, ContextBarItem) {
    'use strict';

    /**
     * @class qui/controls/contextmenu/Bar
     * @param {Object} options
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type: 'qui/controls/contextmenu/Bar',

        Binds: [
            '$onItemEnter',
            '$onItemLeave',
            '$onItemClick',
            '$onItemBlur'
        ],

        options: {
            styles: null,     // mootools css styles
            width: 200,      // menü width
            openening: false,    // if open status = true, onmouseover opens the baritmes
            dragable: false,

            menuMaxHeight: false,
            menuStyles: null,
            menuContainerStyles: null
        },

        initialize: function(options) {
            this.parent(options);

            this.$items = [];
            this.$Elm = null;
            this.$Menu = null;
        },

        /**
         * Create the DOMNode Element
         *
         * @method qui/controls/contextmenu/Bar#create
         * @return {HTMLElement|Element}
         */
        create: function() {
            this.$Elm = new Element('div', {
                'class': 'qui-contextmenu-bar'
            });

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            return this.$Elm;
        },

        /**
         * Import children from a php callback
         *
         * @method qui/controls/contextmenu/Bar#insert
         * @param {Array} list - new QUI\Controls\Contextmenu\Bar()->toArray()
         * @return {Object} this (qui/controls/contextmenu/Bar)
         */
        insert: function(list) {
            for (var i = 0, len = list.length; i < len; i++) {
                if (this.getAttribute('dragable')) {
                    list[i].dragable = true;
                }

                if (this.getAttribute('menuMaxHeight')) {
                    list[i].menuMaxHeight = this.getAttribute('menuMaxHeight');
                }

                if (this.getAttribute('menuStyles')) {
                    list[i].menuStyles = this.getAttribute('menuStyles');
                }

                if (this.getAttribute('menuContainerStyles')) {
                    list[i].menuContainerStyles = this.getAttribute('menuContainerStyles');
                }

                this.appendChild(
                    new ContextBarItem(list[i])
                );
            }

            return this;
        },

        /**
         * Get an Child Element
         *
         * @method qui/controls/contextmenu/Bar#getChildren
         * @param {String} name - [Name of the Children, optional, if no name given, returns all Children]
         * @return {Array|Boolean|Object} List of children | false | qui/controls/contextmenu/Item
         */
        getChildren: function(name) {
            if (typeof name !== 'undefined') {
                var i, len;
                var items = this.$items;

                for (i = 0, len = items.length; i < len; i++) {
                    if (items[i].getAttribute('name') === name) {
                        return items[i];
                    }
                }

                return false;
            }

            return this.$items;
        },

        /**
         * Return the first child Element
         *
         * @method qui/controls/contextmenu/Bar#firstChild
         * @return {Object|Boolean} qui/controls/contextmenu/Item | false
         */
        firstChild: function() {
            if (this.$items[0]) {
                return this.$items[0];
            }

            return false;
        },

        /**
         * Return the number of children
         *
         * @method qui/controls/contextmenu/Bar#count
         * @return {Number}
         */
        count: function() {
            return this.$items.length;
        },

        /**
         * Add the Child to the Menü
         *
         * @method qui/controls/contextmenu/Bar#appendChild
         * @param {Object} Child - qui/controls/contextmenu/BarItem
         * @return {Object} this (qui/controls/contextmenu/Bar)
         */
        appendChild: function(Child) {
            if (!Child || typeof Child === 'undefined') {
                return this;
            }

            if (this.getAttribute('dragable')) {
                Child.setAttribute('dragable', true);
            }

            if (this.getAttribute('menuMaxHeight')) {
                Child.setAttribute('menuMaxHeight', this.getAttribute('menuMaxHeight'));
            }

            if (this.getAttribute('menuStyles')) {
                Child.setAttribute('menuStyles', this.getAttribute('menuStyles'));
            }

            if (this.getAttribute('menuContainerStyles')) {
                Child.setAttribute('menuContainerStyles', this.getAttribute('menuContainerStyles'));
            }

            this.$items.push(Child);

            Child.addEvents({
                onMouseEnter: this.$onItemEnter,
                onMouseLeave: this.$onItemLeave,
                onBlur: this.$onItemBlur,
                onClick: this.$onItemClick
            });

            if (this.$Elm) {
                Child.inject(this.$Elm);
            }

            Child.setParent(this);

            return this;
        },

        /**
         * Destroy all children items
         *
         * @method qui/controls/contextmenu/Bar#clearChildren
         * @return {Object} this (qui/controls/contextmenu/Bar)
         */
        clearChildren: function() {
            for (var i = 0, len = this.$items.length; i < len; i++) {
                if (this.$items[i]) {
                    this.$items[i].destroy();
                }
            }

            this.$items = [];

            return this;
        },

        /**
         * Return the next children / item of the item
         *
         * @method qui/controls/contextmenu/Bar#getNext
         * @param {Object} Item - qui/controls/contextmenu/Item
         * @return {Object|Boolean} qui/controls/contextmenu/Item | false
         */
        getNext: function(Item) {
            for (var i = 0, len = this.$items.length; i < len; i++) {
                if (this.$items[i] != Item) {
                    continue;
                }

                if (typeof this.$items[i + 1] !== 'undefined') {
                    return this.$items[i + 1];
                }
            }

            return false;
        },

        /**
         * Return the previous children / item of the item
         *
         * @method qui/controls/contextmenu/Bar#getPrevious
         * @param {Object} Item - qui/controls/contextmenu/BarItem
         * @return {Object|Boolean} - qui/controls/contextmenu/BarItem | false
         */
        getPrevious: function(Item) {
            var i = this.$items.length - 1;

            for (; i >= 0; i--) {
                if (i === 0) {
                    return false;
                }

                if (this.$items[i] == Item) {
                    return this.$items[i - 1];
                }
            }

            return false;
        },

        /**
         * event: on item enter
         *
         * @method qui/controls/contextmenu/Bar#$onItemEnter
         * @param {Object} Item - qui/controls/contextmenu/BarItem
         */
        $onItemEnter: function(Item) {
            if (this.getAttribute('openening') === false) {
                return;
            }

            if (this.$Active == Item) {
                return;
            }

            if (this.$Active) {
                this.$Active.blur();
            }

            if (typeof this.$delay !== 'undefined' && this.$delay) {
                clearTimeout(this.$delay);
            }

            Item.focus();
            this.$Active = Item;
        },

        /**
         * event: on item enter
         *
         * @method qui/controls/contextmenu/Bar#$onItemLeave
         */
        $onItemLeave: function() {

        },

        /**
         * event: on item enter
         *
         * @method qui/controls/contextmenu/Bar#$onItemClick
         */
        $onItemClick: function() {
            this.setAttribute('openening', true);
        },

        /**
         * event: on item blur
         *
         * @method qui/controls/contextmenu/Bar#$onItemBlur
         */
        $onItemBlur: function() {
            this.$Active = null;

            this.$delay = function() {
                if (!this.$Active) {
                    this.setAttribute('openening', false);
                }
            }.delay(200, this);
        }
    });
});