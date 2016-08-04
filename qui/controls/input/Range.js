/**
 * Input range
 *
 * @author www.pcsg.de (Henning Leutz)
 * @module qui/controls/input/Range
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require css!qui/controls/input/Range.css
 */
define('qui/controls/input/Range', [

    'qui/QUI',
    'qui/controls/Control',

    'css!qui/controls/input/Range.css'

], function (QUI, QUIControl) {
    "use strict";

    /**
     * @class qui/controls/input/Params
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: QUIControl,
        Type   : 'qui/controls/input/Range',

        options: {
            min    : 0,
            max    : 100,
            name   : '',
            value  : '',
            step   : 1,
            display: true,
            range  : false
        },

        initialize: function (options) {
            this.parent(options);

            this.$Input     = null;
            this.$FromInput = null;
            this.$ToInput   = null;

            this.$FromDisplay = null;
            this.$ToDisplay   = null;
        },

        /**
         * create the DOMNode Element
         *
         * @return {HTMLElement}
         */
        create: function () {
            this.parent();


            var self = this;

            this.$Elm.addClass('qui-control-input-range');

            this.$Input = new Element('input', {
                type: 'hidden'
            }).inject(this.$Elm);

            this.$FromDisplay = new Element('div', {
                'class': 'qui-control-input-range-display',
                html   : this.getAttribute('min')
            }).inject(this.$Elm);

            this.$FromInput = new Element('input', {
                type   : 'range',
                'class': 'qui-control-input-range-input',
                value  : this.getAttribute('min'),
                min    : this.getAttribute('min'),
                max    : this.getAttribute('max'),
                step   : this.getAttribute('step'),
                name   : this.getAttribute('name')
            }).inject(this.$Elm);

            console.log(this.getAttribute('min'));

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            if (this.getAttribute('range')) {
                this.$ToInput = new Element('input', {
                    type   : 'range',
                    'class': 'qui-control-input-range-input',
                    value  : this.getAttribute('max'),
                    min    : this.getAttribute('min'),
                    max    : this.getAttribute('max'),
                    step   : this.getAttribute('step'),
                    name   : this.getAttribute('name')
                }).inject(this.$Elm);

                this.$ToDisplay = new Element('div', {
                    'class': 'qui-control-input-range-display',
                    html   : this.getAttribute('max'),
                    styles : {
                        'float': 'right'
                    }
                }).inject(this.$Elm);

                this.$Elm.addClass('qui-control-input-range__range');
            }

            if (this.getAttribute('display') === false) {
                this.$Display.setStyle('display', 'none');
            }

            // input events
            this.$FromInput.addEvent('change', function () {
                self.setValue(this.value);
            });

            this.$FromDisplay.addEvent('change', function () {
                self.setValue(this.value);
            });


            if (this.getAttribute('value') !== false) {
                this.setValue(this.getAttribute('value'));
            }

            return this.$Elm;
        },

        /**
         * set the value
         * @param {String|Number} value
         */
        setValue: function (value) {
            if (this.$FromInput && this.$FromInput.value !== value) {
                this.$FromInput.value = value;
            }

            if (this.$FromDisplay && this.$FromDisplay.value !== value) {
                this.$FromDisplay.value = value;
            }

            this.fireEvent('change');
        },

        /**
         * Return the value
         * @returns {String|Number|Boolean}
         */
        getValue: function () {
            return this.$FromInput ? this.$FromInput.value : false;
        },

        /**
         * Return the INPUT DOMNode Element, if created
         * @returns {HTMLInputElement|null}
         */
        getRangeElm: function () {
            return this.$FromInput;
        }
    });
});
