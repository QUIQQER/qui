/**
 * A Panel
 * A Panel is like a container for apps.
 *
 * @module qui/controls/desktop/Panel
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/loader/Loader
 * @require qui/controls/toolbar/Bar
 * @require qui/controls/buttons/Seperator
 * @require qui/controls/buttons/Button
 * @require qui/controls/desktop/panels/Sheet
 * @require qui/controls/breadcrumb/Bar
 * @require qui/controls/contextmenu/Menu
 * @require qui/utils/Controls
 * @require css!qui/controls/desktop/Panel.css
 *
 * @event onCreate [ this ]
 * @event onOpen [ this ]
 * @event onOpenBegin [ this ]
 * @event onMinimize [ this ]
 * @event onRefresh [ this ]
 * @event onResize [ this ]
 * @event onResizeBegin [ this ]
 * @event onDragDropStart [ this ]
 * @event dragDropComplete [ this ]
 * @event onDrag [ this, event, Element ]
 * @event onCategoryEnter [ this, Category ]
 * @event onCategoryLeave [ this, Category ]
 */

define('qui/controls/desktop/Panel', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/controls/toolbar/Bar',
    'qui/controls/buttons/Seperator',
    'qui/controls/buttons/Button',
    'qui/controls/desktop/panels/Sheet',
    'qui/controls/breadcrumb/Bar',
    'qui/controls/contextmenu/Menu',
    'qui/utils/Controls',

    'css!qui/controls/desktop/Panel.css'

], function (QUI, Control, Loader, Toolbar, Seperator, Button, PanelSheet, BreadcrumbBar, QUIContextmenu, Utils) {
    "use strict";

    /**
     * @class qui/controls/desktop/Panel
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type   : 'qui/controls/desktop/Panel',

        Binds: [
            '$onDestroy'
        ],

        options: {
            '#id'  : false,
            name   : 'qui-desktop-panel',
            content: false,

            // header
            header: true,      // true to create a panel header when panel is created
            title : false,     // the title inserted into the panel's header
            icon  : false,

            // footer
            footer: false,     // true to create a panel footer when panel is created

            // Style options:
            height    : '100%',      // the desired height of the panel, if false, it use the parent height
            'class'   : '',         // css class to add to the main panel div
            scrollbars: true,       // true to allow scrollbars to be shown

            // Other:
            collapsible   : true,   // can the panel be collapsed
            collapseFooter: true,   // collapse footer when panel is collapsed

            closeable  : true, // can be the panel destroyed?
            closeButton: false, // display a close button
            dragable   : true,  // is the panel dragable to another column?
            breadcrumb : false,
            toWindow   : false
        },

        initialize: function (options) {
            this.$uid = String.uniqueID();
            this.parent(options);

            this.Loader = new Loader();

            this.$Elm     = null;
            this.$Header  = null;
            this.$Title   = null;
            this.$Footer  = null;
            this.$Content = null;

            this.$Buttons     = null;
            this.$Categories  = null;
            this.$Breadcrumb  = null;
            this.$ContextMenu = null;
            this.$CloseButton = null;

            this.$ButtonBar     = null;
            this.$CategoryBar   = null;
            this.$BreadcrumbBar = null;
            this.$ActiveCat     = null;
            this.$Dropable      = null;

            this.addEvents({
                onDestroy     : this.$onDestroy,
                onSetAttribute: function (key, value) {

                    if (this.$Header && key === 'closeButton') {

                        if (value === true && !this.$CloseButton) {
                            this.$CloseButton = new Button({
                                icon  : 'icon-remove',
                                styles: {
                                    'float': 'right'
                                },
                                events: {
                                    onClick: function () {
                                        this.destroy();
                                    }.bind(this)
                                }
                            }).inject(this.$Header);

                            return;
                        }

                        if (value === false && this.$CloseButton) {
                            this.$CloseButton.destroy();
                        }
                    }

                }.bind(this)
            });
        },

        /**
         * Create the DOMNode Element for the panel
         *
         * @method qui/controls/desktop/Panel#create
         * @return {HTMLElement}
         */
        create: function () {
            if (this.$Elm) {
                return this.$Elm;
            }

            this.$Elm = new Element('div', {
                'data-quiid': this.getId(),
                'class'     : 'qui-panel box',
                tabindex    : -1,

                styles: {
                    height: this.getAttribute('height')
                },

                html: '<div class="qui-panel-header box"></div>' +
                      '<div class="qui-panel-buttons box"></div>' +
                      '<div class="qui-panel-categories box"></div>' +
                      '<div class="qui-panel-content box"></div>' +
                      '<div class="qui-panel-footer box"></div>'
            });

            this.Loader.inject(this.$Elm);

            this.$Header     = this.$Elm.getElement('.qui-panel-header');
            this.$Footer     = this.$Elm.getElement('.qui-panel-footer');
            this.$Content    = this.$Elm.getElement('.qui-panel-content');
            this.$Buttons    = this.$Elm.getElement('.qui-panel-buttons');
            this.$Categories = this.$Elm.getElement('.qui-panel-categories');

            if (this.getAttribute('breadcrumb')) {
                this.$Breadcrumb = new Element('div', {
                    'class': 'qui-panel-breadcrumb box'
                }).inject(this.$Buttons, 'after');
            }

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            this.$Content.setStyle('display', null);
            this.$Buttons.setStyle('display', 'none');
            this.$Categories.setStyle('display', 'none');

            if (this.getAttribute('content')) {
                this.$Content.set('html', this.getAttribute('content'));
            }

            if (this.getAttribute('collapsible')) {
                this.enableCollapsible();
            }

            // drag & drop
            if (this.getAttribute('dragable')) {
                this.enableDragDrop();
            }

            // content params
            this.$refresh();
            this.fireEvent('create', [this]);

            return this.$Elm;
        },

        /**
         * Refresh the panel
         *
         * @method qui/controls/desktop/Panel#refresh
         * @return {Object} this (qui/controls/desktop/Panel)
         */
        refresh: function () {
            this.resize();
            this.fireEvent('refresh', [this]);
            this.$refresh();

            return this;
        },

        /**
         * Refresh helper
         *
         * @method qui/controls/desktop/Panel#$refresh
         * @ignore
         * @private
         */
        $refresh: function () {
            if (!this.$Title) {
                this.$Icon = new Element('span.qui-panel-icon').inject(
                    this.$Header
                );

                this.$Title = new Element('h2.qui-panel-title').inject(
                    this.$Header
                );
            }

            if (this.getAttribute('title')) {
                this.$Title.set('html', this.getAttribute('title'));
            }

            if (this.getAttribute('footer')) {
                this.$Footer.setStyle('display', null);
            } else {
                this.$Footer.setStyle('display', 'none');
            }

            if (this.getAttribute('icon')) {
                var path = this.getAttribute('icon');

                if (Utils.isFontAwesomeClass(path)) {
                    var css = this.$Icon.className;
                    css     = css.replace(/\bicon-\S+/g, '');

                    this.$Icon.className = css;
                    this.$Icon.addClass(path);

                } else {
                    new Element('img', {
                        src: path
                    }).inject(this.$Icon);
                }
            }


            this.setAttribute('closeButton', this.getAttribute('closeButton'));
        },

        /**
         * Execute a resize and repaint
         *
         * @method qui/controls/desktop/Panel#resize
         * @return {Object} this (qui/controls/desktop/Panel)
         */
        resize: function () {
            var self = this;

            this.fireEvent('resizeBegin', [this]);

            if (this.getAttribute('header') === false) {
                this.$Header.setStyle('display', 'none');
            } else {
                this.$Header.setStyle('display', null);
            }

            if (this.getAttribute('footer') === false) {
                this.$Footer.setStyle('display', 'none');
            } else {
                this.$Footer.setStyle('display', null);
            }

            if (this.getButtonBar().count()) {
                this.$Buttons.setStyle('display', null);
            } else {
                this.$Buttons.setStyle('display', 'none');
            }


            if (this.isOpen() === false) {
                this.fireEvent('resize', [this]);
                return this;
            }


            if (this.getAttribute('styles') &&
                this.getAttribute('styles').height) {
                this.setAttribute('height', this.getAttribute('styles').height);
            }

            var content_height = this.getAttribute('height'),
                overflow       = 'auto',
                buttonsSize    = this.$Buttons.getSize();

            // height calc
            if (content_height.toString().match('%')) {
                var Parent = this.$Elm.getParent() || document.body;

                content_height = ( content_height ).toInt();
                content_height = Parent.getSize().y * ( content_height / 100 );
            }

            content_height = content_height -
                             buttonsSize.y - 2 -
                             this.$Footer.getSize().y - 1 -
                             this.$Header.getSize().y;

            if (this.$Breadcrumb) {
                content_height = content_height - this.$Breadcrumb.getSize().y;
            }

            if (this.getAttribute('scrollbars') === false) {
                overflow = 'hidden';
            }

            if (this.$CategoryBar) {
                this.$Categories.setStyle('height', content_height);
                this.$CategoryBar.setAttribute('height', content_height);
                this.$CategoryBar.resize();
            }

            if (this.$ButtonBar) {
                this.$ButtonBar.resize();
            }

            moofx(this.$Elm).animate({
                height: this.getAttribute('height')
            }, {
                duration: 250,
                equation: 'ease-out',
                callback: function () {
                    // set proportions
                    self.$Content.setStyles({
                        overflow: overflow,
                        height  : content_height
                    });

                    self.fireEvent('resize', [self]);
                }
            });

            return this;
        },

        /**
         * fix the panel
         * the panel are not more editable - the method can be overwritten, its a placeholder for child panels
         */
        fix: function () {

        },

        /**
         * unfix the panel
         * the panel is editable - the method can be overwritten, its a placeholder for child panels
         */
        unfix: function () {

        },

        /**
         * Open the Panel
         *
         * @method qui/controls/desktop/Panel#open
         * @param {Function} [callback] - optional, callback function
         * @return {Object} this (qui/controls/desktop/Panel)
         */
        open: function (callback) {
            var self = this;

            this.fireEvent('openBegin', [this]);

            this.$Content.setStyle('display', null);
            this.$Header.removeClass('qui-panel-close');

            if (this.$Collaps) {
                this.$Collaps.removeClass('qui-panel-expand');
                this.$Collaps.removeClass('icon-chevron-right');

                this.$Collaps.addClass('qui-panel-collapse');
                this.$Collaps.addClass('icon-chevron-down');
            }

            moofx(this.$Elm).animate({
                height: this.getAttribute('height')
            }, {
                duration: 200,
                equation: 'ease-out',
                callback: function () {
                    self.fireEvent('open', [self]);
                    self.resize();

                    if (typeof callback !== 'undefined') {
                        callback();
                    }
                }
            });

            return this;
        },

        /**
         * Minimize / Collapse the panel
         *
         * @method qui/controls/desktop/Panel#minimize
         * @param {Function} [callback] - optional, callback function
         * @return {Object} this (qui/controls/desktop/Panel)
         */
        minimize: function (callback) {
            var self = this;

            this.fireEvent('minimizeBegin', [this]);

            this.$Content.setStyle('display', 'none');
            this.$Footer.setStyle('display', 'none');
            this.$Buttons.setStyle('display', 'none');

            if (this.$Collaps) {
                this.$Collaps.removeClass('qui-panel-collapse');
                this.$Collaps.removeClass('icon-chevron-down');

                this.$Collaps.addClass('qui-panel-expand');
                this.$Collaps.addClass('icon-chevron-right');
            }

            this.$Header.addClass('qui-panel-close');


            moofx(this.$Elm).animate({
                height: this.$Header.getSize().y
            }, {
                duration: 200,
                equation: 'ease-out',
                callback: function () {
                    self.fireEvent('minimize', [self]);
                    self.resize();

                    if (typeof callback !== 'undefined') {
                        callback();
                    }
                }
            });

            return this;
        },

        /**
         * Toggle the panel
         * Close the panel if the panel is opened and open the panel if the panel is closed
         *
         * @method qui/controls/desktop/Panel#toggle
         * @return {Object} this (qui/controls/desktop/Panel)
         */
        toggle: function () {
            if (this.getAttribute('collapsible') === false) {
                return this;
            }

            if (this.isOpen()) {
                this.minimize();
            } else {
                this.open();
            }

            return this;
        },

        /**
         * Is the Panel open?
         *
         * @method qui/controls/desktop/Panel#isOpen
         * @return {Boolean}
         */
        isOpen: function () {
            if (!this.$Content) {
                return false;
            }

            return this.$Content.getStyle('display') != 'none';
        },

        /**
         * Highlight the column
         *
         * @method qui/controls/desktop/Panel#highlight
         * @return {Object} this (qui/controls/desktop/Panel)
         */
        highlight: function () {
            if (!this.getElm()) {
                return this;
            }

            new Element('div.qui-panel-highlight').inject(
                this.getElm()
            );

            return this;
        },

        /**
         * Dehighlight the column
         *
         * @method qui/controls/desktop/Panel#normalize
         * @return {Object} this (qui/controls/desktop/Panel)
         */
        normalize: function () {
            if (!this.getElm()) {
                return this;
            }

            this.getElm().getElements('.qui-panel-highlight').destroy();

            return this;
        },

        /**
         * @deprecated
         * @method qui/controls/desktop/Panel#getBody
         */
        getBody: function () {
            return this.getContent();
        },

        /**
         * Return the Content ( Body ) DOMNode Element
         *
         * @method qui/controls/desktop/Panel#getBody
         * @return {null|HTMLElement}
         */
        getContent: function () {
            return this.$Content;
        },

        /**
         * Set the Content
         *
         * @method qui/controls/desktop/Panel#setContent
         * @param {String} content - HTML String
         * @return {Object} this (qui/controls/desktop/Panel)
         */
        setContent: function (content) {
            this.$Content.set('html', content);

            return this;
        },

        /**
         * Return the Footer DOMNode Element
         *
         * @method qui/controls/desktop/Panel#getFooter
         * @return {null|HTMLElement}
         */
        getFooter: function () {
            return this.$Footer;
        },

        /**
         * Set the Footer
         *
         * @method qui/controls/desktop/Panel#setFooter
         * @param {String} content - HTML String
         * @return {Object} this (qui/controls/desktop/Panel)
         */
        setFooter: function (content) {
            this.$Footer.set('html', content);

            return this;
        },

        /**
         * Return the Title DOMNode Element
         *
         * @method qui/controls/desktop/Panel#getHeader
         * @return {null|HTMLElement}
         */
        getHeader: function () {
            return this.$Header;
        },

        /**
         * Add an action button to the Panel
         * This is a button top of the panel
         *
         * @method qui/controls/desktop/Panel#addButton
         * @param {Object|HTMLElement} Btn - qui/controls/buttons/Buttons | qui/controls/buttons/Seperator | Object params
         * @return {Object} this (qui/controls/desktop/Panel)
         */
        addButton: function (Btn) {
            if (!QUI.Controls.isControl(Btn) && typeOf(Btn) !== 'element') {
                if (Btn.type == 'seperator' ||
                    Btn.type == 'QUI\\Controls\\Buttons\\Seperator') {
                    Btn = new Seperator(Btn);
                } else {
                    Btn = new Button(Btn);
                }
            }

            this.getButtonBar().appendChild(Btn);

            // if first children, then resize
            if (this.getButtonBar().count() == 1) {
                this.resize();
            }

            return this;
        },

        /**
         * Return the children
         *
         * @method @method qui/controls/desktop/Panel#getButtons
         * @param {String} [name] - optional, name of the wanted Element
         *                          if no name given, all children will be return
         * @return {Array}
         */
        getButtons: function (name) {
            if (!this.$ButtonBar) {
                return [];
            }

            return this.$ButtonBar.getChildren(name);
        },

        /**
         * Return the button bar of the pannel
         *
         * @method qui/controls/desktop/Panel#getButtonBar
         * @return {Object} qui/controls/toolbar/Bar
         */
        getButtonBar: function () {
            if (!this.$ButtonBar) {
                this.$Buttons.setStyle('display', null);

                this.$ButtonBar = new Toolbar({
                    slide        : false,
                    type         : 'buttons',
                    'menu-button': false,
                    mousewheel   : false
                }).inject(this.$Buttons);
            }

            return this.$ButtonBar;
        },

        /**
         * Add an category button to the Panel
         * This is a button left of the panel
         *
         * @method qui/controls/desktop/Panel#addCategory
         * @param {Object} Btn - qui/controls/buttons/Buttons | button params
         * @return {Object} this (qui/controls/desktop/Panel)
         */
        addCategory: function (Btn) {
            if (typeof Btn.getType === 'undefined') {
                Btn = new Button(Btn);
            }

            var self = this;

            Btn.addEvents({

                onClick: function (Btn) {
                    if (self.$ActiveCat && self.$ActiveCat == Btn) {
                        return;
                    }

                    self.fireEvent('categoryLeave', [self, self.$ActiveCat]);

                    Btn.setActive();
                },

                onActive: function (Btn) {
                    if (self.$ActiveCat && self.$ActiveCat == Btn) {
                        return;
                    }

                    if (self.$ActiveCat) {
                        self.$ActiveCat.setNormal();
                    }

                    self.$ActiveCat = Btn;
                    self.fireEvent('categoryEnter', [self, Btn]);
                }

            });

            this.getCategoryBar().appendChild(Btn);
            this.getElm().addClass('qui-panel-width-categories');

            return this;
        },

        /**
         * Return a category children
         *
         * @method qui/controls/desktop/Panel#getCategory
         * @param {String} [name] - optional, name of the wanted Element
         *                          if no name given, all children will be return
         * @return {Array}
         */
        getCategory: function (name) {
            if (!this.$CategoryBar) {
                return [];
            }

            return this.$CategoryBar.getChildren(name);
        },

        /**
         * Return the Category bar object
         *
         * @method qui/controls/desktop/Panel#getCategoryBar
         * @return {Object} qui/controls/toolbar/Bar
         */
        getCategoryBar: function () {
            if (!this.$CategoryBar) {
                this.$Categories.setStyle('display', null);

                this.$CategoryBar = new Toolbar({
                    width        : 190,
                    slide        : false,
                    type         : 'buttons',
                    vertical     : true,
                    'menu-button': false,
                    events       : {
                        onClear: function () {
                            this.$ActiveCat = null;
                        }.bind(this)
                    }
                }).inject(this.$Categories);
            }

            return this.$CategoryBar;
        },

        /**
         * Minimize the category bar
         *
         * @return Promise
         */
        minimizeCategory: function () {
            var CategoryBar = this.getCategoryBar();

            CategoryBar.setAttribute('width', 50);
            CategoryBar.resize();

            return new Promise(function (resolve) {

                this.$Categories.addClass('qui-panel-categories-minimize');

                moofx(this.$Categories).animate({
                    width: 50
                }, {
                    duration: 250,
                    equation: 'cubic-bezier(.42,.4,.46,1.29)',
                    callback: function () {

                        this.resize();
                        resolve();

                    }.bind(this)
                });

            }.bind(this));
        },

        /**
         * Maximize the category bar
         *
         * @return Promise
         */
        maximizeCategory: function () {
            return new Promise(function (resolve) {

                moofx(this.$Categories).animate({
                    width: 190
                }, {
                    duration: 250,
                    equation: 'cubic-bezier(.42,.4,.46,1.29)',
                    callback: function () {

                        this.$Categories.removeClass('qui-panel-categories-minimize');

                        var CategoryBar = this.getCategoryBar();

                        CategoryBar.setAttribute('width', 190);
                        CategoryBar.resize();

                        this.resize();

                        resolve();

                    }.bind(this)
                });

            }.bind(this));
        },

        /**
         * Return the active category
         *
         * @method qui/controls/desktop/Panel#getActiveCategory
         * @return {Object} qui/controls/buttons/Buttons
         */
        getActiveCategory: function () {
            return this.$ActiveCat;
        },

        /**
         * Return the Breacrumb bar object
         *
         * @method qui/controls/desktop/Panel#getBreadcrumb
         * @return {Object} qui/controls.breadcrumb.Bar
         */
        getBreadcrumb: function () {
            if (!this.$BreadcrumbBar) {
                this.$BreadcrumbBar = new BreadcrumbBar({
                    name: 'panel-breadcrumb-' + this.getId()
                }).inject(this.$Breadcrumb);
            }

            return this.$BreadcrumbBar;
        },

        /**
         * Return the panel contextmenu
         *
         * @method qui/controls/desktop/Panel#getContextMenu
         * @return {qui/controls/contextmenu/Menu}
         */
        getContextMenu: function () {
            if (this.$ContextMenu) {
                return this.$ContextMenu;
            }

            // context menu
            this.$ContextMenu = new QUIContextmenu({
                title : this.getAttribute('title'),
                events: {
                    blur: function (Menu) {
                        Menu.hide();
                    }
                }
            });

            this.$ContextMenu.inject(document.body);

            return this.$ContextMenu;
        },

        /**
         * Create a sheet in the panel and open it
         *
         * @method qui/controls/desktop/Panel#createSheet
         * @param {Object} [options] - optional, Sheet options
         * @return {Object} qui/controls/panels/Sheet
         */
        createSheet: function (options) {
            var self  = this,
                Sheet = new PanelSheet(options);

            var resize = function () {
                Sheet.resize();
            };

            Sheet.addEvent('onDestroy', function () {
                self.removeEvent('onResize', resize);
            });

            this.addEvent('onResize', resize);

            Sheet.inject(this.$Elm);

            return Sheet;
        },

        /**
         * Enable collapsible
         */
        enableCollapsible: function () {
            this.setAttribute('collapsible', true);

            if (this.$Collaps) {
                return;
            }

            var self = this;

            this.$Collaps = new Element('div', {
                'class': 'qui-panel-collapse icon-chevron-down'
            }).inject(this.$Header);

            this.$Header.setStyle('cursor', 'pointer');

            this.$Header.addEvent('click', function () {
                self.toggle();
            });
        },

        /**
         * Disable collapsible
         */
        disableCollapsible: function () {
            this.setAttribute('collapsible', false);

            if (!this.$Collaps) {
                return;
            }

            this.$Collaps.destroy();
            this.$Header.setStyle('cursor', 'default');
            this.$Header.removeEvent('click');
        },

        /**
         * Enable the dragdrop
         */
        enableDragDrop: function () {
            this.setAttribute('dragable', true);

            if (this.$Header) {
                this.$Header.setStyle('cursor', 'move');
            }

            if (this.$Dropable) {
                this.$Dropable.enable();
                return;
            }

            var self = this;

            this.$getDragable(function () {
                if (self.getAttribute('dragable')) {
                    self.$Dropable.enable();
                } else {
                    self.$Dropable.disable();
                }
            });
        },

        /**
         * Disable the dragdrop
         */
        disableDragDrop: function () {
            this.setAttribute('dragable', false);

            if (this.$Header) {
                this.$Header.setStyle('cursor', 'default');
            }

            if (this.$Dropable) {
                this.$Dropable.disable();
            }
        },

        /**
         * Return the Dragable Object
         *
         * @method qui/controls/desktop/Panel#$getDragable
         * @param {Function} callback - Callback function( {DragDrop} )
         */
        $getDragable: function (callback) {
            if (this.$Dropable) {
                callback(this.$Dropable);
                return;
            }

            if (typeof this.$_dragDropExec !== 'undefined') {
                (function () {
                    this.$getDragable(callback);
                }).delay(20, this);

                return;
            }

            this.$_dragDropExec = true;

            var self = this;

            require(['qui/classes/utils/DragDrop'], function (DragDrop) {
                var DragDropParent = null;

                self.$Dropable = new DragDrop(self.$Header, {
                    dropables: '.qui-panel-drop',
                    cssClass : 'radius5',
                    styles   : {
                        width : 100,
                        height: 150
                    },
                    events   : {
                        onStart: function (Dragable, Element, event) {
                            self.fireEvent('dragDropStart', [self, Element, event]);
                        },

                        onComplete: function () {
                            self.fireEvent('dragDropComplete', [self]);
                        },

                        onDrag: function (Dragable, Element, event) {
                            self.fireEvent('drag', [self, event]);

                            if (DragDropParent) {
                                DragDropParent.fireEvent('dragDropDrag', [self, event]);
                            }
                        },

                        onEnter: function (Dragable, Element, Dropable) {
                            var quiid = Dropable.get('data-quiid');

                            if (!quiid) {
                                return;
                            }

                            DragDropParent = QUI.Controls.getById(quiid);

                            if (DragDropParent) {
                                DragDropParent.fireEvent('dragDropEnter', [self, Element]);
                            }
                        },

                        onLeave: function (Dragable, Element) {
                            if (DragDropParent) {
                                DragDropParent.fireEvent('dragDropLeave', [self, Element]);
                                DragDropParent = null;
                            }
                        },

                        onDrop: function (Dragable, Element, Dropable, event) {
                            if (!Dropable) {
                                return;
                            }

                            if (DragDropParent) {
                                DragDropParent.fireEvent('dragDropDrop', [self, Element, Dropable, event]);
                            }
                        }
                    }
                });

                callback(self.$Dropable);
            });
        },

        /**
         * Event: on panel destroy
         *
         * @method qui/controls/desktop/Panel#$onDestroy
         */
        $onDestroy: function () {
            var destroy = [
                this.$Header,
                this.$Title,
                this.$Footer,
                this.$Content,
                this.$Buttons,
                this.$ButtonBar,
                this.$CategoryBar,
                this.$ActiveCat,
                this.$BreadcrumbBar,
                this.$ContextMenu
            ];

            for (var i = 0, len = destroy.length; i < len; i++) {
                if (destroy[i] && "destroy" in destroy[i]) {
                    destroy[i].destroy();
                }
            }
        }
    });
});
