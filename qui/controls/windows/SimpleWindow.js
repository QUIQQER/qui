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
            'create'
        ],

        options: {
            maxHeight: 600,
            maxWidth: 800,
            contentPadding: false,
        },

        initialize: function (options) {
            this.parent(options);
        },

        create: function () {
            this.parent();

            this.$Elm.querySelector('.qui-window-popup-title').destroy();
            this.$Elm.querySelector('.qui-window-popup-buttons').destroy();

            this.$Title = document.createElement('div');
            this.$TitleText = document.createElement('div');
            this.$Buttons = document.createElement('div');
            this.$Content.classList.remove('qui-window-popup-content');
            this.$Content.classList.add('qui-window-simpleWindow-content');

            if (this.getAttribute('contentPadding')) {
                this.$Content.classList.add('qui-window-simpleWindow-content--withPadding');
            }

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
        }
    });
});
