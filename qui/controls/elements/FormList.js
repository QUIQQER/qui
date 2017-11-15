/**
 * Generate variable form element list
 * if you need variable html code lists like user data fields, social data fields
 * something like intervals for html form elements
 *
 * @module qui/controls/elements/FormList
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/buttons/Button
 * @require css!qui/controls/elements/FormList.css
 */
define('qui/controls/elements/FormList', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',

    'css!qui/controls/elements/FormList.css'

], function (QUI, QUIControl, QUIButton) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'qui/controls/elements/FormList',

        Binds: [
            '$onInject',
            '$createEntry',
            '$refreshData'
        ],

        options: {
            entry: ''
        },

        initialize: function (options) {
            this.parent(options);

            this.$Buttons   = null;
            this.$Container = null;
            this.$Input     = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * Create the DOMNode Element
         *
         * @return {HTMLElement}
         */
        create: function () {
            this.$Elm = new Element('div', {
                'class': 'qui-controls-formlist',
                html   : '<div class="qui-controls-formlist-buttons"></div>' +
                         '<div class="qui-controls-formlist-container"></div>'
            });

            this.$Container = this.$Elm.getElement('.qui-controls-formlist-container');
            this.$Buttons   = this.$Elm.getElement('.qui-controls-formlist-buttons');

            new QUIButton({
                text     : 'Eintrag hinzufügen', // #locale
                textimage: 'icon-plus fa fa-add',
                events   : {
                    onClick: this.$createEntry
                }
            }).inject(this.$Buttons);


            return this.$Elm;
        },

        /**
         * event : on import
         */
        $onImport: function () {
            this.$Input = this.getElm();

            var nodeName = this.$Input.nodeName;

            if (nodeName == 'INPUT' ||
                nodeName == 'TEXTAREA' ||
                nodeName == 'SELECT') {
                this.$Input.type = 'hidden';
            }

            this.create().wraps(this.$Input);


            // look if some value exist
            var value = this.$Input.value;

            if (value !== '') {
                value = JSON.decode(value);

                if (typeOf(value) !== 'array') {
                    return;
                }

                var i, key, len, Node;

                for (i = 0, len = value.length; i < len; i++) {
                    Node = this.$createEntry();

                    for (key in value[i]) {
                        if (value[i].hasOwnProperty(key)) {
                            Node.getElements('[name="' + key + '"]')
                                .set('value', value[i][key]);
                        }
                    }
                }
            }
        },

        /**
         * Return the data
         *
         * @return {Array}
         */
        getData: function () {
            var c, i, len, clen, elements, elmResult;

            var result  = [],
                entries = this.$Container.getElements('.qui-controls-formlist-entry');

            for (i = 0, len = entries.length; i < len; i++) {
                elements  = entries[i].getElements('input,select,textarea');
                elmResult = {};

                for (c = 0, clen = elements.length; c < clen; c++) {
                    elmResult[elements[c].name] = elements[c].value;
                }

                result.push(elmResult);
            }

            return result;
        },

        /**
         * search the date and set it to the input field
         */
        $refreshData: function () {
            if (this.$Input) {
                this.$Input.value = JSON.encode(this.getData());
            }
        },

        /**
         * create a list entry
         *
         * @return {HTMLElement}
         */
        $createEntry: function () {

            var Child = new Element('div', {
                'class': 'qui-controls-formlist-entry',
                html   : '<div class="qui-controls-formlist-entry-delete"></div>' +
                         '<div class="qui-controls-formlist-entry-data">' +
                         this.getAttribute('entry') +
                         '</div>'
            }).inject(this.$Container);

            new QUIButton({
                icon  : 'icon-trash',
                events: {
                    onClick: function () {
                        Child.destroy();
                        this.$refreshData();
                    }.bind(this)
                }
            }).inject(
                Child.getElement('.qui-controls-formlist-entry-delete')
            );

            Child.getElements('input,select,textarea').addEvents({
                blur  : this.$refreshData,
                change: this.$refreshData
            });

            QUI.parse(Child).then(function() {
                this.$refreshData();
                this.fireEvent('parsed', [this, Child]);
            }.bind(this));

            return Child;
        }
    });
});