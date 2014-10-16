
/**
 * A Panel
 * A Panel is like a container for apps.
 *
 * @module qui/controls/desktop/Panel
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/loader/Loader
 * @require qui/controls/toolbar/Bar
 * @require qui/controls/buttons/Seperator
 * @require qui/controls/buttons/Button
 * @require qui/controls/desktop/panels/Sheet
 * @require qui/controls/breadcrumb/Bar
 * @require qui/controls/contextmenu/Menu
 * @require qui/utils/Controls
 * @require css!qui/controls/desktop/Panel.css
 *
 * @event onCreate [ this ]
 * @event onOpen [ this ]
 * @event onMinimize [ this ]
 * @event onRefresh [ this ]
 * @event onResize [ this ]
 * @event onDragDropStart [ this ]
 * @event dragDropComplete [ this ]
 * @event onDrag [ this, event, Element ]
 * @event onCategoryEnter [ this, Category ]
 * @event onCategoryLeave [ this, Category ]
 */

define([

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/controls/toolbar/Bar',
    'qui/controls/buttons/Seperator',
    'qui/controls/buttons/Button',
    'qui/controls/desktop/panels/Sheet',
    'qui/controls/breadcrumb/Bar',
    'qui/controls/contextmenu/Menu',
    'qui/utils/Controls',

    'css!qui/controls/desktop/Panel.css'

], function(QUI, Control, Loader, Toolbar, Seperator, Button, PanelSheet, BreadcrumbBar, QUIContextmenu, Utils)
{
    "use strict";

    /**
     * @class qui/controls/desktop/Panel
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/desktop/Panel',

        Binds : [
            '$onDestroy'
        ],

        options : {
            name    : 'qui-desktop-panel',
            content : false,

            // header
            header : true,      // true to create a panel header when panel is created
            title  : false,     // the title inserted into the panel's header
            icon   : false,

            // footer
            footer : false,     // true to create a panel footer when panel is created

            // Style options:
            height     : '100%',      // the desired height of the panel, if false, it use the parent height
            'class'    : '',         // css class to add to the main panel div
            scrollbars : true,       // true to allow scrollbars to be shown

            // Other:
            collapsible    : true,   // can the panel be collapsed
            collapseFooter : true,   // collapse footer when panel is collapsed

            closeable  : true, // can be the panel destroyed?
            dragable   : true,  // is the panel dragable to another column?
            breadcrumb : false,
            toWindow   : false
        },

        initialize: function(options)
        {
            this.$uid = String.uniqueID();
            this.parent( options );

            this.Loader = new Loader();

            this.$Elm     = null;
            this.$Header  = null;
            this.$Title   = null;
            this.$Footer  = null;
            this.$Content = null;

            this.$Buttons     = null;
            this.$Categories  = null;
            this.$Breadcrumb  = null;
            this.$ContextMenu = null;

            this.$ButtonBar     = null;
            this.$CategoryBar   = null;
            this.$BreadcrumbBar = null;
            this.$ActiveCat     = null;
            this.$Dropable      = null;

            this.addEvents({
                onDestroy : this.$onDestroy
            });
        },

        /**
         * Create the DOMNode Element for the panel
         *
         * @method qui/controls/desktop/Panel#create
         * @return {DOMNode}
         */
        create : function()
        {
            if ( this.$Elm ) {
                return this.$Elm;
            }

            var self = this;

            this.$Elm = new Element('div', {
                'data-quiid' : this.getId(),
                'class' : 'qui-panel box',
                tabindex : -1,

                styles : {
                    height : this.getAttribute('height')
                },

                html : '<div class="qui-panel-header box"></div>' +
                       '<div class="qui-panel-buttons box"></div>' +
                       '<div class="qui-panel-categories box"></div>' +
                       '<div class="qui-panel-content box"></div>' +
                       '<div class="qui-panel-footer box"></div>'
            });

            this.Loader.inject( this.$Elm );

            this.$Header     = this.$Elm.getElement( '.qui-panel-header' );
            this.$Footer     = this.$Elm.getElement( '.qui-panel-footer' );
            this.$Content    = this.$Elm.getElement( '.qui-panel-content' );
            this.$Buttons    = this.$Elm.getElement( '.qui-panel-buttons' );
            this.$Categories = this.$Elm.getElement( '.qui-panel-categories' );

            if ( this.getAttribute( 'breadcrumb' ) )
            {
                this.$Breadcrumb = new Element('div', {
                    'class' : 'qui-panel-breadcrumb box'
                }).inject( this.$Buttons, 'after' );
            }

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            this.$Content.setStyle( 'display', null );
            this.$Buttons.setStyle( 'display', 'none' );
            this.$Categories.setStyle( 'display', 'none' );

            if ( this.getAttribute( 'content' ) ) {
                this.$Content.set( 'html', this.getAttribute('content') );
            }

            if ( this.getAttribute('collapsible') )
            {
                this.$Collaps = new Element('div', {
                    'class' : 'qui-panel-collapse icon-chevron-down fa fa-chevron-down'
                }).inject( this.$Header );

                this.$Header.setStyle( 'cursor', 'pointer' );

                this.$Header.addEvent('click', function() {
                    self.toggle();
                });
            }

            // drag & drop
            if ( this.getAttribute('dragable') ) {
                this.enableDragDrop();
            }

            // content params
            this.$refresh();
            this.fireEvent( 'create', [ this ] );

            return this.$Elm;
        },

        /**
         * Refresh the panel
         *
         * @method qui/controls/desktop/Panel#refresh
         * @return {this}
         */
        refresh : function()
        {
            this.resize();
            this.fireEvent( 'refresh', [ this ] );
            this.$refresh();

            return this;
        },

        /**
         * Refresh helper
         *
         * @method qui/controls/desktop/Panel#$refresh
         * @ignore
         * @private
         */
        $refresh : function()
        {
            if ( !this.$Title )
            {
                this.$Icon = new Element( 'span.qui-panel-icon' ).inject(
                    this.$Header
                );

                this.$Title = new Element( 'h2.qui-panel-title' ).inject(
                    this.$Header
                );
            }

            if ( this.getAttribute( 'title' ) ) {
                this.$Title.set( 'html', this.getAttribute('title') );
            }

            if ( this.getAttribute( 'icon' ) )
            {
                var path = this.getAttribute( 'icon' );

                if ( Utils.isFontAwesomeClass( path )  )
                {
                    var css = this.$Icon.className;
                        css = css.replace(/\bicon-\S+/g, '');

                    this.$Icon.className = css;
                    this.$Icon.addClass( path );

                } else
                {
                    new Element('img', {
                        src : path
                    }).inject( this.$Icon );
                }
            }
        },

        /**
         * Execute a resize and repaint
         *
         * @method qui/controls/desktop/Panel#resize
         * @return {this} self
         */
        resize : function()
        {
            if ( this.getAttribute( 'header' ) === false )
            {
                this.$Header.setStyle( 'display', 'none' );
            } else
            {
                this.$Header.setStyle( 'display', null );
            }

            if ( this.getAttribute( 'footer' ) === false )
            {
                this.$Footer.setStyle( 'display', 'none' );
            } else
            {
                this.$Footer.setStyle( 'display', null );
            }

            if ( this.getButtonBar().count() )
            {
                this.$Buttons.setStyle( 'display', null );
            } else
            {
                this.$Buttons.setStyle( 'display', 'none' );
            }


            if ( this.isOpen() === false )
            {
                this.fireEvent( 'resize', [ this ] );
                return this;
            }


            if ( this.getAttribute( 'styles' ) &&
                 this.getAttribute( 'styles' ).height )
            {
                this.setAttribute(
                    'height',
                    this.getAttribute( 'styles' ).height
                );
            }

            var content_height = this.getAttribute( 'height' ),
                content_width  = this.$Elm.getSize().x,
                overflow       = 'auto';

            // height calc
            if ( content_height.toString().match( '%' ) )
            {
                var Parent = this.$Elm.getParent() || document.body;

                content_height = ( content_height ).toInt();
                content_height = Parent.getSize().y * ( content_height / 100 );
            }

            content_height = content_height;

            if ( this.getAttribute( 'breadcrumb' ) ) {
                content_height = content_height;
            }

            content_height = content_height -
                             this.$Buttons.getSize().y - 2 -
                             this.$Footer.getSize().y - 1 -
                             this.$Header.getSize().y;

            if ( this.getAttribute( 'scrollbars' ) === false ) {
                overflow = 'hidden';
            }

            // width calc
            if ( this.$Categories.getSize().x )
            {
                content_width = content_width - this.$Categories.getSize().x;
            } else
            {
                content_width = '100%';
            }

            // set proportions
            this.$Content.setStyles({
                overflow : overflow,
                height   : content_height,
                width    : content_width
            });

            this.$Elm.setStyle( 'height', this.getAttribute( 'height' ) );

            if ( this.$ButtonBar ) {
                this.$ButtonBar.resize();
            }

            this.fireEvent( 'resize', [ this ] );
            return this;
        },

        /**
         * Open the Panel
         *
         * @method qui/controls/desktop/Panel#open
         * @return {this} self
         */
        open : function()
        {
            this.$Content.setStyle( 'display', null );
            this.$Elm.setStyle( 'height', this.getAttribute( 'height' ) );
            this.$Header.removeClass( 'qui-panel-close' );

            if ( this.$Collaps )
            {
                this.$Collaps.removeClass( 'qui-panel-expand' );
                this.$Collaps.removeClass( 'icon-chevron-right' );
                this.$Collaps.removeClass( 'fa-chevron-down' );

                this.$Collaps.addClass( 'qui-panel-collapse' );
                this.$Collaps.addClass( 'icon-chevron-down' );
                this.$Collaps.addClass( 'fa-chevron-down' );
            }

            this.fireEvent( 'open', [ this ] );
            this.resize();

            return this;
        },

        /**
         * Minimize / Collapse the panel
         *
         * @method qui/controls/desktop/Panel#minimize
         * @return {this} self
         */
        minimize : function()
        {
            this.$Content.setStyle( 'display', 'none' );
            this.$Footer.setStyle( 'display', 'none' );
            this.$Buttons.setStyle( 'display', 'none' );

            this.$Elm.setStyle( 'height', this.$Header.getSize().y );

            this.$Collaps.removeClass( 'qui-panel-collapse' );
            this.$Collaps.removeClass( 'icon-chevron-down' );
            this.$Collaps.removeClass( 'fa-chevron-down' );

            this.$Collaps.addClass( 'qui-panel-expand' );
            this.$Collaps.addClass( 'icon-chevron-right' );
            this.$Collaps.addClass( 'fa-chevron-right' );

            this.$Header.addClass( 'qui-panel-close' );

            this.fireEvent( 'minimize', [ this ] );

            return this;
        },

        /**
         * Toggle the panel
         * Close the panel if the panel is opened and open the panel if the panel is closed
         *
         * @method qui/controls/desktop/Panel#toggle
         * @return {this} self
         */
        toggle : function()
        {
            if ( this.getAttribute( 'collapsible' ) === false ) {
                return this;
            }

            if ( this.isOpen() )
            {
                this.minimize();
            } else
            {
                this.open();
            }

            return this;
        },

        /**
         * Is the Panel open?
         *
         * @method qui/controls/desktop/Panel#isOpen
         * @return {Bool}
         */
        isOpen : function()
        {
            return this.$Content.getStyle( 'display' ) == 'none' ? false : true;
        },

        /**
         * Highlight the column
         *
         * @method qui/controls/desktop/Panel#highlight
         * @return {this} self
         */
        highlight : function()
        {
            if ( !this.getElm() ) {
                return this;
            }

            new Element( 'div.qui-panel-highlight' ).inject(
                this.getElm()
            );

            return this;
        },

        /**
         * Dehighlight the column
         *
         * @method qui/controls/desktop/Panel#normalize
         * @return {this} self
         */
        normalize : function()
        {
            if ( !this.getElm() ) {
                return this;
            }

            this.getElm().getElements( '.qui-panel-highlight' ).destroy();

            return this;
        },

        /**
         * @depricated
         * @method qui/controls/desktop/Panel#getBody
         */
        getBody : function()
        {
            return this.getContent();
        },

        /**
         * Return the Content ( Body ) DOMNode Element
         *
         * @method qui/controls/desktop/Panel#getBody
         * @return {null|DOMNode}
         */
        getContent : function()
        {
            return this.$Content;
        },

        /**
         * Set the Content
         *
         * @method qui/controls/desktop/Panel#setContent
         * @param {String} content - HTML String
         * @return {this}
         */
        setContent : function(content)
        {
            this.$Content.set( 'html', content );

            return this;
        },

        /**
         * Return the Footer DOMNode Element
         *
         * @method qui/controls/desktop/Panel#getFooter
         * @return {null|DOMNode}
         */
        getFooter : function()
        {
            return this.$Footer;
        },

        /**
         * Set the Footer
         *
         * @method qui/controls/desktop/Panel#setFooter
         * @param {String} content - HTML String
         * @return {this}
         */
        setFooter : function(content)
        {
            this.$Footer.set( 'html', content );

            return this;
        },

        /**
         * Return the Title DOMNode Element
         *
         * @method qui/controls/desktop/Panel#getHeader
         * @return {null|DOMNode}
         */
        getHeader : function()
        {
            return this.$Header;
        },

        /**
         * Add an action button to the Panel
         * This is a button top of the panel
         *
         * @method qui/controls/desktop/Panel#addButton
         * @param {qui/controls/buttons/Buttons|qui/controls/buttons/Seperator|Object} Btn
         * @return {this}
         */
        addButton : function(Btn)
        {
            if ( !QUI.Controls.isControl( Btn ) )
            {
                if ( Btn.type == 'seperator' ||
                     Btn.type == 'QUI\\Controls\\Buttons\\Seperator' )
                {
                    Btn = new Seperator( Btn );
                } else
                {
                    Btn = new Button( Btn );
                }
            }

            this.getButtonBar().appendChild( Btn );

            // if first children, then resize
            if ( this.getButtonBar().count() == 1 ) {
                this.resize();
            }

            return this;
        },

        /**
         * Return the children
         *
         * @method @method qui/controls/desktop/Panel#getButtons
         * @param {String} name - [optional] name of the wanted Element
         *                        if no name given, all children will be return
         * @return {Array}
         */
        getButtons : function(name)
        {
            if ( !this.$ButtonBar ) {
                return [];
            }

            return this.$ButtonBar.getChildren( name );
        },

        /**
         * Return the button bar of the pannel
         *
         * @method qui/controls/desktop/Panel#getButtonBar
         * @return {qui/controls/toolbar/Bar}
         */
        getButtonBar : function()
        {
            if ( !this.$ButtonBar )
            {
                this.$Buttons.setStyle( 'display', null );

                this.$ButtonBar = new Toolbar({
                    slide : false,
                    type  : 'buttons',
                    'menu-button' : false
                }).inject( this.$Buttons );
            }

            return this.$ButtonBar;
        },

        /**
         * Add an category button to the Panel
         * This is a button left of the panel
         *
         * @method qui/controls/desktop/Panel#addCategory
         * @param {qui/controls/buttons/Buttons|Object} Btn
         * @return {this} self
         */
        addCategory : function(Btn)
        {
            if ( typeof Btn.getType === 'undefined' )   {
                Btn = new Button( Btn );
            }

            var self = this;

            Btn.addEvents({

                onClick : function(Btn)
                {
                    if ( self.$ActiveCat && self.$ActiveCat == Btn ) {
                        return;
                    }

                    self.fireEvent( 'categoryLeave', [ self, self.$ActiveCat ] );

                    Btn.setActive();
                },

                onActive : function(Btn)
                {
                    if ( self.$ActiveCat ) {
                        self.$ActiveCat.setNormal();
                    }

                    self.$ActiveCat = Btn;
                    self.fireEvent( 'categoryEnter', [ self, Btn ] );
                }

            });

            this.getCategoryBar().appendChild( Btn );

            return this;
        },

        /**
         * Return a category children
         *
         * @method qui/controls/desktop/Panel#getCategory
         * @param {String} name - [optional] name of the wanted Element
         *                        if no name given, all children will be return
         * @return {Array}
         */
        getCategory : function(name)
        {
            if ( !this.$CategoryBar ) {
                return [];
            }

            return this.$CategoryBar.getChildren( name );
        },

        /**
         * Return the Category bar object
         *
         * @method qui/controls/desktop/Panel#getCategoryBar
         * @return {qui/controls/toolbar/Bar}
         */
        getCategoryBar : function()
        {
            if ( !this.$CategoryBar )
            {
                this.$Categories.setStyle( 'display', null );

                this.$CategoryBar = new Toolbar({
                    width : 190,
                    slide : false,
                    type  : 'buttons',
                    'menu-button' : false,
                    events :
                    {
                        onClear : function(Bar)
                        {
                            this.$ActiveCat = null;
                        }.bind( this )
                    }
                }).inject( this.$Categories );
            }

            return this.$CategoryBar;
        },

        /**
         * Return the active category
         *
         * @method qui/controls/desktop/Panel#getActiveCategory
         * @return {qui/controls/buttons/Buttons}
         */
        getActiveCategory : function()
        {
            return this.$ActiveCat;
        },

        /**
         * Return the Breacrumb bar object
         *
         * @method qui/controls/desktop/Panel#getBreadcrumb
         * @return {qui/controls.breadcrumb.Bar}
         */
        getBreadcrumb : function()
        {
            if ( !this.$BreadcrumbBar )
            {
                this.$BreadcrumbBar = new BreadcrumbBar({
                    name : 'panel-breadcrumb-' + this.getId()
                }).inject( this.$Breadcrumb );
            }

            return this.$BreadcrumbBar;
        },

        /**
         * Return the panel contextmenu
         *
         * @method qui/controls/desktop/Panel#getContextMenu
         * @return {qui/controls/contextmenu/Menu}
         */
        getContextMenu : function()
        {
            if ( this.$ContextMenu ) {
                return this.$ContextMenu;
            }

            // context menu
            this.$ContextMenu = new QUIContextmenu({
                title  : this.getAttribute( 'title' ),
                events :
                {
                    blur : function(Menu) {
                        Menu.hide();
                    }
                }
            });

            this.$ContextMenu.inject( document.body );

            return this.$ContextMenu;
        },

        /**
         * Create a sheet in the panel and open it
         *
         * @method qui/controls/desktop/Panel#createSheet
         * @param {Object} options - [optional] Sheet options
         * @return {qui/controls/panels/Sheet}
         */
        createSheet : function(options)
        {
            return new PanelSheet( options ).inject( this.$Elm );
        },

        /**
         * Enable the dragdrop
         */
        enableDragDrop : function()
        {
            this.setAttribute( 'dragable', true );

            if ( this.$Header ) {
                this.$Header.setStyle( 'cursor', 'move' );
            }

            if ( this.$Dropable )
            {
                this.$Dropable.enable();
                return;
            }

            var self = this;

            this.$getDragable(function()
            {
                if ( self.getAttribute( 'dragable' ) )
                {
                    self.$Dropable.enable();
                } else
                {
                    self.$Dropable.disable();
                }
            });
        },

        /**
         * Enable the dragdrop
         */
        disableDragDrop : function()
        {
            this.setAttribute( 'dragable', false );

            if ( this.$Header ) {
                this.$Header.setStyle( 'cursor', 'default' );
            }

            if ( self.$Dropable ) {
                self.$Dropable.disable();
            }
        },

        /**
         * Return the Dragable Object
         *
         * @method qui/controls/desktop/Panel#$getDragable
         * @param {Function} callback - Callback function( {DragDrop} )
         */
        $getDragable : function(callback)
        {
            if ( this.$Dropable )
            {
                callback( this.$Dropable );
                return;
            }

            if ( typeof this.$_dragDropExec !== 'undefined' )
            {
                (function() {
                    this.$getDragable( callback );
                }).delay( 20, this );

                return;
            }

            this.$_dragDropExec = true;

            var self = this;

            require(['qui/classes/utils/DragDrop'], function(DragDrop)
            {
                var DragDropParent = null;

                self.$Dropable = new DragDrop(self.$Header, {
                    dropables : '.qui-panel-drop',
                    cssClass  : 'radius5',
                    styles    : {
                        width  : 100,
                        height : 150
                    },
                    events :
                    {
                        onStart : function(Dragable, Element, event) {
                            self.fireEvent( 'dragDropStart', [ self, Element, event ] );
                        },

                        onComplete : function() {
                            self.fireEvent( 'dragDropComplete', [ self ] );
                        },

                        onDrag : function(Dragable, Element, event)
                        {
                            self.fireEvent( 'drag', [ self, event ] );

                            if ( DragDropParent ) {
                                DragDropParent.fireEvent( 'dragDropDrag', [ self, event ] );
                            }
                        },

                        onEnter : function(Dragable, Element, Dropable)
                        {
                            var quiid = Dropable.get( 'data-quiid' );

                            if ( !quiid ) {
                                return;
                            }

                            DragDropParent = QUI.Controls.getById( quiid );

                            if ( DragDropParent ) {
                                DragDropParent.fireEvent( 'dragDropEnter', [ self, Element ] );
                            }
                        },

                        onLeave : function(Dragable, Element, Dropable)
                        {
                            if ( DragDropParent )
                            {
                                DragDropParent.fireEvent( 'dragDropLeave', [ self, Element ] );
                                DragDropParent = null;
                            }
                        },

                        onDrop : function(Dragable, Element, Dropable, event)
                        {
                            if ( !Dropable ) {
                                return;
                            }

                            if ( DragDropParent ) {
                                DragDropParent.fireEvent( 'dragDropDrop', [ self, Element, Dropable, event ] );
                            }
                        }
                    }
                });

                callback( self.$Dropable );
            });
        },

        /**
         * Event: on panel destroy
         *
         * @method qui/controls/desktop/Panel#$onDestroy
         */
        $onDestroy : function()
        {
            var destroy = [
                this.$Header,
                this.$Title,
                this.$Footer,
                this.$Content,
                this.$Buttons,
                this.$ButtonBar,
                this.$CategoryBar,
                this.$ActiveCat,
                this.$BreadcrumbBar,
                this.$ContextMenu
            ];

            for ( var i = 0, len = destroy.length; i < len; i++ )
            {
                if ( destroy[ i ] && "destroy" in destroy[ i ] ) {
                    destroy[ i ].destroy();
                }
            }
        }
    });
});
