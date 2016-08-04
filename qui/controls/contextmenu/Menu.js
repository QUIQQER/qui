/**
 * A Context Menu
 *
 * @module qui/controls/contextmenu/Menu
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/utils/Elements
 * @require css!qui/controls/contextmenu/Menu.css
 *
 * @event onMouseEnter
 * @event onMouseLeave
 */
define('qui/controls/contextmenu/Menu', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Elements',

    'css!qui/controls/contextmenu/Menu.css'

], function (QUI, Control, QUIElementUtil) {
    "use strict";

    /**
     * @class qui/controls/contextmenu/Menu
     *
     * @fires onShow [this]
     * @fires onHide [this]
     * @fires onBlur [this]
     * @fires onFocus [this]
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type   : 'qui/controls/contextmenu/Menu',

        Binds: [
            '$keyup'
        ],

        options: {
            styles   : null,   // mootools css styles
            width    : 200,    // menü width
            title    : false,  // title of the menu (optional) : String
            shadow   : true,   // menü with shadow (true) or not (false)
            corner   : false,  // corner for the menü
            maxHeight: false, // max height of the menu
            dragable : false,
            showIcons: true
        },

        initialize: function (options) {
            this.parent(options);

            this.$items  = [];
            this.$Title  = null;
            this.$Active = null;

            this.$__activeSubMenu = false;
        },

        /**
         * Create the DOM Element
         *
         * @method qui/controls/contextmenu/Menu#create
         * @return {HTMLElement} main DOM-Node Element
         */
        create: function () {
            var self = this;

            this.$Elm = new Element('div.qui-contextmenu', {
                html        : '<div class="qui-contextmenu-container"></div>',
                tabindex    : -1,
                styles      : {
                    display       : 'none',
                    outline       : 'none',
                    '-moz-outline': 'none'
                },
                events      : {
                    blur: function () {
                        this.fireEvent('blur', [this]);
                    }.bind(this),

                    keyup: this.$keyup,

                    mouseenter: function () {
                        self.fireEvent('mouseEnter', [self]);
                    },

                    mouseleave: function () {
                        self.fireEvent('mouseLeave', [self]);
                    },
                    mousedown : function (event) {
                        event.stop();
                    }
                },
                'data-quiid': this.getId()
            });

            this.$Container = this.$Elm.getElement('.qui-contextmenu-container');

            if (this.getAttribute('width')) {
                this.$Elm.setStyle('width', this.getAttribute('width'));
            }

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            if (this.getAttribute('title')) {
                this.setTitle(this.getAttribute('title'));
            }

            if (this.getAttribute('shadow')) {
                this.$Container.addClass('qui-contextmenu-shadow');
            }

            for (var i = 0, len = this.$items.length; i < len; i++) {
                this.$items[i].inject(this.$Container);
            }

            return this.$Elm;
        },

        /**
         * Shows the Menu, clears the display style
         *
         * @method qui/controls/contextmenu/Menu#show
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        show: function () {
            if (!this.$Elm) {
                return this;
            }

            if (this.$__activeSubMenu) {
                this.$__activeSubMenu.hide();
            }

            this.$__activeSubMenu = false;

            var Elm = this.$Elm;

            if (this.getAttribute('corner')) {
                Elm.removeClass('qui-context-corner-top');
                Elm.removeClass('qui-context-corner-bottom');
                Elm.removeClass('qui-context-corner-left');
                Elm.removeClass('qui-context-corner-left');
            }

            switch (this.getAttribute('corner')) {
                case 'top':
                    Elm.addClass('qui-context-corner-top');
                    break;

                case 'bottom':
                    Elm.addClass('qui-context-corner-bottom');
                    break;

                case 'left':
                    Elm.addClass('qui-context-corner-left');
                    break;

                case 'right':
                    Elm.addClass('qui-context-corner-right');
                    break;
            }

            // zindex
            if (this.getParent() && QUI.Controls.isControl(this.getParent())) {
                var ParentElm = this.getParent().getElm();

                if (ParentElm) {
                    Elm.setStyle(
                        'zIndex',
                        QUIElementUtil.getComputedZIndex(ParentElm) + 1
                    );
                }
            }

            this.$Container.setStyle('height', 0);

            Elm.setStyles({
                display: '',
                height : 0
            });

            this.refresh();

            if (this.$Active) {
                this.$Active.setActive();
            }

            this.fireEvent('show', [this]);

            return this;
        },

        /**
         * Hide the Menu, set the display style to none
         *
         * @method qui/controls/contextmenu/Menu#hide
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        hide: function () {
            // hide children menus
            var children = this.getChildren();

            for (var i = 0, len = children.length; i < len; i++) {
                if (children[i].$Menu) {
                    children[i].$Menu.hide();
                }
            }

            this.getElm().setStyles({
                display: 'none'
            });

            this.fireEvent('hide', [this]);

            return this;
        },

        /**
         * refresh the menu
         */
        refresh: function () {

            var Elm        = this.getElm(),
                Parent     = Elm.getParent(),
                scrollSize = Elm.getScrollSize();

            this.$Container.setStyle('height', scrollSize.y + 5);

            if (this.getAttribute('maxHeight')) {
                scrollSize = this.$Container.getScrollSize();

                if (scrollSize.y >= this.getAttribute('maxHeight')) {
                    Elm.setStyles({
                        height: this.getAttribute('maxHeight')
                    });

                    this.$Container.setStyles({
                        height  : this.getAttribute('maxHeight'),
                        overflow: 'auto'
                    });

                } else {
                    Elm.setStyles({
                        height: scrollSize.y
                    });

                    this.$Container.setStyle('height', scrollSize.y + 5);
                }

                scrollSize = Elm.getSize();

            } else {
                Elm.setStyle('height', scrollSize.y);
            }

            // if parent is the body element
            // context menu don't get out of the body
            this.setAttribute('menuPosLeft', false);

            if (Parent.nodeName === 'BODY') {
                var elm_pos   = Elm.getPosition(),
                    body_size = Parent.getSize();

                if (elm_pos.x + scrollSize.x + 50 > body_size.x) {
                    this.$Elm.setStyle('left', body_size.x - scrollSize.x - 50);
                }

                if (elm_pos.y + scrollSize.y + 50 > body_size.y) {
                    this.$Elm.setStyle('top', body_size.y - scrollSize.y - 50);
                }
            }
        },

        /**
         * Set the focus to the Menu, the blur event would be triggerd
         *
         * @method qui/controls/contextmenu/Menu#focus
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        focus: function () {
            this.getElm().focus();
            this.fireEvent('focus', [this]);

            return this;
        },

        /**
         * Set the Position of the Menu
         *
         * if parent is the body element
         * context menu don't get out of the body
         *
         * @method qui/controls/contextmenu/Menu#setPosition
         * @param {Number} x - from the top (x axis)
         * @param {Number}y - from the left (y axis)
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        setPosition: function (x, y) {
            if (this.$Elm) {
                this.$Elm.setStyles({
                    left: x,
                    top : y
                });
            }

            return this;
        },

        /**
         * Set and create the menu title
         *
         * @method qui/controls/contextmenu/Menu#setTitle
         * @param {String} text - Title text
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        setTitle: function (text) {
            if (this.$Container && !this.$Title) {
                this.$Title = new Element('div.qui-contextmenu-title');
                this.$Title.inject(this.$Container, 'top');
            }

            if (this.$Title) {
                this.$Title.set('html', text);
            }

            this.setAttribute('title', text);

            return this;
        },

        /**
         * Get an Child Element
         *
         * @method qui/controls/contextmenu/Menu#getChildren
         * @param {String} [name] - Name of the Children, optional, if no name given, returns all Children
         * @return {Array|Boolean|Object} List of children | false | Child (qui/controls/contextmenu/Item)
         */
        getChildren: function (name) {
            if (typeof name !== 'undefined') {
                var i, len;
                var items = this.$items;

                for (i = 0, len = items.length; i < len; i++) {
                    if (items[i].getAttribute('name') == name) {
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
         * @method qui/controls/contextmenu/Menu#firstChild
         * @return {Object|Boolean} Child (qui/controls/contextmenu/Item) | false
         */
        firstChild: function () {
            for (var i = 0, len = this.$items.length; i <= len; i++) {
                if (!this.$items[i]) {
                    continue;
                }

                if (!this.$items[i].isHidden()) {
                    return this.$items[i];
                }
            }

            return false;
        },

        /**
         * Return the first child Element
         *
         * @method qui/controls/contextmenu/Menu#firstChild
         * @return {Object|Boolean} Child (qui/controls/contextmenu/Item) | false
         */
        lastChild: function () {
            var i = this.$items.length;

            for (; i >= 0; i--) {
                if (i === 0) {
                    return false;
                }

                if (!this.$items[i]) {
                    continue;
                }

                if (!this.$items[i].isHidden()) {
                    return this.$items[i];
                }
            }

            return false;
        },

        /**
         * Return the number of children
         *
         * @method qui/controls/contextmenu/Menu#count
         * @return {Number} count of children
         */
        count: function () {
            return this.$items.length;
        },

        /**
         * Add the Child to the Menü
         *
         * @method qui/controls/contextmenu/Menu#appendChild
         * @param {Object} Child - qui/controls/contextmenu/Item
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        appendChild: function (Child) {
            if (!Child || typeof Child === 'undefined') {
                return this;
            }

            Child.setAttribute('showIcon', this.getAttribute('showIcons'));

            this.$items.push(Child);

            Child.setParent(this);

            if (this.getAttribute('dragable')) {
                Child.setAttribute('dragable', true);
            }

            if (this.$Container) {
                Child.inject(this.$Container);
            }

            return this;
        },

        /**
         * Destroy all children items
         *
         * @method qui/controls/contextmenu/Menu#clearChildren
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        clearChildren: function () {
            for (var i = 0, len = this.$items.length; i < len; i++) {
                if (this.$items[i]) {
                    this.$items[i].destroy();
                }
            }

            this.$items = [];

            return this;
        },

        /**
         * clearChildren() alternative
         *
         * @method qui/controls/contextmenu/Menu#clear
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        clear: function () {
            return this.clearChildren();
        },

        /**
         * Return the active item
         *
         * @method qui/controls/contextmenu/Menu#getActive
         * @return {Object|Boolean} Active Child (qui/controls/contextmenu/Item) | false
         */
        getActive: function () {
            return this.$Active ? this.$Active : false;
        },

        /**
         * Return the next children / item of the item
         *
         * @method qui/controls/contextmenu/Menu#getNext
         * @param {Object} Item - qui/controls/contextmenu/Item
         * @return {Object|Boolean} qui/controls/contextmenu/Item | false
         */
        getNext: function (Item) {
            var active = this.$items.filter(function (Child) {
                return !Child.isHidden();
            });

            for (var i = 0, len = active.length; i < len; i++) {
                if (active[i] != Item) {
                    continue;
                }

                if (typeof active[i + 1] !== 'undefined') {
                    return active[i + 1];
                }
            }

            return false;
        },

        /**
         * Return the previous children / item of the item
         *
         * @method qui/controls/contextmenu/Menu#getPrevious
         * @param {Object} Item - qui/controls/contextmenu/Item
         * @return {Object|Boolean} qui/controls/contextmenu/Item | false
         */
        getPrevious: function (Item) {
            var active = this.$items.filter(function (Child) {
                return !Child.isHidden();
            });

            var i = active.length - 1;

            for (; i >= 0; i--) {
                if (i === 0) {
                    return false;
                }

                if (active[i] == Item) {
                    return active[i - 1];
                }
            }

            return false;
        },

        /**
         * Deselect all children
         *
         * @method qui/controls/contextmenu/Menu#deselectItems
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        deselectItems: function () {
            if (this.$Active) {
                this.$Active = null;
            }

            return this;
        },

        /**
         * Keyup event if the menu has the focus
         * so you can select with keyboard the contextmenu items
         *
         * @method qui/controls/contextmenu/Menu#$keyup
         */
        $keyup: function (event) {
            if (event.key === 'down') {
                this.down();
                return;
            }

            if (event.key === 'up') {
                this.up(event);
                return;
            }

            if (event.key === 'enter') {
                this.select(event);
            }
        },

        /**
         * Simulate a arrow up, select the element up
         *
         * @method qui/controls/contextmenu/Menu#up
         */
        up: function () {
            if (!this.$items.length) {
                return;
            }

            var Last;

            // select last element if nothing is active
            if (!this.$Active) {
                Last = this.lastChild();
                if (Last) {
                    Last.setActive();
                    this.$Active = Last;
                }
                return;
            }

            var Prev = this.getPrevious(this.$Active);

            this.$Active.setNormal();

            if (!Prev) {
                Last = this.lastChild();
                if (Last) {
                    Last.setActive();
                    this.$Active = Last;
                }
                return;
            }

            this.$Active = Prev;
            Prev.setActive();
        },

        /**
         * Simulate a arrow down, select the element down
         *
         * @method qui/controls/contextmenu/Menu#down
         */
        down: function () {
            if (!this.$items.length) {
                return;
            }

            var First;

            // select first element if nothing is selected
            if (!this.$Active) {
                First = this.firstChild();
                if (First) {
                    First.setActive();
                    this.$Active = First;
                }
                return;
            }

            var Next = this.getNext(this.$Active);

            this.$Active.setNormal();

            if (!Next) {
                First = this.firstChild();
                if (First) {
                    First.setActive();
                    this.$Active = First;
                }
                return;
            }

            this.$Active = Next;
            Next.setActive();
        },

        /**
         * Makes a click on the active element
         *
         * @method qui/controls/contextmenu/Menu#select
         * @param {DOMEvent} [event] - optional
         */
        select: function (event) {
            // Last Element
            if (this.$Active) {
                this.$Active.fireEvent('mouseDown', [this.$Active, event]);
                this.$Active.fireEvent('click', [this.$Active, event]);
            }
        }
    });
});
