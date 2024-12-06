/**
 * A Tool / Tabbar
 *
 * @module qui/controls/toolbar/Bar
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require qui/controls/contextmenu/Menu
 * @require qui/controls/contextmenu/Item
 * @require qui/controls/buttons/Button
 * @require css!qui/controls/toolbar/Bar.css
 *
 * @event onClear [ this ]
 * @event onAppendChild [ this, Itm ]
 */
define('qui/controls/toolbar/Bar', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/controls/buttons/Button',

    'css!qui/controls/toolbar/Bar.css'

], function(QUI, Control, ContextMenu, ContextMenuItem, Button) {
    'use strict';

    /**
     * @class qui/controls/toolbar/Bar
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type: 'qui/controls/toolbar/Bar',

        Binds: [
            'toLeft',
            'toRight',
            'scrollUp',
            'scrollDown',
            '$onMousewheel'
        ],

        options: {
            height: false,
            slide: true,
            'menu-button': true,
            mousewheel: true,
            type: 'tabbar',
            width: false,
            vertical: false
        },

        initialize: function(options) {
            this.Fx = null;
            this.$Elm = null;
            this.Tabs = null;
            this.Menu = null;

            this.Container = null;
            this.Active = null;

            this.BtnLeft = null;
            this.BtnRight = null;
            this.$BtnScrollUp = null;
            this.$BtnScrollDown = null;

            this.items = [];
            this.btns = [];

            this.moveLeft = null;
            this.moveRight = null;

            this.parent(options);
        },

        /**
         * Destroy the Bar
         *
         * @method qui/controls/toolbar/Bar#destroy
         */
        destroy: function() {
            var i, len;

            for (i = 0, len = this.items.length; i < len; i++) {
                if (this.items[i]) {
                    this.items[i].destroy();
                }
            }

            for (i = 0, len = this.btns.length; i < len; i++) {
                if (this.btns[i]) {
                    this.btns[i].destroy();
                }
            }

            this.items = [];
            this.btns = [];

            if (this.$Elm) {
                this.$Elm.destroy();
            }

            if (this.BtnLeft) {
                this.BtnLeft.destroy();
            }

            if (this.BtnRight) {
                this.BtnRight.destroy();
            }

            if (this.Menu) {
                this.Menu.destroy();
            }

            this.Fx = null;
            this.$Elm = null;
            this.Tabs = null;
            this.Menu = null;

            this.Container = null;
            this.Active = null;
            this.BtnLeft = null;
            this.BtnRight = null;
        },

        /**
         * Refresh the Bar
         *
         * @method qui/controls/toolbar/Bar#refresh
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        refresh: function() {
            if (!this.$Elm) {
                return this;
            }

            var i, len, Itm;

            var items = this.items;

            // items create
            this.Tabs.set('html', '');

            for (i = 0, len = items.length; i < len; i++) {
                Itm = items[i];
                Itm.inject(this.Tabs);

                this.Menu.appendChild(
                    this.$addContextMenuItm(Itm)
                );
            }

            if (this.getAttribute('menu-button') === true) {
                this.Menu.show();
            } else {
                this.Menu.hide();
            }

            if (this.getAttribute('slide') === true) {
                this.BtnLeft.show();
                this.BtnRight.show();
            } else {
                this.BtnLeft.hide();
                this.BtnRight.hide();
            }

            this.resize();

            return this;
        },

        /**
         * Create the DOMNode for the Bar
         *
         * @method qui/controls/toolbar/Bar#create
         * @return {HTMLElement}
         */
        create: function() {
            if (this.$Elm) {
                this.refresh();

                return this.$Elm;
            }


            this.$Elm = new Element('div', {
                'class': 'qui-toolbar',
                'data-quiid': this.getId(),

                'html': '<div class="qui-toolbar-container">' +
                    '<div class="qui-toolbar-tabs"></div>' +
                    '</div>'
            });

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            this.Tabs = this.$Elm.getElement('.qui-toolbar-tabs');
            this.Container = this.$Elm.getElement('.qui-toolbar-container');

            if (this.getAttribute('mousewheel')) {
                this.Container.addEvents({
                    mousewheel: this.$onMousewheel
                });
            }

            // left / right
            this.BtnLeft = new Button({
                name: 'toLeft',
                'class': 'qui-toolbar-button qui-toolbar-button-btnLeft fa fa-chevron-left',
                events: {
                    onClick: this.toLeft
                }
            });

            this.BtnRight = new Button({
                name: 'toRight',
                'class': 'qui-toolbar-button qui-toolbar-button-btnRight fa fa-chevron-right',
                events: {
                    onClick: this.toRight
                }
            });

            // up down
            if (this.getAttribute('vertical')) {
                this.$BtnScrollUp = new Button({
                    name: 'scrollUp',
                    'class': 'qui-toolbar-button qui-toolbar-button-scrollUp',
                    text: '<span class="fa fa-chevron-up"></span>',
                    events: {
                        onClick: function() {
                            this.scrollUp(300);
                        }.bind(this)
                    }
                });

                this.$BtnScrollDown = new Button({
                    name: 'scrollDown',
                    'class': 'qui-toolbar-button qui-toolbar-button-scrollDown',
                    text: '<span class="fa fa-chevron-down"></span>',
                    events: {
                        onClick: function() {
                            this.scrollDown(300);
                        }.bind(this)
                    }
                });

                this.$BtnScrollUp.inject(this.$Elm, 'top');
                this.$BtnScrollDown.inject(this.$Elm);

                this.$BtnScrollUp.hide();
                this.$BtnScrollDown.hide();
            }

            // create the left context menu
            this.Menu = new Button({
                'class': 'qui-toolbar-button qui-toolbar-button-btnMenu fa fa-chevron-down'
            });

            this.Menu.setParent(this);
            this.Menu.inject(this.$Elm, 'top');

            this.BtnLeft.inject(this.$Elm, 'top');
            this.BtnRight.inject(this.$Elm);

            this.Tabs.setStyles({
                'float': 'left',
                left: 0,
                position: 'relative',
                top: 0
            });

            this.refresh();

            this.Fx = moofx(this.Tabs);

            return this.$Elm;
        },

        /**
         * Clear the whole bar and destroys the children
         *
         * @method qui/controls/toolbar/Bar#clear
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        clear: function() {
            if (!this.Tabs) {
                this.fireEvent('clear', [this]);

                return this;
            }

            var i, len;

            for (i = 0, len = this.items.length; i < len; i++) {
                if (this.items[i]) {
                    this.items[i].destroy();
                }
            }

            for (i = 0, len = this.btns.length; i < len; i++) {
                if (this.btns[i]) {
                    this.btns[i].destroy();
                }
            }

            this.Tabs.set('html', '');

            delete this.items;
            delete this.Active;

            this.items = [];
            this.btns = [];
            this.Active = null;


            if (this.Menu) {
                this.Menu.clear();
                this.Menu.setDisable();
            }

            if (this.moveLeft) {
                this.moveLeft.setDisable();
            }

            if (this.moveRight) {
                this.moveRight.setDisable();
            }

            this.Tabs.setStyle('left', 0);
            this.fireEvent('clear', [this]);

            return this;
        },

        /**
         * Hide the Bar
         *
         * @method qui/controls/toolbar/Bar#hide
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        hide: function() {
            this.$Elm.setStyles({
                'height': 0,
                'overflow': 'hidden'
            });

            return this;
        },

        /**
         * Show the Bar
         *
         * @method qui/controls/toolbar/Bar#show
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        show: function() {
            this.$Elm.setStyle('height', null);
            this.$Elm.setStyle('overflow', null);

            return this;
        },

        /**
         * Scrolls the bar to the right
         *
         * @method qui/controls/toolbar/Bar#toLeft
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        toLeft: function() {
            if (!this.Fx) {
                return this;
            }

            this.Fx.animate({
                left: 0
            });

            return this;
        },

        /**
         * Scrolls the bar to the right
         *
         * @method qui/controls/toolbar/Bar#toRight
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        toRight: function() {
            var left = this.Tabs.offsetLeft - 150;

            if (left < ((this.Tabs.offsetWidth - 150) * -1)) {
                left = 0;
            }

            this.Fx.animate({
                left: left
            });

            return this;
        },

        /**
         * Scroll ths bar up
         *
         * @param {Number} move - pixel to move
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        scrollUp: function(move) {
            if (!this.getAttribute('vertical')) {
                return this;
            }

            move = move || 150;

            var top = this.Tabs.getStyle('top').toInt() + move;

            if (top >= 0) {
                top = 0;
            }

            this.Fx.animate({
                top: top
            }, {
                duration: 200,
                equation: 'ease-out'
            });


            return this;
        },

        /**
         * scroll the bar down
         *
         * @param {Number} move - pixel to move
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        scrollDown: function(move) {
            if (!this.getAttribute('vertical')) {
                return this;
            }

            move = move || 150;


            var tabsSize = this.Tabs.getSize(),
                conSize = this.Container.getSize();

            if (conSize.y >= tabsSize.y) {
                return this;
            }

            var maxScroll = conSize.y - tabsSize.y,
                top = this.Tabs.getStyle('top').toInt() - move;

            if (maxScroll > top) {
                top = maxScroll;
            }

            this.Fx.animate({
                top: top
            }, {
                duration: 200,
                equation: 'ease-out'
            });

            return this;
        },

        /**
         * Scroll to a specific tab
         *
         * @method qui/controls/toolbar/Bar#toTab
         * @param {Object} Tab - qui/controls/toolbar/Tab
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        toTab: function(Tab) {
            if (this.getAttribute('slide') === false) {
                return this;
            }

            if (!this.$Elm) {
                return this;
            }

            // this.Fx.stop();

            if (Tab === this.firstChild()) {
                this.Fx.animate({
                    left: 0
                });

                return this;
            }

            var needle;

            var TabElm = Tab.getElm(),
                Container = this.$Elm.getElement('.qui-toolbar-container'),
                Tabs = this.$Elm.getElement('.qui-toolbar-tabs'),

                left = Tabs.getStyle('left').toInt() + TabElm.offsetLeft,
                pos = TabElm.offsetLeft + TabElm.offsetWidth;

            if (left < 0) {
                this.Fx.animate({
                    left: Tabs.getStyle('left').toInt() + (left * -1) + 20
                });

                return this;
            }

            // verschieben nach links
            if (pos > Container.offsetWidth) {
                needle = pos - Container.offsetWidth;

                this.Fx.animate({
                    left: (needle + 20) * -1
                });

                return this;
            }

            return this;
        },

        /**
         * Get the first children
         *
         * @method qui/controls/toolbar/Bar#firstChild
         * @return {Object} qui/controls/Control
         */
        firstChild: function() {
            return this.items[0];
        },

        /**
         * Get the last child
         *
         * @method qui/controls/toolbar/Bar#lastChild
         * @return {Object} qui/controls/Control
         */
        lastChild: function() {
            return this.items[this.items.length - 1];
        },

        /**
         * Return all children
         *
         * @method qui/controls/toolbar/Bar#getChildren
         * @param {String} [name] - optional, name of the wanted Element
         *                          if no name given, all children will be return
         * @return {Array}
         */
        getChildren: function(name) {
            if (typeof name !== 'undefined') {
                return this.getElement(name);
            }

            return this.items;
        },

        /**
         * Number of children in the toolbar
         *
         * @method qui/controls/toolbar/Bar#count
         * @return {Number}
         */
        count: function() {
            return this.items.length;
        },

        /**
         * Remove a child from the toolbar
         *
         * @method qui/controls/toolbar/Bar#removeChild
         * @param {Object} Child - qui/controls/Control
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        removeChild: function(Child) {
            var i, len;

            var nitms = [],
                itms = this.items,
                childname = Child.getAttribute('name');

            for (i = 0, len = itms.length; i < len; i++) {
                if (itms[i].getAttribute('name') !== childname) {
                    nitms.push(itms[i]);
                    continue;
                }

                itms[i].destroy();
            }

            this.items = nitms;

            return this;
        },

        /**
         * Move an child to another position
         *
         * @method qui/controls/toolbar/Bar#moveChildToPos
         * @param {Object} Child - (qui/controls/Control) Item in the toolbar
         * @param {Number} pos   - New position
         *
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        moveChildToPos: function(Child, pos) {

            // for (var i = 0, len = itms.length; i < len; i++) {
            //     if (Child == itms[i]) {
            //         //itms[i].destroy();
            //         continue;
            //     }
            //
            //     nitems.push(itms[i]);
            // }

            if (pos === 0) {
                return;
            }

            var PosItem = this.items[pos - 1];

            this.items.splice(pos - 1, 0, Child);

            Child.getElm().inject(PosItem.getElm(), 'after');

            return this;
        },

        /**
         * Get an Element by name
         *
         * @method qui/controls/toolbar/Bar#getElement
         * @param {String} name - name of the wanted Element
         * @return {null|Object} null | qui/controls/Control
         */
        getElement: function(name) {
            var i, len;
            var items = this.items;

            for (i = 0, len = items.length; i < len; i++) {
                if (items[i] && items[i].getAttribute('name') === name) {
                    return items[i];
                }
            }

            return null;
        },

        /**
         * Add an Child to the toolbar
         *
         * @method qui/controls/toolbar/Bar#appendChild
         * @param {Object} Itm - qui/controls/buttons/Button | qui/controls/buttons/Separator | qui/controls/toolbar/Tab
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        appendChild: function(Itm) {
            if (typeof Itm === 'undefined') {
                return this;
            }

            var self = this,
                type = typeOf(Itm);

            if (type === 'element') {
                Itm.inject(this.Tabs);
                return this;
            }

            if (!QUI.Controls.isControl(Itm)) {
                return this;
            }

            Itm.addEvent('onDestroy', function() {
                var newItems = [],
                    items = self.items;

                for (var i = 0, len = items.length; i < len; i++) {
                    if (items[i] !== Itm) {
                        newItems.push(items[i]);
                    }
                }

                self.items = newItems;
            });


            Itm.setParent(this);

            if (type === 'qui/controls/toolbar/Tab') {
                Itm.addEvent('click', function(Item) {
                    self.toTab(Item);
                });
            }

            this.fireEvent('appendChild', [this, Itm]);

            // Falls Toolbar eine Tabbar ist, Buttons an vorletzter Stelle
            if (this.getAttribute('type') === 'tabbar' && Itm.getType() === 'qui/controls/buttons/Button') {
                this.btns.push(Itm);

                Itm.inject(this.BtnRight.getElm(), 'before');

                var Con = this.Container,
                    Btn = Itm.getElm();

                Con.setStyle(
                    'width',
                    Con.getStyle('width').toInt() - Btn.getSize().x
                );

                return this;
            }

            // start the normal toolbar
            this.items.push(Itm);

            if (!this.$Elm) {
                return this;
            }

            Itm.inject(this.Tabs);

            if (this.Menu) {
                this.Menu.appendChild(
                    this.$addContextMenuItm(Itm)
                );
            }

            // neue Breite berechnen
            if (this.$Elm) {
                this.resize();
            }

            if (this.Menu) {
                this.Menu.setEnable();
            }

            if (this.BtnLeft) {
                this.BtnLeft.setEnable();
            }

            if (this.BtnRight) {
                this.BtnRight.setEnable();
            }

            return this;
        },

        /**
         * Set an toolbar child active
         *
         * @method qui/controls/toolbar/Bar#setItemActive
         * @param {Object} Child - qui/controls/toolbar/Tab
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        setItemActive: function(Child) {
            if (this.Active) {
                this.Active.leave();
                this.Active.setNormal();

                if (this.Active.getAttribute('ContextMenuItem')) {
                    this.Active.getAttribute('ContextMenuItem').getElm().setStyle('fontWeight', '');
                }
            }

            this.Active = Child;
            this.Active.setActive();

            if (this.Active.getAttribute('ContextMenuItem')) {
                this.Active.getAttribute('ContextMenuItem').getElm().setStyle('fontWeight', 'bold');
            }

            return this;
        },

        /**
         * Returns the active child
         *
         * @method qui/controls/toolbar/Bar#getActive
         * @return {null|Object} null | qui/controls/Control
         */
        getActive: function() {
            if (this.Active) {
                return this.Active;
            }

            var i, len;
            var items = this.items;

            for (i = 0, len = items.length; i < len; i++) {
                if (items[i].isActive()) {
                    this.Active = items[i];
                    return this.Active;
                }
            }
        },

        /**
         * Resize the whole toolbar
         *
         * @method qui/controls/toolbar/Bar#resize
         * @return {Object} this (qui/controls/toolbar/Bar)
         */
        resize: function() {
            if (!this.getElm()) {
                return this;
            }

            var i, len;

            var width = 0;

            // tab width
            if (this.getAttribute('vertical')) {
                if (this.getAttribute('width')) {
                    width = this.getAttribute('width');

                    this.Tabs.setStyle('width', width);
                    this.Container.setStyle('width', width);
                    this.getElm().setStyle('width', width);
                }
            } else {
                // standard toolbar
                var cwidth = 0,
                    itms = this.Tabs.getChildren();

                if (this.getAttribute('width') &&
                    this.getAttribute('width').toString().contains('%') === false) {
                    for (i = 0, len = itms.length; i < len; i++) {
                        width = width + (itms[i].getSize().x.toInt()) + 30;
                    }

                    cwidth = (this.getAttribute('width')).toInt();

                    if (this.getAttribute('slide')) {
                        cwidth = cwidth - this.BtnLeft.getElm().getComputedSize().totalWidth;
                        cwidth = cwidth - this.BtnRight.getElm().getComputedSize().totalWidth;
                        cwidth = cwidth - 50; // paddings
                    }

                    if (this.getAttribute('menu-button')) {
                        cwidth = cwidth - this.Menu.getElm().getComputedSize().totalWidth;
                        cwidth = cwidth - 5; // paddings
                    }
                } else {
                    cwidth = '100%';

                    if (!this.getAttribute('menu-button') && !this.getAttribute('slide')) {
                        width = '100%';
                    }
                }

                this.Tabs.setStyle('width', width);
                this.Container.setStyle('width', cwidth);
                this.getElm().setStyle('width', this.getAttribute('width'));

                // responsive check
                //var wasMobile = this.Tabs.hasClass('.qui-toolbar--mobile');
                this.Tabs.removeClass('qui-toolbar--mobile');

                var containerSize = this.Tabs.getSize();
                var elmSize = this.getElm().getSize();

                if (width === '100%' &&
                    (containerSize.x > elmSize.x || containerSize.y > elmSize.y + 1) // +1 = because border
                ) {
                    this.Tabs.addClass('qui-toolbar--mobile');
                } else {
                    this.Tabs.removeClass('qui-toolbar--mobile');
                }
            }

            if (this.getAttribute('height')) {
                this.Container.setStyle('height', this.getAttribute('height'));
            }

            if (this.getAttribute('vertical')) {
                this.$Elm.setStyle('height', this.getAttribute('height'));

                var sizeY = this.Container.getSize().y,
                    scrollY = this.Container.getScrollSize().y;

                if (sizeY < scrollY) {
                    this.Container.setStyle('height', 'calc(100% - 60px)');
                    this.$BtnScrollUp.show();
                    this.$BtnScrollDown.show();
                } else {
                    this.$BtnScrollUp.hide();
                    this.$BtnScrollDown.hide();
                }
            }

            return this;
        },

        /**
         * Add a ContextMenuItem for a child to the toolbar
         *
         * @method qui/controls/toolbar/Bar#$addContextMenuItm
         * @return {Object} qui/controls/contextmenu/Item
         * @ignore
         */
        $addContextMenuItm: function(Itm) {
            var MenuItem = new ContextMenuItem(
                Itm.getAttributes()
            );

            MenuItem.setAttribute('TAB', Itm);
            MenuItem.setAttribute('Toolbar', this);

            Itm.setAttribute('ContextMenuItem', MenuItem);

            MenuItem.addEvent('onMouseDown', function(Itm) {
                var Tab = Itm.getAttribute('TAB'),
                    Toolbar = Itm.getAttribute('Toolbar');

                Tab.click();
                Toolbar.toTab(Tab);
            });

            return MenuItem;
        },

        /**
         * on : mousewheel event
         * @param {DOMEvent} event - DOM Event
         */
        $onMousewheel: function(event) {
            // Mousewheel UP
            if (event.wheel > 0) {
                this.scrollUp();
                return;
            }

            // Mousewheel DOWN
            if (event.wheel < 0) {
                this.scrollDown();
            }
        }
    });
});
