/**
 * Helper for <form> nodes
 *
 * @module qui/utils/Form
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/utils/Form', {

    /**
     * Set an object to an formular DOMNode
     * goes through all object attributes and set it to the appropriate form elements
     *
     * @method qui/utils/Form#setDataToForm
     *
     * @param {Object} data
     * @param {HTMLElement} form - Formular
     */
    setDataToForm: function (data, form) {
        "use strict";

        if (typeof form === 'undefined' || form.nodeName !== 'FORM') {
            return;
        }

        var i, k, len, val, Elm;

        data = data || {};

        // unselect checkboxes and radios
        for (k in data) {
            if (!data.hasOwnProperty(k)) {
                continue;
            }

            if (typeof form.elements[k] === 'undefined') {
                continue;
            }

            Elm = form.elements[k];

            if (Elm.type === 'checkbox' || Elm.type === 'radio') {
                form.getElements('[name="' + k + '"]').set('checked', false);
            }

            if (Elm.length && ( Elm[0].type === 'checkbox' || Elm[0].type === 'radio' )) {
                form.getElements('[name="' + k + '"]').set('checked', false);
            }
        }

        for (k in data) {
            if (!data.hasOwnProperty(k)) {
                continue;
            }

            if (typeof form.elements[k] === 'undefined') {
                continue;
            }


            Elm = form.elements[k];

            if (Elm.type === 'checkbox') {
                if (data[k] === false || data[k] === true) {
                    Elm.checked = data[k];
                    continue;
                }

                Elm.checked = ( (data[k]).toInt() ? true : false );
                continue;
            }

            if (Elm.type === 'text' ||
                Elm.type === 'hidden' ||
                Elm.nodeName === 'TEXTAREA' ||
                Elm.nodeName === 'SELECT') {

                if (typeOf(data[k]) == 'boolean') {
                    continue;
                }

                Elm.value = data[k];
                continue;
            }

            if (Elm.length) {
                for (i = 0, len = Elm.length; i < len; i++) {
                    if (Elm[i].type !== 'radio' && Elm[i].type !== 'checkbox') {
                        continue;
                    }

                    val = Elm[i].value;

                    if (typeOf(data[k]) == 'array') {
                        if (data[k].contains(val)) {
                            Elm[i].checked = true;
                        }

                        continue;
                    }

                    if (val == data[k]) {
                        Elm[i].checked = true;
                    }
                }

                continue;
            }

            if (Elm.type === 'color') {
                Elm.set('data-realvalue', data[k]);
            }

            Elm.value = data[k];
        }
    },

    /**
     * Get all Data from a Formular
     *
     * @method qui/utils/Form#getFormData
     *
     * @param {HTMLElement} form - DOMNode Formular
     * @return {Object}
     */
    getFormData: function (form) {
        "use strict";

        if (typeof form === 'undefined' || !form) {
            return {};
        }

        var i, n, len, Elm;

        var result   = {},
            elements = form.elements;

        for (i = 0, len = elements.length; i < len; i++) {
            Elm = elements[i];
            n   = Elm.name;

            if (n === '') {
                continue;
            }

            if (Elm.type === 'checkbox') {
                // array
                if (elements[n].length) {
                    if (typeof result[Elm.name] === 'undefined') {
                        result[n] = [];
                    }

                    if (Elm.checked) {
                        result[n].push(Elm.value);
                    }

                    continue;
                }

                result[n] = Elm.checked ? true : false;
                continue;
            }

            if (Elm.type === 'radio' && !Elm.length) {
                if (Elm.checked) {
                    result[n] = Elm.value;
                }

                continue;
            }

            if (Elm.type === 'radio' && Elm.length) {
                for (i = 0, len = Elm.length; i < len; i++) {
                    if (Elm[i].type !== 'radio') {
                        continue;
                    }

                    result[Elm[i].name] = '';

                    if (Elm[i].checked) {
                        result[Elm[i].name] = Elm[i].value;
                    }
                }
            }

            result[n] = Elm.value;
        }

        return result;
    },

    /**
     * Set text to the cursorposition of an textarea / input
     *
     * @method qui/utils/Form#insertTextAtCursor
     *
     * @param {HTMLElement} el
     * @param {String} text
     */
    insertTextAtCursor: function (el, text) {
        "use strict";

        var val = el.value, endIndex, range;

        if (typeof el.selectionStart != "undefined" &&
            typeof el.selectionEnd != "undefined") {

            endIndex          = el.selectionEnd;
            el.value          = val.slice(0, el.selectionStart) + text + val.slice(endIndex);
            el.selectionStart = el.selectionEnd = endIndex + text.length;

        } else if (typeof document.selection != "undefined" &&
                   typeof document.selection.createRange != "undefined") {

            el.focus();

            range      = document.selection.createRange();
            range.collapse(false);
            range.text = text;
            range.select();
        }
    }
});
