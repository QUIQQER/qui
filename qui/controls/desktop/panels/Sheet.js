/**
 * A panel Sheet
 *
 * @module qui/controls/desktop/panels/Sheet
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require qui/controls/buttons/Button
 *
 * @event onOpen [this]
 * @event onClose [this]
 */

define('qui/controls/desktop/panels/Sheet', [

    'qui/controls/Control',
    'qui/controls/buttons/Button',

    'css!qui/controls/desktop/panels/Sheet.css'

], function (Control, Button) {
    "use strict";

    /**
     * @class qui/controls/desktop/panels/Sheet
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type   : 'qui/controls/desktop/panels/Sheet',

        Binds: [
            '$fxComplete'
        ],

        options: {
            styles     : false,
            header     : true,
            buttons    : true,
            title      : '',
            closeButton: {
                textimage: 'icon-remove fa fa-remove',
                text     : 'schließen / abbrechen'
            }
        },

        initialize: function (options) {
            this.parent(options);

            this.$Elm     = null;
            this.$Header  = null;
            this.$Body    = null;
            this.$Buttons = null;
            this.$FX      = null;
        },

        /**
         * Create the DOMNode Element of the Sheet
         *
         * @method qui/controls/desktop/panels/Sheet#create
         * @return {HTMLElement}
         */
        create: function () {
            this.$Elm = new Element('div.qui-panel-sheet', {
                'data-quiid': this.getId(),

                html: '<div class="qui-panel-sheet-header box"></div>' +
                      '<div class="qui-panel-sheet-body box"></div>' +
                      '<div class="qui-panel-sheet-btn-container box">' +
                      '<div class="qui-panel-sheet-buttons"></div>' +
                      '</div>',

                styles: {
                    visibility: 'hidden',
                    display   : 'none'
                }
            });

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            this.$Header  = this.$Elm.getElement('.qui-panel-sheet-header');
            this.$Body    = this.$Elm.getElement('.qui-panel-sheet-body');
            this.$Buttons = this.$Elm.getElement('.qui-panel-sheet-btn-container');

            if (!this.getAttribute('buttons')) {
                this.$Buttons.setStyle('display', 'none');
            }

            if (!this.getAttribute('header')) {
                this.$Header.setStyle('display', 'none');
            }

            this.$Header.set('html', this.getAttribute('title'));

            // header close button
            new Button({
                icon  : 'icon-remove fa fa-remove',
                styles: {
                    'float': 'right'
                },
                events: {
                    onClick: this.hide.bind(this)
                }
            }).inject(this.$Header);

            // sub close button
            var closeButton = this.getAttribute('closeButton');

            var CloseButton = new Button({
                text     : closeButton.text || 'schließen / abbrechen',
                textimage: closeButton.textimage || false,
                events   : {
                    onClick: this.hide.bind(this)
                }
            });

            this.addButton(CloseButton);


            this.$FX = moofx(this.$Elm);

            return this.$Elm;
        },

        /**
         * Return the panel content
         *
         * @method qui/controls/desktop/panels/Sheet#getContent
         * @return {HTMLElement|null}
         */
        getContent: function () {
            return this.$Body;
        },

        /**
         * Return the panel content
         *
         * @method qui/controls/desktop/panels/Sheet#getBody
         * @return {HTMLElement|null}
         */
        getBody: function () {
            return this.getContent();
        },

        /**
         * Return the button container
         *
         * @method qui/controls/desktop/panels/Sheet#getButtons
         * @return {HTMLElement|null}
         */
        getButtons: function () {
            return this.$Buttons;
        },

        /**
         * clear the buttons
         */
        clearButtons: function () {
            this.getButtons()
                .getElements('.qui-panel-sheet-buttons')
                .set('html', '');
        },

        /**
         * Add a button to the Sheet
         *
         * @method qui/controls/desktop/panels/Sheet#addButton
         * @param {Object} Btn - QUI Button (qui/controls/buttons/Button) or QUI Button options (Object)
         * @return {Object} this (qui/controls/desktop/panels/Sheet)
         */
        addButton: function (Btn) {
            if (typeOf(Btn) !== 'qui/controls/buttons/Button') {
                Btn = new Button(Btn);
            }

            var Container = this.getButtons().getElement('.qui-panel-sheet-buttons'),
                styles    = Btn.getAttributes('styles') || {};

            styles.margin = '12px 5px';


            Btn.setAttribute('styles', styles);
            Btn.inject(Container);
            Btn.getElm().setStyle('float', 'none');
        },

        /**
         * Show the panel sheet
         *
         * @method qui/controls/desktop/panels/Sheet#show
         * @param {Function} [callback] - optional, callback function
         * @return {Object} this (qui/controls/desktop/panels/Sheet)
         */
        show: function (callback) {
            var self   = this,
                Elm    = this.getElm(),
                Parent = Elm.getParent(),
                size   = Parent.getSize();

            Elm.setStyles({
                boxShadow : '0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                left      : (size.x + 50) * -1,
                height    : size.y,
                visibility: null
            });

            Elm.setStyles({
                display: null,
                opacity: 1
            });

            if (!this.getAttribute('buttons')) {
                this.$Buttons.setStyle('display', 'none');
            }

            if (!this.getAttribute('header')) {
                this.$Header.setStyle('display', 'none');
            }


            var button_size = this.getButtons().getSize(),
                header_size = this.$Header.getSize();

            this.getBody().setStyles({
                'float': 'left',
                height : size.y - button_size.y - header_size.y,
                width  : '100%'
            });


            this.$FX.animate({
                left: 0
            }, {
                equation: 'ease-out',
                callback: function () {
                    if (typeOf(callback) === 'function') {
                        callback();
                    }

                    self.$fxComplete();
                }
            });

            return this;
        },

        /**
         * Hide the panel sheet
         *
         * @method qui/controls/desktop/panels/Sheet#hide
         * @param {Function} [callback] - optional, callback function
         * @return {Object} this (qui/controls/desktop/panels/Sheet)
         */
        hide: function (callback) {
            var self   = this,
                Elm    = this.getElm(),
                Parent = Elm.getParent(),
                size   = Parent.getSize();

            Elm.setStyle('boxShadow', '0 6px 20px 0 rgba(0, 0, 0, 0.19)');


            this.$FX.animate({
                left   : (size.x + 50) * -1,
                opacity: 0
            }, {
                equation: 'ease-out',
                callback: function () {
                    if (typeOf(callback) === 'function') {
                        callback();
                    }

                    self.$fxComplete();

                    Elm.setStyle('display', 'none');
                }
            });

            return this;
        },

        /**
         * fx complete action
         * if panel is closed or opened
         *
         * @method qui/controls/desktop/panels/Sheet#$fxComplete
         */
        $fxComplete: function () {
            if (this.getElm().getStyle('left').toInt() >= 0) {
                this.getElm().setStyle('boxShadow', null);

                this.fireEvent('open', [this]);
                this.fireEvent('show', [this]);
                return;
            }

            this.fireEvent('close', [this]);
        }
    });
});
