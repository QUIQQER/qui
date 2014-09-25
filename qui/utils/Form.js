
/**
 * Helper for <form> nodes
 *
 * @module qui/utils/Form
 * @author www.pcsg.de (Henning Leutz)
 */

define({

    /**
     * Set an object to an formular DOMNode
     * goes through all object attributes and set it to the appropriate form elements
     *
     * @method qui/utils/Form#setDataToForm
     *
     * @param {Object} data
     * @param {DOMNode} form - Formular
     */
    setDataToForm : function(data, form)
    {
        if ( typeof form === 'undefined' || form.nodeName !== 'FORM' ) {
            return;
        }

        var i, k, len, Elm;

        data = data || {};

        for ( k in data )
        {
            if ( !form.elements[ k ] ) {
                continue;
            }

            Elm = form.elements[ k ];

            if ( Elm.type === 'checkbox' )
            {
                if ( data[k] === false || data[k] === true )
                {
                    Elm.checked = data[k];
                    continue;
                }

                Elm.checked = ( (data[k]).toInt() ? true : false );
                continue;
            }

            if ( Elm.length )
            {
                for ( i = 0, len = Elm.length; i < len; i++ )
                {
                    if ( Elm[i].type !== 'radio' ) {
                        continue;
                    }

                    if ( Elm[i].value == data[k] ) {
                        Elm[i].checked = true;
                    }
                }

                continue;
            }

            Elm.value = data[k];
        }
    },

    /**
     * Get all Data from a Formular
     *
     * @method qui/utils/Form#getFormData
     *
     * @param {DOMNode} form - DOMNode Formular
     * @return {Object}
     */
    getFormData : function(form)
    {
        if ( typeof form === 'undefined' || !form ) {
            return {};
        }

        var i, len, Elm;
        var result   = {},
            elements = form.elements;

        for ( i = 0, len = elements.length; i < len; i++ )
        {
            Elm = elements[i];

            if ( Elm.type === 'checkbox' )
            {
                result[ Elm.name ] = Elm.checked ? true : false;
                continue;
            }

            if ( Elm.type === 'radio' && !Elm.length )
            {
                if ( Elm.checked ) {
                    result[ Elm.name ] = Elm.value;
                }

                continue;
            }

            if ( Elm.type === 'radio' && Elm.length )
            {
                for ( i = 0, len = Elm.length; i < len; i++ )
                {
                    if ( Elm[i].type !== 'radio' ) {
                        continue;
                    }

                    result[ Elm[i].name ] = '';

                    if ( Elm[i].checked )
                    {
                        result[ Elm[i].name ] = Elm[i].value;
                        continue;
                    }
                }
            }

            result[ Elm.name ] = Elm.value;
        }

        return result;
    },

    /**
     * Set text to the cursorposition of an textarea / input
     *
     * @method qui/utils/Form#insertTextAtCursor
     *
     * @param {DOMNode} el
     * @param {String} text
     */
    insertTextAtCursor : function(el, text)
    {
        var val = el.value, endIndex, range;

        if ( typeof el.selectionStart != "undefined" &&
             typeof el.selectionEnd != "undefined")
        {
            endIndex = el.selectionEnd;
            el.value = val.slice(0, el.selectionStart) + text + val.slice(endIndex);
            el.selectionStart = el.selectionEnd = endIndex + text.length;

        } else if ( typeof document.selection != "undefined" &&
                    typeof document.selection.createRange != "undefined")
        {
            el.focus();

            range = document.selection.createRange();
            range.collapse( false );
            range.text = text;
            range.select();
        }
    }
});