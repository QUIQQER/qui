/**
 * A loader control
 * Creates a div with a loader animation
 *
 * @module qui/controls/loader/Loader
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/Locale
 * @require css!qui/controls/loader/Loader.css
 *
 * Global QUI Attribute
 * - control-loader-type
 * - control-loader-color
 */

define('qui/controls/loader/Loader', [

    'qui/QUI',
    'qui/controls/Control',

    'css!qui/controls/loader/Loader.css'

], function(QUI, QUIControl) {
    'use strict';

    /**
     * @class qui/controls/loader/Loader
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: QUIControl,
        Type: 'qui/controls/loader/Loader',

        options: {
            cssclass: '',     // extra CSS class
            closetime: 50000,  // seconds if the closing window showed
            styles: false,  // extra CSS styles,
            type: false,
            color: false,
            opacity: 0.8,

            loaderErrorText: 'Das Fenster reagiert nicht mehr. Um fortzufahren, klicken Sie bitte hier.'
        },

        initialize: function(options) {
            this.parent(options);

            this.$Inner = null;
            this.$Close = null;
            this.$FX = null;
            this.$delay = null;
            this.$status = 0;

            this.addEvent('onDestroy', function() {
                if (this.$Elm && this.$Elm.getParent()) {
                    this.$Elm.getParent().removeClass('qui-loader-parent');
                }
            });

            this.$animations = {
                standard: {
                    children: 8,
                    files: ['css!qui/controls/loader/Loader.standard.css']
                },

                'line-scale': {
                    children: 5,
                    files: ['css!qui/controls/loader/Loader.line-scale.css']
                },

                'ball-clip-rotate': {
                    children: 1,
                    files: ['css!qui/controls/loader/Loader.ball-clip-rotate.css']
                },

                'ball-pulse-rise': {
                    children: 5,
                    files: ['css!qui/controls/loader/Loader.ball-pulse-rise.css']
                },

                'ball-triangle-path': {
                    children: 3,
                    files: ['css!qui/controls/loader/Loader.ball-triangle-path.css']
                },

                'pacman': {
                    children: 5,
                    files: ['css!qui/controls/loader/Loader.pacman.css']
                },

                'fa-spinner': {
                    children: 1,
                    files: ['css!qui/controls/loader/Loader.fa-spinner.css']
                },

                'fa-gear': {
                    children: 1,
                    files: ['css!qui/controls/loader/Loader.fa-spinner.css']
                },

                'fa-refresh': {
                    children: 1,
                    files: ['css!qui/controls/loader/Loader.fa-spinner.css']
                },

                'fa-circle-o-notch': {
                    children: 1,
                    files: ['css!qui/controls/loader/Loader.fa-spinner.css']
                }
            };
        },

        /**
         * Create the DOMNode Element of the loader
         *
         * @method controls/loader/Loader#create
         * @return {HTMLElement}
         */
        create: function() {
            this.$Elm = new Element('div', {
                'class': 'qui-loader',
                html: '<div class="qui-loader-message"></div>' +
                    '<div class="qui-loader-inner"></div>',
                styles: {
                    display: 'none',
                    opacity: 0.8
                }
            });

            if (this.getAttribute('cssclass')) {
                this.$Elm.addClass(this.getAttribute('cssclass'));
            }

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            this.$Inner = this.$Elm.getElement('.qui-loader-inner');
            this.$Message = this.$Elm.getElement('.qui-loader-message');

            this.$FX = moofx(this.$Elm);

            return this.$Elm;
        },

        /**
         * Shows the loader
         *
         * @method controls/loader/Loader#show
         * @return {Promise}
         */
        show: function(str) {
            this.fireEvent('show', [this]);

            return new Promise((resolve) => {
                this.$status = 1;

                if (!this.$Elm) {
                    resolve();
                    return;
                }

                if (!this.$Elm.getParent()) {
                    resolve();
                    return;
                }

                if (this.$Close) {
                    this.$Close.destroy();
                    this.$Close = null;

                    this.$Elm.set({
                        html: '<div class="qui-loader-message"></div>' +
                            '<div class="qui-loader-inner"></div>'
                    });

                    this.$Inner = this.$Elm.getElement('.qui-loader-inner');
                    this.$Message = this.$Elm.getElement('.qui-loader-message');
                }

                const self = this,
                    size = this.$Elm.measure(function() {
                        return this.getSize();
                    });

                this.$Message.set('html', '');

                if (typeof str !== 'undefined') {
                    this.$Message.set({
                        html: str,
                        styles: {
                            top: (size.y + 20) / 2
                        }
                    });
                }

                // must be showed, because, hide can be triggered -> no async showed
                this.$Elm.setStyle('display', '');

                if (this.getAttribute('styles')) {
                    this.$Elm.setStyles(this.getAttribute('styles'));
                }

                this.$FX.animate({
                    opacity: this.getAttribute('opacity')
                }, {
                    duration: 200
                });

                // load animation
                let animationData = false,
                    animationType = false;

                if (this.getAttribute('type') &&
                    this.getAttribute('type') in this.$animations) {
                    animationData = this.$animations[this.getAttribute('type')];
                    animationType = this.getAttribute('type');
                }

                if (!animationType &&
                    QUI.getAttribute('control-loader-type') &&
                    QUI.getAttribute('control-loader-type') in this.$animations) {
                    animationData = this.$animations[QUI.getAttribute('control-loader-type')];
                    animationType = QUI.getAttribute('control-loader-type');
                }

                if (!animationType) {
                    animationData = this.$animations.standard;
                    animationType = 'standard';
                }

                require(animationData.files, () => {
                    if (self.$status === 0) {
                        self.hide();
                        resolve();
                        return;
                    }

                    self.$Inner.set('html', '');

                    let i, len, Child;

                    const Parent = new Element('div', {
                        'class': 'qui-loader-inner-' + animationType
                    }).inject(self.$Inner);

                    let color = self.getAttribute('color');

                    if (!color) {
                        color = QUI.getAttribute('control-loader-color');
                    }

                    if (animationType === 'fa-spinner' ||
                        animationType === 'fa-gear' ||
                        animationType === 'fa-refresh' ||
                        animationType === 'fa-circle-o-notch'
                    ) {
                        // fa 5 fallback
                        if (animationType === 'fa-circle-o-notch') {
                            animationType = animationType + ' fa-circle-notch';
                        }

                        Parent.set('html', '<span class="fas fa ' + animationType + ' fa-spin"></span>');
                        Parent.setStyle('color', color);
                    }

                    for (i = 0, len = animationData.children; i < len; i++) {
                        Child = new Element('div', {
                            'class': 'control-background'
                        }).inject(Parent);

                        if (color) {
                            Child.setStyle('background', color);
                        }
                    }

                    const ElmParent = self.$Elm.getParent();

                    if (ElmParent && !ElmParent.hasClass('qui-window-popup')) {
                        ElmParent.addClass('qui-loader-parent');
                    }

                    if (self.$status === 0) {
                        self.hide();
                        resolve();
                        return;
                    }

                    if (!self.getAttribute('closetime')) {
                        resolve();
                        return;
                    }

                    // sicherheitsabfrage nach 10 sekunden
                    if (self.$delay) {
                        clearTimeout(self.$delay);
                    }

                    self.$delay = (function() {
                        self.showCloseButton();
                    }).delay(self.getAttribute('closetime'), self);

                    resolve();
                });

            });
        },

        /**
         * Hide the loader
         *
         * @method controls/loader/Loader#hide
         * @param {Function} [callback] - callback function, trigger at animation end
         * @return {Promise}
         */
        hide: function(callback) {
            this.fireEvent('hide', [this]);

            return new Promise((resolve) => {
                this.$status = 0;

                if (this.$delay) {
                    clearTimeout(this.$delay);
                }

                if (!this.$Elm) {
                    resolve();
                    return;
                }

                if (!this.$FX) {
                    this.$Elm.setStyle('display', 'none');

                    if (typeof callback === 'function') {
                        callback();
                    }

                    resolve();
                    return;
                }

                this.$FX.animate({
                    opacity: 0
                }, {
                    duration: 200,
                    callback: () => {
                        if (this.$Elm) {
                            this.$Elm.setStyle('display', 'none');
                        }

                        this.$status = 0;

                        if (typeof callback === 'function') {
                            callback();
                        }

                        resolve();
                    }
                });
            });
        },

        /**
         * Shows the closing text in the loader
         * if the timeout is triggered
         *
         * @method controls/loader/Loader#showCloseButton
         */
        showCloseButton: function() {
            if (!this.$Elm) {
                return;
            }

            this.$Elm.set({
                html: '',
                styles: {
                    cursor: 'pointer',
                    opacity: 0.9
                }
            });

            const self = this;
            let message = this.getAttribute('loaderErrorText');

            if (QUI.getAttribute('control-loader-errorText')) {
                message = QUI.getAttribute('control-loader-errorText');
            }

            this.$Close = new Element('div', {
                text: message,
                styles: {
                    'font-weight': 'bold',
                    'text-align': 'center',
                    'margin-top': (this.$Elm.getSize().y / 2) - 100
                },
                events: {
                    click: function() {
                        self.hide();
                    }
                }
            }).inject(this.$Elm);
        }
    });
});
