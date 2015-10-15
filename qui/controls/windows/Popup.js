/**
 * A popup window
 *
 * @module qui/controls/windows/Popup
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require qui/controls/utils/Background
 * @require qui/controls/loader/Loader
 * @require qui/Locale
 * @require qui/utils/Controls
 * @require qui/controls/windows/locale/de
 * @require qui/controls/windows/locale/en
 * @require css!qui/controls/windows/Popup.css
 * @require css!qui/controls/buttons/Button.css
 *
 * @event onOpen [ self ]
 * @event onOpenBegin [ self ]
 * @event onClose [ self ]
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
                                                       FunctionsUtils) {

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
                onDestroy : function() {
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
                new Element('div', {
                    'class': 'icon-remove fa fa-remove',
                    styles : {
                        cursor    : 'pointer',
                        'float'   : 'right',
                        lineHeight: 17,
                        width     : 17
                    },
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
            if (this.getAttribute('buttons') && this.getAttribute('closeButton')) {
                var Submit = new Element('button', {
                    html   : '<span>' + this.getAttribute('closeButtonText') + '</span>',
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


                this.$Buttons.setStyles({
                    'float'  : 'left',
                    height   : 50,
                    margin   : '0 auto',
                    opacity  : 0,
                    textAlign: 'center',
                    width    : '100%'
                });
            }

            if (!this.getAttribute('buttons')) {
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
         * @return Promise
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
            this.$oldBodyStyle = {
                overflow: document.body.style.overflow,
                position: document.body.style.position,
                width   : document.body.style.width,
                top     : document.body.style.top,
                scroll  : document.body.getScroll(),
                minWidth: document.body.style.minWidth
            };

            document.body.setStyles({
                width   : document.body.getSize().x,
                minWidth: document.body.getSize().x
            });

            document.body.setStyles({
                overflow: 'hidden',
                position: 'absolute'
            });

            this.$opened = true;

            new Fx.Scroll(document.body).set(0, this.$oldBodyStyle.scroll.y);

            this.getElm().setStyle('position', 'fixed');

            this.fireEvent('openBegin', [this]);

            return new Promise(function(resolve) {

                this.resize(true, function () {

                    this.fireEvent('open', [this]);

                    if (typeof callback === 'function') {
                        callback();
                    }

                    resolve();

                }.bind(this));

            }.bind(this));
        },

        /**
         * Resize the popup
         *
         * @method qui/controls/windows/Popup#resize
         * @param {Boolean} [withfx] - deprecated
         * @param {Function} [callback]
         */
        resize: function (withfx, callback) {
            if (!this.$Elm) {
                return;
            }

            if (this.$scroll) {
                return;
            }

            if (!this.$opened) {
                return this.open(callback);
            }

            this.fireEvent('resizeBegin', [this]);

            var self     = this,
                doc_size = document.body.getSize(),
                width    = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                height   = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            if (width > this.getAttribute('maxWidth')) {
                width = this.getAttribute('maxWidth');
            }

            if (height > this.getAttribute('maxHeight')) {
                height = this.getAttribute('maxHeight');
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

            this.$FX.animate({
                height : height,
                width  : width,
                left   : left,
                top    : top,
                opacity: 1
            }, {
                duration: 300,
                equation: 'ease-out',
                callback: function () {
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
                }
            });
        },

        /**
         * Close the popup
         *
         * @method qui/controls/windows/Popup#close
         * @return Promise
         */
        close: function () {

            QUI.removeEvent('resize', this.resize);

            window.removeEvent('touchstart', this.$__scrollSpy);
            window.removeEvent('touchend', this.$__scrollDelay);

            // set old body attributes
            if (typeof this.$oldBodyStyle !== 'undefined') {
                document.body.setStyles({
                    overflow: this.$oldBodyStyle.overflow || null,
                    position: this.$oldBodyStyle.position || null,
                    width   : this.$oldBodyStyle.width || null,
                    top     : this.$oldBodyStyle.top || null,
                    minWidth: this.$oldBodyStyle.minWidth || null
                });

                document.body.scrollTo(
                    this.$oldBodyStyle.scroll.x,
                    this.$oldBodyStyle.scroll.y
                );
            }

            this.$opened = false;

            return new Promise(function(resolve) {

                if (!this.$Elm) {
                    resolve();
                    return;
                }

                var self = this;

                this.$FX.animate({
                    top    : this.$Elm.getPosition().y + 100,
                    opacity: 0
                }, {
                    duration: 200,
                    equation: 'ease-out',
                    callback: function () {
                        self.fireEvent('close', [self]);

                        self.$Elm.destroy();
                        self.Background.hide();

                        resolve();
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

            if (typeOf(Elm) != 'element') {
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
         * @return {Object} qui/controls/windows/Popup
         */
        hideButtons: function () {
            if (!this.$Buttons) {
                return this;
            }

            this.$Buttons.setStyle('display', 'none');
        },

        /**
         * show the button line
         *
         * @method qui/controls/windows/Popup#showButtons
         * @return {Object} qui/controls/windows/Popup
         */
        showButtons: function () {
            if (!this.$Buttons) {
                return this;
            }

            this.$Buttons.setStyle('display', '');
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

                if (Control && Control.getAttribute('name') == name) {
                    return Control;
                }
            }

            return false;
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
