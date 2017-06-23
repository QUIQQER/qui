/**
 * Button Separator
 *
 * @module qui/controls/buttons/Separator
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 *
 * @event onResize [this]
 * @event onCreate [this]
 */
define('qui/controls/buttons/Separator', [

    'qui/controls/Control'

], function (Control) {
    "use strict";

    /**
     * @class qui/controls/buttons/Separator
     *
     * @param {Object} options
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type   : 'qui/controls/buttons/Separator',

        options: {
            height: false,
            styles: false
        },

        initialize: function (options) {
            this.parent(options);

            // Events
            this.addEvent('resize', function () {
                var Elm = this.getElm();

                if (Elm && Elm.getParent()) {
                    Elm.setStyle('height', Elm.getParent().getSize().y);
                }
            });
        },

        /**
         * Create the DOMNode
         *
         * @method qui/controls/buttons/Separator#create
         * @return {HTMLElement}
         */
        create: function () {
            this.$Elm = new Element('div.qui-buttons-separator', {
                'data-quiid': this.getId()
            });

            if (this.getAttribute('height')) {
                this.$Elm.setStyle('height', this.getAttribute('height'));
            }

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            this.fireEvent('create', [this]);

            return this.$Elm;
        }
    });
});
