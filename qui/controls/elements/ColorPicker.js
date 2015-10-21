/**
 * Color Picker
 * only html5 compatible
 *
 * @module qui/controls/elements/ColorPicker
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/elements/ColorPicker.css
 */
define('qui/controls/elements/ColorPicker', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/buttons/Button',

    'css!qui/controls/elements/ColorPicker.css'

], function (QUI, QUIControl, QUIButton) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'qui/controls/elements/ColorPicker',

        Binds: [
            'clear',
            'reset',
            '$onImport'
        ],

        options: {
            defaultcolor: false
        },

        initialize: function (options) {

            this.parent(options);

            this.$Input          = null;
            this.$Color          = null;
            this.$ColorContainer = null;
            this.$Clear          = null;
            this.$Default        = null;

            this.addEvents({
                onImport: this.$onImport
            });
        },

        /**
         * Create the DOMNode Element
         * @returns {HTMLDivElement}
         */
        create: function () {
            var self = this;

            this.$Elm = new Element('div', {
                'class': 'qui-controls-colorpicker',
                html   : '<div class="qui-controls-colorpicker-colorContainer"></div>'
            });

            if (!this.$Color) {
                this.$Color = new Element('input', {
                    type: 'color'
                }).inject(this.$Elm);
            }

            this.$Input = new Element('input', {
                name: '',
                type: 'hidden'
            }).inject(this.$Elm);

            if (this.getAttribute('defaultcolor')) {
                this.$Default = new QUIButton({
                    icon  : 'fa fa-refresh icon-refresh',
                    events: {
                        onClick: this.reset
                    }
                }).inject(this.$Elm);

                this.$Default.getElm().addClass('qui-controls-resetbutton');
            }

            this.$Clear = new QUIButton({
                icon  : 'fa fa-close icon-remove',
                events: {
                    onClick: this.clear
                }
            }).inject(this.$Elm);

            this.$Clear.getElm().addClass(
                'qui-controls-colorpicker-clearButton'
            );

            this.$ColorContainer = this.$Elm.getElement(
                '.qui-controls-colorpicker-colorContainer'
            );

            this.$Color.addEvent('change', function () {
                self.setValue(self.$Color.value);
            });

            this.$Color.setStyles({
                display: 'none'
            });

            this.$ColorContainer.addEvent('click', function () {
                self.$Color.click();
            });

            return this.$Elm;
        },

        /**
         * event : on import
         */
        $onImport: function () {
            this.$Color = this.getElm();

            var Parent = this.create();
            Parent.wraps(this.$Color);

            this.$Clear.inject(this.$Color, 'after');

            this.$Input.set({
                name: this.$Color.get('name'),
                id  : this.$Color.get('id')
            });

            this.$Color.set({
                name: null,
                id  : null
            });

            var realValue = this.$Color.get('data-realvalue');

            if (realValue === '') {
                this.clear();
                return;
            }

            this.setValue(this.$Color.get('value'));
        },

        /**
         * Clears the value
         */
        clear: function () {
            this.$Input.value = '';
            this.$Color.value = '';

            this.$ColorContainer.setStyle('backgroundColor', null);
        },

        /**
         * Set the color
         *
         * @param {String} color
         */
        setValue: function (color) {

            if (color === '') {
                this.clear();
                return;
            }

            this.$Color.value = color;
            this.$Input.value = this.$Color.value;

            this.$ColorContainer.setStyle('backgroundColor', this.$Color.value);
        },

        /**
         * Return the value
         *
         * @returns {String}
         */
        getValue: function () {
            return this.$Input.value;
        },

        /**
         * Set the default icon
         */
        reset: function () {
            this.setValue(this.getAttribute('defaultcolor'));
        }
    });
});
