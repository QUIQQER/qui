/**
 * A Panel
 * A Panel is like a container for apps.
 *
 * @author www.pcsg.de (Henning Leutz)
 *
 * @module controls/desktop/Panel
 * @package com.pcsg.qui.js.controls.desktop
 * @namespace QUI.controls.desktop
 *
 * @todo create footer
 *
 * @event onCreate [this]
 * @event onOpen [this]
 * @event onMinimize [this]
 * @event onRefresh [this]
 * @event onResize [this]
 */

define('qui/controls/desktop/Panel', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/controls/toolbar/Bar',
    'qui/controls/buttons/Seperator',
    'qui/controls/buttons/Button',
    'qui/controls/desktop/panels/Sheet',
    'qui/controls/breadcrumb/Bar',
    'qui/utils/Controls',

    'css!qui/controls/desktop/Panel.css'

], function(QUI, Control, Loader, Toolbar, Seperator, Button, PanelSheet, BreadcrumbBar, Utils)
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

            this.addEvent( 'onDestroy', this.$onDestroy );
        },

        /**
         * destroy the panel
         *
         * @method qui/controls/desktop/Panel#destroy
         */
        destroy : function()
        {
            this.fireEvent( 'destroy', [ this ] );

            if ( typeof this.$Elm !== 'undefined' && this.$Elm ) {
                this.$Elm.destroy();
            }

            this.$Elm = null;

            // destroy it from the controls
            QUI.Controls.destroy( this );
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
                'class'      : 'qui-panel',
                styles       : {
                    height : this.getAttribute('height')
                },

                html : '<div class="qui-panel-header"></div>' +
                       '<div class="qui-panel-buttons box"></div>' +
                       '<div class="qui-panel-categories box"></div>' +
                       '<div class="qui-panel-content box"></div>' +
                       '<div class="qui-panel-footer"></div>'
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
                    'class' : 'qui-panel-collapse icon-chevron-down'
                }).inject( this.$Header );

                this.$Header.setStyle( 'cursor', 'pointer' );

                this.$Header.addEvent('click', function() {
                    self.toggle();
                });
            }

            // drag & drop
            if ( this.getAttribute('dragable') )
            {
                this.$Header.setStyle( 'cursor', 'move' );

                require(['qui/classes/utils/DragDrop'], function(DragDrop)
                {
                    new DragDrop(self.$Header, {
                        dropables : '.qui-panel-drop',
                        cssClass  : 'radius5',
                        styles    : {
                            width  : 100,
                            height : 150
                        },
                        events :
                        {
                            onEnter : function(Element, Droppable)
                            {
                                Droppable.highlight();
                                // QUI.controls.Utils.highlight( Droppable );
                            },

                            onLeave : function(Element, Droppable) {
                                Droppable.highlight();
                                //QUI.controls.Utils.normalize( Droppable );
                            },

                            onDrop : function(Element, Droppable, event)
                            {
                                if ( !Droppable ) {
                                    return;
                                }

                                var quiid = Droppable.get( 'data-quiid' );

                                if ( !quiid ) {
                                    return;
                                }

                                var Parent = QUI.Controls.getById( quiid );

                                Parent.normalize();
                                Parent.appendChild( self );
                            }
                        }
                    });
                });
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

            if ( content_height.toString().match( '%' ) )
            {
                var Parent = this.$Elm.getParent() || document.body;

                content_height = ( content_height ).toInt();
                content_height = Parent.getSize().y * ( content_height / 100 );
            }

            content_height = content_height - 31;

            if ( this.getAttribute( 'breadcrumb' ) ) {
                content_height = content_height - 40;
            }

            if ( this.$Categories.getSize().x ) {
                content_width = content_width - this.$Categories.getSize().x;
            }

            content_height = content_height -
                             this.$Buttons.getSize().y -
                             this.$Footer.getSize().y -
                             this.$Header.getSize().y;

            if ( this.getAttribute( 'scrollbars' ) === false ) {
                overflow = 'hidden';
            }

            this.$Content.setStyles({
                overflow : overflow,
                height   : content_height,
                width    : content_width
            });

            this.$Elm.setStyle( 'height', this.getAttribute( 'height' ) );

            if ( this.$ButtonBar )
            {
                this.$ButtonBar.setAttribute( 'width', '98%' );
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
            this.$Footer.setStyle( 'display', null );

            if ( this.$Buttons ) {
                this.$Buttons.setStyle( 'display', null );
            }

            this.$Elm.setStyle( 'height', this.getAttribute( 'height' ) );

            if ( this.$Collaps )
            {
                this.$Collaps.removeClass( 'qui-panel-expand' );
                this.$Collaps.removeClass( 'icon-chevron-right' );

                this.$Collaps.addClass( 'qui-panel-collapse' );
                this.$Collaps.addClass( 'icon-chevron-down' );
            }

            this.fireEvent( 'open', [ this ] );

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

            if ( this.$Buttons ) {
                this.$Buttons.setStyle( 'display', 'none' );
            }

            this.$Elm.setStyle( 'height', this.$Header.getSize().y );

            this.$Collaps.removeClass( 'qui-panel-collapse' );
            this.$Collaps.removeClass( 'icon-chevron-down' );

            this.$Collaps.addClass( 'qui-panel-expand' );
            this.$Collaps.addClass( 'icon-chevron-right' );

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
         * @depricated
         */
        getContent : function()
        {
            return this.$Content;
        },

        /**
         * Set the Content
         *
         * @param {String} content - HTML String
         * @return {this}
         */
        setContent : function(content)
        {
            this.$Content.set( 'html', content );

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
                     Btn.type == 'qui/controls/buttons/Seperator' )
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
                    width : this.$Buttons.getSize().x,
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

            Btn.addEvents({

                onClick : function(Btn)
                {
                    if ( this.$ActiveCat && this.$ActiveCat == Btn ) {
                        return;
                    }

                    Btn.setActive();
                }.bind( this ),

                onActive : function(Btn)
                {
                    if ( this.$ActiveCat ) {
                        this.$ActiveCat.setNormal();
                    }

                    this.$ActiveCat = Btn;

                }.bind( this )

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
            this.$ContextMenu = new ContextMenu({
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
         * @return {qui/controls/panels/Sheet}
         */
        createSheet : function()
        {
            var Sheet = new PanelSheet().inject(
                this.$Elm
            );

            return Sheet;
        },

        /**
         * Event: on panel destroy
         *
         * @method qui/controls/desktop/Panel#$onDestroy
         */
        $onDestroy : function()
        {
            if ( this.$Elm ) {
                this.$Header.destroy();
            }

            if ( this.$Title ) {
                this.$Title.destroy();
            }

            if ( this.$Footer ) {
                this.$Footer.destroy();
            }

            if ( this.$Content ) {
                this.$Content.destroy();
            }

            if ( this.$Buttons ) {
                this.$Buttons.destroy();
            }

            if ( this.$ButtonBar ) {
                this.$ButtonBar.destroy();
            }

            if ( this.$CategoryBar ) {
                this.$CategoryBar.destroy();
            }

            if ( this.$ActiveCat ) {
                this.$ActiveCat.destroy();
            }

            if ( this.$BreadcrumbBar ) {
                this.$BreadcrumbBar.destroy();
            }

            if ( this.$ContextMenu ) {
                this.$ContextMenu.destroy();
            }
        }
    });
});