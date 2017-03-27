/**
 * Context Menu Seperator
 *
 * @module qui/controls/contextmenu/Seperator
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require css!qui/controls/contextmenu/Seperator.css
 */

define('qui/controls/contextmenu/Seperator', [

    'qui/controls/Control',

    'css!qui/controls/contextmenu/Seperator.css'

], function (Control) {
    "use strict";

    /**
     * @class qui/controls/contextmenu/Seperator
     *
     * @fires onClick [this]
     * @fires onMouseDown [this]
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type   : 'qui/controls/contextmenu/Seperator',

        options: {
            styles: null
        },

        initialize: function (options) {
            this.parent(options);

            this.$Elm = null;
        },

        /**
         * Create the DOMNode for the Element
         *
         * @method qui/controls/contextmenu/Seperator#create
         * @return {HTMLElement}
         */
        create: function () {
            this.$Elm = new Element('div.qui-context-seperator', {
                'data-quiid': this.getId()
            });

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            return this.$Elm;
        },

        /**
         * if the seperator is in a baritem
         *
         * @method qui/controls/contextmenu/Seperator#setNormal
         * @ignore
         */
        setNormal: function () {
        },

        /**
         * if the seperator is in a baritem
         *
         * @method qui/controls/contextmenu/Seperator#setActive
         * @ignore
         */
        setActive: function () {
        }
    });
});