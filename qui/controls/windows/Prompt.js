/**
 * Submit Fenster
 *
 * @module qui/controls/windows/Prompt
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onSubmit [ value, this ]
 * @event onEnter [ value, this ]
 * @event onCancel [ this ]
 */

define('qui/controls/windows/Prompt', [

    'qui/QUI',
    'qui/controls/windows/Popup',
    'qui/controls/buttons/Button',
    'qui/utils/Controls',

    'css!qui/controls/windows/Prompt.css'

], function(QUI, Popup, Button, Utils) {
    'use strict';

    /**
     * @class qui/controls/windows/Prompt
     *
     * @fires onDrawEnd
     * @fires onClose
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Popup,
        Type: 'qui/controls/windows/Prompt',

        options: {
            maxHeight: 300,

            check: false, // function to check the input
            autoclose: true,

            information: false,
            title: '...',
            titleicon: 'icon-remove fa fa-remove',
            icon: 'icon-remove fa fa-remove',
            value: false,

            cancel_button: {
                text: false,
                textimage: 'icon-remove fa fa-remove'
            },
            ok_button: {
                text: false,
                textimage: 'icon-ok fa fa-check'
            }
        },

        Binds: [
            '$onCreate',
            '$onOpen'
        ],

        initialize: function(options) {
            this.parent(options);

            // defaults
            if (this.getAttribute('name') === false) {
                this.setAttribute('name', 'win' + new Date().getMilliseconds());
            }

            if (this.getAttribute('width') === false) {
                this.setAttribute('width', 500);
            }

            if (this.getAttribute('height') === false) {
                this.setAttribute('height', 240);
            }

            // button texts
            var cancelText = 'Cancel',
                submitText = 'Ok',
                cancelButton = this.getAttribute('cancel_button'),
                submitButton = this.getAttribute('ok_button');

            if (QUI.getAttribute('control-windows-prompt-canceltext')) {
                cancelText = QUI.getAttribute('control-windows-prompt-canceltext');
            }

            if (QUI.getAttribute('control-windows-prompt-submittext')) {
                submitText = QUI.getAttribute('control-windows-prompt-submittext');
            }

            if (cancelButton.text === false) {
                cancelButton.text = cancelText;
            }

            if (submitButton.text === false) {
                submitButton.text = submitText;
            }

            this.setAttribute('cancel_button', cancelButton);
            this.setAttribute('ok_button', submitButton);


            this.$Input = null;
            this.$Body = null;

            this.addEvents({
                onCreate: this.$onCreate,
                onOpen: this.$onOpen
            });
        },

        /**
         * oncreate event, create the prompt box
         *
         * @method qui/controls/windows/Prompt#$onCreate
         */
        $onCreate: function() {
            var self = this,
                Content = this.getContent();

            Content.set(
                'html',

                '<div class="qui-windows-prompt">' +
                '<div class="qui-windows-prompt-icon"></div>' +
                '<div class="qui-windows-prompt-text"></div>' +
                '<div class="qui-windows-prompt-information"></div>' +
                '</div>' +
                '<div class="qui-windows-prompt-input">' +
                '<input type="text" value="" class="box" />' +
                '</div>'
            );

            this.$Icon = Content.getElement('.qui-windows-prompt-icon');
            this.$Text = Content.getElement('.qui-windows-prompt-text');
            this.$Info = Content.getElement('.qui-windows-prompt-information');

            this.$Container = Content.getElement('.qui-windows-prompt');
            this.$Input = Content.getElement('input');


            if (this.getAttribute('titleicon')) {
                var value = this.getAttribute('titleicon');

                if (Utils.isFontAwesomeClass(value)) {
                    new Element('span', {
                        'class': value
                    }).inject(this.$Icon);
                } else {
                    new Element('img.qui-windows-prompt-image', {
                        src: value,
                        styles: {
                            'display': 'block' // only image, fix
                        }
                    }).inject(this.$Icon);
                }
            }

            if (this.getAttribute('title')) {
                this.$Text.set('html', this.getAttribute('title'));
            }

            if (this.getAttribute('information')) {
                this.$Info.set('html', this.getAttribute('information'));
            }

            if (this.getAttribute('value')) {
                this.$Input.value = this.getAttribute('value');
            }

            this.$Input.addEvent('keyup', function(event) {
                if (event.key === 'enter') {
                    self.fireEvent('enter', [self.getValue(), self]);
                    self.submit();
                }
            });

            this.$Container.setStyle(
                'maxHeight',
                this.getAttribute('maxHeight') - 190
            );


            this.$Buttons.set('html', '');

            this.addButton(
                new Button({
                    text: this.getAttribute('cancel_button').text,
                    textimage: this.getAttribute('cancel_button').textimage,
                    styles: {
                        width: 150
                    },
                    events: {
                        onClick: function() {
                            self.fireEvent('cancel', [self]);
                            self.close();
                        }
                    }
                }).create()
            );

            this.addButton(
                new Button({
                    text: this.getAttribute('ok_button').text,
                    textimage: this.getAttribute('ok_button').textimage,
                    styles: {
                        width: 150
                    },
                    events: {
                        onClick: function() {
                            self.submit();
                        }
                    }
                }).create()
            );
        },

        /**
         * event : on open
         *
         * @method qui/controls/windows/Prompt#$onOpen
         */
        $onOpen: function() {
            // focus after 500 miliseconds
            (function() {
                this.$Input.focus();
            }).delay(700, this);
        },

        /**
         * Return the DOMNode input field of the prompt
         *
         * @method qui/controls/windows/Prompt#getInput
         * @returns {HTMLElement}
         */
        getInput: function() {
            return this.$Input;
        },

        /**
         * Return the value
         *
         * @method qui/controls/windows/Prompt#getValue
         * @return {String}
         */
        getValue: function() {
            if (!this.getInput()) {
                return '';
            }

            return this.getInput().value;
        },

        /**
         * Set the value of the prompt
         *
         * @method qui/controls/windows/Prompt#setValue
         * @param value
         * @return {Object} qui/controls/windows/Prompt
         */
        setValue: function(value) {
            if (!this.getInput()) {
                return this;
            }

            this.getInput().value = value;

            return this;
        },

        /**
         * Checks if a submit can be triggered
         *
         * @method qui/controls/windows/Prompt#check
         * @return {Boolean}
         */
        check: function() {
            if (this.getAttribute('check')) {
                return this.getAttribute('check')(this);
            }

            return this.$Input.value !== '';
        },

        /**
         * Submit the prompt window
         *
         * @method qui/controls/windows/Prompt#submit
         * @return {Boolean}
         */
        submit: function() {
            if (this.check() === false) {
                return false;
            }

            this.fireEvent('submit', [this.$Input.value, this]);

            if (this.getAttribute('autoclose')) {
                this.close();
            }

            return true;
        }
    });
});
