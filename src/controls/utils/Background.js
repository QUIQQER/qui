/**
 * A Background
 * Creates a black background layer
 *
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/controls/utils/Background', [

    'qui/controls/Control'

],function(Control)
{
    "use strict";

    return new Class({

        Extends : Control,
        Type    : 'qui/controls/utils/Background',

        initialize : function(params)
        {
            this.parent( params );
        },

        /**
         * Return the DOMNode Element
         * The Background would inserted into the body
         *
         * @return {DOMNode}
         */
        create : function()
        {
            if ( this.$Elm ) {
                return this.$Elm;
            }

            this.$Elm = new Element('div', {
                'class' : 'qui-background',
                styles  : {
                    backgroundColor : '#000000',
                    position : 'fixed',
                    width    : '100%',
                    height   : '100%',
                    top      : 0,
                    left     : 0,
                    zIndex   : 1000,
                    opacity  : 0.6,
                    display  : 'none'
                }
            });

            document.body.appendChild( this.$Elm );

            return this.$Elm;
        }
    });
});
