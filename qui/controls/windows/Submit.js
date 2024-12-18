/**
 * Submit windows
 *
 * @module qui/controls/windows/Submit
 * @author www.pcsg.de (Henning Leutz)
 *
 * @fires onSubmit
 * @fires onCancel
 */

define('qui/controls/windows/Submit', [

    'qui/QUI',
    'qui/controls/windows/Popup',
    'qui/controls/buttons/Button',

    'css!qui/controls/windows/Submit.css'

], function(QUI, Popup, Button) {
    'use strict';

    /**
     * @class qui/controls/windows/Submit
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
        Type: 'qui/controls/windows/Submit',

        options: {
            'maxHeight': 300,
            'autoclose': true,

            'information': false,
            'title': '...',
            'titleicon': 'icon-remove fa fa-remove',
            'icon': 'icon-remove fa fa-remove',

            cancel_button: {
                text: false,
                textimage: 'icon-remove fa fa-remove'
            },
            ok_button: {
                text: false,
                textimage: 'icon-ok fa fa-check'
            }
        },

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

            if (QUI.getAttribute('control-windows-submit-canceltext')) {
                cancelText = QUI.getAttribute('control-windows-submit-canceltext');
            }

            if (QUI.getAttribute('control-windows-submit-submittext')) {
                submitText = QUI.getAttribute('control-windows-submit-submittext');
            }

            if (cancelButton.text === false) {
                cancelButton.text = cancelText;
            }

            if (submitButton.text === false) {
                submitButton.text = submitText;
            }

            this.setAttribute('cancel_button', cancelButton);
            this.setAttribute('ok_button', submitButton);

            // on set attribute event
            // if attributes were set after creation
            this.addEvent('onSetAttribute', function(attr, value) {
                if (!this.$Body.getElement('.textbody')) {
                    return;
                }

                if (attr === 'texticon') {
                    Asset.image(value, {
                        onLoad: function(Node) {
                            var Texticon = this.$Body.getElement('.texticon'),
                                Textbody = this.$Body.getElement('.textbody');

                            if (!Texticon) {
                                Texticon = new Element('img.texticon');
                                Texticon.inject(Textbody, 'before');
                            }

                            Textbody.setStyle(
                                'width',
                                this.$Body.getSize().x - Node.width - 20
                            );

                            Texticon.src = value;

                        }.bind(this)
                    });

                    return;
                }

                if (attr === 'information') {
                    this.$Body.getElement('.information').set('html', value);

                    return;
                }

                if (attr === 'text') {
                    this.$Body.getElement('.text').set('html', value);
                }

            }.bind(this));

            this.$Body = null;
            this.$Win = null;
            this.$Buttons = null;
        },

        /**
         * Create the body for the submit window
         *
         * @method qui/controls/windows/Submit#onCreate
         * @ignore
         */
        onCreate: function() {
            var self = this,
                Content = this.$Win.el.content,
                Footer = this.$Win.el.footer;

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


            new Button({
                text: this.getAttribute('cancel_button').text,
                textimage: this.getAttribute('cancel_button').textimage,
                events: {
                    onClick: function() {
                        self.fireEvent('cancel', [self]);
                        self.close();
                    }
                }
            }).inject(Footer);

            new Button({
                text: this.getAttribute('ok_button').text,
                textimage: this.getAttribute('ok_button').textimage,
                events: {
                    onClick: function() {
                        self.submit();
                    }
                }
            }).inject(Footer, 'top');
        },

        /**
         * Submit the window
         *
         * @method qui/controls/windows/Submit#submit
         */
        submit: function() {
            this.fireEvent('submit', [this]);

            if (this.getAttribute('autoclose')) {
                this.close();
            }
        }
    });
});
