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
            Formatter: false // callable function to format the display message
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

            noUiSlider.create(this.$BarContainer, {
                start  : [this.getAttribute('min'), this.getAttribute('max')],
                step   : this.getAttribute('step'),
                margin : 20, // Handles must be more than '20' apart
                connect: true, // Display a colored bar between the handles
                range  : {
                    min: this.getAttribute('min'),
                    max: this.getAttribute('max')
                }
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
         * set the value
         * @param {String|Number} value
         */
        setValue: function (value) {
            if (this.$Input && this.$Input.value !== value) {
                this.$Input.value = value;
            }

            if (this.$Display && this.$Display.value !== value) {
                this.$Display.value = value;
            }

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
