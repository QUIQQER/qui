/**
 * A popup window
 *
 * @module qui/controls/windows/Popup
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onOpen [ self ]
 * @event onOpenBegin [ self ]
 * @event onClose [ self ]
 * @event onCloseBegin [ self ]
 * @event onCreate [ self ]
 * @event onResize [ self ]
 * @event onResizeBegin [ self ]
 */

var needle = [
    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/utils/Background',
    'qui/controls/loader/Loader',
    'qui/Locale',
    'qui/utils/Controls',
    'qui/utils/Functions',
    'qui/utils/System',

    'qui/controls/windows/locale/de',
    'qui/controls/windows/locale/en',

    'css!qui/controls/windows/Popup.css'
];

if (!("QUI" in window) || !window.QUI.getAttribute('control-buttons-dont-load-css')) {
    needle.push('css!qui/controls/buttons/Button.css');
}


define('qui/controls/windows/Popup', needle, function (QUI,
                                                       Control,
                                                       Background,
                                                       Loader,
                                                       Locale,
                                                       Utils,
                                                       FunctionsUtils,
                                                       SystemUtils) {

    "use strict";

    /**
     * @class qui/controls/windows/Popup
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type   : 'qui/controls/windows/Popup',

        Binds: [
            'resize',
            'cancel'
        ],

        options: {
            maxWidth          : 900,	// {integer} [optional]max width of the window
            maxHeight         : 600,	// {integer} [optional]max height of the window
            content           : false,	// {string} [optional] content of the window
            icon              : false,	// {false|string} [optional] icon of the window
            title             : false,	// {false|string} [optional] title of the window
            'class'           : false,
            backgroundClosable: true, // {bool} [optional] closes the window on click? standard = true

            // buttons
            buttons         : true, // {bool} [optional] show the bottom button line
            closeButton     : true, // {bool} show the close button
            closeButtonText : Locale.get('qui/controls/windows/Popup', 'btn.close'),
            titleCloseButton: true  // {bool} show the title close button
        },

        initialize: function (options) {
            this.parent(options);

            var self = this;

            this.$Elm     = null;
            this.$Content = null;
            this.$Buttons = null;
            this.$FX      = false;
            this.$opened  = false;
            this.$scroll  = false;

            this.Background = new Background();
            this.Loader     = new Loader();


            // button texts
            var closeText = QUI.getAttribute('control-windows-popup-closetext');

            if (this.getAttribute('closeButtonText')) {
                closeText = this.getAttribute('closeButtonText');
            }

            this.setAttribute('closeButtonText', closeText);


            this.$__scrollDelay = FunctionsUtils.debounce(function () {
                self.$scroll = false;
            }, 300);

            this.$__scrollSpy = function () {
                if (this.$opened) {
                    self.$scroll = true;
                }
            };

            QUI.Windows.register(this);

            this.addEvents({
                onDestroy: function () {
                    self.Loader.destroy();
                    self.Background.destroy();
                }
            });
        },

        /**
         * Create the DOMNode Element
         *
         * @method qui/controls/windows/Popup#create
         * @return {HTMLElement}
         */
        create: function () {
            if (this.$Elm) {
                return this.$Elm;
            }

            var self = this;

            this.$Elm = new Element('div', {
                'class' : 'qui-window-popup box',
                html    : '<div class="qui-window-popup-title box">' +
                '<div class="qui-window-popup-title-icon"></div>' +
                '<div class="qui-window-popup-title-text"></div>' +
                '</div>' +
                '<div class="qui-window-popup-content box"></div>' +
                '<div class="qui-window-popup-buttons box"></div>',
                tabindex: -1,
                styles  : {
                    opacity: 0
                }
            });

            this.$FX = moofx(this.$Elm);

            this.$Title     = this.$Elm.getElement('.qui-window-popup-title');
            this.$Icon      = this.$Elm.getElement('.qui-window-popup-title-icon');
            this.$TitleText = this.$Elm.getElement('.qui-window-popup-title-text');
            this.$Content   = this.$Elm.getElement('.qui-window-popup-content');
            this.$Buttons   = this.$Elm.getElement('.qui-window-popup-buttons');

            this.$Content.setStyle('opacity', 0);

            if (this.getAttribute('titleCloseButton')) {
                new Element('button', {
                    name   : 'close',
                    'class': 'fa fa-close qui-window-popup-title-close',
                    events : {
                        click: function () {
                            self.cancel();
                        }
                    }
                }).inject(this.$Title);
            }

            // icon
            var path = this.getAttribute('icon');

            if (path && Utils.isFontAwesomeClass(path)) {
                this.$Icon.addClass(path);

            } else if (path) {
                new Element('img', {
                    src: path
                }).inject(this.$Icon);
            }

            // title
            if (this.getAttribute('title')) {
                this.$TitleText.set('html', this.getAttribute('title'));
            }

            if (!this.getAttribute('title') && !this.getAttribute('icon')) {
                this.$Title.setStyle('display', 'none');
            }

            // bottom buttons
            if (this.getAttribute('buttons')) {
                this.$Buttons.setStyles({
                    'float'  : 'left',
                    height   : 50,
                    margin   : '0 auto',
                    opacity  : 0,
                    textAlign: 'center',
                    width    : '100%'
                });

                if (this.getAttribute('closeButton')) {
                    var Submit = new Element('button', {
                        html   : '<span>' + this.getAttribute('closeButtonText') + '</span>',
                        name   : 'close',
                        'class': 'qui-button btn-red',
                        events : {
                            click: this.cancel
                        },
                        styles : {
                            display  : 'inline',
                            'float'  : 'none',
                            width    : 150,
                            textAlign: 'center'
                        }
                    });

                    Submit.inject(this.$Buttons);
                }
            } else {
                this.$Buttons.setStyle('display', 'none');
            }

            if (this.getAttribute('content')) {
                this.setContent(this.getAttribute('content'));
            }

            if (this.getAttribute('class')) {
                this.$Elm.addClass(this.getAttribute('class'));
            }

            this.Loader.inject(this.$Elm);

            this.fireEvent('create', [this]);

            return this.$Elm;
        },

        /**
         * Refresh the window
         *
         * @method qui/controls/windows/Popup#refresh
         */
        refresh: function () {
            // icon
            var path = this.getAttribute('icon');

            if (path && Utils.isFontAwesomeClass(path)) {
                this.$Icon.addClass(path);

            } else if (path) {
                this.$Icon.set('html', '');

                new Element('img', {
                    src: path
                }).inject(this.$Icon);
            }

            // title
            if (this.getAttribute('title')) {
                this.$TitleText.set('html', this.getAttribute('title'));
            }

            if (!this.getAttribute('title') && !this.getAttribute('icon')) {
                this.$Title.setStyle('display', 'none');
            }
        },

        /**
         * Open the popup
         *
         * @method qui/controls/windows/Popup#open
         *
         * @param {Function} [callback] - callback function
         * @return {Promise}
         */
        open: function (callback) {
            this.Background.create();

            if (this.getAttribute('backgroundClosable')) {
                this.Background.getElm().addEvent(
                    'click',
                    this.cancel
                );
            }

            this.Background.show();
            this.inject(document.body);

            QUI.addEvent('resize', this.resize);

            window.addEvent('touchstart', this.$__scrollSpy);
            window.addEvent('touchend', this.$__scrollDelay);


            // touch body fix
            QUI.Windows.calcWindowSize();

            document.body.setStyles({
                width   : document.body.getSize().x,
                minWidth: document.body.getSize().x
            });

            document.body.setStyles({
                overflow: 'hidden',
                position: 'absolute'
            });

            // ios 4 detection
            var ios = SystemUtils.iOSversion();

            if (ios) {
                document.body.setStyles({
                    overflow           : 'hidden',
                    position           : 'fixed',
                    top                : document.body.getScroll().y * -1,
                    '-webkit-transform': 'translateZ(0)'
                });

                var Background = this.Background.getElm();

                Background.setStyle('opacity', 0);
                Background.setStyle('top', document.body.getStyle('top').toInt() * -1);

                moofx(this.Background.getElm()).animate({
                    opacity: 0.6
                });

            } else {
                new Fx.Scroll(document.body).set(0, document.body.getScroll().y);
            }

            this.$opened = true;

            this.getElm().setStyles({
                position: 'fixed',
                top     : 0,
                width   : this.getOpeningWidth()
            });

            this.fireEvent('openBegin', [this]);

            return new Promise(function (resolve) {

                var execute = (function () {
                    this.resize(true, function () {

                        this.fireEvent('open', [this]);

                        if (typeof callback === 'function') {
                            callback();
                        }

                        resolve();

                    }.bind(this));
                }.bind(this));


                if (ios) {
                    // ios rendering bugs because of overflow hidden ... *sigh*
                    execute.delay(250, this);
                    return;
                }

                execute();

            }.bind(this));
        },

        /**
         * Resize the popup
         *
         * @method qui/controls/windows/Popup#resize
         * @param {Boolean} [withfx] - deprecated
         * @param {Function} [callback]
         * @return {Promise}
         */
        resize: function (withfx, callback) {
            if (!this.$Elm) {
                return Promise.resolve();
            }

            if (this.$scroll) {
                return Promise.resolve();
            }

            if (!this.$opened) {
                return this.open(callback);
            }

            this.fireEvent('resizeBegin', [this]);

            var self     = this,
                doc_size = QUI.getWindowSize(),
                height   = this.getOpeningHeight(),
                width    = this.getOpeningWidth();

            var ios = SystemUtils.iOSversion();

            if (ios) {
                if (doc_size.y > QUI.getBodySize().y) {
                    doc_size.y = QUI.getBodySize().y;
                }
            }

            var top  = (doc_size.y - height) / 2;
            var left = (doc_size.x - width) / 2;

            if (top < 0) {
                top = 0;
            }

            var pos  = this.$Elm.getPosition(),
                size = this.$Elm.getSize();

            if (pos.x === 0) {
                this.$Elm.setStyle('left', left);
            }

            if (pos.y === 0 && top !== 0) {
                this.$Elm.setStyle('top', top - 50);
            }

            if (size.x === 0) {
                this.$Elm.setStyle('width', width);
            }

            // ios fix
            if (ios) {
                top = top + (document.body.getStyle('top').toInt() * -1);

                // background ios fix - orientation change
                var Background = this.Background.getElm();

                Background.setStyles({
                    top  : document.body.getStyle('top').toInt() * -1,
                    width: doc_size.x
                });
            }

            // content height
            var containerHeight = self.$Buttons.getSize().y + self.$Title.getSize().y;

            self.$Content.setStyles({
                height: 'calc(100% - ' + containerHeight + 'px)'
            });

            return new Promise(function (resolve) {
                var execute = false;

                this.$FX.animate({
                    height : height,
                    left   : left,
                    opacity: 1,
                    top    : top,
                    width  : width
                }, {
                    duration: 200,
                    callback: function () {
                        execute = true;

                        // content height
                        var content_height = self.$Elm.getSize().y -
                            self.$Buttons.getSize().y -
                            self.$Title.getSize().y;

                        self.$Content.setStyles({
                            height : content_height,
                            opacity: null
                        });

                        self.$Buttons.setStyle('opacity', null);

                        //self.$Elm.focus();
                        self.fireEvent('resize', [self]);

                        if (typeof callback === 'function') {
                            callback();
                        }

                        resolve();
                    }
                });

                /**
                 * Fallback for a bug with moofx that does not execute the callback
                 * if the style of the element already matches the target values.
                 */
                setTimeout(function () {
                    if (!execute) {
                        if (typeof callback === 'function') {
                            callback();
                        }

                        resolve();
                    }
                }, 300);

            }.bind(this));
        },

        /**
         * Close the popup
         *
         * @method qui/controls/windows/Popup#close
         * @return {Promise}
         */
        close: function () {
            QUI.removeEvent('resize', this.resize);

            window.removeEvent('touchstart', this.$__scrollSpy);
            window.removeEvent('touchend', this.$__scrollDelay);

            return new Promise(function (resolve) {
                if (!this.$Elm) {
                    this.$opened = false;
                    resolve();
                    return;
                }

                var self = this;

                this.fireEvent('closeBegin', [self]);

                this.$FX.animate({
                    top    : this.$Elm.getPosition().y + 100,
                    opacity: 0
                }, {
                    duration: 200,
                    callback: function () {
                        self.$Elm.destroy();
                        self.$Elm = null;

                        self.Background.hide(function () {
                            self.Background.destroy();

                            self.$opened = false;
                            self.fireEvent('close', [self]);

                            resolve();
                        });
                    }
                });

            }.bind(this));
        },

        /**
         * Close the popup and fire the cancel event
         *
         * @method qui/controls/windows/Popup#cancel
         */
        cancel: function () {
            this.fireEvent('cancel', [this]);
            this.close();
        },

        /**
         * Is th window opened?
         * @returns {boolean}
         */
        isOpened: function () {
            return this.$opened;
        },

        /**
         * Return the content DOMNode
         *
         * @method qui/controls/windows/Popup#getContent
         * @return {HTMLElement} DIV
         */
        getContent: function () {
            return this.$Content;
        },

        /**
         * set the content of the popup
         *
         * @method qui/controls/windows/Popup#setContent
         * @return {String} html
         */
        setContent: function (html) {
            this.getContent().set('html', html);
        },

        /**
         * Add a Element to the button bar
         *
         * @method qui/controls/windows/Popup#addButton
         * @param {Object} Elm - {} or qui/controls/buttons/Button
         * @return {Object} qui/controls/windows/Popup
         */
        addButton: function (Elm) {
            if (!this.$Buttons) {
                return this;
            }

            var Node = Elm;

            Elm.inject(this.$Buttons, 'top');

            if (typeOf(Elm) !== 'element') {
                Node = Elm.getElm();
            }

            Node.setStyles({
                display: 'inline',
                'float': 'none'
            });

            this.$Buttons.setStyles({
                height: 50
            });

            return this;
        },

        /**
         * hide the button line
         *
         * @method qui/controls/windows/Popup#hideButtons
         * @return {Promise}
         */
        hideButtons: function () {
            var self = this;

            return new Promise(function (resolve) {
                var buttonHeight = self.$Buttons.getSize().y;

                self.$Buttons.setStyle('bottom', 0);
                self.$Buttons.setStyle('position', 'absolute');

                var containerHeight = self.$Title.getSize().y;

                self.$Content.setStyle(
                    'height',
                    'calc(100% - ' + containerHeight + 'px)'
                );

                moofx(self.$Buttons).animate({
                    bottom: buttonHeight * -1
                }, {
                    duration: 200,
                    callback: function () {
                        self.$Buttons.setStyle('display', 'none');
                        resolve();
                    }
                });
            });
        },

        /**
         * show the button line
         *
         * @method qui/controls/windows/Popup#showButtons
         * @return {Promise}
         */
        showButtons: function () {
            var self = this;

            return new Promise(function (resolve) {
                self.$Buttons.setStyle('display', null);
                self.$Buttons.setStyle('display', null);

                var containerHeight = self.$Buttons.getSize().y + self.$Title.getSize().y;

                moofx(self.$Content).animate({
                    height: 'calc(100% - ' + containerHeight + 'px)'
                }, {
                    duration: 200,
                    callback: function () {
                        self.$Buttons.setStyle('position', 'absolute');

                        moofx(self.$Buttons).animate({
                            bottom: 0
                        }, {
                            callback: function () {
                                resolve();
                            }
                        });
                    }
                });
            });
        },

        /**
         * Return the wanted button
         *
         * @param {String} name - name of the button
         * @returns {Boolean|Object} - qui/controls/buttons/Button
         */
        getButton: function (name) {
            var list = this.$Buttons.getElements('[data-quiid]');

            for (var i = 0, len = list.length; i < len; i++) {
                Control = QUI.Controls.getById(list[i].get('data-quiid'));

                if (Control && Control.getAttribute('name') === name) {
                    return Control;
                }
            }

            return false;
        },

        /**
         * Return the opening width
         *
         * @returns {number}
         */
        getOpeningWidth: function () {
            var width = QUI.getWindowSize().x;

            if (width > this.getAttribute('maxWidth')) {
                width = this.getAttribute('maxWidth');
            }

            return width;
        },

        /**
         * Return the opening height
         *
         * @returns {number}
         */
        getOpeningHeight: function () {
            var height = QUI.getWindowSize().y;

            if (height > this.getAttribute('maxHeight')) {
                height = this.getAttribute('maxHeight');
            }

            return height;
        },

        /**
         * create and open a new sheet
         *
         * @method qui/controls/windows/Popup#openSheet
         * @param {Function} onfinish - callback function
         */
        openSheet: function (onfinish) {
            var Sheet = new Element('div', {
                'class': 'qui-window-popup-sheet box',
                html   : '<div class="qui-window-popup-sheet-content box"></div>' +
                '<div class="qui-window-popup-sheet-buttons box">' +
                '<div class="back button btn-white">' +
                '<span>' +
                Locale.get(
                    'qui/controls/windows/Popup',
                    'btn.back'
                ) +
                '</span>' +
                '</div>' +
                '</div>',
                styles : {
                    left: '-110%'
                }
            }).inject(this.$Elm);

            Sheet.getElement('.back').addEvent(
                'click',
                function () {
                    Sheet.fireEvent('close');
                }
            );

            Sheet.addEvent('close', function () {
                moofx(Sheet).animate({
                    left: '-100%'
                }, {
                    callback: function () {
                        Sheet.destroy();
                    }
                });
            });

            // heights
            var Content = Sheet.getElement('.qui-window-popup-sheet-content');

            Content.setStyles({
                height: Sheet.getSize().y - 80
            });


            // effect
            moofx(Sheet).animate({
                left: 0
            }, {
                callback: function () {
                    onfinish(Content, Sheet);
                }
            });
        }
    });
});
