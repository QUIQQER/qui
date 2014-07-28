
/**
 * Column for panels
 *
 * @module qui/controls/desktop/Column
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/contextmenu/Menu
 * @require qui/controls/contextmenu/Item
 * @require qui/controls/desktop/Panel
 * @require qui/controls/loader/Loader
 * @require qui/classes/utils/DragDrop
 * @require css!qui/controls/desktop/Column.css
 */

define([

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/controls/desktop/Panel',
    'qui/controls/loader/Loader',
    'qui/classes/utils/DragDrop',

    'css!qui/controls/desktop/Column.css'

], function(QUI, Control, Contextmenu, ContextmenuItem, Panel, Loader, QuiDragDrop)
{
    "use strict";

    /**
     * @class qui/controls/desktop/Column
     * @event onCreate [this]
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/desktop/Column',

        Binds : [
            '$onDestroy',
            '$onContextMenu',
            '$onPanelOpen',
            '$onPanelMinimize',
            '$onPanelDestroy',
            '$clickAddPanelToColumn',
            '$onEnterRemovePanel',
            '$onLeaveRemovePanel',
            '$onClickRemovePanel',
            '$onDragDropStart',
            '$onDragDropStop',
            '$onDrag',
            '$onDrop'
        ],

        options : {
            name        : 'column',
            width       : false,
            height      : false,
            resizeLimit : [],
            sortable    : true,
            closable    : false,
            placement   : 'left' // depricated
        },

        initialize: function(options)
        {
            this.parent( options );

            this.$ContextMenu = null;
            this.$Elm         = null;
            this.$Content     = null;
            this.$panels      = {};

            this.addEvents({
                onDestroy : this.$onDestroy,
                onDrop    : this.$onDrop
            });
        },

        /**
         * event : destroy the column
         *
         * @method qui/controls/desktop/Column#$onDestroy
         */
        $onDestroy : function()
        {
            if ( this.$ContextMenu ) {
                this.$ContextMenu.destroy();
            }

            if ( this.$Content ) {
                this.$Content.destroy();
            }

            if ( this.$Elm ) {
                this.$Elm.destroy();
            }
        },

        /**
         * Create the DOMNode for the Column
         *
         * @method qui/controls/desktop/Column#create
         * @return {DOMNode}
         */
        create : function()
        {
            this.$Elm = new Element('div', {
                'class'      : 'qui-column box qui-panel-drop',
                'data-quiid' : this.getId()
            });

            if ( this.getAttribute( 'height' ) ) {
                this.$Elm.setStyle( 'height', this.getAttribute( 'height' ) );
            }

            if ( this.getAttribute( 'width' ) ) {
                this.$Elm.setStyle( 'width', this.getAttribute( 'width' ) );
            }


            this.$Content = new Element('div', {
                'class' : 'qui-column-content box'
            }).inject( this.$Elm );

            // contextmenu
            this.$ContextMenu = new Contextmenu({
                events :
                {
                    onBlur : function(Menu) {
                        Menu.hide();
                    }
                }
            }).inject( document.body );

            this.$ContextMenu.hide();

            this.$Elm.addEvents({
                contextmenu : this.$onContextMenu
            });

            if ( typeof this.$serialize !== 'undefined' ) {
                this.unserialize( this.$serialize );
            }

            // this.resize();
            this.fireEvent( 'create', [ this ] );

            return this.$Elm;
        },

        /**
         * Return the data for the workspace
         *
         * @method qui/controls/desktop/Column#serialize
         * @return {Object}
         */
        serialize : function()
        {
            var panels   = this.getChildren(),
                children = [];

            for ( var p in panels ) {
                children.push( panels[ p ].serialize() );
            }

            return {
                attributes : this.getAttributes(),
                children   : children
            };
        },

        /**
         * Import the saved data
         *
         * @method qui/controls/desktop/Column#unserialize
         * @param {Object} data
         */
        unserialize : function(data)
        {
            this.setAttribute( data.attributes );

            if ( !this.$Elm )
            {
                this.$serialize = data;
                return this;
            }

            var i, len,
                child_type, child_modul;

            var children = data.children,
                self     = this;

            if ( !children ) {
                return;
            }

            var req = ['MessageHandler'];

            for ( i = 0, len = children.length; i < len; i++ )
            {
                child_type  = children[ i ].type;
                child_modul = child_type.replace('QUI.', '')
                                        .replace(/\./g, '/');

                req.push( child_modul );
            }

            require(req, function(MessageHandler)
            {
                var i, len, attr, height, Child, Control;

                for ( i = 0, len = children.length; i < len; i++ )
                {
                    Child  = children[ i ];
                    attr   = Child.attributes;
                    height = attr.height;

                    try
                    {
                        Control = eval(
                            'new '+ Child.type +'( attr )'
                        );

                        Control.unserialize( Child );

                        self.appendChild( Control );

                    } catch ( Exception )
                    {
                        MH.addException( Exception );
                    }
                }
            });
        },

        /**
         * Append a child to the Column
         *
         * @method qui/controls/desktop/Column#appendChild
         * @param {qui/controls/desktop/Panel|qui/controls/desktop/Tasks} Panel
         * @param {Integer} pos - [optional] Position where to insert
         * @return {this}
         */
        appendChild : function(Panel, pos)
        {
            var Prev, colheight;

            var Handler   = false,
                height    = false,
                Parent    = Panel.getParent(),

                computedSize    = this.$Content.getComputedSize(),
                old_panel_is_me = false;


            colheight = computedSize.height -
                        computedSize['padding-top'] -
                        computedSize['padding-bottom'];

            // depend from another parent, if the panel has a parent
            if ( typeOf( Parent ) == 'qui/controls/desktop/Column' )
            {
                Parent.dependChild( Panel );

                if ( Parent == this ) {
                    old_panel_is_me = true;
                }
            }

            Panel.setParent( this );


            // create a new handler
            if ( this.count() )
            {
                Handler = new Element('div', {
                    'class' : 'qui-column-hor-handle smooth'
                });

                this.$addHorResize( Handler );

                Panel.setAttribute( '_Handler', Handler );
            }

            var handlelist = this.getElm().getElements(
                '.qui-column-hor-handle'
            );

            // if the old panel was me, so we only make a new order
            // there is a less column, because the panel column was destroyed
            if ( typeof pos !== 'undefined' &&
                 old_panel_is_me &&
                 (pos).toInt() !== 0 )
            {
                pos = pos - 1;
            }

            // insert the panel
            if ( typeof pos === 'undefined' || handlelist.length < (pos).toInt() )
            {
                // first panel have no handler
                if ( Handler ) {
                    Handler.inject( this.$Content );
                }

                Panel.inject( this.$Content );

            } else if ( (pos).toInt() === 0 || !handlelist.length )
            {
                Handler.inject( this.$Content, 'top' );
                Panel.inject( this.$Content, 'top' );

            } else if ( typeof handlelist[ pos - 1 ] !== 'undefined' )
            {
                Handler.inject( handlelist[ pos - 1 ], 'after' );
                Panel.inject( handlelist[ pos - 1 ], 'after' );
            }

            // if no height
            // or no second panel exist
            // use the column height
            if ( !Panel.getAttribute( 'height' ) || !this.count() ) {
                Panel.setAttribute( 'height', colheight - 2 );
            }

            if ( this.getAttribute( 'sortable' ) )
            {
                Panel.setAttribute( 'dragable', true );
            } else
            {
                Panel.setAttribute( 'dragable', false );
            }


            // if some panels insight, resize the other panels
            if ( this.count() )
            {
                height = Panel.getAttribute( 'height' );
                Prev   = this.getPreviousPanel( Panel );

                if ( !Prev ) {
                    Prev = this.getNextPanel( Panel );
                }

                if ( !Prev ) {
                    Prev = this.$panels[ 0 ];
                }


                if ( height > colheight || height.toString().match( '%' ) ) {
                    height = (colheight / 2).round();
                }

                var max         = Prev.getAttribute( 'height' ),
                    prev_height = max - height;

                if ( prev_height < 100 )
                {
                    prev_height = 100;
                    height      = max - 100;
                }

                if ( Handler ) {
                    height = height - Handler.getSize().y;
                }

                Panel.setAttribute( 'height', height );
                Prev.setAttribute( 'height', prev_height );
                Prev.resize();
            }

            Panel.resize();

            Panel.addEvents({
                onMinimize : this.$onPanelMinimize,
                onOpen     : this.$onPanelOpen,
                onDestroy  : this.$onPanelDestroy,

                // drag drop events
                onDragDropStart    : this.$onDragDropStart,
                onDragDropComplete : this.$onDragDropStop,
                onDrag             : this.$onDrag
            });

            this.$panels[ Panel.getId() ] = Panel;

            return this;
        },

        /**
         * Depends a panel from the column
         *
         * @method qui/controls/desktop/Column#dependChild
         * @param {qui/controls/desktop/Panel} Panel
         * @return {this} self
         */
        dependChild : function(Panel)
        {
            if ( this.$panels[ Panel.getId() ] ) {
                delete this.$panels[ Panel.getId() ];
            }

            // destroy the panel events
            Panel.removeEvents({
                onMinimize : this.$onPanelMinimize,
                onOpen     : this.$onPanelOpen,
                onDestroy  : this.$onPanelDestroy
            });

            // if the panel is from this column
            var Handler = false,
                Parent  = Panel.getParent();

            Handler = Panel.getAttribute( '_Handler' );

            if ( Parent ) {
                Panel.getParent().$onPanelDestroy( Panel );
            }

            return this;
        },

        /**
         * Return the column children
         *
         * @method qui/controls/desktop/Column#getChildren
         * @param {String} name - [optional]
         * @return {Object}
         */
        getChildren : function(name)
        {
            if ( typeof name === 'undefined' ) {
                return this.$panels;
            }

            var i;
            var items = this.$panels;

            for ( i in items )
            {
                if ( items[ i ].getAttribute( 'name' ) == name ) {
                    return items[ i ];
                }
            }

            return false;
        },

        /**
         * Panel count
         * How many panels are in the coulumn?
         *
         * @method qui/controls/desktop/Column#count
         * @return {Integer}
         */
        count : function()
        {
            var c, i = 0;

            for ( c in this.$panels ) {
                i++;
            }

            return i;
        },

        /**
         * Resize the column and all panels in the column
         *
         * @method qui/controls/desktop/Column#resize
         * @return {this}
         */
        resize : function()
        {
            if ( !this.isOpen() ) {
                return this;
            }

            var width = this.getAttribute( 'width' );

            if ( !width ) {
                return this;
            }

            if ( this.$Elm.getSize().x == this.getAttribute( 'width' ) ) {
                return this;
            }

            this.$Elm.setStyle( 'width', width );

            // all panels resize
            var i, Panel;

            for ( i in this.$panels )
            {
                Panel = this.$panels[ i ];

                Panel.setAttribute( 'width', width );
                Panel.resize();
            }

            return this;
        },

        /**
         * Open the column
         *
         * @method qui/controls/desktop/Column#open
         * @return {this}
         */
        open : function()
        {
            this.$Content.setStyle( 'display', null );

            // sibling resize
            var Sibling = this.getSibling();

            Sibling.setAttribute(
                'width',
                Sibling.getAttribute('width') - this.getAttribute('width') + 6
            );

            Sibling.resize();

            // self reresh
            this.resize();

            return this;
        },

        /**
         * Close the column
         *
         * @method qui/controls/desktop/Column#close
         * @return {this}
         */
        close : function()
        {
            if ( this.getAttribute( 'closable' ) === false ) {
                return this;
            }

            var content_width = this.$Content.getSize().x,
                Sibling       = this.getSibling();

            this.$Content.setStyle( 'display', 'none' );

            // resize the sibling column
            Sibling.setAttribute(
                'width',
                Sibling.getAttribute('width') + content_width
            );

            Sibling.resize();

            return this;
        },

        /**
         * toggle the open status of the column
         * if open, then close
         * if close, the open ;-)
         *
         * @method qui/controls/desktop/Column#toggle
         * @return {this}
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
         * Return the open status of the colum
         * is the column open?
         *
         * @method qui/controls/desktop/Column#isOpen
         * @return {Bool}
         */
        isOpen : function()
        {
            return this.$Content.getStyle( 'display' ) == 'none' ? false : true;
        },

        /**
         * Highlight the column
         *
         * @method qui/controls/desktop/Column#highlight
         * @return {this}
         */
        highlight : function()
        {
            if ( !this.getElm() ) {
                return this;
            }

            new Element( 'div.qui-column-hightlight' ).inject(
                this.getElm()
            );

            return this;
        },

        /**
         * Dehighlight the column
         *
         * @method qui/controls/desktop/Column#normalize
         * @return {this}
         */
        normalize : function()
        {
            if ( !this.getElm() ) {
                return this;
            }

            this.getElm().getElements( '.qui-column-hightlight' ).destroy();

            return this;
        },

        /**
         * Return the Sibling column control
         * it is looked to the placement
         * if no column exist, so it search the prev and next columns
         *
         * @method qui/controls/desktop/Column#getSibling
         * @return {false|qui/controls/desktop/Column}
         */
        getSibling : function()
        {
            var Column;

            if ( this.getAttribute( 'placement' ) == 'left' )
            {
                Column = this.getElm().getNext( '.qui-column' );
            } else if( this.getAttribute( 'placement' ) == 'right' )
            {
                Column = this.getElm().getPrevious( '.qui-column' );
            }

            if ( Column ) {
                return QUI.Controls.getById( Next.get( 'data-quiid' ) );
            }

            Column = this.getPrevious();

            if ( Column ) {
                return Column;
            }


            Column = this.getNext();

            if ( Column ) {
                return Column;
            }

            return false;
        },

        /**
         * Return the previous sibling
         *
         * @method qui/controls/desktop/Column#getPrevious
         * @return {false|qui/controls/desktop/Column}
         */
        getPrevious : function()
        {
            var Prev = this.getElm().getPrevious( '.qui-column' );

            if ( !Prev ) {
                return false;
            }

            return QUI.Controls.getById( Prev.get( 'data-quiid' ) );
        },

        /**
         * Return the next sibling
         *
         * @method qui/controls/desktop/Column#getNext
         * @return {false|qui/controls/desktop/Column}
         */
        getNext : function()
        {
            var Next = this.getElm().getNext( '.qui-column' );

            if ( !Next ) {
                return false;
            }

            return QUI.Controls.getById( Next.get( 'data-quiid' ) );
        },

        /**
         * return the next panel sibling
         *
         * @method qui/controls/desktop/Column#getNextPanel
         * @return {false|qui/controls/desktop/Panel|qui/controls/desktop/Tasks}
         */
        getNextPanel : function(Panel)
        {
            var NextElm = Panel.getElm().getNext( '.qui-panel' );

            if ( !NextElm ) {
                return false;
            }

            var Next = QUI.Controls.getById( NextElm.get( 'data-quiid' ) );

            return Next ? Next : false;
        },

        /**
         * Get the next panel sibling which is opened
         *
         * @method qui/controls/desktop/Column#getNextOpenedPanel
         * @return {false|qui/controls/desktop/Panel|qui/controls/desktop/Tasks}
         */
        getNextOpenedPanel : function(Panel)
        {
            var list = Panel.getElm().getAllNext( '.qui-panel' );

            if ( !list.length ) {
                return false;
            }

            var i, len, Control;

            for ( i = 0, len = list.length; i < len; i++ )
            {
                Control = QUI.Controls.getById(
                    list[ i ].get( 'data-quiid' )
                );

                if ( Control && Control.isOpen() ) {
                    return Control;
                }
            }

            return false;
        },

        /**
         * return the previous panel sibling
         *
         * @method qui/controls/desktop/Column#getPreviousPanel
         * @return {false|qui/controls/desktop/Panel|qui/controls/desktop/Tasks}
         */
        getPreviousPanel : function(Panel)
        {
            var PrevElm = Panel.getElm().getPrevious( '.qui-panel' );

            if ( !PrevElm ) {
                return false;
            }

            var Prev = QUI.Controls.getById( PrevElm.get( 'data-quiid' ) );

            return Prev ? Prev : false;
        },

        /**
         * return the previous panel sibling
         *
         * @method qui/controls/desktop/Column#getPreviousOpenedPanel
         * @return {false|qui/controls/desktop/Panel|qui/controls/desktop/Tasks}
         */
        getPreviousOpenedPanel : function(Panel)
        {
            var list = Panel.getElm().getAllPrevious( '.qui-panel' );

            if ( !list.length ) {
                return false;
            }


            var i, len, Control;

            for ( i = 0, len = list.length; i < len; i++ )
            {
                Control = QUI.Controls.getById(
                    list[ i ].get( 'data-quiid' )
                );

                if ( Control && Control.isOpen() ) {
                    return Control;
                }
            }

            return false;
        },

        /**
         * Panel close event
         *
         * @method qui/controls/desktop/Column#$onPanelMinimize
         * @param {qui/controls/desktop/Panel} Panel
         * @ignore
         */
        $onPanelMinimize : function(Panel)
        {
            var Next = this.getNextOpenedPanel( Panel );

            Panel.setAttribute( 'columnCloseDirection', 'next' );

            if ( !Next )
            {
                Next = this.getPreviousOpenedPanel( Panel );
                Panel.setAttribute( 'columnCloseDirection', 'prev' );
            }

            if ( !Next )
            {
                this.close();
                return;
            }

            var panel_height       = Panel.getAttribute('height'),
                panel_title_height = Panel.getHeader().getSize().y,
                next_height        = Next.getElm().getComputedSize().totalHeight;

            Next.setAttribute( 'height', next_height + panel_height - panel_title_height );
            Next.resize();
        },

        /**
         * Panel open event
         *
         * @method qui/controls/desktop/Column#$onPanelOpen
         * @param {qui/controls/desktop/Panel} Panel
         * @ignore
         */
        $onPanelOpen : function(Panel)
        {
            // find the sibling
            var Prev      = false,
                direction = Panel.getAttribute( 'columnCloseDirection' );

            if ( direction && direction == 'next' ) {
                Prev = this.getNextOpenedPanel( Panel );
            }

            if ( direction && direction == 'prev' ) {
                Prev = this.getPreviousOpenedPanel( Panel );
            }

            if ( !Prev ) {
                Prev = this.getPreviousOpenedPanel( Panel );
            }

            if ( !Prev ) {
                Prev = this.getNextOpenedPanel( Panel );
            }

            if ( !Prev ) {
                return;
            }


            var panel_height       = Panel.getElm().getComputedSize().totalHeight,
                panel_title_height = Panel.getHeader().getSize().y,
                prev_height        = Prev.getElm().getComputedSize().totalHeight;

            Prev.setAttribute(
                'height',
                prev_height - (panel_height - panel_title_height)
            );

            Prev.resize();

            // check if the panel content have a scroll bar
            var elm_size   = this.$Content.getSize().y,
                elm_scroll = this.$Content.getScrollSize().y;

            if ( elm_size >= elm_scroll ) {
                return;
            }

            // we must recalc our panels
            // we have no space :-/ or to many space
            var len    = Object.getLength( this.$panels ),
                height = Math.ceil( elm_size / len );

            for ( var quiid in this.$panels )
            {
                Panel = this.$panels[ quiid ];

                if ( !Panel.isOpen() ) {
                    continue;
                }

                Panel.setAttribute( 'height', height );
                Panel.resize();
            }

            // look at the last
            var i;
            var childheight = 0,
                children    = this.$Content.getChildren();

            for ( i = 0, len = children.length; i < len; i++ ) {
                childheight = childheight + children[ i ].getSize().y;
            }

            Panel.setAttribute(
                'height',
                Panel.getAttribute( 'height' ) - ( childheight - elm_size )
            );
        },

        /**
         * event: If the panel would be destroyed
         *
         * @method qui/controls/desktop/Column#$onPanelDestroy
         * @param {qui/controls/desktop/Panel} Panel
         * @ignore
         */
        $onPanelDestroy : function(Panel)
        {
            var height, Next, Prev, Sibling;

            var pid = Panel.getId(),
                Elm = Panel.getElm();

            if ( this.$panels[ pid ] ) {
                delete this.$panels[ pid ];
            }

            // find handler
            var Handler = Panel.getAttribute( '_Handler' );

            // the panel is the first panel
            // so the next panel handler must be destroyed
            if ( !Handler && !Elm.getPrevious() && Elm.getNext() )
            {
                Handler = Elm.getNext();
                Next    = Handler.getNext();

                if ( Next && Next.get( 'data-quiid' ) )
                {
                    Sibling = QUI.Controls.getById(
                        Next.get( 'data-quiid' )
                    );

                    height = Handler.getSize().y +
                             Sibling.getAttribute( 'height' ) +
                             Panel.getAttribute( 'height' );

                    Sibling.setAttribute( 'height', height );
                    Sibling.setAttribute( '_Handler', false );
                    Sibling.resize();
                }

                Handler.destroy();
                return;
            }

            // if the panel is the last panel
            // so the next previous handler must be destroyed
            if ( !Handler && !Elm.getNext() && Elm.getPrevious() )
            {
                Handler = Elm.getPrevious();
                Prev    = Handler.getPrevious();

                if ( Prev && Prev.get( 'data-quiid' ) )
                {
                    Sibling = QUI.Controls.getById(
                        Prev.get( 'data-quiid' )
                    );

                    height = Handler.getSize().y +
                             Sibling.getAttribute( 'height' ) +
                             Panel.getAttribute( 'height' );

                    Sibling.setAttribute( 'height', height );
                    Sibling.setAttribute( '_Handler', false );
                    Sibling.resize();
                }

                Handler.destroy();
                return;
            }


            if ( !Handler || !Handler.hasClass( 'qui-column-hor-handle' ) ) {
                return;
            }

            Prev = Handler.getPrevious();

            if ( Prev && Prev.get( 'data-quiid' ) )
            {
                Sibling = QUI.Controls.getById(
                    Prev.get( 'data-quiid' )
                );

                height = Handler.getSize().y +
                         Sibling.getAttribute( 'height' ) +
                         Panel.getAttribute( 'height' );

                Sibling.setAttribute( 'height', height );
                Sibling.resize();
            }

            Handler.destroy();
        },

        /**
         * Add the horizental resizing events to the column
         *
         * @method qui/controls/desktop/Column#$addHorResize
         * @param {DOMNode} Handle
         */
        $addHorResize : function(Handle)
        {
            var pos = Handle.getPosition();

            var DragDrop = new QuiDragDrop(Handle, {
                limit  : {
                    x: [ pos.x, pos.x ],
                    y: [ pos.y, pos.y ]
                },
                events :
                {
                    onStart : function(DragDrop, Dragable)
                    {
                        if ( !this.$Elm ) {
                            return;
                        }

                        var pos   = this.$Elm.getPosition(),
                            hpos  = Handle.getPosition(),
                            limit = DragDrop.getAttribute( 'limit' );

                        limit.y = [
                            pos.y,
                            pos.y + this.$Elm.getSize().y
                        ];

                        limit.x = [ hpos.x, hpos.x ];

                        DragDrop.setAttribute( 'limit', limit );

                        Dragable.setStyles({
                            height  : 5,
                            padding : 0,
                            top     : hpos.y,
                            left    : hpos.x
                        });

                    }.bind( this ),

                    onStop : this.$horResizeStop.bind( this )
                }
            });

            DragDrop.setAttribute( 'Control', this );
            DragDrop.setAttribute( 'Handle', Handle );
        },

        /**
         * Horizontal Drag Drop Stop
         * Helper Function
         *
         * @method qui/controls/desktop/Column#$horResizeStop
         */
        $horResizeStop : function(DragDrop, Dragable)
        {
            var i, len, size, change;

            var Handle   = DragDrop.getAttribute('Handle'),
                pos      = Dragable.getPosition(),
                hpos     = Handle.getPosition(),
                children = this.$Content.getChildren(),

                computedSize = this.$Content.getComputedSize();

            size = computedSize.height -
                        computedSize['padding-top'] -
                        computedSize['padding-bottom'];

            change = pos.y - hpos.y;

            var Next = Handle.getNext(),
                Prev = Handle.getPrevious(),

                PrevInstance = false,
                NextInstance = false;

            if ( Next ) {
                NextInstance = QUI.Controls.getById( Next.get( 'data-quiid' ) );
            }

            if ( Prev ) {
                PrevInstance = QUI.Controls.getById( Prev.get( 'data-quiid' ) );
            }

            if ( NextInstance && !NextInstance.isOpen() )
            {
                var NextOpened = this.getNextOpenedPanel( NextInstance );

                if ( !NextOpened )
                {
                    NextInstance.setAttribute( 'height', 30 );
                    NextInstance.open();
                } else
                {
                    NextInstance = NextOpened;
                }
            }

            if ( PrevInstance && !PrevInstance.isOpen() )
            {
                var PrevOpened = this.getPreviousOpenedPanel( PrevInstance );

                if ( !PrevOpened )
                {
                    PrevInstance.setAttribute( 'height', 30 );
                    PrevInstance.open();
                } else
                {
                    PrevInstance = PrevOpened;
                }
            }

            if ( NextInstance )
            {
                NextInstance.setAttribute(
                    'height',
                    NextInstance.getAttribute( 'height' ) - change
                );

                NextInstance.resize();
            }


            if ( !PrevInstance ) {
                return;
            }

            PrevInstance.setAttribute(
                'height',
                PrevInstance.getAttribute( 'height' ) + change
            );

            PrevInstance.resize();

            // check if a rest height exist
            var children_height = 0;

            for ( i = 0, len = children.length; i < len; i++ ) {
                children_height = children_height + children[i].getSize().y;
            }

            if ( children_height == size.y ) {
                return;
            }

            PrevInstance.setAttribute(
                'height',
                PrevInstance.getAttribute( 'height' ) + (size.y - children_height)
            );

            PrevInstance.resize();
        },

        /**
         * event : on context menu
         *
         * @method qui/controls/desktop/Column#$onContextMenu
         * @param {DOMEvent} event
         */
        $onContextMenu : function(event)
        {
            if ( !this.getParent() ) {
                return;
            }

            event.stop();

            var i, len, Panel, AddPanels, RemovePanels;

            var Parent = this.getParent(),
                panels = Parent.getAvailablePanel();


            this.$ContextMenu.clearChildren();
            this.$ContextMenu.setTitle( 'Column' );

            // add panels
            AddPanels = new ContextmenuItem({
                text : 'Panel hinzufügen',
                name : 'add_panels_to_column'
            });

            this.$ContextMenu.appendChild( AddPanels );

            for ( i = 0, len = panels.length; i < len; i++ )
            {
                AddPanels.appendChild(
                    new ContextmenuItem({
                        text   : panels[ i ].text,
                        icon   : panels[ i ].icon,
                        name   : 'add_panels_to_column',
                        params : panels[ i ],
                        events : {
                            onMouseDown : this.$clickAddPanelToColumn
                        }
                    })
                );
            }

            // remove panels
            RemovePanels = new ContextmenuItem({
                text : 'Panel löschen',
                name : 'remove_panel_of_column'
            });

            this.$ContextMenu.appendChild( RemovePanels );

            for ( i in this.$panels )
            {
                Panel = this.$panels[ i ];

                RemovePanels.appendChild(
                    new ContextmenuItem({
                        text   : Panel.getAttribute( 'title' ),
                        icon   : Panel.getAttribute( 'icon' ),
                        name   : Panel.getAttribute( 'name' ),
                        Panel  : Panel,
                        events : {
                            onActive    : this.$onEnterRemovePanel,
                            onNormal    : this.$onLeaveRemovePanel,
                            onMouseDown : this.$onClickRemovePanel
                        }
                    })
                );
            }


            this.$ContextMenu.setPosition(
                event.page.x,
                event.page.y
            ).show().focus();
        },

        /**
         * event : onclick contextmenu, add a panel
         *
         * @method qui/controls/desktop/Column#$clickAddPanelToColumn
         * @param {qui/controls/contextmenu/Item} ContextMenuItem
         */
        $clickAddPanelToColumn : function(ContextMenuItem)
        {
            var Column = this,
                params = ContextMenuItem.getAttribute( 'params' );

            if ( !params.require ) {
                return;
            }

            require([ params.require ], function(Panel) {
                Column.appendChild( new Panel() );
            });
        },

        /**
         * event : on mouse enter at a contextmenu item -> remove panel
         *
         * @method qui/controls/desktop/Column#$onEnterRemovePanel
         * @param {qui/controls/contextmenu/Item} Item
         */
        $onEnterRemovePanel : function(Item)
        {
            Item.getAttribute( 'Panel' ).highlight();
        },

        /**
         * event : on mouse leave at a contextmenu item -> remove panel
         *
         * @method qui/controls/desktop/Column#$onLeaveRemovePanel
         * @param {qui/controls/contextmenu/Item} Item
         */
        $onLeaveRemovePanel : function(Item)
        {
            Item.getAttribute( 'Panel' ).normalize();
        },

        /**
         * event : on mouse click at a contextmenu item -> remove panel
         *
         * @method qui/controls/desktop/Column#$onClickRemovePanel
         * @param {qui/controls/contextmenu/Item} Item
         */
        $onClickRemovePanel : function(Item)
        {
            Item.getAttribute( 'Panel' ).destroy();
        },

        /**
         * DragDrop event handling
         */

        /**
         * event : drag drop start
         * calculates the position of the drag drop arrows
         * and create the drag drop arrows
         *
         * @method qui/controls/desktop/Column#$onDragDropStart
         * @param {qui/classes/utils/DragDrop} DragDrop - DragDrop Object
         * @param {DOMNode} DragElement - DragDrop DOMNode Element
         * @param {DOMEvent} event - DOM event
         */
        $onDragDropStart : function(DragDrop, DragElement, event)
        {
            var i, y, len, closest, distance, Handler;

            this.$ddArrowPositions = {};

            var Elm    = this.getElm(),
                elmPos = Elm.getPosition(),
                list   = Elm.getElements( '.qui-column-hor-handle' ),
                xPos   = elmPos.x;

            // first arrow
            this.$ddArrowPositions[ elmPos.y ] = new Element('div', {
                'class' : 'qui-column-drag-arrow icon-circle-arrow-left ',
                styles  : {
                    top     : elmPos.y,
                    left    : xPos,
                    display : 'none'
                },
                'data-arrowno' : 0
            }).inject( document.body );

            // arrows between
            for ( i = 0, len = list.length; i < len; i++ )
            {
                Handler = list[ i ];
                Handler.set( 'data-arrowid', String.uniqueID() );

                y = Handler.getPosition().y;

                this.$ddArrowPositions[ y ] = new Element('div', {
                    'class' : 'qui-column-drag-arrow icon-circle-arrow-left ',
                    styles  : {
                        top     : y - 20,
                        left    : xPos,
                        display : 'none'
                    },
                    'data-arrowid' : Handler.get( 'data-arrowid' ),
                    'data-arrowno' : i + 1
                }).inject( document.body );
            }


            // last arrow
            this.$ddArrowPositions[ elmPos.y + Elm.getSize().y ] = new Element('div', {
                'class' : 'qui-column-drag-arrow icon-circle-arrow-left ',
                styles  : {
                    top     : elmPos.y + Elm.getSize().y - 20,
                    left    : xPos,
                    display : 'none'
                },
                'data-arrowno' : i + 1
            }).inject( document.body );

            // calc the nearest
            y        = event.page.y;
            closest  = null;
            distance = false;

            for ( i in this.$ddArrowPositions )
            {
                distance = y-i;

                if ( distance < 0 ) {
                    distance = distance * -1;
                }

                if ( !closest || closest > distance )
                {
                    this.$ddArrow = this.$ddArrowPositions[ i ];
                    closest = distance;
                }
            }

            this.$ddArrow.setStyle( 'display', null );
        },

        /**
         * event : drag drop complete
         * destroy all drag drop arrows
         *
         * @method qui/controls/desktop/Column#$onDragDropStop
         */
        $onDragDropStop : function()
        {
            var i, len, list;

            for ( i in this.$ddArrowPositions ) {
                this.$ddArrowPositions[ i ].destroy();
            }

            this.$ddArrowPositions = {};

            // clean handler ids
            list = this.getElm().getElements( '.qui-column-hor-handle' );

            for ( i = 0, len = list.length; i < len; i++ ) {
                list[ i ].set( 'data-arrowid', null );
            }
        },

        /**
         * event : drag
         *
         * @method qui/controls/desktop/Column#$onDrag
         * @param {qui/classes/utils/DragDrop} DragDrop - DragDrop Object
         * @param {DOMEvent} event - DOM event
         */
        $onDrag : function(DragDrop, event)
        {
            var y = event.page.y;

            if ( this.$ddArrowPositions[ y ] )
            {
                this.$ddArrow.setStyle( 'display', 'none' );
                this.$ddArrowPositions[ y ].setStyle( 'display', null );

                this.$ddArrow = this.$ddArrowPositions[ y ];
            }
        },

        /**
         * event : a control droped on the column
         *
         * @method qui/controls/desktop/Column#$onDrop
         * @param {qui/controls/Control} Control - QUI Control
         */
        $onDrop : function(Control)
        {
            if ( !this.$ddArrow )
            {
                this.appendChild( Control );
                return;
            }

            this.appendChild( Control, this.$ddArrow.get( 'data-arrowno' ) );
        }
    });
});