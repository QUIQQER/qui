
/**
 * A breadcrumb bar
 *
 * @module qui/controls/breadcrumb/Bar
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require css!qui/controls/breadcrumb/Bar.css
 */

define([

    'qui/controls/Control',

    'css!qui/controls/breadcrumb/Bar.css'

], function(Control)
{
    "use strict";

    /**
     * @class qui/controls/breadcrumb/Bar
     * @desc Breadcrumb bar item - Parent object of all breadcrumb items
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/breadcrumb/Bar',

        options : {
            width       : false,  // with of the bar
            itemClasses : false,  // if the items should get some extra css classes
                                  // can be an array or string
            cssclass    : false   // extra css classes for the bar
        },

        initialize : function(options)
        {
            this.$items = [];
            this.parent( options );
        },

        /**
         * Create the DOMNode for the Bar
         *
         * @method qui/controls/breadcrumb/Bar#create
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class'      : 'qui-breadcrumb box',
                'data-quiid' : this.getId()
            });

            if ( this.getAttribute( 'width' ) ) {
                this.$Elm.setStyle( 'width', this.getAttribute( 'width' ) );
            }

            if ( this.getAttribute( 'cssclass' ) ) {
                this.$Elm.addClass( this.getAttribute( 'cssclass' ) );
            }

            return this.$Elm;
        },

        /**
         * append a child to the end of the breadcrumb
         *
         * @method qui/controls/breadcrumb/Bar#appendChild
         * @param {qui/controls/breadcrumb/Item} Item - breadcrumb item
         * @return {this}
         */
        appendChild : function(Item)
        {
            if ( Item.getType() !== 'qui/controls/breadcrumb/Item' ) {
                return this;
            }

            this.$items.push( Item );

            Item.inject( this.getElm() );

            if ( this.getAttribute( 'itemClasses' ) )
            {
                var cssclass = this.getAttribute( 'itemClasses' );

                if ( typeOf( cssclass ) == 'array' ) {
                    cssclass = cssclass.join( ' ' );
                }

                Item.getElm().addClass( cssclass );
            }

            return this;
        },

        /**
         * Return the first child of the breadcrumb
         *
         * @method qui/controls/breadcrumb/Bar#firstChild
         * @return {qui/controls/breadcrumb/Item|false}
         */
        firstChild : function()
        {
            if ( typeof this.$items[ 0 ] !== 'undefined' ) {
                return this.$items[ 0 ];
            }

            return false;
        },

        /**
         * Return the last child of the breadcrumb
         *
         * @method qui/controls/breadcrumb/Bar#lastChild
         * @return {qui/controls/breadcrumb/Item|false}
         */
        lastChild : function()
        {
            return this.$items.getLast();
        },

        /**
         * Return all children
         *
         * @method qui/controls/breadcrumb/Bar#getChildren
         * @return {Array}
         */
        getChildren : function()
        {
            return this.$items;
        },

        /**
         * Clears the complete breadcrumb
         *
         * @method qui/controls/breadcrumb/Bar#clear
         */
        clear : function()
        {
            for ( var i = 0, len = this.$items.length; i < len; i++ ) {
                this.$items[i].destroy();
            }

            this.$items = [];
        },

        /**
         * Resize the Breadcrumb with the new attributes
         *
         * @method qui/controls/breadcrumb/Bar#resize
         */
        resize : function()
        {
            if ( this.getAttribute( 'width' ) ) {
                this.getElm().setStyle( 'width', this.getAttribute( 'width' ) );
            }
        }
    });
});
