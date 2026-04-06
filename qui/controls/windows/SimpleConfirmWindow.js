/**
 * SimpleWindow
 */
define('qui/controls/windows/SimpleConfirmWindow', [

    'qui/QUI',
    'qui/controls/windows/SimpleWindow',
    'css!qui/controls/windows/SimpleConfirmWindow.css'

], function (QUI, SimpleWindow) {
    'use strict';

    return new Class({

        Extends: SimpleWindow,
        Type: 'qui/controls/windows/SimpleConfirmWindow',

        Binds: [
            'create',
            'submit'
        ],

        options: {
            autoclose: true,
            maxHeight: 600,
            maxWidth: 800,
            buttonSubmit: {
                'class': 'btn btn-primary', // string
                'icon': 'fa fa-check',      // string | false
                'text': 'OK',               // string
                'order': 2,                 // int
                'orderMobile': 1            // int
            },
            buttonCancel: {
                'class': 'btn btn-link-body', // string
                'icon': 'fa fa-cancel',       // string | false
                'text': 'Cancel',             // string
                'order': 1,                   // int
                'orderMobile': 2              // int
            }
        },

        initialize: function (options) {
            this.parent(options);
        },

        create: function () {
            this.parent();

            this.$Buttons = document.createElement('div');
            this.$Buttons.classList.add('qui-window-simpleWindow__buttons');
            this.$Buttons.classList.add('qui-window-simpleConfirmWindow__buttons');

            const createButton = (name, options, onClick) => {
                if (!options) {
                    return;
                }

                const button = document.createElement('button');
                const classes = options['class'] ? options['class'].split(' ') : [];

                button.type = 'button';
                button.name = name;

                classes.forEach((className) => {
                    if (className) {
                        button.classList.add(className);
                    }
                });

                if (options.icon) {
                    const icon = document.createElement('span');
                    icon.className = options.icon;
                    button.appendChild(icon);
                }

                if (options.text) {
                    const text = document.createElement('span');
                    text.textContent = options.text;
                    button.appendChild(text);
                }

                button.addEventListener('click', onClick);

                button.style.setProperty('--button-order', parseInt(options.order, 10) || 0);
                button.style.setProperty(
                    '--button-order-mobile',
                    parseInt(options.orderMobile, 10) || parseInt(options.order, 10) || 0
                );

                this.$Buttons.appendChild(button);
            };

            createButton('submit', this.getAttribute('buttonSubmit'), this.submit);
            createButton('cancel', this.getAttribute('buttonCancel'), this.cancel.bind(this));

            this.$Elm.appendChild(this.$Buttons);

            return this.$Elm;
        },

        submit: function () {
            this.fireEvent('submit', [this]);

            if (this.getAttribute('autoclose')) {
                this.close();
            }
        }
    });
});
