/**
 * Sitemap Item
 *
 * @module qui/controls/sitemap/Item
 * @author www.pcsg.de (Henning Leutz)
 */
define('qui/controls/sitemap/Item', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Controls',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/classes/utils/DragDrop',

    'css!qui/controls/sitemap/Item.css'

], function (QUI, QUIControl, Utils, QUIContextMenu, QUIContextMenuItem, QUIDragDrop) {
    "use strict";

    /**
     * @class qui/controls/sitemap/Item
     *
     * @fires onOpen [this]
     * @fires onClose [this]
     * @fires onClick [this, event]
     * @fires onContextMenu [this, event]
     * @fires onSelect [this]
     * @fires onDeSelect [this]
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: QUIControl,
        Type   : 'qui/controls/sitemap/Item',

        Binds: [
            'toggle',
            'click',
            '$onChildDestroy',
            '$onSetAttribute'
        ],

        options: {
            value: '',
            text : '',
            icon : '',

            alt  : '',
            title: '',

            contextmenu: true,
            hasChildren: false,
            dragable   : false
        },

        $Elm  : null,
        $items: [],

        initialize: function (options) {
            const self = this;

            this.parent(options);

            this.$Elm = null;
            this.$Map = null;
            this.$Opener = null;
            this.$Icons = null;
            this.$Text = null;

            this.$Children = null;
            this.$ContextMenu = null;
            this.$DragDrop = null;
            this.$disable = false;

            this.$items = [];

            this.addEvents({
                onSetAttribute: this.$onSetAttribute,
                onDestroy     : function (Item) {
                    Item.clearChildren();

                    if (self.$Opener) {
                        self.$Opener.destroy();
                    }

                    if (self.$Icons) {
                        self.$Icons.destroy();
                    }

                    if (self.$Text) {
                        self.$Text.destroy();
                    }

                    if (self.$Children) {
                        self.$Children.destroy();
                    }

                    if (self.$ContextMenu) {
                        self.$ContextMenu.destroy();
                    }
                },
                onInject      : function () {
                    self.refresh.delay(20, self);
                }
            });
        },

        /**
         * Create the DOMNode of the Sitemap Item
         *
         * @method qui/controls/sitemap/Item#create
         * @return {HTMLElement}
         */
        create: function () {
            let i, len;
            const self = this;

            this.$Elm = new Element('div', {
                'class'     : 'qui-sitemap-entry box',
                alt         : this.getAttribute('alt'),
                title       : this.getAttribute('title'),
                'data-value': this.getAttribute('value'),
                'data-quiid': this.getId(),
                html        : '<div class="qui-sitemap-entry-opener fa"></div>' +
                              '<div class="qui-sitemap-entry-container">' +
                              '<div class="qui-sitemap-entry-icon"></div>' +
                              '<div class="qui-sitemap-entry-text">###</div>' +
                              '</div>' +
                              '<div class="qui-sitemap-entry-children"></div>',
                events      : {
                    contextmenu: function (event) {
                        if (self.getAttribute('contextmenu') === false) {
                            event.stop();
                            return;
                        }

                        if (self.getMap()) {
                            self.getMap().childContextMenu(self, event);
                        }

                        self.fireEvent('contextMenu', [
                            self,
                            event
                        ]);
                    }
                }
            });

            this.$Opener = this.$Elm.getElement('.qui-sitemap-entry-opener');
            this.$Icons = this.$Elm.getElement('.qui-sitemap-entry-icon');
            this.$Text = this.$Elm.getElement('.qui-sitemap-entry-text');
            this.$Children = this.$Elm.getElement('.qui-sitemap-entry-children');
            this.$Container = this.$Elm.getElement('.qui-sitemap-entry-container');

            // events
            this.$Opener.addEvents({
                click: this.toggle
            });

            this.$Text.addEvents({
                click: this.click
            });

            // ui
            this.$Children.setStyle('display', 'none');


            if (this.getAttribute('icon')) {
                this.addIcon(this.getAttribute('icon'));
            }

            if (this.getAttribute('text')) {
                this.$Text.set('html', this.getAttribute('text'));
            }

            len = this.$items.length;

            if (len || this.hasChildren()) {
                this.$setOpener();

                for (i = 0; i < len; i++) {
                    this.$items[i].inject(this.$Children);
                    this.$items[i].refresh();
                }
            }

            if (this.getAttribute('dragable')) {
                this.getDragDrop();
            }

            return this.$Elm;
        },

        /**
         * refresh the entry - recalc
         *
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        refresh: function () {
            let width = 0;

            if (this.$Opener) {
                width = width + this.$Opener.measure(function () {
                    return this.getSize().x;
                });
            }

            if (this.$Icons) {
                width = width + this.$Icons.measure(function () {
                    return this.getSize().x;
                });
            }

            if (this.$Text) {
                width = width + this.$Text.measure(function () {
                    return this.getComputedSize().totalWidth;
                });
            }

            if (!width) {
                return this;
            }


            if (this.$Elm) {
                this.$Elm.setStyle('width', width);
            }

            return this;
        },

        /**
         * Return the text DOMNode
         *
         * @method qui/controls/sitemap/Item#getTextElm
         * @return {HTMLElement|null}
         */
        getTextElm: function () {
            return this.$Text;
        },

        /**
         * Return the container DOMNode
         * include the icon and the text node
         *
         * @method qui/controls/sitemap/Item#getContainerElm
         * @return {HTMLElement|null}
         */
        getContainerElm: function () {
            return this.$Container;
        },

        /**
         * Add an Icon to the Icon Container
         * You can only add an icon if the main DOMNode are drawed
         *
         * @method qui/controls/sitemap/Item#addIcon
         * @param {String} icon_url - URL of the Image
         * @return {HTMLElement} Element
         */
        addIcon: function (icon_url) {
            if (!this.$Icons) {
                this.getElm();
            }

            let Img = this.$Icons.getElement('[src="' + icon_url + '"]');

            if (Img) {
                return Img;
            }

            // multible class definitions
            if (icon_url.match(' ')) {

                Img = this.$Icons.getElement(
                    '.' + icon_url.replace(/ /g, '.')
                );

            } else {
                Img = this.$Icons.getElement('.' + icon_url);
            }

            if (Img) {
                return Img;
            }

            if (Utils.isFontAwesomeClass(icon_url)) {
                return new Element('i', {
                    'class': 'qui-sitemap-entry-icon-itm ' + icon_url
                }).inject(this.$Icons);
            }

            return new Element('img', {
                src    : icon_url,
                'class': 'qui-sitemap-entry-icon-itm'
            }).inject(this.$Icons);
        },

        /**
         * Remove an icon of the Icon Container
         *
         * @method qui/controls/sitemap/Item#removeIcon
         * @param {String} icon_url - URL of the Image
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        removeIcon: function (icon_url) {
            if (!this.$Icons) {
                return this;
            }

            let Img = this.$Icons.getElement('[src="' + icon_url + '"]');

            if (Img) {
                Img.destroy();
            }

            icon_url = icon_url.replace('fa fa', 'fa');
            Img = this.$Icons.getElement('.' + icon_url);

            if (Img) {
                Img.destroy();
            }

            return this;
        },

        /**
         * Activate the Item. The inactive Icon would be destroy
         *
         * @method qui/controls/sitemap/Item#activate
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        activate: function () {
            if (this.$disable) {
                return this;
            }

            this.removeIcon('fa-remove');

            return this;
        },

        /**
         * Deactivate the Item. Add inactive Icon
         *
         * @method qui/controls/sitemap/Item#deactivate
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        deactivate: function () {
            if (this.$disable) {
                return this;
            }

            this.addIcon('fa fa-remove').setStyles({
                color: 'red'
            });

            return this;
        },

        /**
         * Add a Child
         *
         * @method qui/controls/sitemap/Item#appendChild
         *
         * @param {Object} Child - qui/controls/sitemap/Item
         * @param {String} [where] - before, after
         *
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        appendChild: function (Child, where) {
            if (typeof where === 'undefined') {
                where = 'bottom';
            }

            if (where !== 'bottom') {
                const Parent = this.getParent();
                const index = Parent.$items.indexOf(this);

                switch (where) {
                    case 'after':
                        Parent.$items.splice(index + 1, 0, Child);
                        Child.getElm().inject(this.getElm(), where);
                        break;

                    case 'before':
                        Parent.$items.splice(index, 0, Child);
                        Child.getElm().inject(this.getElm(), where);
                        break;
                }

                Child.setParent(Parent);
                Child.setMap(this.getMap());

                Child.addEvents({
                    onDestroy: this.$onChildDestroy
                });

                Child.refresh();

                this.getMap().fireEvent('appendChild', [
                    this,
                    Child
                ]);

                return this;
            }

            this.$items.push(Child);
            this.$setOpener();

            if (this.$Children) {
                Child.inject(this.$Children);

                let size = this.$Children.getSize();

                if (size.x) {
                    let child_size = 10 +
                                     Child.$Opener.getSize().x +
                                     Child.$Icons.getSize().x +
                                     Child.$Text.getSize().x;

                    if (child_size > size.x) {
                        this.$Children.setStyle('width', child_size);
                    }
                }
            }

            Child.setParent(this);        // set the parent to the this
            Child.setMap(this.getMap());  // set the parent to the Map

            Child.addEvents({
                onDestroy: this.$onChildDestroy
            });

            Child.refresh();

            this.getMap().fireEvent('appendChild', [
                this,
                Child
            ]);

            return this;
        },

        /**
         * Get the first Child if exists
         *
         * @method qui/controls/sitemap/Item#firstChild
         * @return {Object|Boolean} qui/controls/sitemap/Item | false
         */
        firstChild: function () {
            return this.$items[0] || false;
        },

        /**
         * Have the Items childrens?
         * Observed the hasChildren Attribute
         *
         * @method qui/controls/sitemap/Item#hasChildren
         * @return {Boolean}
         */
        hasChildren: function () {
            if (this.getAttribute('hasChildren')) {
                return true;
            }

            return !!this.$items.length;
        },

        /**
         * Returns the children items
         *
         * @method qui/controls/sitemap/Item#getChildren
         * @return {Array}
         */
        getChildren: function () {
            return this.$items;
        },

        /**
         * Delete all children
         *
         * @method qui/controls/sitemap/Item#clearChildren
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        clearChildren: function () {
            let i, len;
            let items = this.$items;

            for (i = 0, len = items.length; i < len; i++) {
                if (items[i]) {
                    items[i].destroy();
                }
            }

            this.$Children.set('html', '');
            this.$items = [];

            return this;
        },

        /**
         * Get the number of children
         *
         * @method qui/controls/sitemap/Item#countChildren
         * @return {Number}
         */
        countChildren: function () {
            return this.$items.length;
        },

        /**
         * Remove the child from the list
         *
         * @method qui/controls/sitemap/Item#countChildren
         * @param {Object} Child - qui/controls/sitemap/Item
         * @return {Object} this (qui/controls/sitemap/Item)
         * @ignore
         */
        $removeChild: function (Child) {
            let items = [];

            for (let i = 0, len = this.$items.length; i < len; i++) {
                if (this.$items[i].getId() !== Child.getId()) {
                    items.push(this.$items[i]);
                }
            }

            this.$items = items;

            // dont delete it, because ajax
            //this.setAttribute( 'hasChildren', this.$items.length ? true : false );

            this.$setOpener();

            return this;
        },

        /**
         * Select the Item
         *
         * @method qui/controls/sitemap/Item#select
         * @param {DOMEvent} [event] - optional
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        select: function (event) {
            if (this.$disable) {
                return this;
            }

            this.fireEvent('select', [
                this,
                event
            ]);

            if (this.$Container) {
                this.$Container.addClass('qui-sitemap-entry-select');
            }

            return this;
        },

        /**
         * Deselect the Item
         *
         * @method qui/controls/sitemap/Item#deselect
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        deselect: function () {
            this.fireEvent('deSelect', [this]);

            if (this.$Container) {
                this.$Container.removeClass('qui-sitemap-entry-select');
            }

            return this;
        },

        /**
         * Normalize the item
         * no selection or highlighting
         *
         * @method qui/controls/sitemap/Item#normalize
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        normalize: function () {
            this.enable();

            if (this.$Container) {
                this.$Container.removeClass('qui-sitemap-entry-select');
                this.$Container.removeClass('qui-sitemap-entry-holdBack');
                this.$Container.removeClass('qui-sitemap-entry-highlighted');
            }

            if (this.$Opener) {
                this.$Opener.removeClass('qui-sitemap-entry-holdBack');
            }

            return this;
        },

        /**
         * Highight the item
         *
         * @method qui/controls/sitemap/Item#highlight
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        highlight: function () {
            this.$Container.addClass('qui-sitemap-entry-highlighted');
            return this;
        },

        /**
         * Dehighight the item
         *
         * @method qui/controls/sitemap/Item#deHighlight
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        deHighlight: function () {
            this.$Container.removeClass('qui-sitemap-entry-highlighted');
            return this;
        },

        /**
         * Disable the item
         *
         * @method qui/controls/sitemap/Item#disable
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        disable: function () {
            this.$disable = true;

            if (this.$Container) {
                this.$Container.addClass('qui-sitemap-entry-disabled');
            }

            return this;
        },

        /**
         * Enable the item if the item was disabled
         *
         * @method qui/controls/sitemap/Item#enable
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        enable: function () {
            this.$disable = false;

            if (this.$Container) {
                this.$Container.removeClass('qui-sitemap-entry-disabled');
            }

            return this;
        },

        /**
         * the item is a little disappear
         *
         * @method qui/controls/sitemap/Item#holdBack
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        holdBack: function () {
            if (this.$Container) {
                this.$Container.addClass('qui-sitemap-entry-holdBack');
            }

            if (this.$Opener) {
                this.$Opener.addClass('qui-sitemap-entry-holdBack');
            }
        },

        /**
         * Klick the sitemap item
         *
         * @method qui/controls/sitemap/Item#click
         * @param {DOMEvent} [event] - [optional -> event click]
         */
        click: function (event) {
            this.select(event);
            this.fireEvent('click', [
                this,
                event
            ]);
        },

        /**
         * Opens the childrens
         *
         * @method qui/controls/sitemap/Item#open
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        open: function () {
            if (!this.$Children) {
                return this;
            }

            this.$Children.setStyle('display', '');
            this.$setOpener();

            this.fireEvent('open', [this]);

            return this;
        },

        /**
         * Close the childrens
         *
         * @method qui/controls/sitemap/Item#close
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        close: function () {
            if (!this.$Children) {
                return this;
            }

            this.$Children.setStyle('display', 'none');
            this.$setOpener();

            this.fireEvent('close', [this]);

            return this;
        },

        /**
         * Switch between open and close
         *
         * @method qui/controls/sitemap/Item#toggle
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        toggle: function () {
            if (!this.hasChildren()) {
                return this;
            }

            if (this.isOpen()) {
                this.close();
            } else {
                this.open();
            }

            return this;
        },

        /**
         * Is the Item open?
         *
         * @method qui/controls/sitemap/Item#isOpen
         * @return {Boolean}
         */
        isOpen: function () {
            if (!this.$Children) {
                return false;
            }

            return this.$Children.getStyle('display') !== 'none';
        },

        /**
         * Create and return a contextmenu for the Element
         *
         * @method qui/controls/sitemap/Item#getContextMenu
         * @return {Object} Menu - qui/controls/sitemap/Menu
         */
        getContextMenu: function () {
            if (this.$ContextMenu) {
                return this.$ContextMenu;
            }

            let cm_name = this.getAttribute('name') || this.getId();

            this.$ContextMenu = new QUIContextMenu({
                name  : cm_name + '-contextmenu',
                events: {
                    onShow: function (Menu) {
                        Menu.focus();
                    },
                    onBlur: function (Menu) {
                        Menu.hide();
                    }
                }
            });

            this.$ContextMenu.inject(document.body);
            this.$ContextMenu.hide();

            return this.$ContextMenu;
        },

        /**
         * Get the map parent, if it is set
         *
         * @method qui/controls/sitemap/Item#getMap
         * @return {Object|null} Map - qui/controls/sitemap/Map
         */
        getMap: function () {
            return this.$Map;
        },

        /**
         * Set the map parent
         *
         * @method qui/controls/sitemap/Item#getMap
         * @param {Object} Map - qui/controls/sitemap/Map
         * @return {Object} this (qui/controls/sitemap/Item)
         */
        setMap: function (Map) {
            this.$Map = Map;

            return this;
        },

        /**
         * @method qui/controls/sitemap/Item#$setOpener
         */
        $setOpener: function () {
            if (!this.$Elm) {
                return;
            }

            if (this.hasChildren() === false) {
                this.$Opener.removeClass('fa-minus-square-o');
                this.$Opener.removeClass('fa-plus-square-o');
                return;
            }

            if (this.isOpen()) {
                this.$Opener.addClass('fa-minus-square-o');
                this.$Opener.removeClass('fa-plus-square-o');
            } else {
                this.$Opener.removeClass('fa-minus-square-o');
                this.$Opener.addClass('fa-plus-square-o');
            }
        },

        /**
         * event : on set attribute
         * change the DOMNode Element if some attributes changed
         *
         * @method qui/controls/sitemap/Item#$onSetAttribute
         * @param {String} key - attribute name
         * @param {String} value - attribute value
         */
        $onSetAttribute: function (key, value) {
            if (!this.$Elm) {
                return;
            }

            if (key === 'icon') {
                this.removeIcon(this.getAttribute('icon'));
                this.addIcon(value);
                return;
            }

            if (key === 'text') {
                this.$Text.set('html', value);
                this.refresh();
                return;
            }

            if (key === 'value') {
                this.$Elm.set('data-value', value);
            }

            if (key === 'hasChildren') {
                this.options.hasChildren = value;
                this.$setOpener();
            }
        },

        /**
         * event : children destroy
         *
         * @method qui/controls/sitemap/Item#$onChildDestroy
         * @param {Object} Item - qui/controls/sitemap/Item
         */
        $onChildDestroy: function (Item) {
            this.$removeChild(Item);
        },

        /**
         * Drag Drop Methods
         */

        /**
         * Return the DragDrop Object
         *
         * @return DragDrop
         */
        getDragDrop: function () {
            if (this.$DragDrop) {
                return this.$DragDrop;
            }

            const self = this;

            // drag drop for the item
            this.$DragDrop = new QUIDragDrop(this.$Elm, {
                dropables: '.qui-sitemap-entry-dropable',
                styles   : {
                    height: 30,
                    width : 200
                },
                events   : {
                    onEnter: function (Element, Dragable, Droppable) {
                        if (!Droppable) {
                            return;
                        }

                        const quiid = Droppable.get('data-quiid');

                        if (!quiid) {
                            return;
                        }

                        QUI.Controls.getById(quiid).highlight();
                    },

                    onLeave: function (Element, Dragable, Droppable) {
                        if (!Droppable) {
                            return;
                        }

                        const quiid = Droppable.get('data-quiid');

                        if (!quiid) {
                            return;
                        }

                        QUI.Controls.getById(quiid).normalize();
                    },

                    onDrop: function (Element, Dragable, Droppable) {
                        if (!Droppable) {
                            return;
                        }

                        const quiid = Droppable.get('data-quiid');

                        if (!quiid) {
                            return;
                        }

                        const Bar = QUI.Controls.getById(quiid);

                        Bar.normalize();
                        Bar.appendChild(self);
                    }
                }
            });
        }
    });
});
