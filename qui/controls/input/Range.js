
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

], function(QUI, QUIControl)
{
    "use strict";

    /**
     * @class qui/controls/input/Params
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: QUIControl,
        Type: 'qui/controls/input/Range',

        options : {
            min : 0,
            max : 100,
            name : '',
            value : '',
            step : 1,
            display : true
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$Input = null;
            this.$Display = null;
        },

        /**
         * create the DOMNode Element
         *
         * @return {HTMLElement}
         */
        create : function()
        {
            this.parent();


            var self = this;

            this.$Elm.addClass( 'qui-contro-input-range' );

            this.$Elm.set(
                'html',

                '<input type="range" class="qui-contro-input-range-input" />' +
                '<input type="text" class="qui-contro-input-range-display" />'
            );

            this.$Input = this.$Elm.getElement('input[type="range"]');
            this.$Display = this.$Elm.getElement('input[type="text"]');

            this.$Input.set({
                min : this.getAttribute('min'),
                max : this.getAttribute('max'),
                step : this.getAttribute('step'),
                name : this.getAttribute('name')
            });

            if ( this.getAttribute('display') === false ) {
                this.$Display.setStyle('display', 'none');
            }

            // input events
            this.$Input.addEvent('change', function() {
                self.setValue( this.value );
            });

            this.$Display.addEvent('change', function() {
                self.setValue( this.value );
            });


            if ( this.getAttribute('value') !== false ) {
                this.setValue( this.getAttribute('value') );
            }

            return this.$Elm;
        },

        /**
         * set the value
         * @param {String|Number} value
         */
        setValue : function(value)
        {
            if ( this.$Input && this.$Input.value !== value ) {
                this.$Input.value = value;
            }

            if ( this.$Display && this.$Display.value !== value ) {
                this.$Display.value = value;
            }

            this.fireEvent('change');
        },

        /**
         * Return the value
         * @returns {String|Number|Boolean}
         */
        getValue : function()
        {
            return this.$Input ? this.$Input.value : false;
        },

        /**
         * Return the INPUT DOMNode Element, if created
         * @returns {HTMLInputElement|null}
         */
        getRangeElm : function()
        {
            return this.$Input;
        }
    });
});
