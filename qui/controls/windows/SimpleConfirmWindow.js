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
                'class': 'btn btn-primary',
                'icon': 'fa fa-check',
                'text': 'OK',
                'order': 2,
                'orderMobile': 1
            },
            buttonCancel: {
                'class': 'btn btn-link-body',
                'icon': 'fa fa-cancel',
                'text': 'Cancel',
                'order': 1,
                'orderMobile': 2
            }
        },

        initialize: function (options) {
            this.parent(options);
        },

        getDefaultButtonSubmit: function () {
            return {
                'class': 'btn btn-primary',
                'icon': 'fa fa-check',
                'text': 'OK',
                'order': 2,
                'orderMobile': 1
            };
        },

        getDefaultButtonCancel: function () {
            return {
                'class': 'btn btn-link-body',
                'icon': 'fa fa-cancel',
                'text': 'Cancel',
                'order': 1,
                'orderMobile': 2
            };
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

            const buttonSubmit = this.getAttribute('buttonSubmit');
            const buttonCancel = this.getAttribute('buttonCancel');

            createButton(
                'submit',
                buttonSubmit === false
                    ? false
                    : Object.merge({}, this.getDefaultButtonSubmit(), buttonSubmit || {}),
                this.submit
            );
            createButton(
                'cancel',
                buttonCancel === false
                    ? false
                    : Object.merge({}, this.getDefaultButtonCancel(), buttonCancel || {}),
                this.cancel.bind(this)
            );

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
