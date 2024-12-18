/**
 * Sitemap Map
 *
 * @module qui/controls/sitemap/Map
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require css!qui/controls/sitemap/Map.css
 */
define('qui/controls/sitemap/Map', [

    'qui/QUI',
    'qui/controls/Control',

    'css!qui/controls/sitemap/Map.css'

], function(QUI, Control) {
    'use strict';

    /**
     * @class qui/controls/sitemap/Map
     * @fires onChildClick
     * @event onAppendChild [{qui/controls/sitemap/Item}]
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type: 'qui/controls/sitemap/Map',

        Binds: [
            '$removeChild'
        ],

        options: {
            multible: false, // multiple selection true or false
            multiple: false // multiple selection true or false
        },

        initialize: function(options) {
            const self = this;

            self.parent(options);

            self.$items = [];
            self.$sels = {};

            if (this.getAttribute('multible')) {
                this.setAttribute('multiple', this.getAttribute('multible'));
            }

            self.addEvent('onAppendChild', function(Parent, Child) {
                Child.addEvents({

                    onClick: function(Item) {
                        self.fireEvent('childClick', [
                            Item,
                            self
                        ]);
                    },

                    onSelect: function(Item, event) {
                        if (self.getAttribute('multiple') === false ||
                            typeof event === 'undefined' ||
                            self.getAttribute('multiple') && !event.control) {
                            self.deselectAllChildren();
                        }

                        self.$addSelected(Item);
                    }
                });

            });

            self.addEvent('onDestroy', function() {
                self.clearChildren();
            });
        },

        /**
         * Create the DOMNode of the Map
         *
         * @method qui/controls/sitemap/Map#create
         * @return {HTMLElement}
         */
        create: function() {
            this.$Elm = new Element('div.qui-sitemap-map', {
                'data-quiid': this.getId(),
                'data-qui': 'qui/controls/sitemap/Map'
            });

            for (let i = 0, len = this.$items.length; i < len; i++) {
                this.$items[i].inject(this.$Elm);
            }

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            return this.$Elm;
        },

        /**
         * Get the first Child if exists
         *
         * @method qui/controls/sitemap/Map#firstChild
         * @return {Object|Boolean} qui/controls/sitemap/Item | false
         */
        firstChild: function() {
            return this.$items[0] || false;
        },

        /**
         * Add a Child
         *
         * @method qui/controls/sitemap/Map#appendChild
         * @param {Object} Itm - qui/controls/sitemap/Item
         * @return {Object} this (qui/controls/sitemap/Map)
         */
        appendChild: function(Itm) {
            Itm.setParent(this);
            Itm.setMap(this);

            Itm.addEvents({
                onDestroy: this.$removeChild
            });

            this.$items.push(Itm);

            if (this.$Elm) {
                Itm.inject(this.$Elm);
            }

            this.fireEvent('appendChild', [
                this,
                Itm
            ]);

            return this;
        },

        /**
         * Clear all children / destroy ist
         *
         * @method qui/controls/sitemap/Map#clearChildren
         * @return {Object} this (qui/controls/sitemap/Map)
         */
        clearChildren: function() {
            for (let i = 0, len = this.$items.length; i < len; i++) {
                this.$clearItem(this.$items[i]);
            }

            this.$items = [];

            return this;
        },

        /**
         * Get all selected Items
         *
         * @method qui/controls/sitemap/Map#getSelectedChildren
         * @return {Array}
         */
        getSelectedChildren: function() {
            let i;
            let result = [];

            for (i in this.$sels) {
                result.push(this.$sels[i]);
            }

            return result;
        },

        /**
         * Get specific children
         *
         * @method qui/controls/sitemap/Map#getChildren
         * @param {String} selector
         * @return {Array} List of children
         */
        getChildren: function(selector) {
            if (!this.$Elm) {
                return [];
            }

            selector = selector || '.qui-sitemap-entry';

            let i, len, quiid, Child;

            let children = this.$Elm.getElements(selector),
                result = [],
                Controls = QUI.Controls;


            if (!children.length) {
                return result;
            }

            for (i = 0, len = children.length; i < len; i++) {
                quiid = children[i].get('data-quiid');
                Child = Controls.getById(quiid);

                if (Child) {
                    result.push(Child);
                }
            }

            return result;
        },

        /**
         * Alias for getChildren
         *
         * @method qui/controls/sitemap/Map#getChildren
         * @see #getChildren
         */
        getElements: function(selector) {
            return this.getChildren(selector);
        },

        /**
         * Get specific children by value
         *
         * @method qui/controls/sitemap/Map#getChildren
         * @param {String|Number} value
         * @return {Array}
         */
        getChildrenByValue: function(value) {
            return this.getChildren('[data-value="' + value + '"]');
        },

        /**
         * Deselected all selected Items
         *
         * @method qui/controls/sitemap/Map#deselectAllChildren
         * @return {Object} this (qui/controls/sitemap/Map)
         */
        deselectAllChildren: function() {
            for (let i in this.$sels) {
                if (this.$sels.hasOwnProperty(i)) {
                    this.$sels[i].deselect();
                }
            }

            this.$sels = {};

            return this;
        },

        /**
         * Execute a {qui/controls/sitemap/Item} contextMenu
         *
         * @method qui/controls/sitemap/Map#childContextMenu
         * @fires onChildContextMenu {qui/controls/sitemap/Item}
         * @param {Object} Itm - qui/controls/sitemap/Item
         * @param {DOMEvent} event
         * @return {Object} this (qui/controls/sitemap/Map)
         */
        childContextMenu: function(Itm, event) {
            if (typeof Itm === 'undefined') {
                return this;
            }

            this.fireEvent('childContextMenu', [
                this,
                Itm,
                event
            ]);

            return this;
        },

        /**
         * Opens all children and children children
         *
         * @method qui/controls/sitemap/Map#openAll
         * @return {Object} this (qui/controls/sitemap/Map)
         */
        openAll: function() {
            for (let i = 0, len = this.$items.length; i < len; i++) {
                this.$openItem(this.$items[i]);
            }

            return this;
        },

        /**
         * Clear a child item
         *
         * @method qui/controls/sitemap/Map#$clearItem
         * @param {Object} Item - qui/controls/sitemap/Item
         * @return {Object} this (qui/controls/sitemap/Map)
         */
        $clearItem: function(Item) {
            if (Item.hasChildren() === false) {
                Item.destroy();
                return this;
            }

            let i, len;
            let children = Item.getChildren();

            for (i = 0, len = children.length; i < len; i++) {
                this.$clearItem(children[i]);
            }

            Item.clearChildren();
            Item.destroy();

            return this;
        },

        /**
         * Opens a child item
         *
         * @method qui/controls/sitemap/Map#$openItem
         * @param {Object} Item - qui/controls/sitemap/Item
         * @return {Object} this (qui/controls/sitemap/Map)
         */
        $openItem: function(Item) {
            Item.open();

            if (Item.hasChildren() === false) {
                return this;
            }

            let i, len;
            let children = Item.getChildren();

            for (i = 0, len = children.length; i < len; i++) {
                if (children[i].hasChildren()) {
                    this.$openItem(children[i]);
                }
            }

            return this;
        },

        /**
         * Remove the child from the list
         *
         * @method qui/controls/sitemap/Item#countChildren
         * @param {Object} Child - qui/controls/sitemap/Item
         * @return {Object} this (qui/controls/sitemap/Map)
         */
        $removeChild: function(Child) {
            let items = [];

            for (let i = 0, len = this.$items.length; i < len; i++) {
                if (this.$items[i].getId() !== Child.getId()) {
                    items.push(this.$items[i]);
                }
            }

            this.$items = items;

            return this;
        },

        /**
         * Adds an selected Item to the sels list
         *
         * @method qui/controls/sitemap/Map#$addSelected
         * @param {Object} Item - qui/controls/sitemap/Item
         * @return {Object} this (qui/controls/sitemap/Map)
         * @ignore
         */
        $addSelected: function(Item) {
            this.$sels[Item.getId()] = Item;

            return this;
        },

        /**
         * Remove an selected Item from the sels list
         *
         * @method qui/controls/sitemap/Map#$removeSelected
         * @param {Object} Item - qui/controls/sitemap/Item
         * @return {Object} this (qui/controls/sitemap/Map)
         * @ignore
         */
        $removeSelected: function(Item) {
            if (this.$sels[Item.getId()]) {
                this.$sels[Item.getId()].deselect();
                delete this.$sels[Item.getId()];
            }

            return this;
        },

        /**
         * Sitemap filter, the user can search for certain items
         *
         * @method qui/controls/sitemap/Map#search
         * @param {String} search
         * @return {Array} List of found elements
         */
        search: function(search) {
            search = search || '';

            let i, len, qid, Item, Node;

            let list = this.$Elm.getElements('.qui-sitemap-entry-text'),
                result = [],
                Controls = QUI.Controls,
                regex = new RegExp(search, 'gi');

            for (i = 0, len = list.length; i < len; i++) {
                Node = list[i];

                if (Node.get('text').match(regex)) {
                    qid = Node.getParent('.qui-sitemap-entry').get('data-quiid');

                    Item = Controls.getById(qid);

                    if (Item) {
                        result.push(Item);
                    }
                }
            }

            return result;
        }
    });
});
