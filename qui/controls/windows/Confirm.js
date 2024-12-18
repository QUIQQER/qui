/**
 * Submit Window
 *
 * @module qui/controls/windows/Confirm
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onSubmit
 * @event onCancel
 */

define('qui/controls/windows/Confirm', [

    'qui/QUI',
    'qui/controls/windows/Popup',
    'qui/controls/buttons/Button',
    'qui/utils/Controls',

    'css!qui/controls/windows/Confirm.css'

], function(QUI, QUIPopup, QUIButton, Utils) {
    'use strict';

    /**
     * @class qui/controls/windows/Confirm
     *
     * @fires onDrawEnd
     * @fires onClose
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: QUIPopup,
        Type: 'qui/controls/windows/Confirm',

        Binds: [
            '$onOpen'
        ],

        options: {
            'maxHeight': 300,
            'autoclose': true,

            'information': false,
            'title': '...',
            'texticon': 'icon-remove fa fa-remove',
            'icon': 'icon-remove fa fa-remove',

            cancel_button: {
                text: false,
                textimage: 'fa fa-remove'
            },

            ok_button: {
                text: false,
                textimage: 'fa fa-check'
            }
        },

        initialize: function(options) {
            var self = this;

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

            if (QUI.getAttribute('control-windows-confirm-canceltext')) {
                cancelText = QUI.getAttribute('control-windows-confirm-canceltext');
            }

            if (QUI.getAttribute('control-windows-confirm-submittext')) {
                submitText = QUI.getAttribute('control-windows-confirm-submittext');
            }

            if (cancelButton && cancelButton.text === false) {
                cancelButton.text = cancelText;
            }

            if (submitButton && submitButton.text === false) {
                submitButton.text = submitText;
            }

            this.setAttribute('cancel_button', cancelButton);
            this.setAttribute('ok_button', submitButton);

            if (QUI.getAttribute('control-windows-cancel-no-button')) {
                this.setAttribute('cancel_button', false);
            }

            // on set attribute event
            // if attributes were set after creation
            this.addEvent('onSetAttribute', function(attr, value) {
                if (!self.$Body) {
                    return;
                }

                if (!self.$Body.getElement('.textbody')) {
                    return;
                }

                if (attr === 'texticon') {
                    var Texticon = self.$Body.getElement('.texticon'),
                        Textbody = self.$Body.getElement('.textbody');

                    if (!Texticon) {
                        Texticon = new Element('div.texticon');
                        Texticon.inject(Textbody, 'before');
                    }

                    Textbody.set({
                        styles: {
                            width: null,
                            fontSize: null
                        },
                        src: null
                    });

                    Texticon.className = 'texticon';

                    if (Utils.isFontAwesomeClass(value)) {
                        Texticon.addClass(value);
                        Texticon.setStyles({
                            fontSize: 50
                        });
                    } else {
                        Texticon.src = value;
                    }

                    return;
                }

                if (attr === 'information') {
                    self.$Body.getElement('.information').set('html', value);

                    return;
                }

                if (attr === 'text') {
                    self.$Body.getElement('.text').set('html', value);
                }
            });

            this.$Body = null;
            this.$Win = null;
            this.$Buttons = null;
        },

        /**
         * Create the body for the submit window
         *
         * @method qui/controls/windows/Confirm#open
         */
        open: function() {
            this.create();

            var self = this,
                Content = this.getContent();

            Content.setStyles({
                padding: 20
            });

            this.$Body = new Element('div.submit-body', {
                html: '<div class="textbody">' +
                    '<h2 class="text">&nbsp;</h2>' +
                    '<div class="information">&nbsp;</div>' +
                    '</div>',
                styles: {
                    'float': 'left',
                    width: '100%'
                }
            });

            this.$Body.inject(Content);

            if (this.getAttribute('texticon')) {
                this.setAttribute('texticon', this.getAttribute('texticon'));
            }

            if (this.getAttribute('text')) {
                this.setAttribute('text', this.getAttribute('text'));
            }

            if (this.getAttribute('information')) {
                this.setAttribute('information', this.getAttribute('information'));
            }

            if (!this.getAttribute('texticon') && !this.getAttribute('text') && !this.getAttribute('information')) {
                this.$Body.destroy();
            }

            this.$Buttons.set('html', '');

            if (this.getAttribute('cancel_button')) {
                this.addButton(
                    new QUIButton({
                        name: 'cancel',
                        text: this.getAttribute('cancel_button').text,
                        textimage: this.getAttribute('cancel_button').textimage,
                        'class': 'qui-button-cancel btn-light',
                        styles: {
                            'float': 'none'
                        },
                        events: {
                            onClick: this.cancel
                        }
                    })
                );
            }

            if (this.getAttribute('ok_button')) {
                this.addButton(
                    new QUIButton({
                        name: 'submit',
                        text: this.getAttribute('ok_button').text,
                        textimage: this.getAttribute('ok_button').textimage,
                        'class': 'qui-button-success btn-success',
                        styles: {
                            'float': 'none'
                        },
                        events: {
                            onClick: function() {
                                self.submit();
                            }
                        }
                    })
                );
            }

            var buttons = this.$Buttons.getElements('button');

            buttons.set('tabindex', 1);
            buttons.set('unselectable', null);
            buttons.setStyle('outline', null);

            if (buttons.length) {
                (function() {
                    buttons[0].focus();
                }).delay(200);
            }

            this.parent();
        },

        /**
         * Submit the window
         *
         * @method qui/controls/windows/Confirm#submit
         */
        submit: function() {
            this.fireEvent('submit', [this]);

            if (this.getAttribute('autoclose')) {
                this.close();
            }
        }
    });
});
