/**
 * Makes an input field to a user selection field
 *
 * @module qui/controls/elements/Select
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onAddItem [ this, id, SelectItem ]
 * @event onRemoveItem [ id, this ]
 * @event onChange [ this ]
 * @event onSearchButtonClick [ this, Button ]
 * @event onCreate [ this ]
 */
define('qui/controls/elements/Select', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/controls/buttons/Button',
    'qui/controls/elements/SelectItem',
    'Ajax',
    'Locale',

    'css!qui/controls/elements/Select.css'

], function (QUI, QUIControl, QUILoader, QUIButton, SelectItem, Ajax, QUILocale) {
    "use strict";

    /**
     * @class qui/controls/elements/Select
     *
     * @param {Object} options
     * @param {HTMLInputElement} [Input]  - (optional), if no input given, one would be created
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: QUIControl,
        Type   : 'qui/controls/elements/Select',

        Binds: [
            'close',
            'fireSearch',
            'update',

            '$calcDropDownPosition',
            '$onItemDestroy',
            '$onInputFocus',
            '$onImport'
        ],

        options: {
            max            : false, // max entries
            multiple       : true,  // select more than one entry?
            searchbutton   : true,
            name           : '',    // string
            styles         : {
                height: 120
            },
            label          : false, // text string or a <label> DOMNode Element
            icon           : 'fa fa-angle-right',
            placeholder    : 'Suche...',
            child          : 'qui/controls/elements/SelectItem', // child type
            showIds        : true, // display the ids in the search result list or not
            asyncSearch    : true,  // search the results asynchronically (if set to false -> just add items without search)
            allowDuplicates: true  // allow items with duplicate values
        },

        initialize: function (options, Input) {
            this.parent(options);

            this.$Input    = Input || null;
            this.$Elm      = null;
            this.$List     = null;
            this.$Search   = null;
            this.$DropDown = null;

            this.$SearchButton = null;

            this.$search = false;
            this.$values = [];

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * Return the DOMNode Element
         *
         * @method qui/controls/elements/Select#create
         * @return {HTMLElement} The main DOM-Node Element
         */
        create: function () {
            if (this.$Elm) {
                return this.$Elm;
            }

            var self = this;

            this.$Elm = new Element('div', {
                'class'     : 'qui-elements-select',
                'data-quiid': this.getId()
            });

            this.Loader = new QUILoader().inject(this.$Elm);

            if (!this.$Input) {
                this.$Input = new Element('input', {
                    name: this.getAttribute('name')
                }).inject(this.$Elm);
            } else {
                this.$Elm.wraps(this.$Input);
            }

            this.$Input.set({
                styles: {
                    display : 'none',
                    opacity : 0,
                    position: 'absolute',
                    zIndex  : 1,
                    left    : 5,
                    top     : 5,
                    cursor  : 'pointer'
                },
                events: {
                    focus: this.$onInputFocus
                }
            });


            this.$List = new Element('div', {
                'class': 'qui-elements-select-list'
            }).inject(this.$Elm);

            this.$Icon = new Element('span', {
                'class': 'qui-elements-select-list-search-loader',
                html   : '<span class="' + this.getAttribute('icon') + '"></span>'
            }).inject(this.$Elm);

            this.$Search = new Element('input', {
                'class'    : 'qui-elements-select-list-search',
                placeholder: this.getAttribute('placeholder'),
                events     : {
                    keyup: function (event) {
                        if (event.key === 'down') {
                            this.down();
                            return;
                        }

                        if (event.key === 'up') {
                            this.up();
                            return;
                        }

                        if (event.key === 'enter') {
                            this.submit();
                            return;
                        }

                        this.fireSearch();
                    }.bind(this),

                    blur : this.close,
                    focus: this.fireSearch
                }
            }).inject(this.$Elm);

            this.$SearchButton = new QUIButton({
                icon  : 'fa fa-list-alt',
                styles: {
                    width: 50
                },
                events: {
                    onClick: function (Btn) {
                        self.fireEvent('onSearchButtonClick', [self, Btn]);
                    }
                }
            }).inject(this.$Elm);


            this.$DropDown = new Element('div', {
                'class': 'qui-elements-list-dropdown',
                styles : {
                    display: 'none',
                    left   : this.$Search.getPosition().x
                }
            }).inject(document.body);

            // settings
            if (this.getAttribute('label')) {
                var Label = this.getAttribute('label');

                if (typeof this.getAttribute('label').nodeName === 'undefined') {
                    Label = new Element('label', {
                        html: this.getAttribute('label')
                    });
                }

                Label.inject(this.$Elm, 'top');

                if (Label.get('data-desc') && Label.get('data-desc') !== '&nbsp;') {
                    new Element('div', {
                        'class': 'description',
                        html   : Label.get('data-desc'),
                        styles : {
                            marginBottom: 10
                        }
                    }).inject(Label, 'after');
                }
            }

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            if (!this.getAttribute('searchbutton')) {
                this.$SearchButton.setStyle('display', 'none');
                this.$Search.style.setProperty('width', '100%', 'important');
            }

            // load values
            if (this.$Input.value || this.$Input.value !== '') {
                var values = this.$Input.value.split(',');

                for (var i = 0, len = values.length; i < len; i++) {
                    this.addItem(values[i]);
                }
            }

            this.fireEvent('create', [this]);

            return this.$Elm;
        },

        /**
         * event: on inject
         */
        $onImport: function () {
            var Elm = this.getElm();

            if (Elm.nodeName === 'INPUT') {
                this.$Input = Elm;
            }

            this.$Elm = null;
            this.create();
            this.refresh();

            if (this.$Input !== this.$Elm) {
                try {
                    this.$Input.fireEvent('load');
                } catch (e) {
                }
            }
        },

        /**
         * Refresh the display
         */
        refresh: function () {
            if (!this.$Elm) {
                return;
            }

            if (!this.getAttribute('max') || parseInt(this.getAttribute('max')) !== 1) {
                this.$Elm.addClass('qui-elements-select-multiple');
                return;
            }

            this.$Elm.setStyle('height', 30);
            this.$Elm.setStyle('minHeight', 30);
            this.$Elm.removeClass('qui-elements-select-multiple');

            this.$List.setStyles({
                height  : 30,
                overflow: 'hidden',
                width   : 'calc(100% - 50px)'
            });

            // max 1 und count entries
            if (this.$values.length === 1) {
                this.$Search.setStyle('display', 'none');
                this.$Icon.setStyle('display', 'none');
                this.$List.setStyle('display', null);
                return;
            }

            this.$Search.setStyle('display', null);
            this.$Icon.setStyle('display', null);
            this.$List.setStyle('display', 'none');
        },

        /**
         * fire the search
         *
         * @method qui/controls/elements/Select#fireSearch
         */
        fireSearch: function () {
            if (!this.getAttribute('asyncSearch')) {
                return;
            }

            if (this.$Search.value === '') {
                return this.close();
            }

            this.cancelSearch();

            this.$calcDropDownPosition();
            this.$Icon.set('html', '<span class="fa fa-spinner fa-spin"></span>');

            this.$DropDown.set({
                styles: {
                    display: '',
                    left   : this.getElm().getPosition().x + 2,
                    width  : this.getElm().getSize().x - 4
                }
            });

            this.$search = this.search.delay(500, this);
        },

        /**
         * cancel the search timeout
         *
         * @method qui/controls/elements/Select#cancelSearch
         */
        cancelSearch: function () {
            if (this.$search) {
                clearTimeout(this.$search);
            }
        },

        /**
         * close the users search
         *
         * @method qui/controls/elements/Select#close
         */
        close: function () {
            this.cancelSearch();

            this.$Icon.set('html', '<span class="' + this.getAttribute('icon') + '"></span>');
            this.$DropDown.setStyle('display', 'none');
            this.$DropDown.set('html', '');
            this.$Search.value = '';
        },

        /**
         * Return the value
         *
         * @returns {String}
         */
        getValue: function () {
            return this.$Input.value;
        },

        /**
         * trigger a users search and open a select item dropdown for selection
         *
         * @method qui/controls/elements/Select#search
         */
        search: function () {
            var value  = this.$Search.value,
                search = this.getAttribute('Search');

            if (!search) {
                search = Promise.resolve([]);
            } else if (typeOf(search) === 'function') {
                search = search(value);
            }

            if (typeof search.then === 'undefined') {
                search = Promise.resolve([]);
            }

            search.then(function (result) {
                var i, len, str, Entry,
                    func_mousedown, func_mouseover,

                    data     = result,
                    icon     = this.getAttribute('icon'),
                    DropDown = this.$DropDown;

                DropDown.set('html', '');

                this.$Icon.set('html', '<span class="' + icon + '"></span>');

                if (!data.length) {
                    new Element('div', {
                        html  : QUILocale.get('quiqqer/system', 'no.results'),
                        styles: {
                            'float': 'left',
                            'clear': 'both',
                            padding: 5,
                            margin : 5
                        }
                    }).inject(DropDown);

                    this.$calcDropDownPosition();
                    return;
                }

                // events
                func_mousedown = function (event) {
                    var Target = event.target;

                    if (!Target.hasClass('qui-elements-list-dropdown-entry')) {
                        Target = Target.getParent('.qui-elements-list-dropdown-entry');
                    }

                    this.addItem(Target.get('data-id'));

                }.bind(this);

                func_mouseover = function () {
                    this.getParent().getElements(
                        '.qui-elements-list-dropdown-entry-hover'
                    ).removeClass(
                        'qui-elements-list-dropdown-entry-hover'
                    );

                    this.addClass('qui-elements-list-dropdown-entry-hover');
                };

                this.$calcDropDownPosition();

                // create
                for (i = 0, len = data.length; i < len; i++) {
                    str = data[i].title;

                    if (value) {
                        str = str.toString().replace(
                            new RegExp('(' + value + ')', 'gi'),
                            '<span class="mark">$1</span>'
                        );
                    }

                    if (this.getAttribute('showIds')) {
                        str = str + ' (' + data[i].id + ')';
                    }

                    Entry = new Element('div', {
                        html     : '<span>' + str + '</span>',
                        'class'  : 'qui-elements-list-dropdown-entry',
                        'data-id': data[i].id,
                        events   : {
                            mousedown : func_mousedown,
                            mouseenter: func_mouseover
                        }
                    }).inject(DropDown);

                    new Element('span', {
                        'class': data[i].icon || this.getAttribute('icon'),
                        styles : {
                            marginRight: 5
                        }
                    }).inject(Entry, 'top');
                }

                this.$calcDropDownPosition();

            }.bind(this));
        },

        /**
         * Add a user to the input
         *
         * @method qui/controls/elements/Select#addUser
         * @param {Number|String} id - id of the user
         *
         * @return {Object} this (qui/controls/elements/Select)
         */
        addItem: function (id) {
            if (id === false || id === '') {
                return this;
            }

            if (!this.getAttribute('allowDuplicates') && this.$values.contains(id)) {
                return this;
            }

            if (this.getAttribute('max') === 1 && this.$values.length) {
                this.$List.set('html', '');
                this.$values = [];
            }

            require([this.getAttribute('child')], function (Child) {
                var NewItem = new Child({
                    id    : id,
                    Parent: this,
                    events: {
                        onDestroy: this.$onItemDestroy
                    }
                }).inject(this.$List);

                this.$values.push(id);

                this.fireEvent('addItem', [this, id, NewItem]);
                this.$refreshValues();
                this.refresh();
            }.bind(this));

            return this;
        },

        /**
         * keyup - users dropdown selection one step up
         *
         * @method qui/controls/elements/Select#up
         * @return {Object} this (qui/controls/elements/Select)
         */
        up: function () {
            if (!this.$DropDown) {
                return this;
            }

            var Active = this.$DropDown.getElement(
                '.qui-elements-list-dropdown-entry-hover'
            );

            // Last Element
            if (!Active) {
                if (this.$DropDown.getLast('.qui-elements-list-dropdown-entry')) {
                    this.$DropDown.getLast('.qui-elements-list-dropdown-entry').addClass(
                        'qui-elements-list-dropdown-entry-hover'
                    );
                }

                return this;
            }

            Active.removeClass(
                'qui-elements-list-dropdown-entry-hover'
            );

            if (!Active.getPrevious()) {
                this.up();
                return this;
            }

            Active.getPrevious().addClass(
                'qui-elements-list-dropdown-entry-hover'
            );
        },

        /**
         * keydown - users dropdown selection one step down
         *
         * @method qui/controls/elements/Select#down
         * @return {Object} this (qui/controls/elements/Select)
         */
        down: function () {
            if (!this.$DropDown) {
                return this;
            }

            var Active = this.$DropDown.getElement(
                '.qui-elements-list-dropdown-entry-hover'
            );

            // First Element
            if (!Active) {
                if (this.$DropDown.getFirst('.qui-elements-list-dropdown-entry')) {
                    this.$DropDown.getFirst('.qui-elements-list-dropdown-entry').addClass(
                        'qui-elements-list-dropdown-entry-hover'
                    );
                }

                return this;
            }

            Active.removeClass(
                'qui-elements-list-dropdown-entry-hover'
            );

            if (!Active.getNext()) {
                this.down();
                return this;
            }

            Active.getNext().addClass(
                'qui-elements-list-dropdown-entry-hover'
            );

            return this;
        },

        /**
         * select the selected user / group
         *
         * @method qui/controls/elements/Select#submit
         */
        submit: function () {
            if (!this.$DropDown) {
                return;
            }

            var Active = this.$DropDown.getElement(
                '.qui-elements-list-dropdown-entry-hover'
            );

            if (Active) {
                this.addItem(Active.get('data-id'));
            }

            this.search();
        },

        /**
         * Set the focus to the input field
         *
         * @method qui/controls/elements/Select#focus
         * @return {Object} this (qui/controls/elements/Select)
         */
        focus: function () {
            if (this.$Search) {
                this.$Search.focus();
            }

            return this;
        },

        /**
         * Removes all children
         *
         * @method qui/controls/elements/Select#clear
         */
        clear: function () {
            this.$values = [];
            this.$List.set('html', '');
            this.$refreshValues();

            this.fireEvent('clear', [this]);
        },

        /**
         * Write the ids to the real input field
         *
         * @method qui/controls/elements/Select#$refreshValues
         */
        $refreshValues: function () {
            this.$Input.value = this.$values.join(',');
            this.$Input.fireEvent('change', [{
                target: this.$Input
            }]);

            this.fireEvent('change', [this]);
        },

        /**
         * event : if a user or a groupd would be destroyed
         *
         * @method qui/controls/elements/Select#$onItemDestroy
         * @param {Object} Item - qui/controls/elements/SelectItem
         */
        $onItemDestroy: function (Item) {
            var itemId   = Item.getAttribute('id');
            this.$values = this.$values.erase(itemId);

            this.$refreshValues();
            this.refresh();

            this.fireEvent('removeItem', [itemId, this]);
        },

        /**
         * event : on input focus, if the real input field get the focus
         *
         * @param {DOMEvent} event
         */
        $onInputFocus: function (event) {
            if (typeof event !== 'undefined') {
                event.stop();
            }

            this.focus();
        },

        /**
         * Calculate the dropdown position
         */
        $calcDropDownPosition: function () {
            var size      = this.$DropDown.getSize();
            var searchPos = this.$Search.getPosition(document.body);

            var top = searchPos.y - size.y;

            // fix for kack :D -> quiqqer/package-tags#40
            if (QUI.getBodySize().y < searchPos.y - size.y) {
                top = QUI.getBodySize().y - size.y;
                this.$calcDropDownPosition.delay(10);
            }

            this.$DropDown.setStyles({
                top: top
            });
        }
    });
});
