/**
 * Input range
 * - only usable in quiqqer/quiqqer
 *
 * @author www.pcsg.de (Henning Leutz)
 * @module qui/controls/input/Range
 *
 * based on http://refreshless.com/nouislider/
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require URL_OPT_DIR + bin/nouislider/distribute/nouislider.min.js
 *
 * @require css!qui/controls/input/Range.css
 * @require css! + URL_OPT_DIR + bin/nouislider/distribute/nouislider.min.css
 */
define('qui/controls/input/Range', [

    'qui/QUI',
    'qui/controls/Control',
    URL_OPT_DIR + 'bin/nouislider/distribute/nouislider.min.js',

    'css!qui/controls/input/Range.css',
    'css!' + URL_OPT_DIR + 'bin/nouislider/distribute/nouislider.min.css'

], function (QUI, QUIControl, noUiSlider) {
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
            min      : 0,
            max      : 100,
            name     : '',
            step     : 1,
            display  : true,
            Formatter: false,  // callable function to format the display message
            range    : false,  // ui slider range
            snap     : false,  // When a non-linear slider has been configured,
                               // the snap option can be set to true
                               // to force the slider to jump between the specified values.
            connect  : true    // Display a colored bar between the handles
        },

        initialize: function (options) {
            this.parent(options);

            this.$BarContainer = null;
            this.$Text         = null;

            this.$value = {
                from: '',
                to  : ''
            };
        },

        /**
         * create the DOMNode Element
         *
         * @return {HTMLElement}
         */
        create: function () {
            this.parent();

            this.$Elm.addClass('qui-control-input-range');

            this.$Elm.set(
                'html',
                '<div class="qui-control-input-range-bar"></div>' +
                '<div class="qui-control-input-range-text"></div>'
            );

            this.$BarContainer = this.$Elm.getElement('.qui-control-input-range-bar');
            this.$Text         = this.$Elm.getElement('.qui-control-input-range-text');

            this.$value = {
                from: this.getAttribute('min'),
                to  : this.getAttribute('max')
            };

            var range = this.getAttribute('range');

            if (!range) {
                range = {
                    min: this.getAttribute('min'),
                    max: this.getAttribute('max')
                };
            }

            noUiSlider.create(this.$BarContainer, {
                start  : [this.getAttribute('min'), this.getAttribute('max')],
                step   : this.getAttribute('step'),
                margin : 0, // Handles must be more than '20' apart
                connect: this.getAttribute('connect'),
                range  : range,
                snap   : this.getAttribute('snap')
            });

            var Formatter = this.getAttribute('Formatter');

            var timerChangeEvent = null;
            var fireChangeEvent  = function () {
                this.fireEvent('change');
            }.bind(this);

            this.$BarContainer.noUiSlider.on('update', function (values, handle) {
                if (handle) {
                    this.$value.to = values[handle];
                } else {
                    this.$value.from = values[handle];
                }

                var message = 'From: ' + this.$value.from + ' to ' + this.$value.to;

                if (typeof Formatter === 'function') {
                    message = Formatter(this.$value);
                }

                this.$Text.set('html', message);

                if (timerChangeEvent) {
                    clearTimeout(timerChangeEvent);
                }

                timerChangeEvent = fireChangeEvent.delay(200);
            }.bind(this));

            this.$BarContainer.getElement('.noUi-connect').setStyle('background', '#d9232b');


            // this.$Elm.set(
            //     'html',
            //
            //     '<input type="range" class="qui-contro-input-range-input" />' +
            //     '<input type="text" class="qui-contro-input-range-display" />'
            // );
            //
            // this.$Input   = this.$Elm.getElement('input[type="range"]');
            // this.$Display = this.$Elm.getElement('input[type="text"]');
            //
            // this.$Input.set({
            //     min : this.getAttribute('min'),
            //     max : this.getAttribute('max'),
            //     step: this.getAttribute('step'),
            //     name: this.getAttribute('name')
            // });
            //
            // if (this.getAttribute('display') === false) {
            //     this.$Display.setStyle('display', 'none');
            // }
            //
            // // input events
            // this.$Input.addEvent('change', function () {
            //     self.setValue(this.value);
            // });
            //
            // this.$Display.addEvent('change', function () {
            //     self.setValue(this.value);
            // });
            //
            //
            // if (this.getAttribute('value') !== false) {
            //     this.setValue(this.getAttribute('value'));
            // }

            return this.$Elm;
        },

        /**
         *
         * @param {Object} range - noUiSlider range -> http://refreshless.com/nouislider/slider-values/
         */
        setRange: function (range) {
            this.$BarContainer.noUiSlider.updateOptions({
                range: range
            });
        },

        /**
         * set the value
         * @param {String|Number|Array} value
         */
        setValue: function (value) {
            this.$BarContainer.noUiSlider.set(value);
            this.fireEvent('change');
        },

        /**
         * set the from value
         *
         * @param {String|Number} value
         */
        setFrom: function (value) {
            this.$BarContainer.noUiSlider.set([null, value]);
            this.fireEvent('change');
        },

        /**
         * set the to value
         *
         * @param {String|Number} value
         */
        setTo: function (value) {
            this.$BarContainer.noUiSlider.set([value, null]);
            this.fireEvent('change');
        },

        /**
         * Return the value
         * @returns {Object}
         */
        getValue: function () {
            return this.$value;
        }
    });
});
