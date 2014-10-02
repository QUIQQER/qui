
/**
 * Sitemap Item
 *
 * @module qui/controls/sitemap/Item
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/utils/Controls
 * @require qui/controls/contextmenu/Menu
 * @require qui/controls/contextmenu/Item
 * @require css!qui/controls/sitemap/Item.css
 */

define([

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Controls',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/classes/utils/DragDrop',

    'css!qui/controls/sitemap/Item.css'

], function(QUI, QUIControl, Utils, QUIContextMenu, QUIContextMenuItem, QUIDragDrop)
{
    "use strict";

    /**
     * @class qui/controls/sitemap/Item
     *
     * @fires onOpen [this]
     * @fires onClose [this]
     * @fires onClick [this, event]
     * @fires onContextMenu [this, event]
     * @fires onSelect [this]
     * @fires onDeSelect [this]
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : QUIControl,
        Type    : 'qui/controls/sitemap/Item',

        Binds : [
            'toggle',
            'click',
            '$onChildDestroy',
            '$onSetAttribute'
        ],

        options : {
            value : '',
            text  : '',
            icon  : '',

            alt   : '',
            title : '',

            hasChildren : false,
            dragable    : false
        },

        $Elm   : null,
        $items : [],

        initialize : function(options)
        {
            this.parent( options );

            this.$Elm    = null;
            this.$Map    = null;
            this.$Opener = null;
            this.$Icons  = null;
            this.$Text   = null;

            this.$Children    = null;
            this.$ContextMenu = null;
            this.$DragDrop    = null;
            this.$disable     = false;

            this.$items = [];

            this.addEvent( 'onSetAttribute', this.$onSetAttribute );

            this.addEvent('onDestroy', function(Item)
            {
                Item.clearChildren();

                if ( this.$Opener ) {
                    this.$Opener.destroy();
                }

                if ( this.$Icons ) {
                    this.$Icons.destroy();
                }

                if ( this.$Text ) {
                    this.$Text.destroy();
                }

                if ( this.$Children ) {
                    this.$Children.destroy();
                }

                if ( this.$ContextMenu ) {
                    this.$ContextMenu.destroy();
                }
            });
        },

        /**
         * Create the DOMNode of the Sitemap Item
         *
         * @method qui/controls/sitemap/Item#create
         * @return {DOMNode}
         */
        create : function(Parent)
        {
            var i, len;
            var self = this;

            this.$Elm = new Element('div', {
                'class' : 'qui-sitemap-entry box',
                alt   : this.getAttribute('alt'),
                title : this.getAttribute('title'),
                'data-value' : this.getAttribute('value'),
                'data-quiid' : this.getId(),
                html  : '<div class="qui-sitemap-entry-opener"></div>' +
                        '<div class="qui-sitemap-entry-container">' +
                            '<div class="qui-sitemap-entry-icon"></div>' +
                            '<div class="qui-sitemap-entry-text">###</div>' +
                        '</div>' +
                        '<div class="qui-sitemap-entry-children"></div>',
                events :
                {
                    contextmenu : function(event)
                    {
                        if ( self.getMap() ) {
                            self.getMap().childContextMenu( self, event );
                        }

                        self.fireEvent( 'contextMenu', [ self, event ] );
                    }
                }
            });

            this.$Opener    = this.$Elm.getElement('.qui-sitemap-entry-opener');
            this.$Icons     = this.$Elm.getElement('.qui-sitemap-entry-icon');
            this.$Text      = this.$Elm.getElement('.qui-sitemap-entry-text');
            this.$Children  = this.$Elm.getElement('.qui-sitemap-entry-children');
            this.$Container = this.$Elm.getElement('.qui-sitemap-entry-container');

            // events
            this.$Opener.addEvents({
                click : this.toggle
            });

            this.$Text.addEvents({
                click : this.click
            });

            // ui
            this.$Children.setStyle( 'display', 'none' );


            if ( this.getAttribute( 'icon' ) ) {
                this.addIcon( this.getAttribute( 'icon' ) );
            }

            if ( this.getAttribute( 'text' ) ) {
                this.$Text.set( 'html', this.getAttribute( 'text' ) );
            }

            len = this.$items.length;

            if ( len || this.hasChildren() )
            {
                this.$setOpener();

                for ( i = 0; i < len; i++ )
                {
                    this.$items[ i ].inject( this.$Children );
                    this.$items[ i ].refresh();
                }
            }

            if ( this.getAttribute( 'dragable' ) ) {
                this.getDragDrop();
            }

            return this.$Elm;
        },

        /**
         * refresh the entry - recalc
         *
         * @return {self}
         */
        refresh : function()
        {
            var width = 0;

            if ( this.$Opener )
            {
                width = width + this.$Opener.measure(function() {
                    return this.getSize().x;
                });
            }

            if ( this.$Icons )
            {
                width = width + this.$Icons.measure(function() {
                    return this.getSize().x;
                });
            }

            if ( this.$Text )
            {
                width = width + this.$Text.measure(function() {
                    return this.getSize().x;
                });
            }

            if ( !width ) {
                return this;
            }

            this.$Elm.setStyle( 'width', width );

            return this;
        },

        /**
         * Return the text DOMNode
         *
         * @method qui/controls/sitemap/Item#getTextElm
         * @return {DOMNode|null}
         */
        getTextElm : function()
        {
            if ( this.$Text ) {
                return this.$Text;
            }

            return null;
        },

        /**
         * Add an Icon to the Icon Container
         * You can only add an icon if the main DOMNode are drawed
         *
         * @method qui/controls/sitemap/Item#addIcon
         * @param {String} icon_url - URL of the Image
         * @return {DOMNode} Element
         */
        addIcon : function(icon_url)
        {
            if ( !this.$Icons ) {
                this.getElm();
            }

            var Img = this.$Icons.getElement( '[src="'+ icon_url +'"]' );

            if ( Img ) {
                return Img;
            }

            Img = this.$Icons.getElement( '.'+ icon_url );

            if ( Img ) {
                return Img;
            }

            if ( Utils.isFontAwesomeClass( icon_url ) )
            {
                return new Element('i', {
                    'class' : 'qui-sitemap-entry-icon-itm '+ icon_url
                }).inject( this.$Icons );
            }

            return new Element('img', {
                src     : icon_url,
                'class' : 'qui-sitemap-entry-icon-itm'
            }).inject( this.$Icons );
        },

        /**
         * Remove an icon of the Icon Container
         *
         * @method qui/controls/sitemap/Item#removeIcon
         * @param {String} icon_url - URL of the Image
         * @return {this}
         */
        removeIcon : function(icon_url)
        {
            if ( !this.$Icons ) {
                return this;
            }

            var Img = this.$Icons.getElement( '[src="'+ icon_url +'"]' );

            if ( Img ) {
                Img.destroy();
            }

            Img = this.$Icons.getElement( '.'+ icon_url );

            if ( Img ) {
                Img.destroy();
            }


            return this;
        },

        /**
         * Activate the Item. The inactive Icon would be destroy
         *
         * @method qui/controls/sitemap/Item#activate
         * @return {this}
         */
        activate : function()
        {
            if ( this.$disable ) {
                return this;
            }

            this.removeIcon( 'icon-remove' );

            return this;
        },

        /**
         * Deactivate the Item. Add inactive Icon
         *
         * @method qui/controls/sitemap/Item#deactivate
         * @return {this}
         */
        deactivate : function()
        {
            if ( this.$disable ) {
                return this;
            }

            var Icon = this.addIcon( 'icon-remove' );

            Icon.setStyles({
                color : 'red'
            });

            return this;
        },

        /**
         * Add a Child
         *
         * @method qui/controls/sitemap/Item#appendChild
         * @param {qui/controls/sitemap/Item} Child
         * @return {this}
         */
        appendChild : function(Child)
        {
            this.$items.push( Child );
            this.$setOpener();

            if ( this.$Children )
            {
                Child.inject( this.$Children );

                var size = this.$Children.getSize();

                if ( size.x )
                {
                    var child_size = 10 +
                                     Child.$Opener.getSize().x +
                                     Child.$Icons.getSize().x +
                                     Child.$Text.getSize().x;

                    if ( child_size > size.x ) {
                        this.$Children.setStyle( 'width', child_size );
                    }
                }
            }

            Child.setParent( this );        // set the parent to the this
            Child.setMap( this.getMap() );  // set the parent to the Map

            Child.addEvents({
                onDestroy : this.$onChildDestroy
            });

            Child.refresh();

            this.getMap().fireEvent( 'appendChild', [ this, Child ] );

            return this;
        },

        /**
         * Get the first Child if exists
         *
         * @method qui/controls/sitemap/Item#firstChild
         * @return {qui/controls/sitemap/Item|false}
         */
        firstChild : function()
        {
            return this.$items[0] || false;
        },

        /**
         * Have the Items childrens?
         * Observed the hasChildren Attribute
         *
         * @method qui/controls/sitemap/Item#hasChildren
         * @return {Bool}
         */
        hasChildren : function()
        {
            if ( this.getAttribute( 'hasChildren' ) ) {
                return true;
            }

            return this.$items.length ? true : false;
        },

        /**
         * Returns the children items
         *
         * @method qui/controls/sitemap/Item#getChildren
         * @return {Array}
         */
        getChildren : function()
        {
            return this.$items;
        },

        /**
         * Delete all children
         *
         * @method qui/controls/sitemap/Item#clearChildren
         * @return {this}
         */
        clearChildren : function()
        {
            var i, len;
            var items = this.$items;

            for ( i = 0, len = items.length; i < len; i++ )
            {
                if ( items[ i ] ) {
                    items[ i ].destroy();
                }
            }

            this.$Children.set( 'html', '' );
            this.$items = [];

            return this;
        },

        /**
         * Get the number of children
         *
         * @method qui/controls/sitemap/Item#countChildren
         * @return {Integer}
         */
        countChildren : function()
        {
            return this.$items.length;
        },

        /**
         * Remove the child from the list
         *
         * @method qui/controls/sitemap/Item#countChildren
         * @param {qui/controls/sitemap/Item} Child
         * @return {this} self
         * @ignore
         */
        $removeChild : function(Child)
        {
            var items = [];

            for ( var i = 0, len = this.$items.length; i < len; i++ )
            {
                if ( this.$items[ i ].getId() !== Child.getId() ) {
                    items.push( this.$items[ i ] );
                }
            }

            this.$items = items;

            // dont delete it, because ajax
            //this.setAttribute( 'hasChildren', this.$items.length ? true : false );

            this.$setOpener();

            return this;
        },

        /**
         * Select the Item
         *
         * @method qui/controls/sitemap/Item#select
         * @param {DOMEvent} event - [optional]
         * @return {this} self
         */
        select : function(event)
        {
            if ( this.$disable ) {
                return this;
            }

            this.fireEvent( 'select', [ this, event ] );

            if ( this.$Container ) {
                this.$Container.addClass( 'qui-sitemap-entry-select' );
            }

            return this;
        },

        /**
         * Deselect the Item
         *
         * @method qui/controls/sitemap/Item#deselect
         * @return {this} self
         */
        deselect : function()
        {
            this.fireEvent( 'deSelect', [ this ] );

            if ( this.$Container ) {
                this.$Container.removeClass( 'qui-sitemap-entry-select' );
            }

            return this;
        },

        /**
         * Normalite the item
         * no selection or highlighting
         *
         * @method qui/controls/sitemap/Item#normalize
         * @return {this} self
         */
        normalize : function()
        {
            this.enable();

            if ( this.$Container )
            {
                this.$Container.removeClass( 'qui-sitemap-entry-select' );
                this.$Container.removeClass( 'qui-sitemap-entry-holdBack' );
            }

            if ( this.$Opener ) {
                this.$Opener.removeClass( 'qui-sitemap-entry-holdBack' );
            }

            return this;
        },

        /**
         * Disable the item
         *
         * @method qui/controls/sitemap/Item#disable
         * @return {this} self
         */
        disable : function()
        {
            this.$disable = true;

            if ( this.$Container ) {
                this.$Container.addClass( 'qui-sitemap-entry-disabled' );
            }

            return this;
        },

        /**
         * Enable the item if the item was disabled
         *
         * @method qui/controls/sitemap/Item#enable
         * @return {this} self
         */
        enable : function()
        {
            this.$disable = false;

            if ( this.$Container ) {
                this.$Container.removeClass( 'qui-sitemap-entry-disabled' );
            }

            return this;
        },

        /**
         * the item is a little disappear
         *
         * @method qui/controls/sitemap/Item#holdBack
         * @return {this} self
         */
        holdBack : function()
        {
            if ( this.$Container ) {
                this.$Container.addClass( 'qui-sitemap-entry-holdBack' );
            }

            if ( this.$Opener ) {
                this.$Opener.addClass( 'qui-sitemap-entry-holdBack' );
            }
        },

        /**
         * Klick the sitemap item
         *
         * @method qui/controls/sitemap/Item#click
         * @param {Event} event - [optional -> event click]
         */
        click : function(event)
        {
            this.select( event );
            this.fireEvent( 'click', [ this, event ] );
        },

        /**
         * Opens the childrens
         *
         * @method qui/controls/sitemap/Item#open
         * @return {this} self
         */
        open : function()
        {
            if ( !this.$Children ) {
                return this;
            }

            this.$Children.setStyle( 'display', '' );
            this.$setOpener();

            this.fireEvent( 'open', [ this ] );

            return this;
        },

        /**
         * Close the childrens
         *
         * @method qui/controls/sitemap/Item#close
         * @return {this} self
         */
        close : function()
        {
            if ( !this.$Children ) {
                return this;
            }

            this.$Children.setStyle( 'display', 'none' );
            this.$setOpener();

            this.fireEvent( 'close', [this] );

            return this;
        },

        /**
         * Switch between open and close
         *
         * @method qui/controls/sitemap/Item#toggle
         * @return {this} self
         */
        toggle : function()
        {
            if ( this.isOpen() )
            {
                this.close();
            } else
            {
                this.open();
            }

            return this;
        },

        /**
         * Is the Item open?
         *
         * @method qui/controls/sitemap/Item#isOpen
         * @return {Bool}
         */
        isOpen : function()
        {
            if ( !this.$Children ) {
                return false;
            }

            return this.$Children.getStyle( 'display' ) == 'none' ? false : true;
        },

        /**
         * Create and return a contextmenu for the Element
         *
         * @method qui/controls/sitemap/Item#getContextMenu
         * @return {qui/controls/sitemap/Menu} Menu
         */
        getContextMenu : function()
        {
            if ( this.$ContextMenu ) {
                return this.$ContextMenu;
            }

            var cm_name = this.getAttribute( 'name' ) || this.getId();

            this.$ContextMenu = new QUIContextMenu({
                name   : cm_name +'-contextmenu',
                events :
                {
                    onShow : function(Menu)
                    {
                        Menu.focus();
                    },
                    onBlur : function(Menu)
                    {
                        Menu.hide();
                    }
                }
            });

            this.$ContextMenu.inject( document.body );
            this.$ContextMenu.hide();

            return this.$ContextMenu;
        },

        /**
         * Get the map parent, if it is set
         *
         * @method qui/controls/sitemap/Item#getMap
         * @return {qui/controls/sitemap/Map|null} Map
         */
        getMap : function()
        {
            return this.$Map;
        },

        /**
         * Set the map parent
         *
         * @method qui/controls/sitemap/Item#getMap
         * @param {qui/controls/sitemap/Map} Map
         * @return {this}
         */
        setMap : function(Map)
        {
            this.$Map = Map;

            return this;
        },

        /**
         * @method qui/controls/sitemap/Item#$setOpener
         */
        $setOpener : function()
        {
            if ( !this.$Elm ) {
                return;
            }

            if ( this.hasChildren() === false )
            {
                this.$Opener.removeClass( 'qui-sitemap-entry-opener-open' );
                this.$Opener.removeClass( 'qui-sitemap-entry-opener-close' );

                return;
            }

            if ( this.isOpen() )
            {
                this.$Opener.removeClass( 'qui-sitemap-entry-opener-open' );
                this.$Opener.addClass( 'qui-sitemap-entry-opener-close' );

            } else
            {
                this.$Opener.addClass( 'qui-sitemap-entry-opener-open' );
                this.$Opener.removeClass( 'qui-sitemap-entry-opener-close' );
            }
        },

        /**
         * event : on set attribute
         * change the DOMNode Element if some attributes changed
         *
         * @method qui/controls/sitemap/Item#$onSetAttribute
         * @param {String} key - attribute name
         * @param {String} value - attribute value
         */
        $onSetAttribute : function(key, value)
        {
            if ( !this.$Elm ) {
                return;
            }

            if ( key == 'icon' )
            {
                this.removeIcon( this.getAttribute('icon') );
                this.addIcon( value );

                return;
            }

            if ( key == 'text' )
            {
                this.$Text.set( 'html', value );

                var w = ( this.$Text.getSize().x ).toInt();

                if ( this.$Opener ) {
                    w = w + ( this.$Opener.getSize().x ).toInt();
                }

                if ( this.$Icons ) {
                    w = w + ( this.$Icons.getSize().x ).toInt();
                }

                this.$Elm.setStyle( 'width', w );
                return;
            }

            if ( key == 'value' )
            {
                this.$Elm.set( 'data-value', value );
                return;
            }
        },

        /**
         * event : children destroy
         *
         * @method qui/controls/sitemap/Item#$onChildDestroy
         * @param {qui/controls/sitemap/Item} Item
         */
        $onChildDestroy : function(Item)
        {
            this.$removeChild( Item );
        },


        /**
         * Drag Drop Methods
         */

        /**
         * Return the DragDrop Object
         *
         * @return DragDrop
         */
        getDragDrop : function()
        {
            if ( this.$DragDrop ) {
                return this.$DragDrop;
            }

            var self = this;

            // drag drop for the item
            this.$DragDrop = new QUIDragDrop( this.$Elm, {
                dropables : '.qui-sitemap-entry-dropable',
                styles : {
                    height : 30,
                    width : 200
                },
                events :
                {
                    onEnter : function(Element, Dragable, Droppable)
                    {
                        if ( !Droppable ) {
                            return;
                        }

                        var quiid = Droppable.get( 'data-quiid' );

                        if ( !quiid ) {
                            return;
                        }

                        QUI.Controls.getById( quiid ).highlight();
                    },

                    onLeave : function(Element, Dragable, Droppable)
                    {
                        if ( !Droppable ) {
                            return;
                        }

                        var quiid = Droppable.get( 'data-quiid' );

                        if ( !quiid ) {
                            return;
                        }

                        QUI.Controls.getById( quiid ).normalize();
                    },

                    onDrop : function(Element, Dragable, Droppable, event)
                    {
                        if ( !Droppable ) {
                            return;
                        }
                        var quiid = Droppable.get( 'data-quiid' );

                        if ( !quiid ) {
                            return;
                        }

                        var Bar = QUI.Controls.getById( quiid );

                        Bar.normalize();
                        Bar.appendChild( self );
                    }
                }
            });
        }

    });
});
