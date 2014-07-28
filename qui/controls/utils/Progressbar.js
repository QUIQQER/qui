
/**
 * QUIQQER Progress Bar
 *
 * based on dwProgressBar
 * http://davidwalsh.name/progress-bar-animated-mootools
 *
 * @module qui/controls/utils/Progressbar
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require css!qui/controls/utils/Progressbar.css
 *
 * @event complete [ {this} ]
 */

define([

    'qui/controls/Control',

    'css!qui/controls/utils/Progressbar.css'

], function(QUIControl)
{
    "use strict";

    /**
     * @class qui/controls/utils/Progressbar
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : QUIControl,
        Type    : 'qui/controls/utils/Progressbar',

        options : {
            displayText : false,
            speed       : 10,
            fx          : true,

            boxClass        : 'progressbar',
            percentageClass : 'percantage',
            displayClass    : 'display',
            startPercentage : 0
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$Elm = null;
            this.$Perc = null;
            this.$Text = null;

            this.to = 0;
        },

        /**
         * creates the box and percentage elements
         *
         * @method qui/controls/utils/Progressbar#create
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                styles : {
                    position: 'relative'
                }
            });

            this.$Box = new Element('div', {
                'class' : this.options.boxClass
            });

            this.$Perc = new Element('div', {
                'class' : this.options.percentageClass,
                styles  : {
                    width : this.calculate( this.options.startPercentage.toInt() )
                }
            });

            this.$Perc.inject( this.$Box );
            this.$Box.inject( this.$Elm );

            if ( this.options.displayText )
            {
                  this.$Text = new Element('div', {
                      id : this.options.displayClass
                  });

                  this.$Text.inject( this.$Elm );
            }

            this.width = this.$Box.getSize().x;

            return this.$Elm;
        },

        /**
         * calculates width in pixels from percentage
         *
         * @method qui/controls/utils/Progressbar#calculate
         * @param {Integer} percentage - 0 - 100
         */
        calculate : function(percentage)
        {
            if ( this.width === 0 ) {
                this.width = this.$Box.getSize().x;
            }

            return (this.width * (percentage / 100)).toInt();
        },

        /**
         * animates the change in percentage
         *
         * @method qui/controls/utils/Progressbar#animate
         * @param {Integer} to - 0 - 100
         */
        animate : function(to)
        {
            if ( to.toInt() > 100 ) {
                return;
            }

            if ( to.toInt() === 100 )
            {
                this.$Box.addClass( 'complete' );
                this.fireEvent( 'onComplete', [ this ] );
            }

            if ( this.options.fx === false )
            {
                this.$Perc.setStyle( 'width', this.calculate( to.toInt() ) );
            } else
            {
                this.$Perc.set('morph', {
                    duration : this.options.speed,
                    link     : 'cancel'
                }).morph({
                    width : this.calculate( to.toInt() )
                });
            }

            if ( this.options.displayText ) {
                this.Text.set( 'text', to.toInt() +'%' );
            }
        },

        /**
         * sets the percentage from its current state to desired percentage
         *
         * @method qui/controls/utils/Progressbar#set
         * @param {Integer} to - 0 - 100
         */
        set : function(to)
        {
            this.to = to;
            this.animate( this.to );
        },

        /**
         * @method qui/controls/utils/Progressbar#get
         *
         * @return {Integer}
         */
        get: function()
        {
            return this.to;
        }
    });
});
