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

define('qui/controls/utils/Background', ['qui/controls/Control'], function(Control)
{
    "use strict";

    /**
     * @class qui/controls/utils/Background
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/utils/Background',

        options : {
            styles  : false,
            animate : true
        },

        initialize : function(params)
        {
            this.parent( params );

            this.$FX = moofx( this.$Elm );
        },

        /**
         * Return the DOMNode Element
         * The Background would inserted into the body
         *
         * @method qui/controls/utils/Background#create
         * @return {HTMLElement}
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
                    opacity  : 0,
                    display  : 'none'
                },
                events :
                {
                    click : function() {
                        self.fireEvent( 'click', [ self ] );
                    }
                }
            });

            this.$FX = moofx( this.$Elm );

            document.body.appendChild( this.$Elm );

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            return this.$Elm;
        },

        /**
         * Show the background
         *
         * @param {Function} [callback] - callback function
         */
        show : function(callback)
        {
            this.$Elm.setStyle( 'display', null );

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            if ( this.getAttribute( 'animate' ) === false )
            {
                this.$Elm.set( 'opacity', 0.6 );
                return;
            }


            this.$FX.animate({
                opacity : 0.6
            }, {
                duration : 200,
                callback : function()
                {
                    if ( typeof callback === 'function' ) {
                        callback();
                    }
                }
            });
        },

        /**
         * Hide the background
         *
         * @param {Function} [callback] - callback function
         */
        hide : function(callback)
        {
            if ( this.getAttribute( 'animate' ) === false )
            {
                this.$Elm.set( 'opacity', 0 );

                if ( typeof callback === 'function' ) {
                    callback();
                }

                return;
            }


            this.$FX.animate({
                opacity : 0
            }, {
                duration : 200,
                callback : function()
                {
                    if ( typeof callback === 'function' ) {
                        callback();
                    }
                }
            });
        }
    });
});
