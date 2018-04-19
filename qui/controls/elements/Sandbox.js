/**
 * @module qui/controls/elements/Sandbox
 * @author www.pcsg.de (Henning Leutz)
 *
 * Allows to include completely foreign html
 * The html is included via an iframe and cannot destroy the current html
 */
define('qui/controls/elements/Sandbox', [

    'qui/QUI',
    'qui/controls/Control'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'qui/controls/elements/Sandbox',

        options: {
            content: false
        },

        initialize: function (options) {
            this.parent(options);

            this.$FrameDocument = null;
        },

        /**
         * Create DOMNode Element
         *
         * @return {Element|null}
         */
        create: function () {
            this.parent();

            var moduleUrl = require.toUrl("qui/controls/elements/Sandbox.html");

            this.$Elm = new Element('iframe', {
                src         : moduleUrl + '&id=' + this.getId(),
                'data-quiid': this.getId()
            });

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            return this.$Elm;
        },

        /**
         *
         * @param frameDocument
         */
        $loaded: function (frameDocument) {
            this.$FrameDocument = frameDocument;

            if (this.getAttribute('content')) {
                this.setContent(this.getAttribute('content'));
            }

            this.fireEvent('load', [this]);
        },

        /**
         * Is the frame loaded
         *
         * @return {boolean}
         */
        isLoaded: function () {
            return !!this.$FrameDocument;
        },

        /**
         * Set the content to the frame
         */
        setContent: function (content) {
            if (!this.isLoaded()) {
                this.setAttribute('content', content);
                return;
            }

            this.$FrameDocument.body.innerHTML = content;
        },

        /**
         * Return the iframe body
         *
         * @return {null|HTMLBodyElement}
         */
        getBody: function () {
            if (!this.isLoaded()) {
                return null;
            }

            return this.$FrameDocument.body;
        }
    });
});