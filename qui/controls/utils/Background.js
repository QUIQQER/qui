/**
 * A Background
 * Creates a black background layer
 *
 * @module qui/controls/utils/Background
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 *
 * @event onClick [{self}]
 */

define(['qui/controls/Control'], function(Control)
{
    "use strict";

    return new Class({

        Extends : Control,
        Type    : 'qui/controls/utils/Background',

        options : {
            styles : false
        },

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
            var self = this;

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
                },
                events :
                {
                    click : function() {
                        self.fireEvent( 'click', [ self ] );
                    }
                }
            });

            document.body.appendChild( this.$Elm );

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            return this.$Elm;
        }
    });
});
