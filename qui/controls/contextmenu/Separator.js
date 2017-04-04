/**
 * Context Menu Separator
 *
 * @module qui/controls/contextmenu/Separator
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require css!qui/controls/contextmenu/Separator.css
 */

define('qui/controls/contextmenu/Separator', [

    'qui/controls/Control',

    'css!qui/controls/contextmenu/Separator.css'

], function (Control) {
    "use strict";

    /**
     * @class qui/controls/contextmenu/Separator
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
        Type   : 'qui/controls/contextmenu/Separator',

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
         * @method qui/controls/contextmenu/Separator#create
         * @return {HTMLElement}
         */
        create: function () {
            this.$Elm = new Element('div.qui-context-separator', {
                'data-quiid': this.getId()
            });

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            return this.$Elm;
        },

        /**
         * if the separator is in a baritem
         *
         * @method qui/controls/contextmenu/Separator#setNormal
         * @ignore
         */
        setNormal: function () {
        },

        /**
         * if the separator is in a baritem
         *
         * @method qui/controls/contextmenu/Separator#setActive
         * @ignore
         */
        setActive: function () {
        }
    });
});