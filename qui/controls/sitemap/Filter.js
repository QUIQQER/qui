
/**
 * Sitemap Search Control
 * The control searches a Sitemap Control
 *
 * @module qui/controls/sitemap/Filter
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require qui/controls/buttons/Button
 * @require css!qui/controls/sitemap/Filter.css
 *
 * @event onFocus [this]
 * @event onResultNotViewable [this, Item] <-- delete
 * @event onFilter  [this, results]
 */

define('qui/controls/sitemap/Filter', [

    'qui/controls/Control',
    'qui/controls/buttons/Button',

    'css!qui/controls/sitemap/Filter.css'

], function(Control, Button)
{
    "use strict";

    /**
     * A project sitemap
     *
     * @class qui/controls/sitemap/Filter
     *
     * @param {qui/controls/sitemap/Map}
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/sitemap/Filter',

        Binds : [
            'filter',
            '$filter'
        ],

        options : {
            styles      : false,
            placeholder : 'Filter ...',
            withbutton  : false
        },

        initialize : function(Sitemap, options)
        {
            this.parent( options );

            this.$Elm   = null;
            this.$Input = null;
            this.$maps  = [];

            this.bindSitemap( Sitemap );

            this.$timeoutID = false;
        },

        /**
         * Create the DOMNode of the sitemap filter
         *
         * @method qui/controls/sitemap/Filter#create
         * @return {HTMLElement} DOM-Element
         */
        create : function()
        {
            var self = this;

            this.$Elm = new Element('div', {
                'class' : 'qui-sitemap-filter box',
                html    : '<input type="text" placeholder="'+ this.getAttribute('placeholder') +'" />'
            });

            this.$Input = this.$Elm.getElement( 'input' );

            this.$Input.addEvents({

                keyup : function(event)
                {
                    if ( event.key == 'enter' )
                    {
                        self.filter( self.getInput().value );
                        return;
                    }

                    if ( self.$timeoutID ) {
                        clearTimeout( self.$timeoutID );
                    }

                    self.$timeoutID = function()
                    {
                        self.filter( self.getInput().value );
                        self.$timeoutID = false;

                    }.delay( 250 );

                },

                focus : function()
                {
                    self.fireEvent( 'focus', [ self ] );
                },

                blur : function()
                {
                    if ( self.getInput().value === '' ) {
                        self.filter();
                    }
                }
            });


            if ( this.getAttribute( 'withbutton' ) )
            {
                this.$Search = new Button({
                    icon   : 'icon-search',
                    events :
                    {
                        onClick : function() {
                            self.filter( self.getInput().value );
                        }
                    }
                });

                this.$Search.inject( this.$Elm );
            }


            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            return this.$Elm;
        },

        /**
         * Sets the sitemap which is to be searched
         * Older Sitemap binds persist
         *
         * @method qui/controls/sitemap/Filter#bindSitemap
         * @param {Object} Sitemap - qui/controls/sitemap/Map
         * @return {Object} this (qui/controls/sitemap/Filter)
         */
        bindSitemap : function(Sitemap)
        {
            if ( typeof Sitemap === 'undefined' || !Sitemap ) {
                return this;
            }

            this.$maps.push( Sitemap );

            return this;
        },

        /**
         * all binds would be resolved
         *
         * @method qui/controls/sitemap/Filter#clearBinds
         * @return {Object} this (qui/controls/sitemap/Filter)
         */
        clearBinds : function()
        {
            this.$maps = [];

            return this;
        },

        /**
         * Return the filter input DOMNode Element
         *
         * @method qui/controls/sitemap/Filter#getInput
         * @return {HTMLElement}
         */
        getInput : function()
        {
            return this.$Input;
        },

        /**
         * Filter the Sitemaps
         *
         * @method qui/controls/sitemap/Filter#filter
         * @param {String} str - the filter value
         * @return {Object} this (qui/controls/sitemap/Filter)
         */
        filter : function(str)
        {
            str = str || '';

            for ( var i = 0, len = this.$maps.length; i < len; i++ ) {
                this.$filter( this.$maps[ i ], str );
            }

            return this;
        },

        /**
         * Helper Function for the filter
         *
         * @method qui/controls/sitemap/Filter#$filter
         * @param {Object} Map - (qui/controls/sitemap/Map) the Sitemap
         * @param {String} str - the filter value
         */
        $filter : function(Map, str)
        {
            if ( typeof Map === 'undefined' || !Map ) {
                return;
            }

            var i, len;
            var children = Map.getChildren();

            if ( str === '' )
            {
                for ( i = 0, len = children.length; i < len; i++ ) {
                    children[ i ].normalize();
                }

                this.fireEvent( 'filter',  [ this, [] ] );

                return;
            }


            for ( i = 0, len = children.length; i < len; i++ ) {
                children[ i ].holdBack();
            }

            var result = Map.search( str );

            for ( i = 0, len = result.length; i < len; i++ ) {
                result[ i ].normalize();
            }

            this.fireEvent( 'filter', [ this, result ] );
        }
    });
});
