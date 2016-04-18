/**
 * Helper for DOMNode Elements
 *
 * @module qui/utils/Elements
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/classes/utils/SimulateEvent
 */
define('qui/utils/Elements', [

    'qui/classes/utils/SimulateEvent'

], function (SimulateEvent) {

    "use strict";

    return {

        /**
         * checks if the element is in the viewport
         *
         * @method qui/utils/Elements#isInViewport
         * @param {HTMLElement} el
         */
        isInViewport: function (el) {
            var rect = el.getBoundingClientRect();

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        /**
         * Return the z-index of an Element
         *
         * @method qui/utils/Elements#getComputedZIndex
         * @return {Number}
         */
        getComputedZIndex: function (Elm) {
            var i, z, len, max = 0;
            var parents        = Elm.getParents();

            for (i = 0, len = parents.length; i < len; i++) {
                z = parents[i].getStyle('zIndex');

                if (z == 'auto') {
                    continue;
                }

                if (z > max) {
                    max = z;
                }
            }

            return max;
        },

        /**
         * Return the index of the child from its parent
         *
         * @param {HTMLElement} Elm
         * @return {Number}
         */
        getChildIndex: function (Elm) {
            return Array.prototype.indexOf.call(
                Elm.getParent().children,
                Elm
            );
        },

        /**
         * Return the cursor position of an input field
         *
         * @return {null|Number}
         */
        getCursorPosition: function (Input) {
            if (Input.nodeName !== 'INPUT') {
                return null;
            }

            if ('selectionStart' in Input) {
                return Input.selectionStart;
            }

            if (document.selection) {
                // IE
                Input.focus();

                var range    = document.selection.createRange();
                var rangeLen = range.text.length;

                range.moveStart('character', -Input.value.length);

                return range.text.length - rangeLen;
            }

            return null;
        },

        /**
         * Set the cursor to the position
         *
         * @param {HTMLElement} Input - Input | Textarea Element
         * @param {Number} pos - Position of the cursor
         */
        setCursorPosition: function (Input, pos) {
            if (Input.nodeName !== 'INPUT' && Input.nodeName !== 'TEXTAREA') {
                return null;
            }

            if (Input.createTextRange) {
                var range = Input.createTextRange();

                range.move('character', pos);
                range.select();
                return;
            }

            if (Input.selectionStart) {
                Input.focus();
                Input.setSelectionRange(pos + 1, pos + 1);
                return;
            }

            Input.focus();
        },

        /**
         * Simulate an event at an Element
         *
         * @param {HTMLElement} Target
         * @param {String} eventName
         */
        simulateEvent: function (Target, eventName) {
            new SimulateEvent(Target).simulateEvent(eventName);
        }
    };
});
