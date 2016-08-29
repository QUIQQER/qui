/**
 * @module qui/controls/elements/SelectItem
 *
 * @require qui/controls/Control
 * @require css!qui/controls/elements/SelectItem.css
 */
define('qui/controls/elements/SelectItem', [

    'qui/controls/Control',
    'css!qui/controls/elements/SelectItem.css'

], function (QUIControl) {
    "use strict";

    return new Class({
        Extends: QUIControl,
        Type   : 'qui/controls/elements/SelectItem',

        Binds: [
            '$onInject'
        ],

        options: {
            id  : false,
            icon: 'fa fa-shopping-bag'
        },

        initialize: function (options) {
            this.parent(options);

            this.$Icon    = null;
            this.$Text    = null;
            this.$Destroy = null;

            this.addEvents({
                onInject      : this.$onInject,
                onSetAttribute: function (attribute, value) {
                    if (attribute === 'icon' && this.$Icon) {
                        this.$Icon.className = 'qui-elements-selectItem-icon';
                        this.$Icon.addClass(value);
                    }
                }.bind(this)
            });
        },

        /**
         * Return the DOMNode Element
         *
         * @returns {HTMLElement}
         */
        create: function () {
            var self = this,
                Elm  = this.parent();

            Elm.set({
                'class': 'qui-elements-selectItem smooth',
                html   : '<span class="qui-elements-selectItem-icon ' + this.getAttribute('icon') + '"></span>' +
                         '<span class="qui-elements-selectItem-text">&nbsp;</span>' +
                         '<span class="qui-elements-selectItem-destroy fa fa-remove"></span>'
            });

            this.$Icon    = Elm.getElement('.qui-elements-selectItem-icon');
            this.$Text    = Elm.getElement('.qui-elements-selectItem-text');
            this.$Destroy = Elm.getElement('.qui-elements-selectItem-destroy');

            this.$Destroy.addEvent('click', function () {
                self.destroy();
            });

            return Elm;
        },

        /**
         * must be overwritten
         *
         * @return {Promise}
         */
        refresh: function () {
            return Promise.resolve();
        },

        /**
         * event : on inject
         */
        $onInject: function () {
            this.$Text.set({
                html: '<span class="fa fa-spinner fa-spin"></span>'
            });

            this.refresh();
        }
    });
});
