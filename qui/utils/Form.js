/**
 * Helper for <form> nodes
 *
 * @module qui/utils/Form
 * @author www.pcsg.de (Henning Leutz)
 * @author www.pcsg.de (Patrick Müller)
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

        this.$setDataToNodeList(new Elements(form.elements), data);
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

        return this.$getDataFromNodeList(new Elements(form.elements));
    },

    /**
     * Set data to all children of a DOM node as if it were a form.
     *
     * @param {{}} Data
     * @param {HTMLElement} Node
     * @return {void}
     */
    setDataToNode: function (Data, Node) {
        "use strict";

        var elements = [];

        var addElements = function (list) {
            for (var i = 0, len = list.length; i < len; i++) {
                elements.push(list[i]);
            }
        };

        // Input
        addElements(Node.getElementsByTagName('INPUT'));
        addElements(Node.getElementsByTagName('SELECT'));
        addElements(Node.getElementsByTagName('TEXTAREA'));
        addElements(Node.getElementsByTagName('BUTTON'));

        var NodeList = new Elements(elements);

        this.$setDataToNodeList(NodeList, Data);
    },

    /**
     * Get data from all children of a DOM node as if it were a form.
     *
     * @param {HTMLElement} Node
     * @return {{}}
     */
    getDataFromNode: function (Node) {
        "use strict";

        var elements = [];

        var addElements = function (list) {
            for (var i = 0, len = list.length; i < len; i++) {
                elements.push(list[i]);
            }
        };

        // Input
        addElements(Node.getElementsByTagName('INPUT'));
        addElements(Node.getElementsByTagName('SELECT'));
        addElements(Node.getElementsByTagName('TEXTAREA'));
        addElements(Node.getElementsByTagName('BUTTON'));

        var NodeList = new Elements(elements);

        return this.$getDataFromNodeList(NodeList);
    },

    /**
     * Set Data to all nodes in NodeList.
     *
     * @param {Elements} NodeList
     * @param {{}} Data
     * @return {{}}
     */
    $setDataToNodeList: function (NodeList, Data) {
        "use strict";

        var j, jlen, i, k, len, Elm, elements;

        Data = Data || {};

        /**
         * Returns the DOM nodes in NodeList with name "name".
         *
         * @param {string} name
         * @return {boolean|HTMLElement} - Return DOM node or false if not found
         */
        var getElements = function (name) {
            return NodeList.filter('*[name="' + name + '"]');
        };

        // unselect checkboxes and radios
        for (k in Data) {
            if (!Data.hasOwnProperty(k)) {
                continue;
            }

            elements = getElements(k);

            for (i = 0, len = elements.length; i < len; i++) {
                Elm = elements[i];

                if (Elm.type === 'checkbox' || Elm.type === 'radio') {
                    Elm.set('checked', false);
                }

                if (Elm.length && (Elm[0].type === 'checkbox' || Elm[0].type === 'radio')) {
                    Elm.set('checked', false);
                }
            }
        }

        var elementValue;

        for (k in Data) {
            if (!Data.hasOwnProperty(k)) {
                continue;
            }

            elements     = getElements(k);
            elementValue = Data[k];

            for (i = 0, len = elements.length; i < len; i++) {
                Elm = elements[i];

                if (Elm.type === 'checkbox' || Elm.type === 'radio') {
                    if (typeOf(elementValue) === 'array') {
                        for (j = 0, jlen = elementValue.length; j < jlen; j++) {
                            if (Elm.value == elementValue[j]) {
                                Elm.checked = true;
                                break;
                            }
                        }
                    } else {
                        if (elementValue !== false && elementValue !== true) {
                            elementValue = !!parseInt(elementValue);
                        }

                        if (k.endsWith('[]')) {
                            if (Elm.value == elementValue) {
                                Elm.checked = elementValue;
                            }
                        } else {
                            Elm.checked = elementValue;
                        }
                    }

                    continue;
                }

                if (Elm.type === 'text' ||
                    Elm.type === 'hidden' ||
                    Elm.nodeName === 'TEXTAREA' ||
                    Elm.nodeName === 'SELECT') {

                    if (typeOf(elementValue) == 'boolean') {
                        continue;
                    }

                    Elm.value = Data[k];
                    continue;
                }

                if (Elm.type === 'color') {
                    Elm.set('Data-realvalue', elementValue);
                }

                Elm.value = elementValue;
            }
        }
    },

    /**
     * Reads all data from nodes in NodeList.
     *
     * Only reads from INPUT, SELECT, TEXTAREA or BUTTON elements.
     *
     * @param {Elements} NodeList
     * @return {{}}
     */
    $getDataFromNodeList: function (NodeList) {
        "use strict";

        var i, name, len, Elm, elementValue;

        var result = {};

        var getValue = function (Elm, isCollection) {
            isCollection = isCollection || false;

            switch (Elm.type) {
                case 'checkbox':
                    if (isCollection) {
                        return Elm.checked ? Elm.value : null;
                    }

                    return !!Elm.checked;

                case 'radio':
                    if (Elm.name in result && result[Elm.name]) {
                        return result[Elm.name];
                    }

                    if (Elm.checked) {
                        return Elm.value;
                    }

                    return false;

                default:
                    return Elm.value;
            }
        };

        for (i = 0, len = NodeList.length; i < len; i++) {
            Elm  = NodeList[i];
            name = Elm.name;

            if (name === '') {
                continue;
            }

            if (name.endsWith('[]')) {
                if (!(name in result)) {
                    result[name] = [];
                }

                elementValue = getValue(Elm, true);

                if (elementValue === null) {
                    continue;
                }

                result[name].push(elementValue);

                continue;
            }

            elementValue = getValue(Elm);

            if (elementValue === null) {
                continue;
            }

            result[name] = elementValue;
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

            range = document.selection.createRange();
            range.collapse(false);
            range.text = text;
            range.select();
        }
    }
});
