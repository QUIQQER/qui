
/**
 * Sitemap Map
 *
 * @module qui/controls/sitemap/Map
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/sitemap/Item
 * @require css!qui/controls/sitemap/Map.css
 */

define('qui/controls/sitemap/Map', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/sitemap/Item',

    'css!qui/controls/sitemap/Map.css'

], function(QUI, Control, Item)
{
    "use strict";

    /**
     * @class qui/controls/sitemap/Map
     * @fires onChildClick
     * @event onAppendChild [{qui/controls/sitemap/Item}]
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/sitemap/Map',

        options : {
            multible : false // multible selection true or false
        },

        initialize : function(options)
        {
            var self = this;

            self.parent( options );

            self.$items = [];
            self.$sels  = {};

            self.addEvent('onAppendChild', function(Parent, Child)
            {
                Child.addEvents({

                    onClick : function(Item, event) {
                        self.fireEvent( 'childClick', [ Item, self ] );
                    },

                    onSelect : function(Item, event)
                    {
                        if ( self.getAttribute( 'multible' ) === false ||
                             typeof event === 'undefined' ||
                             self.getAttribute( 'multible' ) && !event.control )
                        {
                            self.deselectAllChildren();
                        }

                        self.$addSelected( Item );
                    }
                });

            });

            self.addEvent('onDestroy', function() {
                self.clearChildren();
            });
        },

        /**
         * Create the DOMNode of the Map
         *
         * @method qui/controls/sitemap/Map#create
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div.qui-sitemap-map', {
                'data-quiid' : this.getId()
            });

            for ( var i = 0, len = this.$items.length; i < len; i++ ) {
                this.$items[ i ].inject( this.$Elm );
            }

            return this.$Elm;
        },

        /**
         * Get the first Child if exists
         *
         * @method qui/controls/sitemap/Map#firstChild
         * @return {qui/controls/sitemap/Item|false}
         */
        firstChild : function()
        {
            return this.$items[0] || false;
        },

        /**
         * Add a Child
         *
         * @method qui/controls/sitemap/Map#appendChild
         * @param {qui/controls/sitemap/Item} Itm
         * @return {this}
         */
        appendChild : function(Itm)
        {
            Itm.setParent( this );
            Itm.setMap( this );

            this.$items.push( Itm );

            if ( this.$Elm ) {
                Itm.inject( this.$Elm );
            }

            this.fireEvent('appendChild', [this, Itm]);

            return this;
        },

        /**
         * Clear all children / destroy ist
         *
         * @method qui/controls/sitemap/Map#clearChildren
         * @return {this} self
         */
        clearChildren : function()
        {
            for ( var i = 0, len = this.$items.length; i < len; i++ ) {
                this.$clearItem( this.$items[i] );
            }

            this.$items = [];

            return this;
        },

        /**
         * Get all selected Items
         *
         * @method qui/controls/sitemap/Map#getSelectedChildren
         * @return {Array}
         */
        getSelectedChildren : function()
        {
            var i;
            var result = [];

            for ( i in this.$sels ) {
                result.push( this.$sels[i] );
            }

            return result;
        },

        /**
         * Get specific children
         *
         * @method qui/controls/sitemap/Map#getChildren
         * @param {String} selector
         * @return {Array} List of children
         */
        getChildren : function(selector)
        {
            if ( !this.$Elm ) {
                return [];
            }

            selector = selector || '.qui-sitemap-entry';

            var i, len, quiid, Child;

            var children = this.$Elm.getElements( selector ),
                result   = [],
                Controls = QUI.Controls;


            if ( !children.length ) {
                return result;
            }

            for ( i = 0, len = children.length; i < len; i++ )
            {
                quiid = children[i].get( 'data-quiid' );
                Child = Controls.getById( quiid );

                if ( Child ) {
                    result.push( Child );
                }
            }

            return result;
        },

        /**
         * Alias for getChildren
         *
         * @method qui/controls/sitemap/Map#getChildren
         * @see qui/controls/sitemap/Map#getChildren
         */
        getElements : function(selector)
        {
            return this.getChildren( selector );
        },

        /**
         * Get specific children by value
         *
         * @method qui/controls/sitemap/Map#getChildren
         * @param {String|Integer} value
         * @return {Array}
         */
        getChildrenByValue : function(value)
        {
            return this.getChildren( '[data-value="'+ value +'"]' );
        },

        /**
         * Deselected all selected Items
         *
         * @method qui/controls/sitemap/Map#deselectAllChildren
         * @return {this} self
         */
        deselectAllChildren : function()
        {
            for ( var i in this.$sels ) {
                this.$sels[i].deselect();
            }

            this.$sels = {};

            return this;
        },

        /**
         * Execute a {qui/controls/sitemap/Item} contextMenu
         *
         * @method qui/controls/sitemap/Map#childContextMenu
         * @fires onChildContextMenu {qui/controls/sitemap/Item}
         * @param {qui/controls/sitemap/Item} Itm
         * @return {this} self
         */
        childContextMenu : function(Itm, event)
        {
            if ( typeof Itm === 'undefined' ) {
                return this;
            }

            this.fireEvent( 'childContextMenu', [this, Itm, event] );

            return this;
        },

        /**
         * Opens all children and children children
         *
         * @method qui/controls/sitemap/Map#openAll
         * @return {this} self
         */
        openAll : function()
        {
            for ( var i = 0, len = this.$items.length; i < len; i++ ) {
                this.$openItem( this.$items[i] );
            }

            return this;
        },

        /**
         * Clear a child item
         *
         * @method qui/controls/sitemap/Map#$clearItem
         * @param {qui/controls/sitemap/Item}
         * @return {this} self
         */
        $clearItem : function(Item)
        {
            if ( Item.hasChildren() === false )
            {
                Item.destroy();
                return this;
            }

            var i, len;
            var children = Item.getChildren();

            for ( i = 0, len = children.length; i < len; i++ ) {
                this.$clearItem( children[i] );
            }

            Item.clearChildren();
            Item.destroy();

            return this;
        },

        /**
         * Opens a child item
         *
         * @method qui/controls/sitemap/Map#$openItem
         * @param {qui/controls/sitemap/Item}
         * @return {this} self
         */
        $openItem : function(Item)
        {
            Item.open();

            if ( Item.hasChildren() === false ) {
                return this;
            }

            var i, len;
            var children = Item.getChildren();

            for ( i = 0, len = children.length; i < len; i++ )
            {
                if ( children[i].hasChildren() ) {
                    this.$openItem( children[i] );
                }
            }

            return this;
        },

        /**
         * Remove the child from the list
         *
         * @method qui/controls/sitemap/Item#countChildren
         * @param {qui/controls/sitemap/Item} Child
         * @return {this} self
         */
        $removeChild : function(Child)
        {
            var items = [];

            for ( var i = 0, len = this.$items.length; i < len; i++ )
            {
                if ( this.$items[i].getId() !== Child.getId() ) {
                    items.push( this.$items[i] );
                }
            }

            this.$items = items;

            return this;
        },

        /**
         * Adds an selected Item to the sels list
         *
         * @method qui/controls/sitemap/Map#$addSelected
         * @param {qui/controls/sitemap/Item}
         * @return {this}
         * @ignore
         */
        $addSelected : function(Item)
        {
            this.$sels[ Item.getId() ] = Item;

            return this;
        },

        /**
         * Remove an selected Item from the sels list
         *
         * @method qui/controls/sitemap/Map#$removeSelected
         * @param {qui/controls/sitemap/Item}
         * @return {this}
         * @ignore
         */
        $removeSelected : function(Item)
        {
            if ( this.$sels[ Item.getId() ] )
            {
                this.$sels[ Item.getId() ].deselect();
                delete this.$sels[ Item.getId() ];
            }

            return this;
        },

        /**
         * Sitemap filter, the user can search for certain items
         *
         * @method qui/controls/sitemap/Map#search
         * @param {String} search
         * @return {Array} List of found elements
         */
        search : function(search)
        {
            search = search || '';

            var i, len, qid, Item, Node;

            var list     = this.$Elm.getElements('.qui-sitemap-entry-text'),
                result   = [],
                Controls = QUI.Controls,
                regex    = new RegExp(search, "gi");

            for ( i = 0, len = list.length; i < len; i++ )
            {
                Node = list[ i ];

                if ( Node.get('text').match( regex ) )
                {
                    qid  = Node.getParent( '.qui-sitemap-entry' )
                               .get('data-quiid');

                    Item = Controls.getById( qid );

                    if ( Item ) {
                        result.push( Item );
                    }
                }
            }

            return result;
        }
    });
});
