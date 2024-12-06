/**
 * Context Menu Item
 *
 * @module qui/controls/contextmenu/Item
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onAppend [ {self}, {qui/controls/contextmenu/Item} ]
 * @event onActive [ {self} ]
 * @event onNormal [ {self} ]
 * @event onClick [ {self} ]
 * @event onChange [ {self} ]
 * @event onMouseDown [ {self}, {DOMEvent} ]
 * @event onMouseUp[ {self}, {DOMEvent} ]
 */
define('qui/controls/contextmenu/Item', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/classes/utils/DragDrop',
    'qui/controls/contextmenu/Menu',
    'qui/utils/Controls',

    'css!qui/controls/contextmenu/Item.css'

], function(QUI, Control, DragDrop, ContextMenu, Utils) {
    'use strict';

    /**
     * @class qui/controls/contextmenu/Item
     *
     * @event onClick [this, event]
     * @event onMouseDown [this, event]
     * @event onMouseUp [this, event]
     * @event onActive [this]
     * @event onNormal [this]
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type: 'qui/controls/contextmenu/Item',

        Binds: [
            '$onSetAttribute',
            '$stringEvent',
            '$onClick',
            '$onInject',

            '$onMouseEnter',
            '$onMouseLeave',
            '$onMouseUp',
            '$onMouseDown'
        ],

        options: {
            text: '',
            icon: '',
            styles: null,
            showIcon: true,
            dragable: false, // parent class .qui-contextitem-dropable
            checkable: false  // icon is a checkbox
        },

        initialize: function(options) {
            options = options || {};

            var self = this,
                items = options.items || [];

            delete options.items;

            this.parent(options);

            this.$items = [];
            this.$path = '';
            this.$disabled = false;

            this.$Elm = null;
            this.$Container = null;
            this.$Menu = null;
            this.$Text = null;
            this.$Icon = null;
            this.$Checkbox = null;

            this.$__childOpend = false;

            if (typeof options.disabled !== 'undefined' && options.disabled) {
                this.$disabled = true;
            }

            this.addEvent('onSetAttribute', this.$onSetAttribute);
            this.addEvent('onInject', this.$onInject);

            if (items.length) {
                this.insert(items);
            }

            // string onClick
            if (this.getAttribute('onClick')) {
                this.addEvent('onClick', function(event) {
                    var func = self.getAttribute('onClick');

                    try {
                        if (typeof func === 'function') {
                            func(self, event);
                        } else {
                            eval(self.getAttribute('onClick') + '(self, event)');
                        }

                    } catch (e) {
                        console.error(e);
                    }
                });
            }
        },

        /**
         * Create the DOMNode for the Element
         *
         * @method qui/controls/contextmenu/Item#create
         * @return {HTMLElement}
         */
        create: function() {
            var i, len;
            var self = this;

            this.$Elm = new Element('div.qui-contextitem', {
                html: '<div class="qui-contextitem-container">' +
                    '<span class="qui-contextitem-icon"></span>' +
                    '<span class="qui-contextitem-text"></span>' +
                    '</div>',

                'data-quiid': this.getId(),
                tabindex: -1,

                events: {
                    mouseenter: this.$onMouseEnter,
                    mouseleave: this.$onMouseLeave
                }
            });

            this.$Container = this.$Elm.getElement('.qui-contextitem-container');
            this.$Text = this.$Elm.getElement('.qui-contextitem-text');
            this.$Icon = this.$Elm.getElement('.qui-contextitem-icon');

            // click events on the text
            this.$Container.addEvents({
                click: this.$onClick,
                mousedown: this.$onMouseDown,
                mouseup: this.$onMouseUp,
                mouseenter: function() {
                    if (self.$Text.getSize().x < self.$Text.getScrollSize().x) {
                        self.$Text.set('title', self.getAttribute('text'));
                    } else {
                        self.$Text.set('title', null);
                    }
                }
            });


            if (this.getAttribute('checkable')) {
                this.$Checkbox = new Element('input', {
                    type: 'checkbox'
                }).inject(this.$Icon);

                this.setAttribute('icon', false);
                this.setAttribute('showIcon', true);

                this.$Elm.addClass('qui-contextitem__checkable');
            }

            if (this.getAttribute('icon') && this.getAttribute('icon') !== '') {
                var icon = this.getAttribute('icon');

                // font awesome
                if (Utils.isFontAwesomeClass(icon)) {
                    this.$Icon.addClass(icon);
                } else {
                    this.$Icon.setStyle('background-image', 'url("' + icon + '")');
                }
            }

            if (this.getAttribute('text') && this.getAttribute('text') !== '') {
                this.$Text.set({
                    html: this.getAttribute('text')
                });

                this.$onInject.delay(500);
            }

            if (this.getAttribute('showIcon') === false) {
                this.$Icon.setStyle('display', 'none');
                this.$Container.addClass('no-icon');
            }

            // drag drop for the item
            if (this.getAttribute('dragable')) {
                new DragDrop(this.$Elm, {
                    dropables: '.qui-contextitem-dropable',
                    events: {
                        onEnter: function(Element, Dragable, Droppable) {
                            if (!Droppable) {
                                return;
                            }

                            var quiid = Droppable.get('data-quiid');

                            if (!quiid) {
                                return;
                            }

                            QUI.Controls.getById(quiid).highlight();
                        },

                        onLeave: function(Element, Dragable, Droppable) {
                            if (!Droppable) {
                                return;
                            }

                            var quiid = Droppable.get('data-quiid');

                            if (!quiid) {
                                return;
                            }

                            QUI.Controls.getById(quiid).normalize();
                        },

                        onDrop: function(Element, Dragable, Droppable) {
                            if (!Droppable) {
                                return;
                            }
                            var quiid = Droppable.get('data-quiid');

                            if (!quiid) {
                                return;
                            }

                            var Bar = QUI.Controls.getById(quiid);

                            Bar.normalize();
                            Bar.appendChild(self);
                        }
                    }
                });
            }

            // Create sub menu, if sub items exist
            len = this.$items.length;

            if (len) {
                this.$Elm.addClass('haschildren');

                var Menu = this.getContextMenu();

                for (i = 0; i < len; i++) {
                    Menu.appendChild(this.$items[i]);
                }
            }

            // set the disable css class
            if (this.isDisabled()) {
                this.disable();
            }

            return this.$Elm;
        },

        /**
         * event : on inject
         */
        $onInject: function() {
        },

        /**
         * Import children
         * from a php callback or an array
         *
         * @method qui/controls/contextmenu/Item#insert
         * @param {Array} list
         * @return {Object} this (qui/controls/contextmenu/Item)
         */
        insert: function(list) {
            var self = this;

            require([
                'qui/controls/contextmenu/Item',
                'qui/controls/contextmenu/Separator'
            ], function(ContextMenuItem, ContextMenuSeparator) {
                for (var i = 0, len = list.length; i < len; i++) {
                    if (self.getAttribute('dragable')) {
                        list[i].dragable = true;
                    }

                    if (list[i].type === 'qui/controls/contextmenu/Separator') {
                        self.appendChild(
                            new ContextMenuSeparator(list[i])
                        );

                        continue;
                    }

                    self.appendChild(
                        new ContextMenuItem(list[i])
                    );
                }
            });

            return this;
        },

        /**
         * trigger a click
         *
         * @method qui/controls/contextmenu/Item#click
         */
        click: function() {
            this.$onClick(false);
        },

        /**
         * Add a Child to the Item
         *
         * @method qui/controls/contextmenu/Item#appendChild
         * @param {Object} Child - qui/controls/contextmenu/Item
         * @return {Object} this (qui/controls/contextmenu/Item)
         */
        appendChild: function(Child) {
            this.$items.push(Child);

            Child.setParent(this);


            if (this.$Elm) {
                this.$Elm.addClass('haschildren');
                Child.inject(this.getContextMenu());
            }

            this.fireEvent('append', [this, Child]);

            return this;
        },

        /**
         * disable the item
         *
         * @method qui/controls/contextmenu/Item#disable
         * @return {Object} this (qui/controls/contextmenu/Item)
         */
        disable: function() {
            this.$disabled = true;

            if (!this.$Elm) {
                return this;
            }

            this.$Elm.addClass('qui-contextitem-disabled');
            return this;
        },

        /**
         * Return if the item is disabled or not
         *
         * @method qui/controls/contextmenu/Item#isDisable
         * @return {Boolean}
         */
        isDisabled: function() {
            return this.$disabled;
        },

        /**
         * check the child
         * if the child has a checkbox
         */
        check: function() {
            this.setActive();

            if (this.$Checkbox) {
                this.$Checkbox.checked = true;
            }

            this.fireEvent('change', [this]);
        },

        /**
         * uncheck the child
         * if the child has a checkbox
         */
        uncheck: function() {
            this.setNormal();

            if (this.$Checkbox) {
                this.$Checkbox.checked = false;
            }

            this.fireEvent('change', [this]);
        },

        /**
         * enable the item if the item was disabled
         *
         * @method qui/controls/contextmenu/Item#enable
         * @return {Object} this (qui/controls/contextmenu/Item)
         */
        enable: function() {
            this.$disabled = false;

            if (!this.$Elm) {
                return this;
            }

            this.$Elm.removeClass('qui-contextitem-disabled');
            return this;
        },

        /**
         * Set the Item active
         *
         * @method qui/controls/contextmenu/Item#setActive
         * @return {Object} this (qui/controls/contextmenu/Item)
         */
        setActive: function() {
            if (this.$Elm && this.$Elm.hasClass('qui-contextitem-active')) {
                return this;
            }

            if (this.$Elm) {
                if (this.$Menu) {
                    this.$Container.addClass('qui-contextitem-active');
                } else {
                    this.$Elm.addClass('qui-contextitem-active');
                }
            }

            this.fireEvent('active', [this]);

            return this;
        },

        /**
         * Normalize the item
         *
         * @method qui/controls/contextmenu/Item#setNormal
         * @return {Object} this (qui/controls/contextmenu/Item)
         */
        setNormal: function() {
            if (!this.$Elm) {
                return this;
            }

            if (this.$Menu) {
                this.$Container.removeClass('qui-contextitem-active');
            } else {
                this.$Elm.removeClass('qui-contextitem-active');
            }

            this.fireEvent('normal', [this]);

            return this;
        },

        /**
         * All Context Menu Items
         *
         * @method qui/controls/contextmenu/Item#getChildren
         * @param {String} name - [Name of the Children, optional, if no name given, returns all Children]
         * @return {Array|Object} List of children |  qui/controls/contextmenu/Menu
         */
        getChildren: function(name) {
            if (typeof name !== 'undefined') {
                if (name === this.getAttribute('name') + '-menu') {
                    return this.getContextMenu();
                }

                return this.getContextMenu().getChildren(name);
            }

            return this.getContextMenu().getChildren();
        },

        /**
         * Return the text node
         *
         * @return {HTMLElement|null}
         */
        getTextElm: function() {
            return this.$Text;
        },

        /**
         * Clear the Context Menu Items
         *
         * @method qui/controls/contextmenu/Item#clear
         * @return {Object} this (qui/controls/contextmenu/Item)
         */
        clear: function() {
            this.getContextMenu().clear();
            this.$items = [];

            return this;
        },

        /**
         * is the item checked
         *
         * @method qui/controls/contextmenu/Item#isChecked
         * @return {boolean}
         */
        isChecked: function() {
            if (!this.getAttribute('checkable')) {
                return false;
            }

            if (!this.$Checkbox) {
                return false;
            }

            return this.$Checkbox.checked;
        },

        /**
         * Create the Context Menu if not exist
         *
         * @method qui/controls/contextmenu/Item#getContextMenu
         * @return {qui/controls/contextmenu/Menu}
         */
        getContextMenu: function() {
            if (this.$Menu) {
                return this.$Menu;
            }

            var self = this;

            this.$Menu = new ContextMenu({
                name: this.getAttribute('name') + '-menu',
                corner: 'left',
                events: {
                    onShow: function(Menu) {
                        var children = Menu.getChildren();

                        for (var i = 0, len = children.length; i < len; i++) {
                            children[i].setNormal();
                        }

                        // set active submenu
                        var ActiveMenu = self.getParent().$__activeSubMenu;

                        if (ActiveMenu && ActiveMenu != Menu) {
                            self.getParent().$__activeSubMenu.hide();
                        }

                        self.getParent().$__activeSubMenu = Menu;
                    },

                    onMouseEnter: function() {
                        self.$__childOpend = true;
                    }
                }
            });

            this.$Menu.inject(document.body);
            this.$Menu.hide();

            this.$Menu.setParent(this);

            return this.$Menu;
        },

        /**
         * onSetAttribute Event
         * Set the attribute to the DOMElement if setAttribute is execute
         *
         * @method qui/controls/contextmenu/Item#$onSetAttribute
         * @param {String} key
         * @param {Boolean|Number|String|Object|Array} value
         *
         * @ignore
         */
        $onSetAttribute: function(key, value) {
            if (!this.$Elm) {
                return;
            }

            if (key === 'text') {
                this.$Text.set('html', value);

                if (this.$Text.getSize().y <= this.$Text.getScrollSize().y) {
                    this.$Text.set('title', value);
                } else {
                    this.$Text.set('title', null);
                }

                return;
            }

            if (key === 'icon' && value) {
                this.$Icon.className = 'qui-contextitem-icon';
                this.$Icon.setStyle('background-image', null);

                if (Utils.isFontAwesomeClass(value)) {
                    this.$Icon.addClass(value);
                } else {
                    this.$Container.setStyle('background-image', 'url("' + value + '")');
                }
            }

            if (key === 'showIcon') {
                if (value === false) {
                    this.$Icon.setStyle('display', 'none');
                    this.$Container.addClass('no-icon');
                } else {
                    this.$Icon.setStyle('display', null);
                    this.$Container.removeClass('no-icon');
                }
            }
        },

        /**
         * interpret a string event
         *
         * @method qui/controls/contextmenu/Item#$stringEvent
         * @param {String} event
         */
        $stringEvent: function(event) {
            eval('(' + event + '(this));');
        },

        /**
         * event : onclick
         *
         * @method qui/controls/contextmenu/Item#$onClick
         * @param {DOMEvent|Boolean} event
         * @ignore
         */
        $onClick: function(event) {
            if (this.$disabled) {
                return;
            }

            // toggle checkbox
            if (this.$Checkbox && this.getAttribute('checkable')) {
                if (event.target !== this.$Checkbox) {
                    this.$Checkbox.checked = !this.$Checkbox.checked;
                }
            }

            this.fireEvent('click', [this, event]);
            this.fireEvent('change', [this]);

            if (this.getAttribute('checkable')) {
                return;
            }

            var Parent = this.getParent();

            if (!Parent) {
                return;
            }

            this.getParent().hide();
        },

        /**
         * event: mouse enter
         *
         * @method qui/controls/contextmenu/Item#$onMouseEnter
         */
        $onMouseEnter: function() {
            var ActiveMenu = this.getParent().$__activeSubMenu;

            if (ActiveMenu) {
                ActiveMenu.hide();
            }


            if (this.$disabled) {
                return;
            }

            if (this.$Menu) {
                var pos = this.$Elm.getPosition(),
                    size = this.$Elm.getSize(),
                    Parent = this.$Menu.getParent();

                this.$Menu.setPosition(pos.x + size.x, pos.y);

                this.$__childOpend = false;

                if (Parent) {
                    var MenuElm = this.$Menu.getElm(),
                        body_size = document.body.getSize();

                    MenuElm.setStyle('opacity', 0);
                    MenuElm.setStyle('display', null);

                    // show the menü left
                    if (pos.x + 200 > body_size.x) {
                        this.$Menu.setAttribute('corner', 'right');
                        this.$Menu.setPosition(pos.x - 220, pos.y);
                    }

                    MenuElm.setStyle('display', 'none');
                    MenuElm.setStyle('opacity', null);
                }

                this.$Menu.show();
                this.$Container.addClass('qui-contextitem-active');
            }

            this.setActive();
        },

        /**
         * event: mouse leave
         *
         * @method qui/controls/contextmenu/Item#$onMouseLeave
         */
        $onMouseLeave: function() {
            if (this.$disabled) {
                return;
            }

            if (this.$Menu) {
                (function() {
                    if (this.$__childOpend === false) {
                        this.$Menu.hide();
                    }

                }).delay(100, this);
            }

            this.$Container.removeClass('qui-contextitem-active');
            this.setNormal();
        },

        /**
         * event: mouse up
         *
         * @method qui/controls/contextmenu/Item#$onMouseUp
         * @param {DOMEvent} event - optional
         */
        $onMouseUp: function(event) {
            this.fireEvent('mouseUp', [this, event]);

            if (this.getAttribute('dragable') === false) {
                event.stop();
            }
        },

        /**
         * event: mouse down
         *
         * @method qui/controls/contextmenu/Item#$onMouseDown
         * @param {DOMEvent} event - optional
         */
        $onMouseDown: function(event) {
            this.fireEvent('mouseDown', [this, event]);

            if (this.getAttribute('dragable') === false) {
                event.stop();
            }
        }
    });
});
