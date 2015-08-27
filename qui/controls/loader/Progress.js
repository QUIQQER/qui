/**
 * A progress bar control
 * Creates a div with a progress animation
 *
 * @module qui/controls/loader/Progress
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require css!qui/controls/loader/Progress.css
 *
 * Global QUI Attribute
 * - control-loader-color
 */

define('qui/controls/loader/Progress', [

    'qui/QUI',
    'qui/controls/Control',
    'css!qui/controls/loader/Progress.css'

], function (QUI, QUIControl) {
    "use strict";

    /**
     * @class qui/controls/loader/Progress
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: QUIControl,
        Type   : 'qui/controls/loader/Progress',

        options: {
            color : '#d52349',
            styles: false
        },

        initialize: function (options) {

            // default global color
            if (QUI.getAttribute('control-loader-color')) {
                this.setAttribute(
                    'color',
                    QUI.getAttribute('control-loader-color')
                );
            }

            this.parent(options);

            this.$Bar   = null;
            this.$BarFX = null;
        },

        /**
         * Create the DOMNode Element of the progress
         *
         * @method controls/loader/Progress#create
         * @return {HTMLElement}
         */
        create: function () {
            var color = this.getAttribute('color');

            this.$Elm = this.parent();
            this.$Elm.addClass('qui-progress');

            this.$Bar = new Element('div', {
                'class': 'qui-progress-bar',
                styles : {
                    background: color,
                    boxShadow : '0 0 10px ' + color + ', 0 0 5px ' + color
                }
            }).inject(this.$Elm);

            this.$BarFX = moofx(this.$Bar);
            this.reset();

            if (this.getAttribute('styles')) {
                this.$Bar.setStyles(this.getAttribute('styles'));
            }

            return this.$Elm;
        },

        /**
         * reset the bar
         */
        reset: function () {
            this.stopIncrement();
            this.$BarFX.style('width', 0);
        },

        /**
         * Set the loader with
         *
         * @param {Number} step - percentage step (0 - 100)
         */
        set: function (step) {
            var width   = this.$Elm.getSize().x,
                newSize = (( width / 100 ) * step).round();

            this.$BarFX.animate({
                width: newSize
            });
        },

        /**
         * animate the progress bar and fill the bar within the intervall
         * reset the bar and fill it within the time (seconds)
         *
         * @param {Number} ms - miliseconds to finish
         */
        increment: function (ms) {
            this.reset();

            this.$BarFX.animate({
                width: '100%'
            }, {
                duration: ms,
                equation: 'linear'
            });
        },

        /**
         * stop the increment
         */
        stopIncrement: function () {
            this.$BarFX.style('width', this.$BarFX.compute('width'));
        }
    });
});