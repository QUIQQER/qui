
/**
 * A panel where you can set bookmarks
 *
 * @author www.pcsg.de (Henning Leutz)
 * @module qui/controls/bookmarks/Panel
 *
 * @require qui/QUI
 * @require qui/controls/desktop/Panel
 * @require qui/controls/buttons/Button
 * @require qui/utils/Controls
 * @require css!qui/controls/bookmarks/Panel.css
 *
 * @event appendChild [ {self}, {Object} Child ]
 * @event removeChild [ {self} ]
 */

define('qui/controls/bookmarks/Panel', [

    'qui/QUI',
    'qui/controls/desktop/Panel',
    'qui/controls/buttons/Button',
    'qui/utils/Controls',

    'css!qui/controls/bookmarks/Panel.css'

], function(QUI, QUIPanel, QUIButton, Utils)
{
    "use strict";

    /**
     * @class qui/controls/bookmarks/Panel
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : QUIPanel,
        Type    : 'qui/controls/bookmarks/Panel',

        Binds : [
            '$create',
            '$clickRemoveButton',
            '$onItemMouseEnter',
            '$onItemMouseLeave'
        ],

        initialize: function(options)
        {
            this.$bookmarks = [];

            this.setAttributes({
                title  : 'Bookmarks',
                icon   : 'icon-book',
                footer : false
            });

            this.addEvent( 'onCreate', this.$create );
            this.parent( options );
        },

        /**
         * resize the bookmark panels
         */
        resize : function()
        {
            this.parent();

            var size  = this.$Content.getSize(),
                width = size.x - 150;

            if ( width <= 0 ) {
                return;
            }

            this.$Content.getElements('.qui-bookmark-text').each(function(Text) {
                Text.setStyle( 'width', width );
            });
        },

        /**
         * Save the bookmark panel to the workspace
         *
         * @method qui/controls/bookmarks/Panel#serialize
         * @return {Object} data
         */
        serialize : function()
        {
            var i, len, icon, clsName, Icon, Bookmark;
            var bookmarks = [];

            for ( i = 0, len = this.$bookmarks.length; i < len; i++ )
            {
                Bookmark = this.$bookmarks[ i ];
                Icon     = Bookmark.getElement( '.qui-bookmark-icon' );
                icon     = '';

                if ( Icon.getElement( 'img' ) )
                {
                    icon = Icon.getElement( 'img' ).src;
                } else
                {
                    clsName = Icon.className.replace( 'qui-bookmark-icon', '' );
                    clsName = clsName.trim();

                    if ( clsName ) {
                        icon = clsName;
                    }
                }

                bookmarks.push({
                    text  : Bookmark.getElement( '.qui-bookmark-text' ).get( 'text' ),
                    icon  : icon,
                    click : Bookmark.get( 'data-click' ),
                    path  : Bookmark.get( 'data-path' )
                });
            }

            return {
                attributes : this.getAttributes(),
                type       : this.getType(),
                bookmarks  : bookmarks
            };
        },

        /**
         * import the saved data
         *
         * @method qui/controls/bookmarks/Panel#unserialize
         * @param {Object} data
         * @return {Object} this (qui/controls/bookmarks/Panel)
         */
        unserialize : function(data)
        {
            this.setAttributes( data.attributes );

            if ( !this.$Container )
            {
                this.$serialize = data;
                return this;
            }

            var i, len, Bookmark;
            var bookmarks = data.bookmarks;

            if ( !bookmarks ) {
                return this;
            }

            for ( i = 0, len = bookmarks.length; i < len; i++ )
            {
                Bookmark = bookmarks[ i ];

                this.$bookmarks.push(
                    this.$createEntry({
                        text  : Bookmark.text,
                        icon  : Bookmark.icon,
                        click : Bookmark.click,
                        path  : Bookmark.path
                    }).inject( this.$Container )
                );
            }

            this.resize();

            return this;
        },

        /**
         * Internal creation
         *
         * @method qui/controls/bookmarks/Panel#$create
         */
        $create : function()
        {
            this.$Container = new Element( 'div' ).inject(
                this.getBody()
            );

            if ( typeof this.$serialize !== 'undefined' ) {
                this.unserialize( this.$serialize );
            }

            // qui-contextitem items can be droped
            this.getElm()
                .addClass( 'qui-contextitem-dropable' )
                .addClass( 'qui-sitemap-entry-dropable' );

            this.fireEvent( 'load', [ this ] );
        },

        /**
         * Add a bookmarks
         *
         * @method qui/controls/bookmarks/Panel#appendChild
         * @param {Object} Item - qui/controls/Control, A QUI control
         * @return {Object} this (qui/controls/bookmarks/Panel)
         */
        appendChild : function(Item)
        {
            if ( !this.$Container ) {
                return this;
            }

            var Child;

            // parse qui/controls/contextmenu/Item to an Bookmark
            if ( Item.getType() == 'qui/controls/contextmenu/Item' )
            {
                var path = Item.getPath();

                Child = this.$createEntry({
                    text : Item.getAttribute( 'text' ),
                    icon : Item.getAttribute( 'icon' ),
                    path : path
                }).inject( this.$Container );

            } else
            {
                Child = this.$createEntry({
                    text  : Item.getAttribute( 'text' ),
                    icon  : Item.getAttribute( 'icon' ),
                    click : Item.getAttribute( 'bookmark' ),
                    path  : ''
                }).inject( this.$Container );
            }

            this.$bookmarks.push( Child );
            this.resize();

            this.fireEvent( 'appendChild', [ this, Child ] );

            return this;
        },

        /**
         * Remove a bookmarks
         *
         * @method qui/controls/desktop/panels/Bookmarks#remove
         */
        remove : function()
        {

        },

        /**
         * Create a bookmark with all events
         *
         * @method qui/controls/bookmarks/Panel#$createEntry
         * @param {Object} params - {text, icon, click}
         * @return {HTMLElement}
         */
        $createEntry : function(params)
        {
            var BookmarkPanel = this;

            params.text  = params.text || '';
            params.icon  = params.icon || false;
            params.click = params.click || '';
            params.path  = params.path || '';

            var Bookmark = new Element('div', {
                'class' : 'qui-bookmark box smooth',
                'html'  : '<span class="qui-bookmark-icon"></span>' +
                          '<span class="qui-bookmark-text">'+ params.text +'</span>',
                'data-click' : params.click,
                'data-path'  : params.path,
                title  : params.text,
                events :
                {
                    click : function()
                    {
                        var click = this.get( 'data-click' ),
                            path  = this.get( 'data-path' );

                        if ( path )
                        {
                            if ( BookmarkPanel.$clickMenuItem( path ) ) {
                                return;
                            }
                        }

                        if ( typeof click === 'undefined' ) {
                            return;
                        }

                        var e = eval( '('+ click +')' );

                        if ( typeof e === 'function' ) {
                            e();
                        }
                    },

                    mouseleave : this.$onItemMouseLeave,
                    mouseenter : this.$onItemMouseEnter
                }
            });

            var Remove = new QUIButton({
                icon : 'icon-remove',
                'class' : 'qui-bookmark-button btn-red',
                styles : {
                    'float' : 'right',
                    display : 'none'
                },
                events : {
                    onClick : this.$clickRemoveButton
                },
                Bookmark : Bookmark
            }).inject( Bookmark );

            Remove.getElm().removeClass( 'qui-button' );

            if ( params.icon )
            {
                var Icon = Bookmark.getElement( '.qui-bookmark-icon' );

                if ( Utils.isFontAwesomeClass( params.icon ) )
                {
                    Icon.addClass( params.icon );

                } else
                {
                    new Element('img.qui-button-image', {
                        src    : params.icon,
                        styles : {
                            'display' : 'block' // only image, fix
                        }
                    }).inject( Icon );
                }
            }

            return Bookmark;
        },

        /**
         * make a click on a menu item by path
         *
         * @method qui/controls/bookmarks/Panel#clickMenuItem
         * @param {String} path - Path to the menu item
         * @return {Boolean}
         */
        $clickMenuItem : function(path)
        {
            path = path.replace(/^\/|\/$/g, '');

            var parts  = path.split( '/' ),
                Parent = QUI.Controls.get( parts[ 0 ] );

            if ( !Parent || !Parent.length ) {
                return false;
            }

            Parent = Parent[ 0 ];

            for ( var i = 1, len = parts.length; i < len; i++ )
            {
                Parent = Parent.getChildren( parts[ i ] );

                if ( Parent === false ) {
                    return false;
                }
            }

            Parent.click();

            return true;
        },

        /**
         * event : click at the remove button
         *
         * @method qui/controls/bookmarks/Panel#$clickRemoveButton
         * @param {Object} Btn - qui/controls/buttons/Button
         */
        $clickRemoveButton : function(Btn)
        {
            var i, id, len, list, Bookmark;

            list     = [];
            Bookmark = Btn.getAttribute( 'Bookmark' );
            id       = Slick.uidOf( Bookmark );

            for ( i = 0, len = this.$bookmarks.length; i < len; i++ )
            {
                if ( Slick.uidOf( this.$bookmarks[ i ] ) != id )
                {
                    list.push( this.$bookmarks[ i ] );
                    continue;
                }

                this.$bookmarks[ i ].destroy();
            }

            this.$bookmarks = list;

            this.fireEvent( 'removeChild', [ this ] );
        },

        /**
         * event : on mouse enter on a bookmark item
         *
         * @method qui/controls/bookmarks/Panel#$onItemMouseEnter
         * @param {DOMEvent} event
         */
        $onItemMouseEnter : function(event)
        {
            if ( this.getAttribute( 'dragable' ) === false ) {
                return;
            }

            event.target.getElements( 'button' ).setStyle( 'display', null );
        },

        /**
         * event : on mouse leave on a bookmark item
         *
         * @method qui/controls/bookmarks/Panel#$onItemMouseLeave
         * @param {DOMEvent} event
         */
        $onItemMouseLeave : function(event)
        {
            event.target.getElements( 'button' ).setStyle( 'display', 'none' );
        }
    });
});
