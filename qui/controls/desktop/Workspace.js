/**
 * Workspace
 *
 * You can append the Workspace with columns and panels
 * Save the Workspace and load the workspace
 *
 * @author www.namerobot.com (Henning Leutz)
 *
 * @module controls/desktop/Workspace
 * @package pcsg.qui.js.controls.desktop.workspace
 *
 * @event onLoad - if the workspace is loaded
 * @event onSave [{this}, {Object Data}]
 */

define('qui/controls/desktop/Workspace', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/controls/desktop/Column',
    'qui/classes/storage/Storage',
    'qui/utils/Math',
    'qui/classes/utils/DragDrop'

], function(QUI, QUIControl, QUILoader, QUIColumn, QUIStorage, QUIMath, QUIDragDrop)
{
    "use strict";

    /**
     * @class qui/controls/desktop.Workspace
     *
     * @param {DOMNode} Parent - Parent node
     * @param {Object} options . QDOM params
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : QUIControl,
        Type    : 'qui/controls/desktop.Workspace',

        Binds : [
            'resize',
            '$onHandlerContextMenu',
            '$onHandlerContextMenuHighlight',
            '$onHandlerContextMenuNormalize',
            '$onHandlerContextMenuClick'
        ],

        options : {
            limit : {}
        },

        initialize : function(Parent, options)
        {
            this.parent( options );

            this.$Parent = Parent;
            this.$Loader = null;

            this.$available_panels = {};
            this.$columns = [];

            window.addEvent( 'resize', this.resize );
        },

        /**
         * Load the Workspace
         *
         * @method qui/controls/desktop.Workspace#load
         * @return {this}
         *
         * @todo controls müssen über require gehohlt werden
         */
        load : function()
        {
            this.inject( this.$Parent );

            this.$Loader.show();

            var self = this;

            require([

                "qui/controls/desktop/Panel"

            ], function(QUIPanel)
            {
                var workspace = QUIStorage.get( 'qui.workspace' );

                if ( workspace ) {
                    workspace = JSON.decode( workspace );
                }

                if ( !workspace ) {
                    workspace = [];
                }

                if ( workspace.length )
                {
                    var i, len, Column;

                    // make columns
                    for ( i = 0, len = workspace.length; i < len; i++ )
                    {
                        Column = new QUIColumn(
                            workspace[ i ].attributes
                        );

                        if ( workspace[ i ].children ) {
                            Column.unserialize( workspace[ i ] );
                        }

                        this.appendChild( Column );
                    }

                    // resize columns width %
                    this.resize( workspace );
                }

                self.fireEvent( 'load' );
                self.$Loader.hide();
            });

            return this;
        },

        /**
         * Workspace resize
         *
         * @param {Array} workspace - [optional] json decoded serialized workspace
         */
        resize : function(workspace)
        {
            var i, len, perc, Column;
            var wlist = [];

            if ( typeof workspace === 'undefined' ||
                 typeof workspace.length === 'undefined' )
            {
                workspace = false;
            }

            if ( workspace )
            {
                var attr;

                for ( i = 0, len = workspace.length; i < len; i++ )
                {
                    attr = workspace[ i ].attributes;

                    if ( attr.width && attr.width > 0 )
                    {
                        wlist.push( attr.width );
                    } else
                    {
                        wlist.push( 200 );
                    }
                }

            } else
            {
                for ( i = 0, len = this.$columns.length; i < len; i++ )
                {
                    Column = this.$columns[ i ];

                    // width list
                    if ( Column.getAttribute( 'width' ) &&
                         Column.getAttribute( 'width' ) > 0 )
                    {
                        wlist.push(
                            Column.getAttribute( 'width' )
                        );
                    } else
                    {
                        wlist.push( 200 );
                    }
                }
            }

            // resize columns width %
            var old_max   = 0,
                max_width = this.$Elm.getSize().x,
                Parent    = this.$Elm.getParent();

            if ( Parent )
            {
                var psize = Parent.getSize();
                max_width = psize.x;
            }

            for ( i = 0, len = wlist.length; i < len; i++ ) {
                old_max = old_max + wlist[ i ];
            }

            // calc the % and resize it
            for ( i = 0, len = wlist.length; i < len; i++ )
            {
                perc = QUIMath.percent( wlist[ i ], old_max );

                this.$columns[ i ].setAttribute(
                    'width',
                    (max_width * (perc / 100)).round() - 5
                );

                this.$columns[ i ].resize();
            }
        },

        /**
         * Create the DOMNode
         *
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div.qui-workspace', {
                styles : {
                    height : '100%',
                    width  : '100%',
                    'float' : 'left'
                }
            });

            this.$Loader = new QUILoader({
                styles : {
                    zIndex : 100
                }
            }).inject( this.$Elm );

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            return this.$Elm;
        },

        /**
         * Save the Workspace to the localstorage
         *
         * @return {Bool}
         */
        save : function()
        {
            var i, len, p, plen,
                panels, children, Column;

            var columns = this.$Elm.getChildren( '.qui-column' ),
                result  = [];

            for ( i = 0, len = columns.length; i < len; i++ )
            {
                Column = QUI.Controls.getById(
                    columns[i].get( 'data-quiid' )
                );

                result.push( Column.serialize() );
            }

            // QUI.Storage.set( 'qui.workspace', JSON.encode( result ) );

            this.fireEvent( 'save', [ this, JSON.encode( result ) ] );

            return true;
        },

        /**
         * Add a column to the workspace
         *
         * @param {qui/controls/desktop/Column|Params} Column
         * @return {this}
         */
        appendChild : function(Column)
        {
            if ( typeOf( Column ) !== 'qui/controls/desktop/Column' ) {
                Column = new QUIColumn( Column );
            }

            var max_width = this.$Elm.getSize().x,
                col_width = Column.getAttribute( 'width' );

            if ( !this.count() ) {
                col_width = max_width;
            }

            if ( !col_width ) {
                col_width = 200;
            }

            Column.setAttribute( 'width', col_width );
            Column.setParent( this );
            Column.inject( this.$Elm );

            if ( this.count() )
            {
                var Handler = new Element('div', {
                    html    : '&nbps;',
                    'class' : 'qui-column-handle smooth',
                    styles  : {
                        width       : 4,
                        borderWidth : '0 1px'
                    },
                    events : {
                        contextmenu : this.$onHandlerContextMenu
                    }
                });

                Handler.inject( Column.getElm(), 'before' );

                this.$bindResizeToColumn( Handler, Column );

                // get prev column
                var Sibling       = this.lastChild(),
                    sibling_width = max_width - col_width - 6;

                if ( max_width > Sibling.getAttribute( 'width' ) ) {
                    sibling_width = Sibling.getAttribute( 'width' ) - col_width - 6;
                }

                Sibling.setAttribute( 'width', sibling_width );
                Sibling.resize();
            }

            this.$columns.push( Column );

            Column.resize();

            return this;
        },

        /**
         * Add a panel to the workspace
         *
         * First it looks fot the first tasks panel, if no task panel exist,
         * it looks for an panel with the name content-panel, if that not exist
         * then it took the panel to a column
         *
         * @param {qui/controls/dekstop/Panel} Panel
         */
        appendPanel : function(Panel)
        {
            if ( QUI.Controls.getByType( 'qui/controls/desktop/Tasks' ).length )
            {
                QUI.Controls.getByType( 'qui/controls/desktop/Tasks' )[ 0 ].appendChild(
                    Panel
                );

                return;
            }

            if ( QUI.Controls.get( 'content-panel' ).length )
            {
                QUI.Controls.get( 'content-panel' )[ 0 ].appendChild(
                    Panel
                );

                return;
            }

            if ( this.$columns[ 1 ] )
            {
                this.$columns[ 1 ].appendChild( Panel );
                return;
            }

            if ( this.$columns[ 0 ] )
            {
                this.$columns[ 0 ].appendChild( Panel );
                return;
            }

            QUI.MH.addError( 'Could not append the panel to the Workspace' );
        },

        /**
         * Return the last column
         *
         * @return {qui/controls/desktop.Column|false}
         */
        lastChild : function()
        {
            return this.$columns[ this.count()-1 ] || false;
        },

        /**
         * Return the first column
         *
         * @return {qui/controls/desktop/Column|false}
         */
        firstChild : function()
        {
            return this.$columns[ 0 ] || false;
        },

        /**
         * Return the number of columns in the workspace
         *
         * @return {Integer}
         */
        count : function()
        {
            return this.$columns.length;
        },

        /**
         * Add a available panel
         *
         * @param {Object} params - parameter {
         *     require : '',
         *     text    : '',
         *     icon    : ''
         * }
         *
         * @return {this}
         */
        addAvailablePanel : function(params)
        {
            if ( typeof params.require === 'undefined' ) {
                return this;
            }

            if ( typeof params.text === 'undefined' ) {
                return this;
            }

            if ( typeof params.icon === 'undefined' ) {
                return this;
            }


            if ( typeof this.$available_panels[ params.require ] !== 'undefined' ) {
                return this;
            }

            this.$available_panels[ params.require ] = params;

            return this;
        },

        /**
         * Return all available Panels for that Workbench
         *
         * @return {Array}
         */
        getAvailablePanel : function()
        {
            var panels = [],
                list   = this.$available_panels;

            for ( var i in list ) {
                panels.push( list[ i ] );
            }

            return panels;
        },

        /**
         * load the default workspace
         */
        defaultSpace : function()
        {
            var content_width = this.$Parent.getSize().x,
                control_width = content_width / 3;

            if ( control_width > 300 ) {
                control_width = 300;
            }

            /**
             * left column
             */
            new QUIColumn({
                name        : 'control-colum',
                placement   : 'left',
                width       : control_width,
                resizeLimit : [100, 300],
                closable    : true,
                events      :
                {
                    onCreate : function(Column)
                    {
                        require([
                            'controls/projects/Panel',
                            'controls/desktop/panels/Bookmarks'
                        ],

                        function(QUI_ProjectsPanel, QUI_Bookmark)
                        {
                            Column.appendChild(
                                new QUI_ProjectsPanel()
                            );

                            // favourite start
                            var Bookmars = new QUI_Bookmark({
                                title  : 'Lesezeichen',
                                header : true,
                                height : 300
                            });

                            Column.appendChild( Bookmars );


                            Bookmars.appendChild(
                                new QUI.controls.contextmenu.Item({
                                    text     : 'Zu den Benutzern',
                                    icon     : URL_BIN_DIR +'16x16/user.png',
                                    bookmark : 'QUI.Bookmarks.openUsers'
                                })
                            ).appendChild(
                                new QUI.controls.contextmenu.Item({
                                    text     : 'Zu den Gruppen',
                                    icon     : URL_BIN_DIR +'16x16/groups.png',
                                    bookmark : 'QUI.Bookmarks.openGroups'
                                })
                            ).appendChild(
                                new QUI.controls.contextmenu.Item({
                                    text     : 'Zum Mülleimer',
                                    icon     : URL_BIN_DIR +'16x16/trashcan_empty.png',
                                    bookmark : 'QUI.Bookmarks.openTrash'
                                })
                            );

                        });
                    }
                }
            }).inject( this.$Elm );

            /**
             * middle column
             */
            var ContentColumn = new QUIColumn({
                name        : 'content-colum',
                width       : content_width - control_width - 250,
                resizeLimit : [200, content_width - 210],
                placement   : 'main'
            }).inject( this.$Elm );

            require(['controls/desktop/Tasks'], function(Taskpanel)
            {
                ContentColumn.appendChild(
                    new Taskpanel({
                        name : 'content-panel'
                    })
                );

                // create the desktop
                require(['controls/desktop/panels/Desktop'], function(QUI_Desktop)
                {
                    var panels = QUI.Controls.get( 'content-panel' );

                    if ( !panels.length ) {
                        return;
                    }

                    panels[ 0 ].appendChild(
                        new QUI_Desktop({
                            closeable : false
                        })
                    );

                    panels[ 0 ].firstChild().click();
                });

            }.bind( ContentColumn ));

            /**
             * Right column
             */
            var RightColumn = new QUIColumn({
                name        : 'right-colum',
                placement   : 'right',
                width       : 250,
                resizeLimit : [200, content_width],
                closable    : true
            }).inject( this.$Elm );

            RightColumn.appendChild(
                new QUI.controls.desktop.Panel({
                    name   : 'error-console',
                    title  : 'Meldungen',
                    header : true,
                    height : 300,
                    events :
                    {
                        onCreate : function(Panel)
                        {
                            Panel.getBody().addClass('box-sizing');
                            Panel.getBody().setStyles({
                                padding : 0,
                                width   : '100%'
                            });
                        }
                    }
                })
            );

            RightColumn.appendChild(
                new QUI.controls.desktop.Panel({
                    name   : 'help',
                    title  : 'Hilfe'
                })
            );
        },

        /**
         * Add the vertical resizing events to the column
         *
         * @param {DOMNode} Handler
         * @param {qui/controls/desktop.Column} Column
         */
        $bindResizeToColumn : function(Handler, Column)
        {
            // dbl click
            Handler.addEvent('dblclick', function() {
                Column.toggle();
            });

            // Drag & Drop event
            var min = Column.getAttribute( 'resizeLimit' )[ 0 ],
                max = Column.getAttribute( 'resizeLimit' )[ 1 ];

            if ( !min ) {
                min = 50;
            }

            if ( !max ) {
                max = this.getElm().getSize().x - 50;
            }

            var handlepos = Handler.getPosition().y;

            new QUIDragDrop(Handler, {
                limit  : {
                    x: [ min, max ],
                    y: [ handlepos, handlepos ]
                },
                events :
                {
                    onStart : function(DragDrop, Dragable)
                    {
                        var pos   = Handler.getPosition(),
                            limit = DragDrop.getAttribute( 'limit' );

                        limit.y = [ pos.y, pos.y ];

                        DragDrop.setAttribute( 'limit', limit );

                        Dragable.setStyles({
                            width   : 5,
                            padding : 0,
                            top     : pos.y,
                            left    : pos.x
                        });
                    },

                    onStop : function(DragDrop, Dragable)
                    {
                        if ( Column.isOpen() === false ) {
                            Column.open();
                        }

                        var change, next_width, this_width;

                        var pos  = Dragable.getPosition(),
                            hpos = Handler.getPosition(),
                            Prev = Column.getPrevious(),
                            Next = Column.getNext();


                        change = pos.x - hpos.x - Handler.getSize().x;

                        if ( !Next && !Prev ) {
                            return;
                        }

                        var Sibling   = Next,
                            placement = 'left';

                        if ( Prev )
                        {
                            Sibling   = Prev;
                            placement = 'right';
                        }

                        this_width = Column.getAttribute( 'width' );
                        next_width = Sibling.getAttribute( 'width' );

                        if ( placement == 'left' )
                        {
                            Column.setAttribute( 'width', this_width + change );
                            Sibling.setAttribute( 'width', next_width - change );

                        } else if ( placement == 'right' )
                        {
                            Column.setAttribute( 'width', this_width - change );
                            Sibling.setAttribute( 'width', next_width + change );
                        }

                        Sibling.resize();
                        Column.resize();
                    }
                }
            });
        },

        /**
         * Resize handler context menu
         *
         * @param {DOMEvent} event
         */
        $onHandlerContextMenu : function(event)
        {
            var self = this;

            event.stop();

            require([
                'qui/controls/contextmenu/Menu',
                'qui/controls/contextmenu/Item'
            ], function(Contextmenu, ContextmenuItem)
            {

                var Menu = new Contextmenu({
                    events :
                    {
                        onBlur : function(Menu) {
                            Menu.destroy();
                        }
                    }
                });

                var Target = event.target,
                    Left   = Target.getPrevious( '.qui-column' ),
                    Next   = Target.getNext( '.qui-column' ),

                    LeftColumn  = QUI.Controls.getById( Left.get('data-quiid') ),
                    RightColumn = QUI.Controls.getById( Next.get('data-quiid') );


                Menu.hide();
                Menu.appendChild(
                    new ContextmenuItem({
                        icon    : 'icon-arrow-left',
                        text    : 'Bearbeitungspalte links löschen.',
                        Column  : LeftColumn,
                        Handler : Target,
                        events  :
                        {
                            onMouseDown : self.$onHandlerContextMenuClick,
                            onActive    : self.$onHandlerContextMenuHighlight,
                            onNormal    : self.$onHandlerContextMenuNormalize
                        }
                    })
                );

                Menu.appendChild(
                    new ContextmenuItem({
                        icon   : 'icon-arrow-right',
                        text   : 'Bearbeitungspalte rechts löschen.',
                        target : event.target,
                        Column : RightColumn,
                        events :
                        {
                            onMouseDown : self.$onHandlerContextMenuClick,
                            onActive    : self.$onHandlerContextMenuHighlight,
                            onNormal    : self.$onHandlerContextMenuNormalize
                        }
                    })
                );

                Menu.inject( document.body );

                Menu.setPosition(
                    event.page.x,
                    event.page.y
                ).show().focus();
            });

        },

        /**
         * event : mouseclick on a contextmenu item on the handler slider
         *
         * @param {QUI.controls.contextmenu.Item} Item
         */
        $onHandlerContextMenuClick : function(Item)
        {
            Item.getAttribute( 'Column' ).destroy();
            Item.getAttribute( 'Handler' ).destroy();
        },

        /**
         * event : mouseenter on a contextmenu item on the handler slider
         *
         * @param {QUI.controls.contextmenu.Item} Item
         */
        $onHandlerContextMenuHighlight : function(Item)
        {
            Item.getAttribute( 'Column' ).highlight();
        },

        /**
         * event : mouseleave on a contextmenu item on the handler slider
         *
         * @param {QUI.controls.contextmenu.Item} Item
         */
        $onHandlerContextMenuNormalize : function(Item)
        {
            Item.getAttribute( 'Column' ).normalize();
        }
    });
});