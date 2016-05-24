/**
 * Animate an element
 *
 * @module qui/classes/utils/Animate
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/classes/DOM
 */
define('qui/classes/utils/Animate', ['qui/classes/DOM'], function (QDOM) {
    "use strict";

    /**
     * @class qui/controls/utils/Animate
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: QDOM,
        Type   : 'qui/classes/utils/Animate',

        options: {
            equation: false,
            duration: 250
        },

        initialize: function (Node, params) {
            this.parent(params);
            this.$FX = moofx(Node);
        },

        /**
         * Animate the element
         *
         * @param {Object} params
         * @returns {Promise}
         */
        animate: function (params) {
            params = params || {};

            return new Promise(function (resolve) {
                this.$FX.animate(params, {
                    duration: this.getAttribute('duration'),
                    equation: this.getAttribute('equation'),
                    callback: resolve
                });
            }.bind(this));
        }
    });
});
