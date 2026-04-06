/**
 * SimpleWindow
 */
define('qui/controls/windows/SimpleWindow', [

    'qui/QUI',
    'qui/controls/windows/Popup',
    'css!qui/controls/windows/SimpleWindow.css'

], function (QUI, QUIPopup) {
    'use strict';

    return new Class({

        Extends: QUIPopup,
        Type: 'qui/controls/windows/SimpleWindow',

        Binds: [
            'create',
            'refreshWindowModeClasses'
        ],

        options: {
            maxHeight: 600,
            maxWidth: 800,
            contentPadding: false,
            mobileMode: 'popup', // popup | fullScreen
        },

        initialize: function (options) {
            this.parent(options);

            this.addEvents({
                resize: this.refreshWindowModeClasses
            });
        },

        create: function () {
            this.parent();

            this.$Elm.querySelector('.qui-window-popup-title').destroy();
            this.$Elm.querySelector('.qui-window-popup-buttons').destroy();

            this.$Title = document.createElement('div');
            this.$TitleText = document.createElement('div');
            this.$Buttons = document.createElement('div');
            this.$Elm.classList.add('qui-window-simpleWindow');
            this.$Content.classList.remove('qui-window-popup-content');
            this.$Content.classList.add('qui-window-simpleWindow-content');

            if (this.getAttribute('contentPadding')) {
                this.$Content.classList.add('qui-window-simpleWindow-content--withPadding');
            }

            this.refreshWindowModeClasses();

            new Element('button', {
                name: 'close',
                'class': 'btn btn-close qui-window-simpleWindow__closeBtn',
                html: '<span class="fa fa-close"></span>',
                styles: {
                    zIndex: 10
                },
                events: {
                    click: () => {
                        this.close();
                    }
                }
            }).inject(this.$Elm);

            return this.$Elm;
        },

        refreshWindowModeClasses: function () {
            if (!this.$Elm) {
                return;
            }

            const isMobile = window.matchMedia('(max-width: 767px)').matches;
            const mobileMode = isMobile ? this.getAttribute('mobileMode') : false;

            this.$Elm.classList.toggle('qui-window-simpleWindow--mobileFullScreen', mobileMode === 'fullScreen');
            this.$Elm.classList.toggle('qui-window-simpleWindow--mobilePopup', mobileMode === 'popup');
        },

        getOpeningWidth: function () {
            if (window.matchMedia('(max-width: 767px)').matches) {
                if (this.getAttribute('mobileMode') === 'fullScreen') {
                    return QUI.getWindowSize().x;
                }

                if (this.getAttribute('mobileMode') === 'popup') {
                    return Math.max(QUI.getWindowSize().x - 24, 0);
                }
            }

            return this.parent();
        },

        getOpeningHeight: function () {
            if (window.matchMedia('(max-width: 767px)').matches) {
                if (this.getAttribute('mobileMode') === 'fullScreen') {
                    return QUI.getWindowSize().y;
                }

                if (this.getAttribute('mobileMode') === 'popup') {
                    return Math.max(QUI.getWindowSize().y - 24, 0);
                }
            }

            return this.parent();
        }
    });
});
