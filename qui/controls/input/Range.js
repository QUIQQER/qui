/**
 * Input range
 * - only usable in quiqqer/quiqqer
 *
 * @author www.pcsg.de (Henning Leutz)
 * @module qui/controls/input/Range
 *
 * based on http://refreshless.com/nouislider/
 */
define('qui/controls/input/Range', [

    'qui/QUI',
    'qui/controls/Control',
    URL_OPT_DIR + 'bin/quiqqer-asset/nouislider/nouislider/dist/nouislider.js',

    'css!qui/controls/input/Range.css',
    'css!' + URL_OPT_DIR + 'bin/quiqqer-asset/nouislider/nouislider/dist/nouislider.css'

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
            start    : false, // handle count, one handle = [0], two handles [0,0], three handles [0,0,0]
            display  : true,
            Formatter: false,  // callable function to format the display message
            range    : false,  // ui slider range
            snap     : false,  // When a non-linear slider has been configured,
                               // the snap option can be set to true
                               // to force the slider to jump between the specified values.
            connect   : true,   // Display a colored bar between the handles
            pips      : {},     // Displays pipes and ranges for the slider
            background: '#d9232b'
        },

        initialize: function (options) {
            this.parent(options);

            this.$BarContainer = null;
            this.$Text = null;

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
            this.$Text = this.$Elm.getElement('.qui-control-input-range-text');

            this.$value = {
                from: this.getAttribute('min'),
                to  : this.getAttribute('max')
            };

            var range = this.getAttribute('range');
            var start = this.getAttribute('start');

            if (!range) {
                range = {
                    min: this.getAttribute('min'),
                    max: this.getAttribute('max')
                };
            }

            if (!start) {
                start = [
                    this.getAttribute('min'),
                    this.getAttribute('max')
                ];
            }

            var Pips = this.getAttribute('pips');

            if (Object.keys(Pips).length === 0 && Pips.constructor === Object) {
                Pips = null;
            }

            try {
                noUiSlider.create(this.$BarContainer, {
                    start  : start,
                    step   : this.getAttribute('step'),
                    margin : 0, // Handles must be more than '20' apart
                    connect: this.getAttribute('connect'),
                    range  : range,
                    snap   : this.getAttribute('snap'),
                    pips   : Pips,
                });
            } catch (e) {
                console.error(e);
                return this.$Elm;
            }

            var Formatter = this.getAttribute('Formatter');

            var timerChangeEvent = null;
            var fireChangeEvent = function () {
                this.fireEvent('change', [this]);
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

            this.$BarContainer.getElements('.noUi-connect').setStyle('background', this.getAttribute('background'));

            return this.$Elm;
        },

        /**
         *
         * @param {Object} range - noUiSlider range -> http://refreshless.com/nouislider/slider-values/
         */
        setRange: function (range) {
            if (this.$BarContainer.noUiSlider) {
                this.$BarContainer.noUiSlider.updateOptions({
                    range: range
                });
            }
        },

        /**
         * set the value
         * @param {String|Number|Array} value
         */
        setValue: function (value) {
            if (this.$BarContainer.noUiSlider) {
                this.$BarContainer.noUiSlider.set(value);
                this.fireEvent('change', [this]);
            }
        },

        /**
         * set the from value
         *
         * @param {String|Number} value
         */
        setFrom: function (value) {
            if (this.$BarContainer.noUiSlider) {
                this.$BarContainer.noUiSlider.set([
                    null,
                    value
                ]);
                this.fireEvent('change', [this]);
            }
        },

        /**
         * set the to value
         *
         * @param {String|Number} value
         */
        setTo: function (value) {
            if (this.$BarContainer.noUiSlider) {
                this.$BarContainer.noUiSlider.set([
                    value,
                    null
                ]);
                this.fireEvent('change', [this]);
            }
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
