/**
 * Column for panels
 *
 * @module qui/controls/desktop/Column
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onContextMenu [ {self}, {DOMEvent} ]
 */

define('qui/controls/desktop/Column', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/controls/desktop/Panel',
    'qui/controls/loader/Loader',
    'qui/classes/utils/DragDrop',
    'qui/controls/desktop/panels/Sheet',

    'css!qui/controls/desktop/Column.css'

], function (QUI, Control, Contextmenu, ContextmenuItem, Panel, Loader, QuiDragDrop, QUISheet) {
    "use strict";

    const RESPONSIVE_WIDTH = 50;
    const RESPONSIVE_CUT = 1200;

    /**
     * @class qui/controls/desktop/Column
     * @event onCreate [this]
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type   : 'qui/controls/desktop/Column',

        Binds: [
            '$onDestroy',
            '$onContextMenu',
            '$onPanelOpen',
            '$onPanelOpenBegin',
            '$onPanelMinimize',
            '$onPanelDestroy',
            '$clickAddPanelToColumn',
            '$onEnterRemovePanel',
            '$onLeaveRemovePanel',
            '$onClickRemovePanel',
            '$onSettingsOpen',
            '$onSettingsClose',

            '$onDragDropEnter',
            '$onDragDropLeave',
            '$onDragDropDrag',
            '$onDragDropDrop',
            '$onDragDropComplete'
        ],

        options: {
            name       : 'column',
            width      : false,
            height     : false,
            resizeLimit: [],
            closable   : false,
            placement  : 'left', // deprecated
            contextmenu: false,
            responsive : false,

            // settings
            setting_toggle: false
        },

        initialize: function (options) {
            this.parent(options);

            this.$responsiveOpen = false;

            this.$ContextMenu = null;
            this.$Elm = null;
            this.$Content = null;
            this.$Settings = null;
            this.$Highlight = null;
            this.$Responsive = null;

            this.$mode = '';
            this.$panels = {};
            this.$dragDrops = {};

            this.$SettingsButton = null;

            this.$__eventPanelOpen = false;
            this.$__unserialize = false;

            this.$fixed = true;
            this.$tmpList = []; // temp list for append Child

            this.addEvents({
                onDestroy: this.$onDestroy,

                dragDropEnter   : this.$onDragDropEnter,
                dragDropLeave   : this.$onDragDropLeave,
                dragDropDrag    : this.$onDragDropDrag,
                dragDropDrop    : this.$onDragDropDrop,
                dragDropComplete: this.$onDragDropComplete
            });
        },

        /**
         * event : destroy the column
         *
         * @method qui/controls/desktop/Column#$onDestroy
         */
        $onDestroy: function () {
            if (this.$ContextMenu) {
                this.$ContextMenu.destroy();
            }

            if (this.$Content) {
                this.$Content.destroy();
            }

            if (this.$Elm) {
                this.$Elm.destroy();
            }
        },

        /**
         * Create the DOMNode for the Column
         *
         * @method qui/controls/desktop/Column#create
         * @return {HTMLElement}
         */
        create: function () {
            const self = this;

            this.$Elm = new Element('div', {
                'class'     : 'qui-column qui-panel-drop',
                'data-quiid': this.getId(),
                events      : {
                    mouseleave: () => {
                        if (this.$responsiveOpen) {
                            const contentWidth = this.$Content.getSize().x;
                            const Sibling = this.getSibling();

                            this.$responsiveOpen = false;
                            this.resize();

                            if (Sibling) {
                                Sibling.setAttribute(
                                    'width',
                                    Sibling.getAttribute('width') + contentWidth - RESPONSIVE_WIDTH
                                );

                                Sibling.resize();
                            }
                        }
                    }
                }
            });

            if (this.getAttribute('responsive')) {
                this.$Elm.addClass('qui-column--responsive');
            }

            if (this.getAttribute('height')) {
                this.$Elm.setStyle('height', this.getAttribute('height'));
            }

            if (this.getAttribute('width')) {
                this.$Elm.setStyle('width', this.getAttribute('width'));
            }

            this.$Content = new Element('div', {
                'class': 'qui-column-content',
                styles : {
                    width: '100%'
                }
            }).inject(this.$Elm);

            this.$Responsive = new Element('div', {
                'class': 'qui-column-responsiveDisplay',
                styles : {
                    display: 'none'
                },
                events : {
                    mouseenter: () => {
                        this.$responsiveOpen = true;
                        this.$Content.setStyle('display', null);
                        this.$Responsive.setStyle('display', 'none');

                        this.setAttribute('width', 300);
                        this.resize();
                        this.open();

                        let first = '';

                        for (let i in this.$panels) {
                            this.$panels[i].getElm().setStyle('height', null);
                            this.$panels[i].minimize();

                            if (first === '') {
                                first = i;
                            }
                        }

                        this.$panels[first].open();

                        // sibling resize
                        const Sibling = this.getSibling();

                        if (!Sibling) {
                            return;
                        }

                        let width = Sibling.getAttribute('width') + RESPONSIVE_WIDTH - 6;
                        Sibling.setAttribute('width', width);
                        Sibling.resize();
                    }
                }
            }).inject(this.$Elm);


            this.$SettingsButton = new Element('div', {
                'class': 'qui-column-settingButton',
                'html' : '<span class="icon-gear fa fa-gear"></span>',
                styles : {
                    display: 'none',
                    opacity: 0
                },
                events : {
                    click     : function () {
                        self.showSettings();
                    },
                    mouseenter: function () {
                        self.highlight();
                    },
                    mouseleave: function () {
                        self.normalize();
                    }
                }
            }).inject(this.$Elm);


            this.$Highlight = new Element('div', {
                'class': 'qui-column-hightlight',
                styles : {
                    display: 'none'
                }
            }).inject(this.$Elm);


            // contextmenu
            this.$ContextMenu = new Contextmenu({
                Column: this,
                events: {
                    onBlur: function (Menu) {
                        Menu.hide();
                    }
                }
            }).inject(document.body);

            this.$ContextMenu.hide();

            this.$Elm.addEvents({
                contextmenu: this.$onContextMenu
            });

            // setting sheet
            this.$Settings = new QUISheet({
                header     : false,
                events     : {
                    onOpen : this.$onSettingsOpen,
                    onClose: this.$onSettingsClose
                },
                closeButton: {
                    text: 'schließen'
                }
            }).inject(this.$Elm);

            if (typeof this.$serialize !== 'undefined') {
                this.unserialize(this.$serialize);
            }

            // temp panels exist?
            for (let i = 0, len = this.$tmpList.length; i < len; i++) {
                this.appendChild(
                    this.$tmpList[i].Panel,
                    this.$tmpList[i].pos
                );
            }

            // this.resize();
            this.fireEvent('create', [this]);

            return this.$Elm;
        },

        /**
         * Return the data for the workspace
         *
         * @method qui/controls/desktop/Column#serialize
         * @return {Object}
         */
        serialize: function () {
            let Panel, ser;

            const panels     = this.$Content.getChildren('.qui-panel'),
                  children   = [],
                  attributes = this.getAttributes(),
                  size       = this.getElm().getSize();

            for (let i = 0, len = panels.length; i < len; i++) {
                Panel = QUI.Controls.getById(panels[i].get('data-quiid'));

                ser = Panel.serialize();
                ser.isOpen = Panel.isOpen();

                children.push(ser);
            }

            attributes.width = size.x;
            attributes.height = size.y;

            return {
                attributes: attributes,
                children  : children
            };
        },

        /**
         * Import the saved data
         *
         * @method qui/controls/desktop/Column#unserialize
         * @param {Object} data
         */
        unserialize: function (data) {
            this.setAttribute(data.attributes);

            if (!this.$Elm) {
                this.$serialize = data;
                return this;
            }

            let i, len,
                child_type, child_modul;

            const children = data.children,
                  self     = this;

            if (!children) {
                return;
            }

            this.$__unserialize = true;

            const req = [];

            for (i = 0, len = children.length; i < len; i++) {
                child_type = children[i].type;
                child_modul = child_type.replace('QUI.', '')
                                        .replace(/\./g, '/');

                req.push(child_modul);
            }

            require(req, function () {
                let regArgs = arguments;

                QUI.getMessageHandler(function (MessageHandler) {
                    let i, len, attr, height, Child, Control;
                    const opened = [];

                    for (i = 0, len = children.length; i < len; i++) {
                        Child = children[i];
                        attr = Child.attributes;
                        height = attr.height;

                        try {
                            Control = new regArgs[i](attr);
                            Control.unserialize(Child);

                            self.appendChild(Control);

                            if (Child.isOpen) {
                                opened.push(Control);
                            }

                        } catch (Exception) {
                            MessageHandler.addError(
                                Exception.toString()
                            );
                        }
                    }

                    self.$__unserialize = false;

                    Object.each(opened, function (Panel) {
                        Panel.open();
                    });

                    Object.each(self.$panels, function (Panel) {
                        Panel.resize();
                    });
                });
            }, function (err) {
                console.error(err);
            });
        },

        /**
         * fix the column
         * the panels are not more movable
         */
        fix: function () {
            this.$fixed = true;

            Object.each(this.$panels, function (Panel) {
                Panel.disableDragDrop();
                Panel.fix();
            });

            // set cursor from the column handlers to default
            const list = this.$Elm.getElements('.qui-column-hor-handle'),
                  self = this;

            for (let i = 0, len = list.length; i < len; i++) {
                list[i].setStyle('cursor', 'default');
                list[i].removeClass('qui-column-hor-handle-enabled');
            }


            // disable drag drops
            Object.each(this.$dragDrops, function (DragDrop) {
                DragDrop.disable();
            });

            this.hideSettings();

            this.$Highlight.setStyles({
                width: null
            });

            this.$Elm.removeClass('qui-task-drop');


            moofx(this.$SettingsButton).animate({
                opacity: 0
            }, {
                duration: 250,
                callback: function () {
                    self.$SettingsButton.setStyle('display', 'none');

                    moofx(self.$Content).animate({
                        width: self.$Elm.getSize().x
                    }, {
                        duration: 250,
                        equation: 'ease-out',
                        callback: function () {
                            self.$Content.setStyles({
                                boxShadow: null,
                                width    : '100%'
                            });

                            self.resize();
                        }
                    });
                }
            });
        },

        /**
         * unfix the column
         * the panels are movable, again
         */
        unfix: function () {
            let wasUnFixed = false;

            if (this.$fixed === false) {
                wasUnFixed = true;
            }

            this.$fixed = false;

            Object.each(this.$panels, function (Panel) {
                Panel.enableDragDrop();
                Panel.unfix();
            });

            // set cursor from the column handlers to default
            const self = this,
                  list = this.$Elm.getElements('.qui-column-hor-handle');

            for (let i = 0, len = list.length; i < len; i++) {
                list[i].setStyle('cursor', null);
                list[i].addClass('qui-column-hor-handle-enabled');
            }

            // enable drag drops
            Object.each(this.$dragDrops, function (DragDrop) {
                DragDrop.enable();
            });

            // show settings
            const size     = this.$Elm.getSize(),
                  settings = this.$SettingsButton.measure(function () {
                      return this.getSize();
                  });

            this.$Highlight.setStyles({
                width: size.x - 30
            });

            this.$Elm.addClass('qui-task-drop');
            this.$Content.setStyle('boxShadow', '0 0 6px 0 rgba(0, 0, 0, 0.7)');

            moofx(this.$Content).animate({
                width: size.x - settings.x
            }, {
                duration: 250,
                equation: 'ease-out',
                callback: function () {
                    self.$SettingsButton.setStyle('display', 'inline');
                    self.resize();

                    if (wasUnFixed) {
                        return;
                    }

                    moofx(self.$SettingsButton).animate({
                        opacity: 1
                    }, {
                        duration: 250
                    });
                }
            });
        },

        /**
         * Append a child to the Column
         *
         * @method qui/controls/desktop/Column#appendChild
         * @param {Object} Panel - qui/controls/desktop/Panel | qui/controls/desktop/Tasks
         * @param {Number} [pos] - optional, Position where to insert
         * @return {Object} this (qui/controls/desktop/Column)
         */
        appendChild: function (Panel, pos) {
            if (!this.isApandable(Panel)) {
                return this;
            }

            if (!this.$Content) {
                this.$tmpList.push({
                    Panel: Panel,
                    pos  : pos
                });

                return this;
            }

            let Handler      = false,
                count        = this.count(),

                columnHeight = 100,
                panelIndex   = false,
                parentIsMe   = false,
                handleList   = this.$Content.getChildren('.qui-column-hor-handle'),
                paneList     = this.$Content.getChildren('.qui-panel');

            const ChildPanel = this.getElm().getElement(
                '[data-quiid="' + Panel.getId() + '"]'
            );

            Panel.setAttribute('collapsible', true);
            Panel.getElm().setStyle('opacity', null);


            if (this.getAttribute('height')) {
                columnHeight = this.getAttribute('height');
            } else {
                columnHeight = this.$Content.getComputedSize().totalHeight;
            }

            // only sortable
            if (ChildPanel) {
                panelIndex = Array.prototype.indexOf.call(paneList, Panel.getElm());
                parentIsMe = true;

                if (typeof pos !== 'undefined') {
                    // same position, so we do nothing
                    if (pos === panelIndex) {
                        return this;
                    }

                    if ((panelIndex + 1) === pos) {
                        return this;
                    }
                }
            }

            // depend from another parent, if the panel has a parent
            if (parentIsMe === false) {
                if (Panel.getParent()) {
                    Panel.getParent().dependChild(Panel);
                }

                Panel.setParent(this);
            } else {
                // only sort, than destroy the handler
                if (Panel.getAttribute('_Handler')) {
                    Panel.getAttribute('_Handler').destroy();

                } else if (panelIndex === 0) {
                    handleList[0].destroy();
                }

                if (typeof handleList[panelIndex - 1] !== 'undefined' &&
                    handleList[panelIndex - 1].getParent()) {
                    handleList[panelIndex - 1].destroy();
                }
            }

            // create a new handler
            if (count) {
                Handler = new Element('div', {
                    'class': 'qui-column-hor-handle smooth'
                });

                Panel.setAttribute('_Handler', Handler);
            }

            // new panel events
            Panel.addEvents({
                onMinimize   : this.$onPanelMinimize,
                onOpen       : this.$onPanelOpen,
                onOpenBegin  : this.$onPanelOpenBegin,
                onResizeBegin: this.$onPanelOpenBegin,
                onDestroy    : this.$onPanelDestroy
            });

            this.$panels[Panel.getId()] = Panel;

            // insert
            if (!Panel.getAttribute('height')) {
                Panel.setAttribute('height', 200);
            }

            if (!Panel.getAttribute('height') || !count) {
                Panel.setAttribute('height', columnHeight);
            }

            // responsive button
            const icon = Panel.getAttribute('icon');
            let text = '';

            if (!icon) {
                text = Panel.getAttribute('title');
                text = text[0].toUpperCase();
            }

            new Element('div', {
                'class': 'qui-column-responsiveDisplay-button',
                html   : '<span class="' + icon + '">' + text + '</span>'
            }).inject(this.$Responsive);


            if (typeof pos === 'undefined' || handleList.length < (pos).toInt()) {
                if (Handler) {
                    Handler.inject(this.$Content);
                }

                Panel.inject(this.$Content);

            } else if ((pos).toInt() === 0) {
                if (Handler) {
                    Handler.inject(this.$Content, 'top');
                }

                Panel.inject(this.$Content, 'top');

            } else if (typeof handleList[pos - 1] !== 'undefined') {
                if (Handler) {
                    Handler.inject(handleList[pos - 1], 'after');
                }

                Panel.inject(handleList[pos - 1], 'after');
            }

            if (Handler) {
                if (!this.$fixed) {
                    Handler.addClass('qui-column-hor-handle-enabled');
                }

                this.$addHorResize(Handler);
            }

            if (this.$__unserialize) {
                Panel.minimize();
            }

            Panel.enableCollapsible();

            // drag drop?
            if (this.$fixed === false) {
                Panel.enableDragDrop();
            } else {
                Panel.disableDragDrop();
            }

            // more panels inside
            if (!count) {
                return this;
            }

            // recalc
            this.$recalcAppend(Panel);

            return this;
        },

        /**
         * event on append child - recalc panels
         *
         * @param {Object} Panel - qui/controls/desktop/Panel
         */
        $recalcAppend: function (Panel) {
            let left = this.$getLeftSpace();

            if (left === 0) {
                return;
            }

            let Prev = this.getPreviousOpenedPanel(Panel);

            if (!Prev) {
                Prev = this.getNextOpenedPanel(Panel);
            }

            if (!Prev) {
                return;
            }

            if (Prev.getElm().getSize().y + left < 50) {
                Prev.minimize();

                this.$recalcAppend(Panel);
                return;
            }

            Prev.setAttribute(
                'height',
                Prev.getElm().getSize().y + left
            );

            Prev.resize();
        },

        /**
         * Depends a panel from the column
         *
         * @method qui/controls/desktop/Column#dependChild
         * @param {Object} Panel - qui/controls/desktop/Panel
         * @return {Object} this (qui/controls/desktop/Column)
         */
        dependChild: function (Panel) {
            if (this.$panels[Panel.getId()]) {
                delete this.$panels[Panel.getId()];
            }

            // destroy the panel events
            Panel.removeEvents({
                onMinimize   : this.$onPanelMinimize,
                onOpen       : this.$onPanelOpen,
                onOpenBegin  : this.$onPanelOpenBegin,
                onResizebegin: this.$onPanelOpenBegin,
                onDestroy    : this.$onPanelDestroy
            });

            // if the panel is from this column
            const Parent = Panel.getParent();

            if (Parent) {
                Panel.getParent().$onPanelDestroy(Panel);
            }

            Panel.getElm().dispose();

            this.recalcPanels();

            return this;
        },

        /**
         * Return the column children
         *
         * @method qui/controls/desktop/Column#getChildren
         * @param {String} [name] - [optional]
         * @return {Object|Boolean} Child | false
         */
        getChildren: function (name) {
            if (typeof name === 'undefined') {
                return this.$panels;
            }

            let i;
            const items = this.$panels;

            for (i in items) {
                if (!items.hasOwnProperty(i)) {
                    continue;
                }

                if (items[i].getAttribute('name') === name) {
                    return items[i];
                }
            }

            return false;
        },

        /**
         * Panel count
         * How many panels are in the column?
         *
         * @method qui/controls/desktop/Column#count
         * @return {Number}
         */
        count: function () {
            let c, i = 0;

            for (c in this.$panels) {
                i++;
            }

            return i;
        },

        /**
         * Resize the column and all panels in the column
         *
         * @method qui/controls/desktop/Column#resize
         * @return {Object} this (qui/controls/desktop/Column)
         */
        resize: function () {
            const winWidth = QUI.getWindowSize().x;

            if (!this.isOpen()) {
                if (this.$responsiveOpen === false && this.getAttribute('responsive') && winWidth > RESPONSIVE_CUT) {                    // back to desktop
                    this.$Elm.removeClass('qui-column--is-responsive');
                    this.$Content.setStyle('display', null);
                    this.$Responsive.setStyle('display', 'none');

                    if (this.$mode === 'responsive') {
                        let first = '';

                        for (let i in this.$panels) {
                            this.$panels[i].getElm().setStyle('height', null);
                            this.$panels[i].minimize();

                            if (first === '') {
                                first = i;
                            }
                        }

                        this.$panels[first].open();
                    }

                    this.$mode = 'desktop';
                } else {
                    return this;
                }
            }

            let width  = this.getAttribute('width'),
                height = this.getAttribute('height');

            if (!width && !height) {
                return this;
            }

            if (this.$responsiveOpen === false && this.getAttribute('responsive')) {
                this.$mode = 'responsive';

                if (winWidth <= RESPONSIVE_CUT) {
                    if (this.getAttribute('originalWidth') !== RESPONSIVE_WIDTH) {
                        this.setAttribute('originalWidth', width);
                    }

                    width = RESPONSIVE_WIDTH;

                    this.$Elm.addClass('qui-column--is-responsive');
                    this.$Content.setStyle('display', 'none');
                    this.$Responsive.setStyle('display', null);
                } else {
                    this.$mode = 'desktop';

                    if (width === RESPONSIVE_WIDTH) {
                        width = 350;
                    }
                }
            }

            this.$Elm.setStyle('width', width);
            this.$Elm.setStyle('height', height);

            if (this.$fixed === false) {
                width = width - 30;
            }

            this.$Content.setStyle('width', width);
            this.$Highlight.setStyle('width', width);

            for (let i in this.$panels) {
                this.$panels[i].setAttribute('width', width);
                this.$panels[i].resize();
            }

            this.setAttribute('width', width);

            // recalc the height
            this.recalcPanels();

            return this;
        },

        /**
         * Open the column
         *
         * @method qui/controls/desktop/Column#open
         * @return {Object} this (qui/controls/desktop/Column)
         */
        open: function () {
            this.$Content.setStyle('display', null);

            // sibling resize
            const Sibling = this.getSibling();

            if (!Sibling) {
                return this;
            }

            Sibling.setAttribute(
                'width',
                Sibling.getAttribute('width') - this.getAttribute('width') + 6
            );

            Sibling.resize();

            // self refresh
            this.resize();

            return this;
        },

        /**
         * Close the column
         *
         * @method qui/controls/desktop/Column#close
         * @return {Object} this (qui/controls/desktop/Column)
         */
        close: function () {
            if (this.getAttribute('closable') === false) {
                return this;
            }

            const content_width = this.$Content.getSize().x,
                  Sibling       = this.getSibling();

            this.$Content.setStyle('display', 'none');

            // resize the sibling column
            Sibling.setAttribute(
                'width',
                Sibling.getAttribute('width') + content_width
            );

            Sibling.resize();

            return this;
        },

        /**
         * toggle the open status of the column
         * if open, then close
         * if close, the open ;-)
         *
         * @method qui/controls/desktop/Column#toggle
         * @return {Object} this (qui/controls/desktop/Column)
         */
        toggle: function () {
            if (this.isOpen()) {
                this.close();
            } else {
                this.open();
            }

            return this;
        },

        /**
         * Return the open status of the colum
         * is the column open?
         *
         * @method qui/controls/desktop/Column#isOpen
         * @return {Boolean}
         */
        isOpen: function () {
            return this.$Content.getStyle('display') !== 'none';
        },

        /**
         * Highlight the column
         *
         * @method qui/controls/desktop/Column#highlight
         * @return {Object} this (qui/controls/desktop/Column)
         */
        highlight: function () {
            if (this.$Highlight) {
                this.$Highlight.setStyle('display', null);
            }

            return this;
        },

        /**
         * Dehighlight the column
         *
         * @method qui/controls/desktop/Column#normalize
         * @return {Object} this (qui/controls/desktop/Column)
         */
        normalize: function () {
            if (this.$Highlight) {
                this.$Highlight.setStyle('display', 'none');
            }

            return this;
        },

        /**
         * Return the Sibling column control
         * it is looked to the placement
         * if no column exist, so it search the prev and next columns
         *
         * @method qui/controls/desktop/Column#getSibling
         * @return {Boolean|Object} false | qui/controls/desktop/Column
         */
        getSibling: function () {
            let Column;

            if (this.getAttribute('placement') === 'left') {
                Column = this.getElm().getNext('.qui-column');
            } else if (this.getAttribute('placement') === 'right') {
                Column = this.getElm().getPrevious('.qui-column');
            }

            if (Column) {
                return QUI.Controls.getById(Column.get('data-quiid'));
            }

            Column = this.getPrevious();

            if (Column) {
                return Column;
            }


            Column = this.getNext();

            if (Column) {
                return Column;
            }

            return false;
        },

        /**
         * Return the previous sibling
         *
         * @method qui/controls/desktop/Column#getPrevious
         * @return {Boolean|Object} false | qui/controls/desktop/Column
         */
        getPrevious: function () {
            const Prev = this.getElm().getPrevious('.qui-column');

            if (!Prev) {
                return false;
            }

            return QUI.Controls.getById(Prev.get('data-quiid'));
        },

        /**
         * Return the next sibling
         *
         * @method qui/controls/desktop/Column#getNext
         * @return {Boolean|Object} false | qui/controls/desktop/Column
         */
        getNext: function () {
            const Next = this.getElm().getNext('.qui-column');

            if (!Next) {
                return false;
            }

            return QUI.Controls.getById(Next.get('data-quiid'));
        },

        /**
         * return the next panel sibling
         *
         * @method qui/controls/desktop/Column#getNextPanel
         * @return {Boolean|Object} false | qui/controls/desktop/Panel | qui/controls/desktop/Tasks
         */
        getNextPanel: function (Panel) {
            const NextElm = Panel.getElm().getNext('.qui-panel');

            if (!NextElm) {
                return false;
            }

            const Next = QUI.Controls.getById(NextElm.get('data-quiid'));

            return Next ? Next : false;
        },

        /**
         * Get the next panel sibling which is opened
         *
         * @method qui/controls/desktop/Column#getNextOpenedPanel
         * @return {Boolean|Object} false | qui/controls/desktop/Panel | qui/controls/desktop/Tasks
         */
        getNextOpenedPanel: function (Panel) {
            const list = Panel.getElm().getAllNext('.qui-panel');

            if (!list.length) {
                return false;
            }

            let i, len, Control;

            for (i = 0, len = list.length; i < len; i++) {
                Control = QUI.Controls.getById(
                    list[i].get('data-quiid')
                );

                if (Control && Control.isOpen()) {
                    return Control;
                }
            }

            return false;
        },

        /**
         * return the previous panel sibling
         *
         * @method qui/controls/desktop/Column#getPreviousPanel
         * @return {Boolean|Object} false | qui/controls/desktop/Panel | qui/controls/desktop/Tasks
         */
        getPreviousPanel: function (Panel) {
            const PrevElm = Panel.getElm().getPrevious('.qui-panel');

            if (!PrevElm) {
                return false;
            }

            const Prev = QUI.Controls.getById(PrevElm.get('data-quiid'));

            return Prev ? Prev : false;
        },

        /**
         * return the previous panel sibling
         *
         * @method qui/controls/desktop/Column#getPreviousOpenedPanel
         * @return {Boolean|Object} false | qui/controls/desktop/Panel | qui/controls/desktop/Tasks
         */
        getPreviousOpenedPanel: function (Panel) {
            const list = Panel.getElm().getAllPrevious('.qui-panel');

            if (!list.length) {
                return false;
            }


            let i, len, Control;

            for (i = 0, len = list.length; i < len; i++) {
                Control = QUI.Controls.getById(
                    list[i].get('data-quiid')
                );

                if (Control && Control.isOpen()) {
                    return Control;
                }
            }

            return false;
        },

        /**
         * Resize all panels with the same size
         */
        adaptPanels: function () {
            let i, Panel, panelHeight;

            let list      = this.$Content.getChildren('.qui-panel'),
                handler   = this.$Content.getChildren('.qui-column-hor-handle'),
                maxHeight = this.$Content.getComputedSize().totalHeight,
                len       = list.length;

            const handlerSum = handler.getDimensions().map(function (obj) {
                return obj.y;
            }).sum();

            maxHeight = maxHeight - handlerSum;
            panelHeight = Math.ceil(maxHeight / len);

            for (i = 0; i < len; i++) {
                Panel = QUI.Controls.getById(
                    list[i].get('data-quiid')
                );

                if (maxHeight < panelHeight) {
                    panelHeight = maxHeight;
                }

                Panel.setAttribute('height', panelHeight);
                Panel.resize();

                maxHeight = maxHeight - panelHeight;
            }
        },

        /**
         * Recalc the panels, if space exist, the last panel would be resized
         */
        recalcPanels: function () {
            if (!this.count()) {
                return;
            }

            const leftSpace = this.$getLeftSpace();

            if (leftSpace === 0) {
                return;
            }

            // resize last panel
            let LastElm   = this.$Content.getLast('.qui-panel'),
                LastPanel = QUI.Controls.getById(LastElm.get('data-quiid'));

            if (LastPanel.isOpen() === false) {
                LastPanel = this.getPreviousOpenedPanel(LastPanel);
            }

            if (!LastPanel || LastPanel.isOpen() === false) {
                return;
            }

            const panelHeight = LastPanel.getElm().getSize().y;

            if (panelHeight + leftSpace < 50) {
                LastPanel.minimize();
                this.recalcPanels();
                return;
            }

            LastPanel.setAttribute('height', panelHeight + leftSpace);
            LastPanel.resize();
        },

        /**
         * Return true or false, if the object can be append into the column
         *
         * @param {Object} QO - QUI object
         */
        isApandable: function (QO) {
            switch (typeOf(QO)) {
                case 'qui/controls/desktop/Panel':
                case 'qui/controls/desktop/Tasks':
                case 'qui/controls/taskbar/Task':
                    return true;

                default:
                    return instanceOf(QO, Panel);
            }
        },

        /**
         * Panel close event
         *
         * @method qui/controls/desktop/Column#$onPanelMinimize
         * @param {Object} Panel - qui/controls/desktop/Panel
         * @ignore
         */
        $onPanelMinimize: function (Panel) {
            if (this.$__eventPanelOpen) {
                return;
            }

            let Next = this.getNextOpenedPanel(Panel);

            Panel.setAttribute('columnCloseDirection', 'next');

            if (!Next) {
                Next = this.getPreviousOpenedPanel(Panel);
                Panel.setAttribute('columnCloseDirection', 'prev');
            }

            if (!Next) {
                this.close();
                return;
            }

            const elmSize = Next.getElm().getSize().y,
                  left    = this.$getLeftSpace();

            if (elmSize + left < 50) {
                Next.minimize();
                return;
            }

            Next.setAttribute('height', elmSize + left);
            Next.resize();
        },

        /**
         * Panel open event
         *
         * @method qui/controls/desktop/Column#$onPanelOpen
         * @param {Object} Panel - qui/controls/desktop/Panel
         * @ignore
         */
        $onPanelOpen: function (Panel) {
            let leftSpace;

            if (this.getAttribute('setting_toggle')) {
                this.$__eventPanelOpen = true;

                // close all panels
                let i, len, Sibling;

                let list   = this.$Content.getChildren('.qui-panel'),
                    opened = 0;

                for (i = 0, len = list.length; i < len; i++) {
                    if (Panel.getId() != list[i].get('data-quiid')) {
                        Sibling = QUI.Controls.getById(
                            list[i].get('data-quiid')
                        );

                        if (Sibling.isOpen()) {
                            Sibling.minimize();

                            opened++;
                        }
                    }
                }

                (function () {
                    this.$__eventPanelOpen = false;
                }).delay(200, this);


                if (!opened) {
                    leftSpace = this.$getLeftSpace();

                    if (!leftSpace) {
                        return;
                    }

                    Panel.setAttribute(
                        'height',
                        Panel.getAttribute('height') + leftSpace
                    );

                    Panel.resize();
                }

                return;
            }


            // find the sibling
            let Prev        = false,
                PanelElm    = Panel.getElm(),

                direction   = Panel.getAttribute('columnCloseDirection'),
                panelHeight = PanelElm.getSize().y;


            if (direction && direction === 'next') {
                Prev = this.getNextOpenedPanel(Panel);
            }

            if (direction && direction === 'prev') {
                Prev = this.getPreviousOpenedPanel(Panel);
            }

            if (!Prev) {
                Prev = this.getPreviousOpenedPanel(Panel);
            }

            if (!Prev) {
                Prev = this.getNextOpenedPanel(Panel);
            }

            // all other panels closed
            if (!Prev) {
                // use the whole left space, if space exists
                let left = this.$getLeftSpace();

                if (!left) {
                    return;
                }

                // we have some more space
                Panel.setAttribute('height', panelHeight + left);
                Panel.resize();
                return;
            }

            // we have more panels opened, we must resized the panels
            leftSpace = this.$getLeftSpace();

            let PrevElm    = Prev.getElm(),
                prevHeight = PrevElm.getComputedSize().totalHeight,
                newHeight  = prevHeight + leftSpace;

            if (newHeight < 100) {
                Panel.setAttribute('height', panelHeight - (100 - newHeight));
                Panel.resize();

                newHeight = 100;
            }

            Prev.setAttribute('height', newHeight);
            Prev.resize();
        },

        /**
         * Panel open begins event
         *
         * @method qui/controls/desktop/Column#$onPanelOpen
         * @ignore
         */
        $onPanelOpenBegin: function () {
            this.$Content.setStyle('overflow', 'hidden');
        },

        /**
         * Return the left space, the empty space which is available
         *
         * @return {Number}
         */
        $getLeftSpace: function () {
            const childrens   = this.$Content.getChildren(),
                  contentSize = this.$Content.getSize().y;

            if (!contentSize) {
                return 0;
            }

            const sum = childrens.getSize().map(function (obj) {
                return obj.y;
            }).sum();

            return contentSize - sum;
        },

        /**
         * event: If the panel would be destroyed
         *
         * @method qui/controls/desktop/Column#$onPanelDestroy
         * @param {Object} Panel - qui/controls/desktop/Panel
         * @ignore
         */
        $onPanelDestroy: function (Panel) {
            let height, Next, Prev, Sibling;

            const pid = Panel.getId(),
                  Elm = Panel.getElm();

            if (this.$panels[pid]) {
                delete this.$panels[pid];
            }

            // find handler
            let Handler = Panel.getAttribute('_Handler');

            // the panel is the first panel
            // so the next panel handler must be destroyed
            if (!Handler && !Elm.getPrevious() && Elm.getNext()) {
                Handler = Elm.getNext();
                Next = Handler.getNext();

                if (Next && Next.get('data-quiid')) {
                    Sibling = QUI.Controls.getById(
                        Next.get('data-quiid')
                    );

                    height = Handler.getSize().y +
                             Sibling.getAttribute('height') +
                             Panel.getAttribute('height');

                    Sibling.setAttribute('height', height);
                    Sibling.setAttribute('_Handler', false);
                    Sibling.resize();
                }

                Handler.destroy();
                return;
            }

            // if the panel is the last panel
            // so the next previous handler must be destroyed
            if (!Handler && !Elm.getNext() && Elm.getPrevious()) {
                Handler = Elm.getPrevious();
                Prev = Handler.getPrevious();

                if (Prev && Prev.get('data-quiid')) {
                    Sibling = QUI.Controls.getById(
                        Prev.get('data-quiid')
                    );

                    height = Handler.getSize().y +
                             Sibling.getAttribute('height') +
                             Panel.getAttribute('height');

                    Sibling.setAttribute('height', height);
                    Sibling.setAttribute('_Handler', false);
                    Sibling.resize();
                }

                Handler.destroy();
                return;
            }


            if (!Handler || !Handler.hasClass('qui-column-hor-handle')) {
                return;
            }

            Prev = Handler.getPrevious();

            if (Prev && Prev.get('data-quiid')) {
                Sibling = QUI.Controls.getById(
                    Prev.get('data-quiid')
                );

                height = Handler.getSize().y +
                         Sibling.getAttribute('height') +
                         Panel.getAttribute('height');

                Sibling.setAttribute('height', height);
                Sibling.resize();
            }

            Handler.destroy();
        },

        /**
         * Add the horizontal resizing events to the column
         *
         * @method qui/controls/desktop/Column#$addHorResize
         * @param {HTMLElement} Handle
         */
        $addHorResize: function (Handle) {
            const pos = Handle.getPosition();

            const DragDrop = new QuiDragDrop(Handle, {
                limit : {
                    x: [
                        pos.x,
                        pos.x
                    ],
                    y: [
                        pos.y,
                        pos.y
                    ]
                },
                events: {
                    onStart: function (DragDrop, Dragable) {
                        if (!this.$Elm) {
                            return;
                        }

                        const pos   = this.$Elm.getPosition(),
                              hpos  = Handle.getPosition(),
                              limit = DragDrop.getAttribute('limit');

                        limit.y = [
                            pos.y,
                            pos.y + this.$Elm.getSize().y
                        ];

                        limit.x = [
                            hpos.x,
                            hpos.x
                        ];

                        DragDrop.setAttribute('limit', limit);

                        Dragable.setStyles({
                            height : 5,
                            padding: 0,
                            top    : hpos.y,
                            left   : hpos.x
                        });

                    }.bind(this),

                    onStop: this.$horResizeStop.bind(this)
                }
            });

            DragDrop.setAttribute('Control', this);
            DragDrop.setAttribute('Handle', Handle);

            this.$dragDrops[DragDrop.getId()] = DragDrop;
        },

        /**
         * Horizontal Drag Drop Stop
         * Helper Function
         *
         * @method qui/controls/desktop/Column#$horResizeStop
         */
        $horResizeStop: function (DragDrop, Dragable) {
            let change, newHeight;

            const Handle = DragDrop.getAttribute('Handle'),
                  pos    = Dragable.getPosition(),
                  hpos   = Handle.getPosition();

            change = pos.y - hpos.y;

            let Next         = Handle.getNext(),
                Prev         = Handle.getPrevious(),

                PrevInstance = false,
                NextInstance = false;

            if (Next) {
                NextInstance = QUI.Controls.getById(Next.get('data-quiid'));
            }

            if (Prev) {
                PrevInstance = QUI.Controls.getById(Prev.get('data-quiid'));
            }

            if (NextInstance && !NextInstance.isOpen()) {
                let NextOpened = this.getNextOpenedPanel(NextInstance);

                if (!NextOpened) {
                    NextInstance.setAttribute('height', 40);
                    NextInstance.open();
                } else {
                    NextInstance = NextOpened;
                }
            }

            if (PrevInstance && !PrevInstance.isOpen()) {
                let PrevOpened = this.getPreviousOpenedPanel(PrevInstance);

                if (!PrevOpened) {
                    PrevInstance.setAttribute('height', 40);
                    PrevInstance.open();
                } else {
                    PrevInstance = PrevOpened;
                }
            }


            if (NextInstance) {
                newHeight = NextInstance.getElm().getSize().y - change;

                if (newHeight < 50) { // panel min height
                    newHeight = 50;
                }

                NextInstance.setAttribute('height', newHeight);
                NextInstance.resize();
            }


            if (PrevInstance) {
                newHeight = PrevInstance.getElm().getSize().y + change;

                let discrepancy = 0;

                if (newHeight < 50) // panel min height
                {
                    discrepancy = 50 - newHeight;
                    newHeight = 50;
                }

                PrevInstance.setAttribute('height', newHeight);
                PrevInstance.resize();

                if (discrepancy && NextInstance) {
                    newHeight = NextInstance.getElm().getSize().y - discrepancy;

                    NextInstance.setAttribute('height', newHeight);
                    NextInstance.resize();
                }
            }

            const leftSpace = this.$getLeftSpace();

            if (leftSpace === 0) {
                return;
            }

            newHeight = PrevInstance.getAttribute('height') + leftSpace;

            PrevInstance.setAttribute('height', newHeight);
            PrevInstance.resize();
        },

        /**
         * event : on context menu
         *
         * @method qui/controls/desktop/Column#$onContextMenu
         * @param {DOMEvent} event
         * @deprecated
         */
        $onContextMenu: function (event) {
            if (this.$fixed) {
                return;
            }

            this.fireEvent('contextMenu', [
                this,
                event
            ]);


            if (!this.getAttribute('contextmenu')) {
                return;
            }

            if (!this.getParent()) {
                return;
            }

            event.stop();

            let i, len, Panel, AddPanels, RemovePanels;

            const Parent = this.getParent(),
                  panels = Parent.getAvailablePanel();


            this.$ContextMenu.clearChildren();
            this.$ContextMenu.setTitle('Column');

            // add panels
            AddPanels = new ContextmenuItem({
                text: 'Panel hinzufügen',
                name: 'add_panels_to_column'
            });

            this.$ContextMenu.appendChild(AddPanels);

            for (i = 0, len = panels.length; i < len; i++) {
                AddPanels.appendChild(
                    new ContextmenuItem({
                        text  : panels[i].text,
                        icon  : panels[i].icon,
                        name  : 'add_panels_to_column',
                        params: panels[i],
                        events: {
                            onMouseDown: this.$clickAddPanelToColumn
                        }
                    })
                );
            }

            // remove panels
            RemovePanels = new ContextmenuItem({
                text: 'Panel löschen',
                name: 'remove_panel_of_column'
            });

            this.$ContextMenu.appendChild(RemovePanels);

            for (i in this.$panels) {
                Panel = this.$panels[i];

                RemovePanels.appendChild(
                    new ContextmenuItem({
                        text  : Panel.getAttribute('title'),
                        icon  : Panel.getAttribute('icon'),
                        name  : Panel.getAttribute('name'),
                        Panel : Panel,
                        events: {
                            onActive   : this.$onEnterRemovePanel,
                            onNormal   : this.$onLeaveRemovePanel,
                            onMouseDown: this.$onClickRemovePanel
                        }
                    })
                );
            }


            this.$ContextMenu.setPosition(
                event.page.x,
                event.page.y
            ).show().focus();
        },

        /**
         * event : onclick contextmenu, add a panel
         *
         * @method qui/controls/desktop/Column#$clickAddPanelToColumn
         * @param {Object} ContextMenuItem - qui/controls/contextmenu/Item
         */
        $clickAddPanelToColumn: function (ContextMenuItem) {
            const Column = this,
                  params = ContextMenuItem.getAttribute('params');

            if (!params.require) {
                return;
            }

            require([params.require], function (Panel) {
                Column.appendChild(new Panel());
            });
        },

        /**
         * event : on mouse enter at a contextmenu item -> remove panel
         *
         * @method qui/controls/desktop/Column#$onEnterRemovePanel
         * @param {Object} Item - qui/controls/contextmenu/Item
         */
        $onEnterRemovePanel: function (Item) {
            Item.getAttribute('Panel').highlight();
        },

        /**
         * event : on mouse leave at a contextmenu item -> remove panel
         *
         * @method qui/controls/desktop/Column#$onLeaveRemovePanel
         * @param {Object} Item - qui/controls/contextmenu/Item
         */
        $onLeaveRemovePanel: function (Item) {
            Item.getAttribute('Panel').normalize();
        },

        /**
         * event : on mouse click at a contextmenu item -> remove panel
         *
         * @method qui/controls/desktop/Column#$onClickRemovePanel
         * @param {Object} Item - qui/controls/contextmenu/Item
         */
        $onClickRemovePanel: function (Item) {
            Item.getAttribute('Panel').destroy();
        },

        /**
         * DragDrop event handling
         */

        /**
         * event on drag drop enter
         *
         * @method qui/controls/desktop/Column#$onDragDropEnter
         * @param {Object} QO - (qui/controls/Control) QUI Control
         * @param {HTMLElement} Elm
         */
        $onDragDropEnter: function (QO, Elm) {
            if (!this.isApandable(QO)) {
                return;
            }


            this.$calcDragDropArrows();

            // calc the nearest
            let distance;

            let y       = Elm.getPosition().y,
                closest = null;

            for (let i in this.$ddArrowPositions) {
                distance = y - i;

                if (distance < 0) {
                    distance = distance * -1;
                }

                if (!closest || closest > distance) {
                    this.$ddArrow = this.$ddArrowPositions[i];
                    closest = distance;
                }
            }

            if (this.$ddArrow) {
                this.$ddArrow.setStyle('display', null);
            }

            this.highlight();
        },

        /**
         * event on draging
         *
         * @method qui/controls/desktop/Column#$onDragDropDrag
         * @param {Object} QO - (qui/controls/Control) QUI Control
         * @param {DOMEvent} event
         */
        $onDragDropDrag: function (QO, event) {
            const y = event.page.y;

            if (typeof this.$ddArrowPositions[y] === 'undefined') {
                return;
            }

            if (this.$ddArrow === this.$ddArrowPositions[y]) {
                return;
            }

            if (this.$ddArrow) {
                this.$ddArrow.setStyle('display', 'none');
            }

            this.$ddArrow = this.$ddArrowPositions[y];
            this.$ddArrow.setStyle('display', null);
        },

        /**
         * event : a control droped on the column
         *
         * @method qui/controls/desktop/Column#$onDragDropDrop
         * @param {Object} QO - (qui/controls/Control) QUI Control
         */
        $onDragDropDrop: function (QO) {
            if (!this.isApandable(QO)) {
                return;
            }

            if (typeOf(QO) === 'qui/controls/taskbar/Task') {
                QO = QO.getInstance();

                this.$onDragDropComplete();
            }

            if (!this.$ddArrow) {
                this.appendChild(QO);
                this.recalcPanels();

                return;
            }

            this.appendChild(QO, this.$ddArrow.get('data-arrowno'));
            this.$onDragDropLeave(QO);

            this.recalcPanels();
        },

        /**
         * event drag drop complete
         *
         * @method qui/controls/desktop/Column#$onDragDropComplete
         */
        $onDragDropComplete: function () {
            this.$clearDragDropArrows();
            this.normalize();
        },

        /**
         * event: drag drop leave
         *
         * @method qui/controls/desktop/Column#$onDragDropLeave
         */
        $onDragDropLeave: function () {
            this.$onDragDropComplete();
        },

        /**
         * calculates the position of the drag drop arrows
         * and create the drag drop arrows
         *
         * @method qui/controls/desktop/Column#$onDragDropStart
         */
        $calcDragDropArrows: function () {
            let i, y, len, Handler;

            this.$ddArrowPositions = {};

            const Elm    = this.getElm(),
                  elmPos = Elm.getPosition(),
                  list   = Elm.getElements('.qui-column-hor-handle'),
                  xPos   = elmPos.x;

            // first arrow
            this.$ddArrowPositions[elmPos.y + 10] = new Element('div', {
                'class'       : 'qui-column-drag-arrow icon-circle-arrow-left ',
                styles        : {
                    top    : elmPos.y,
                    left   : xPos,
                    display: 'none'
                },
                'data-arrowno': 0
            }).inject(document.body);

            // arrows between
            for (i = 0, len = list.length; i < len; i++) {
                Handler = list[i];
                Handler.set('data-arrowid', String.uniqueID());

                y = Handler.getPosition().y;

                this.$ddArrowPositions[y] = new Element('div', {
                    'class'       : 'qui-column-drag-arrow icon-circle-arrow-left ',
                    styles        : {
                        top    : y - 20,
                        left   : xPos,
                        display: 'none'
                    },
                    'data-arrowid': Handler.get('data-arrowid'),
                    'data-arrowno': i + 1
                }).inject(document.body);
            }


            // last arrow
            this.$ddArrowPositions[elmPos.y + Elm.getSize().y - 10] = new Element('div', {
                'class'       : 'qui-column-drag-arrow icon-circle-arrow-left ',
                styles        : {
                    top    : elmPos.y + Elm.getSize().y - 20,
                    left   : xPos,
                    display: 'none'
                },
                'data-arrowno': i + 1
            }).inject(document.body);
        },

        /**
         * event : drag drop complete
         * destroy all drag drop arrows
         *
         * @method qui/controls/desktop/Column#$onDragDropStop
         */
        $clearDragDropArrows: function () {
            let i, len, list;

            for (i in this.$ddArrowPositions) {
                if (this.$ddArrowPositions.hasOwnProperty(i)) {
                    this.$ddArrowPositions[i].destroy();
                }
            }

            this.$ddArrowPositions = {};

            // clean handler ids
            list = this.getElm().getElements('.qui-column-hor-handle');

            for (i = 0, len = list.length; i < len; i++) {
                list[i].set('data-arrowid', null);
            }
        },

        /**
         * Settings
         */

        /**
         * Show settings
         * only showable if column is unfix
         */
        showSettings: function () {
            if (this.$fixed) {
                return;
            }

            if (!this.$Settings) {
                return;
            }

            this.$Settings.show();
        },

        /**
         * Hide settings
         */
        hideSettings: function () {
            if (!this.$Settings) {
                return;
            }

            this.$Settings.hide();
        },

        /**
         * event : on setting open
         */
        $onSettingsOpen: function (Sheet) {
            const Content = Sheet.getContent();

            Content.set({
                'class': 'qui-column-settings-content',
                html   : '<h1>Einstellungen für die Panelspalte</h1>' +
                         '<label>' +
                         '<input type="checkbox" name="setting_toggle" />' +
                         'Nur immer ein Panel offen halten' +
                         '</label>'
            });

            if (this.getAttribute('setting_toggle')) {
                Content.getElement('[name="setting_toggle"]').checked = true;
            }
        },

        /**
         * event : on setting close
         */
        $onSettingsClose: function (Sheet) {
            const self    = this,
                  Content = Sheet.getContent();

            Content.getElements('input').each(function (Elm) {
                if (Elm.type === 'checkbox') {
                    self.setAttribute(Elm.get('name'), !!Elm.checked);
                    return;
                }

                self.setAttribute(Elm.get('name'), Elm.get('value'));
            });
        }
    });
});
