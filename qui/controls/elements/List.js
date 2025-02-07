/**
 * QUI list control
 *
 * @module qui/controls/elements/List
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require css!qui/controls/elements/List.css
 *
 * @event onClick [ self, {Object} itemData, {HTMLElement} Item ]
 */

define('qui/controls/elements/List', [

    'qui/QUI',
    'qui/controls/Control',

    'css!qui/controls/elements/List.css'

], function(QUI, QUIControl) {
    'use strict';

    return new Class({

        Extends: QUIControl,
        Type: 'qui/controls/elements/List',

        Binds: [
            '$itemClick'
        ],

        options: {
            styles: false,
            checkboxes: false
        },

        initialize: function(options) {
            this.parent(options);

            this.$items = [];
        },

        /**
         * Return the domnode element
         *
         * @return {HTMLElement}
         */
        create: function() {
            this.$Elm = new Element('div', {
                'class': 'qui-elements-list'
            });

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            this.refresh();

            return this.$Elm;
        },

        /**
         * Refresh the list
         */
        refresh: function() {
            if (!this.$Elm) {
                return;
            }

            this.$Elm.set('html', '');

            var self = this;
            var i, len, icon, item, text, title, Section, CheckboxContainer;

            var itemClick = function(event) {
                var Target = event.target;

                if (!Target.hasClass('qui-elements-list-item')) {
                    Target = Target.getParent('.qui-elements-list-item');
                }

                // if the click is at the checkbox, do nothing
                // if the click is at the node, toggle the checkbox status
                if (event.target.nodeName != 'INPUT' && self.getAttribute('checkboxes')) {
                    var Checkbox = Target.getElement('[type="checkbox"]');
                    Checkbox.checked = !Checkbox.checked; // toggle
                }

                self.$itemClick(Target);
            };

            for (i = 0, len = this.$items.length; i < len; i++) {
                item = this.$items[i];

                icon = '';
                title = '';
                text = '';

                if ('icon' in item) {
                    icon = item.icon;
                }

                if ('title' in item) {
                    title = item.title;
                }

                if ('text' in item) {
                    text = item.text;
                }

                Section = new Element('section', {
                    'class': 'qui-elements-list-item smooth',
                    'html': '<div class="qui-elements-list-item-icon">' +
                        '<span class="' + icon + '"></span>' +
                        '</div>' +
                        '<div class="qui-elements-list-item-text">' +
                        '<header>' +
                        title +
                        '</header>' +
                        '<div class="qui-elements-list-item-description">' +
                        text +
                        '</div>' +
                        '</div>',
                    events: {
                        click: itemClick
                    },
                    'data-id': i
                }).inject(this.$Elm);


                if (this.getAttribute('checkboxes')) {

                    CheckboxContainer = new Element('div', {
                        'class': 'qui-elements-list-item-checkbox',
                        html: '<input type="checkbox" />'
                    }).inject(Section, 'top');

                    Section.getElement('.qui-elements-list-item-text').setStyles({
                        width: 'calc( 100% - 120px )'
                    });
                }
            }
        },

        /**
         * Add an item
         *
         * @param {Object} item - icon, title, text
         */
        addItem: function(item) {
            this.$items.push(item);
            this.refresh();

            return this;
        },

        /**
         * Add an list of items
         *
         * @param {Array} arrList - list of items
         */
        addItems: function(arrList) {
            for (var i = 0, len = arrList.length; i < len; i++) {
                this.$items.push(arrList[i]);
            }

            this.refresh();

            return this;
        },

        /**
         * Return the selected data
         *
         * @returns {Array}
         */
        getSelectedData: function() {
            var result = [];
            var checkedList = this.$Elm.getElements('input:checked');

            var i, len, elmId;

            for (i = 0, len = checkedList.length; i < len; i++) {

                elmId = checkedList[i].getParent('.qui-elements-list-item').get('data-id');

                if (elmId in this.$items) {
                    result.push(this.$items[elmId]);
                }
            }

            return result;
        },

        /**
         * Clear the list
         */
        clear: function() {
            this.$items = [];
            this.$Elm.set('html', '');
        },

        /**
         * event : on item click
         *
         * @param {HTMLElement} Item
         */
        $itemClick: function(Item) {
            var id = Item.get('data-id');

            if (typeof this.$items[id] !== 'undefined') {
                this.fireEvent('click', [this, this.$items[id], Item]);
            }
        }
    });

});