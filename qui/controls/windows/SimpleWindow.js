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
            maxWidth: 800
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

            new Element('button', {
                name: 'close',
                'class': 'fa fa-close qui-window-popup-title-close',
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
