
/**
 * A loader control
 * Creates a div with a loader animation
 *
 * @module qui/controls/loader/Loader
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require qui/Locale
 * @require css!qui/controls/loader/Loader.css
 *
 * Global QUI Attribute
 * - control-loader-type
 * - control-loader-color
 */

define('qui/controls/loader/Loader', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/Locale',
    'css!qui/controls/loader/Loader.css'

], function(QUI, QUIControl, QUILocale)
{
    "use strict";

    /**
     * @class qui/controls/loader/Loader
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : QUIControl,
        Type    : 'qui/controls/loader/Loader',

        options : {
            cssclass  : '',     // extra CSS class
            closetime : 50000,  // seconds if the closing window showed
            styles    : false,  // extra CSS styles,
            type      : QUI.getAttribute( 'control-loader-type') || 'standard',
            color     : QUI.getAttribute( 'control-loader-color' )
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$Inner = null;
            this.$FX    = null;
            this.$delay = null;

            this.addEvent('onDestroy', function()
            {
                if ( this.$Elm.getParent() ) {
                    this.$Elm.getParent().removeClass( 'qui-loader-parent' );
                }
            });

            this.$animations = {
                standard : {
                    children : 8,
                    files    : ['css!qui/controls/loader/Loader.standard.css']
                },

                'line-scale' : {
                    children : 5,
                    files    : ['css!qui/controls/loader/Loader.line-scale.css']
                },

                'ball-pulse-rise' : {
                    children : 5,
                    files    : ['css!qui/controls/loader/Loader.ball-pulse-rise.css']
                }
            };
        },

        /**
         * Create the DOMNode Element of the loader
         *
         * @method controls/loader/Loader#create
         * @return {HTMLElement}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'qui-loader',
                html    : '<div class="qui-loader-message"></div>'+
                          '<div class="qui-loader-inner"></div>',
                styles : {
                    display : 'none',
                    opacity : 0.8
                }
            });

            if ( this.getAttribute( 'cssclass' ) ) {
                this.$Elm.addClass( this.getAttribute( 'cssclass' ) );
            }

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            this.$Inner   = this.$Elm.getElement( '.qui-loader-inner' );
            this.$Message = this.$Elm.getElement( '.qui-loader-message' );

            this.$FX = moofx( this.$Elm );

            return this.$Elm;
        },

        /**
         * Shows the loader
         *
         * @method controls/loader/Loader#show
         */
        show : function(str)
        {
            if ( !this.$Elm ) {
                return;
            }

            if ( !this.$Elm.getParent() ) {
                return;
            }

            var self = this,
                size = this.$Elm.measure(function() {
                    return this.getSize();
                });

            this.$Message.set( 'html', '' );

            if ( typeof str !== 'undefined' )
            {
                this.$Message.set({
                    html   : str,
                    styles : {
                        top : (size.y + 20) / 2
                    }
                });
            }

            // load animation
            var animationData = this.$animations.standard,
                animationType = 'standard';

            if ( this.getAttribute( 'type' ) in this.$animations )
            {
                animationData = this.$animations[ this.getAttribute( 'type' ) ];
                animationType = this.getAttribute( 'type' );
            }

            require( animationData.files , function()
            {
                self.$Inner.set( 'html', '' );

                var i, len, Child;

                var Parent = new Element('div', {
                    'class' : 'qui-loader-inner-'+ animationType
                }).inject( self.$Inner );

                var color = self.getAttribute( 'color' );

                for ( i = 0, len = animationData.children; i < len; i++ )
                {
                    Child = new Element('div', {
                        'class' : 'control-background'
                    }).inject( Parent );

                    if ( color ) {
                        Child.setStyle( 'background', color );
                    }
                }


                self.$Elm.setStyle( 'display', '' );

                if ( !self.$Elm.getParent().hasClass( 'qui-window-popup' ) ) {
                    self.$Elm.getParent().addClass( 'qui-loader-parent' );
                }


                if ( !self.getAttribute( 'closetime' ) ) {
                    return;
                }

                // sicherheitsabfrage nach 10 sekunden
                if ( self.$delay ) {
                    clearTimeout( self.$delay );
                }

                self.$delay = (function() {
                    self.showCloseButton();
                }).delay( self.getAttribute( 'closetime' ) , self );
            });
        },

        /**
         * Hide the loader
         *
         * @method controls/loader/Loader#hide
         * @param {Function} [callback] - callback function, trigger at animation end
         */
        hide : function(callback)
        {
            if ( this.$delay ) {
                clearTimeout( this.$delay );
            }

            if ( !this.$Elm ) {
                return;
            }

            if ( !this.$FX )
            {
                this.$Elm.setStyle( 'display', 'none' );

                if ( typeof callback === 'function' ) {
                    callback();
                }

                return;
            }

            var self = this;

            this.$FX.animate({
                opacity : 0
            }, function()
            {
                self.$Elm.setStyle( 'display', 'none' );

                if ( typeof callback === 'function' ) {
                    callback();
                }
            });
        },

        /**
         * Shows the closing text in the loader
         * if the timeout is triggered
         *
         * @method controls/loader/Loader#showCloseButton
         */
        showCloseButton : function()
        {
            if ( !this.$Elm ) {
                return;
            }

            this.$Elm.set({
                html   : '',
                styles : {
                    cursor  : 'pointer',
                    opacity : 0.9
                }
            });

            var self = this;

            new Element('div', {
                text   : QUILocale.get( 'quiqqer/controls', 'loader.close' ),
                styles : {
                    'font-weight' : 'bold',
                    'text-align'  : 'center',
                    'margin-top'  : (this.$Elm.getSize().y / 2) - 100
                },
                events :
                {
                    click : function() {
                        self.hide();
                    }
                }
            }).inject( this.$Elm );
        }
    });
});
