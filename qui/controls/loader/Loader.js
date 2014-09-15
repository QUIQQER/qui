
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
 */

define([

    'qui/controls/Control',
    'qui/Locale',
    'css!qui/controls/loader/Loader.css'

], function(Control, Locale)
{
    "use strict";

    /**
     * @class qui/controls/loader/Loader
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/loader/Loader',

        options : {
            cssclass  : '',    // extra CSS class
            closetime : 50000, // seconds if the closing window showed
            styles    : false  // extra CSS styles
        },

        initialize : function(options)
        {
            this.parent( options );
            this.$delay = null;

            var self = this;

            this.addEvent('onDestroy', function()
            {
                if ( this.$Elm.getParent() ) {
                    this.$Elm.getParent().removeClass( 'qui-loader-parent' );
                }
            });
        },

        /**
         * Create the DOMNode Element of the loader
         *
         * @method controls/loader/Loader#create
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class' : 'qui-loader',
                html : '<div class="qui-loader-message"></div>'+
                       '<div class="qui-loader-bar">' +
                           '<div class="qui-loader-dot qui-loader-bar1"></div>' +
                           '<div class="qui-loader-dot qui-loader-bar2"></div>' +
                           '<div class="qui-loader-dot qui-loader-bar3"></div>' +
                           '<div class="qui-loader-dot qui-loader-bar4"></div>' +
                           '<div class="qui-loader-dot qui-loader-bar5"></div>' +
                           '<div class="qui-loader-dot qui-loader-bar6"></div>' +
                           '<div class="qui-loader-dot qui-loader-bar7"></div>' +
                           '<div class="qui-loader-dot qui-loader-bar8"></div>' +
                       '</div>',
                styles : {
                    display : 'none',
                    opacity : 0.8
                }
            });

            if ( this.getAttribute('cssclass') ) {
                this.$Elm.addClass( this.getAttribute('cssclass') );
            }

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

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

            var Message = this.$Elm.getElement( '.qui-loader-message' ),
                Bar     = this.$Elm.getElement( '.qui-loader-bar' ),
                size    = this.$Elm.getSize();

            Message.set( 'html', '' );

            var top  = (size.y - 50) / 2,
                left = (size.x - 240) / 2;

            if ( top < 0 )
            {
                size = this.$Elm.measure(function() {
                    return this.getSize();
                });

                top  = (size.y - 50) / 2;
                left = (size.x - 240) / 2;
            }

            Bar.setStyles({
                top  : top,
                left : left
            });

            if ( typeof str !== 'undefined' )
            {
                Message.set({
                    html   : str,
                    styles : {
                        top : (size.y + 20) / 2
                    }
                });

            }

            this.$Elm.setStyle( 'display', '' );

            if ( !this.$Elm.getParent().hasClass( 'qui-window-popup' ) ) {
                this.$Elm.getParent().addClass( 'qui-loader-parent' );
            }

            if ( !this.getAttribute( 'closetime' ) ) {
                return;
            }

            // sicherheitsabfrage nach 10 sekunden
            if ( this.$delay ) {
                clearTimeout( this.$delay );
            }

            this.$delay = (function()
            {
                this.showCloseButton();
            }).delay( this.getAttribute( 'closetime' ) , this );
        },

        /**
         * Hide the loader
         *
         * @method controls/loader/Loader#hide
         */
        hide : function()
        {
            if ( this.$delay ) {
                clearTimeout( this.$delay );
            }

            if ( !this.$Elm ) {
                return;
            }

            this.$Elm.setStyle( 'display', 'none' );
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
                    cursor : 'pointer'
                }
            });

            this.$Elm.setStyle( 'opacity', 0.9 );

            var self = this;

            new Element('div', {
                text   : Locale.get( 'quiqqer/controls', 'loader.close' ),
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
