
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
 *
 * @event onContextMenu [ {self}, {DOMEvent} ]
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

            '$onDragDropEnter',
            '$onDragDropLeave',
            '$onDragDropDrag',
            '$onDragDropDrop',
            '$onDragDropComplete'
        ],

        options : {
            name        : 'column',
            width       : false,
            height      : false,
            resizeLimit : [],
            closable    : false,
            placement   : 'left', // depricated
            contextmenu : false
        },

        initialize: function(options)
        {
            this.parent( options );

            this.$ContextMenu = null;
            this.$Elm         = null;
            this.$Content     = null;
            this.$panels      = {};
            this.$dragDrops   = {};

            this.$fixed   = true;
            this.$tmpList = []; // temp list for append Child

            this.addEvents({
                onDestroy : this.$onDestroy,

                dragDropEnter    : this.$onDragDropEnter,
                dragDropLeave    : this.$onDragDropLeave,
                dragDropDrag     : this.$onDragDropDrag,
                dragDropDrop     : this.$onDragDropDrop,
                dragDropComplete : this.$onDragDropComplete
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
                'class'      : 'qui-column box qui-panel-drop qui-task-drop',
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
                Column : this,
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

            // temp panels exist?
            for ( var i = 0, len = this.$tmpList.length; i < len; i++ )
            {
                this.appendChild(
                    this.$tmpList[ i ].Panel,
                    this.$tmpList[ i ].pos
                );
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
            var panels     = this.getChildren(),
                children   = [],
                attributes = this.getAttributes(),
                size       = this.getElm().getSize();

            for ( var p in panels ) {
                children.push( panels[ p ].serialize() );
            }

            attributes.width  = size.x;
            attributes.height = size.y;

            return {
                attributes : attributes,
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

            var req = [];

            for ( i = 0, len = children.length; i < len; i++ )
            {
                child_type  = children[ i ].type;
                child_modul = child_type.replace('QUI.', '')
                                        .replace(/\./g, '/');

                req.push( child_modul );
            }

            require(req, function()
            {
                var regArgs = arguments;

                QUI.getMessageHandler(function(MessageHandler)
                {
                    var i, len, attr, height, Child, Control;

                    for ( i = 0, len = children.length; i < len; i++ )
                    {
                        Child  = children[ i ];
                        attr   = Child.attributes;
                        height = attr.height;

                        try
                        {
                            Control = new regArgs[ i ]( attr )
                            Control.unserialize( Child );

                            self.appendChild( Control );

                        } catch ( Exception )
                        {
                            MessageHandler.addError(
                                Exception.toString()
                            );
                        }
                    }

                    Object.each( self.$panels, function(Panel) {
                        Panel.resize();
                    });
                });
            });
        },

        /**
         * fix the column
         * the panels are not more movable
         */
        fix : function()
        {
            var i, len, DragDrop;

            this.$fixed = true;

            Object.each( this.$panels, function(Panel) {
                Panel.disableDragDrop();
            });

            // set cursor from the column handlers to default
            var list = this.$Elm.getElements( '.qui-column-hor-handle' );

            for ( i = 0, len = list.length; i < len; i++ )
            {
                list[ i ].setStyle( 'cursor', 'default' );
                list[ i ].removeClass( 'qui-column-hor-handle-enabled' );
            }

            // disable drag drops
            Object.each( this.$dragDrops, function(DragDrop, key) {
                DragDrop.disable();
            });
        },

        /**
         * unfix the column
         * the panels are movable, again
         */
        unfix : function()
        {
            var i, len;

            this.$fixed = false;

            Object.each( this.$panels, function(Panel) {
                Panel.enableDragDrop();
            });

            // set cursor from the column handlers to default
            var list = this.$Elm.getElements( '.qui-column-hor-handle' );

            for ( i = 0, len = list.length; i < len; i++ )
            {
                list[ i ].setStyle( 'cursor', null );
                list[ i ].addClass( 'qui-column-hor-handle-enabled' );
            }

            // enable drag drops
            Object.each( this.$dragDrops, function(DragDrop) {
                DragDrop.enable();
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
            if ( !this.isApandable( Panel ) ) {
                return this;
            }

            if ( !this.$Content )
            {
                this.$tmpList.push({
                    Panel : Panel,
                    pos   : pos
                });

                return this;
            }

            var Handler = false,
                Parent  = Panel.getParent(),
                count   = this.count(),

                columnHeight = 100,
                panelIndex   = false,
                parentIsMe   = false,
                handleList   = this.$Content.getElements( '.qui-column-hor-handle' ),
                paneList     = this.$Content.getElements( '.qui-panel' );

            var ChildPanel = this.getElm().getElement(
                '[data-quiid="'+ Panel.getId() +'"]'
            );

            if ( this.getAttribute( 'height' ) )
            {
                columnHeight = this.getAttribute( 'height' );
            } else
            {
                columnHeight = this.$Content.getComputedSize().totalHeight;
            }

        // only sortable
            if ( ChildPanel )
            {
                panelIndex = Array.prototype.indexOf.call( paneList, Panel.getElm() );
                parentIsMe = true;

                if ( typeof pos !== 'undefined' )
                {
                    // same position, so we do nothing
                    if ( pos == panelIndex ) {
                        return this;
                    }

                    if ( (panelIndex + 1) == pos ) {
                        return this;
                    }
                }
            }


        // depend from another parent, if the panel has a parent
            if ( parentIsMe === false )
            {
                if ( Panel.getParent() ) {
                    Panel.getParent().dependChild( Panel );
                }

                Panel.setParent( this );

            } else
            {
        // only sort, than destroy the handler
                if ( Panel.getAttribute( '_Handler' ) )
                {
                    Panel.getAttribute( '_Handler' ).destroy();

                } else if ( panelIndex == 0 )
                {
                    handleList[ 0 ].destroy();
                }

                if ( typeof handleList[ panelIndex-1 ] !== 'undefined' &&
                     handleList[ panelIndex-1 ].getParent() )
                {
                    handleList[ panelIndex-1 ].destroy();
                }
            }


        // create a new handler
            if ( count )
            {
                Handler = new Element('div', {
                    'class' : 'qui-column-hor-handle smooth'
                });

                if ( !this.$fixed ) {
                    Handler.addClass( 'qui-column-hor-handle-enabled' );
                }

                this.$addHorResize( Handler );

                Panel.setAttribute( '_Handler', Handler );
            }


        // new panel events
            Panel.addEvents({
                onMinimize : this.$onPanelMinimize,
                onOpen     : this.$onPanelOpen,
                onDestroy  : this.$onPanelDestroy
            });

            this.$panels[ Panel.getId() ] = Panel;

        // insert
            if ( !Panel.getAttribute( 'height' ) ) {
                Panel.setAttribute( 'height', 200 );
            }

            if ( !Panel.getAttribute( 'height' ) || !count ) {
                Panel.setAttribute( 'height', columnHeight );
            }

            if ( typeof pos === 'undefined' || handleList.length < (pos).toInt() )
            {
                if ( Handler ) {
                    Handler.inject( this.$Content );
                }

                Panel.inject( this.$Content );

            } else if ( ( pos ).toInt() === 0 )
            {
                if ( Handler ) {
                    Handler.inject( this.$Content, 'top' );
                }

                Panel.inject( this.$Content, 'top' );

            } else if ( typeof handleList[ pos - 1 ] !== 'undefined' )
            {
                if ( Handler ) {
                    Handler.inject( handleList[ pos - 1 ], 'after' );
                }

                Panel.inject( handleList[ pos - 1 ], 'after' );
            }


        // drag drop?
            if ( this.$fixed === false )
            {
                Panel.enableDragDrop();
            } else
            {
                Panel.disableDragDrop();
            }


        // more panels inside
            if ( !count ) {
                return this;
            }

        // recalc
            this.$recalcAppend( Panel );

            return this;
        },

        /**
         * event on append child - recalc panels
         */
        $recalcAppend : function(Panel)
        {
            var left = this.$getLeftSpace();

            if ( left == 0 ) {
                return;
            }

            var Prev = this.getPreviousOpenedPanel( Panel );

            if ( !Prev ) {
                Prev = this.getNextOpenedPanel( Panel );
            }

            if ( !Prev ) {
                return;
            }

            if ( Prev.getElm().getSize().y + left < 50 )
            {
                Prev.minimize();

                this.$recalcAppend( Panel );
                return;
            }

            Prev.setAttribute(
                'height',
                Prev.getElm().getSize().y + left
            );

            Prev.resize();
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

            Panel.getElm().dispose();

            this.recalcPanels();

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

            var width  = this.getAttribute( 'width' ),
                height = this.getAttribute( 'height' );

            if ( !width && !height ) {
                return this;
            }

            var elmSize = this.$Elm.getSize();

            if ( elmSize.x == this.getAttribute( 'width' ) &&
                 elmSize.y == this.getAttribute( 'height' ) )
            {
                return this;
            }

            this.$Elm.setStyle( 'width', width );
            this.$Elm.setStyle( 'height', height );

            for ( var i in this.$panels )
            {
                this.$panels[ i ].setAttribute( 'width', width );
                this.$panels[ i ].resize();
            }

            this.$Content.setStyle( 'overflow', 'hidden' );

            (function()
            {
                this.recalcPanels();
                this.$Content.setStyle( 'overflow', null );

            }).delay( 20, this );


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

            if ( this.getElm().getElement( '.qui-column-hightlight' ) ) {
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
         * Resize all panels with the same size
         */
        adaptPanels : function()
        {
            var i, len, Panel, panelHeight;

            var list      = this.$Content.getElements( '.qui-panel' ),
                handler   = this.$Content.getElements( '.qui-column-hor-handle' ),
                maxHeight = this.$Content.getComputedSize().totalHeight,
                len       = list.length;

            var handlerSum = handler.getDimensions().map(function(obj) {
                return obj.y;
            }).sum();

            maxHeight   = maxHeight - handlerSum;
            panelHeight = Math.ceil( maxHeight / len );

            for ( i = 0; i < len; i++ )
            {
                Panel = QUI.Controls.getById(
                    list[ i ].get( 'data-quiid' )
                );

                if ( maxHeight < panelHeight) {
                    panelHeight = maxHeight;
                }

                Panel.setAttribute( 'height', panelHeight );
                Panel.resize();

                maxHeight = maxHeight - panelHeight;
            }
        },

        /**
         * Recalc the panels, if space exist, the last panel would be resized
         */
        recalcPanels : function()
        {
            if ( !this.count() ) {
                return;
            }

            var leftSpace = this.$getLeftSpace();

            if ( leftSpace == 0 ) {
                return;
            }

            // resize last panel
            var LastElm   = this.$Content.getLast( '.qui-panel' ),
                LastPanel = QUI.Controls.getById( LastElm.get( 'data-quiid' ) );

            if ( LastPanel.isOpen() === false ) {
                LastPanel = this.getPreviousOpenedPanel( LastPanel );
            }

            if ( !LastPanel || LastPanel.isOpen() === false ) {
                return;
            }

            var panelHeight = LastPanel.getElm().getSize().y;

            if ( panelHeight + leftSpace < 50 )
            {
                LastPanel.minimize();
                this.recalcPanels();
                return;
            }

            LastPanel.setAttribute( 'height', panelHeight + leftSpace );
            LastPanel.resize();
        },

        /**
         * Return true or false, if the object can be append into the column
         *
         * @param {Object} QO - QUI object
         */
        isApandable : function(QO)
        {
            switch ( typeOf( QO ) )
            {
                case 'qui/controls/desktop/Panel':
                case 'qui/controls/desktop/Tasks':
                case 'qui/controls/taskbar/Task':
                    return true;
            }

            if ( instanceOf( QO, Panel ) ) {
                return true;
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

            var elmSize = Next.getElm().getSize().y,
                left    = this.$getLeftSpace();

            if ( elmSize + left < 50 )
            {
                Next.minimize();
                return;
            }

            Next.setAttribute( 'height', elmSize + left );
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
            var Prev        = false,
                PanelElm    = Panel.getElm(),

                direction     = Panel.getAttribute( 'columnCloseDirection' ),
                panelHeight   = PanelElm.getSize().y,
                contentHeight = this.$Content.getSize().y,
                scrollHeight  = this.$Content.getScrollSize().y;


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

            // all other panels closed
            if ( !Prev )
            {
                // use the whole left space, if space exists
                var left = this.$getLeftSpace();

                if ( !left ) {
                    return;
                }

                // we have some more space
                Panel.setAttribute( 'height', panelHeight + left );
                Panel.resize();
                return;
            }

            // we have more panels opened, we must resized the panels
            var PrevElm    = Prev.getElm(),
                prevHeight = PrevElm.getComputedSize().totalHeight,
                newHeight  = prevHeight - panelHeight;

            Prev.setAttribute( 'height', newHeight );
            Prev.resize();

            var left = this.$getLeftSpace();

            if ( left === 0 ) {
                return;
            }

            if ( left > 0 )
            {
                Prev.setAttribute( 'height', newHeight + left );
                Prev.resize();
                return;
            }

            this.adaptPanels();
        },

        /**
         * Return the left space, the empty space which is available
         *
         * @return {Integer}
         */
        $getLeftSpace : function()
        {
            var childrens   = this.$Content.getChildren(),
                contentSize = this.$Content.getSize().y;

            if ( !contentSize ) {
                return 0;
            }

            var sum = childrens.getSize().map(function(obj) {
                return obj.y;
            }).sum();

            return contentSize - sum;
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

            this.$dragDrops[ DragDrop.getId() ] = DragDrop;
        },

        /**
         * Horizontal Drag Drop Stop
         * Helper Function
         *
         * @method qui/controls/desktop/Column#$horResizeStop
         */
        $horResizeStop : function(DragDrop, Dragable)
        {
            var change, newHeight;

            var Handle   = DragDrop.getAttribute('Handle'),
                pos      = Dragable.getPosition(),
                hpos     = Handle.getPosition(),
                children = this.$Content.getChildren(),

                computedSize = this.$Content.getComputedSize();

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
                    NextInstance.setAttribute( 'height', 40 );
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
                    PrevInstance.setAttribute( 'height', 40 );
                    PrevInstance.open();
                } else
                {
                    PrevInstance = PrevOpened;
                }
            }


            if ( NextInstance )
            {
                newHeight = NextInstance.getElm().getSize().y - change;

                if ( newHeight < 50 ) { // panel min height
                    newHeight = 50;
                }

                NextInstance.setAttribute( 'height', newHeight );
                NextInstance.resize();
            }


            if ( PrevInstance )
            {
                newHeight = PrevInstance.getElm().getSize().y + change;

                var discrepancy = 0;

                if ( newHeight < 50 ) // panel min height
                {
                    discrepancy = 50 - newHeight;
                    newHeight   = 50;
                }

                PrevInstance.setAttribute( 'height', newHeight );
                PrevInstance.resize();

                if ( discrepancy && NextInstance )
                {
                    newHeight = NextInstance.getElm().getSize().y - discrepancy;

                    NextInstance.setAttribute( 'height', newHeight );
                    NextInstance.resize();
                }
            }

            var leftSpace = this.$getLeftSpace();

            if ( leftSpace == 0 ) {
                 return;
            }

            newHeight = PrevInstance.getAttribute( 'height' ) + leftSpace;

            PrevInstance.setAttribute( 'height', newHeight );
            PrevInstance.resize();
        },

        /**
         * event : on context menu
         *
         * @method qui/controls/desktop/Column#$onContextMenu
         * @param {DOMEvent} event
         * @depricated
         */
        $onContextMenu : function(event)
        {
            if ( this.$fixed ) {
                return;
            }

            this.fireEvent( 'contextMenu', [ this, event ] );


            if ( !this.getAttribute( 'contextmenu' ) ) {
                return;
            }

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
         * event on drag drop enter
         *
         * @method qui/controls/desktop/Column#$onDragDropEnter
         * @param {qui/controls/Control} Control - QUI Control
         * @param {DOMNode} Elm
         */
        $onDragDropEnter : function(QO, Elm)
        {
            if ( !this.isApandable( QO ) ) {
                return;
            }


            this.$calcDragDropArrows();

            // calc the nearest
            var y        = Elm.getPosition().y,
                closest  = null,
                distance = false;

            for ( var i in this.$ddArrowPositions )
            {
                distance =  y - i;

                if ( distance < 0 ) {
                    distance = distance * -1;
                }

                if ( !closest || closest > distance )
                {
                    this.$ddArrow = this.$ddArrowPositions[ i ];
                    closest = distance;
                }
            }

            if ( this.$ddArrow ) {
                this.$ddArrow.setStyle( 'display', null );
            }

            this.highlight();
        },

        /**
         * event on draging
         *
         * @method qui/controls/desktop/Column#$onDragDropDrag
         * @param {qui/controls/Control} Control - QUI Control
         * @param {DOMEvent} event
         */
        $onDragDropDrag : function(QO, event)
        {
            var y = event.page.y,
                x = event.page.x;

            if ( typeof this.$ddArrowPositions[ y ] === 'undefined' ) {
                return;
            }

            if ( this.$ddArrow == this.$ddArrowPositions[ y ] ) {
                return;
            }

            if ( this.$ddArrow ) {
                this.$ddArrow.setStyle( 'display', 'none' );
            }

            this.$ddArrow = this.$ddArrowPositions[ y ];
            this.$ddArrow.setStyle( 'display', null );
        },

        /**
         * event : a control droped on the column
         *
         * @method qui/controls/desktop/Column#$onDragDropDrop
         * @param {qui/controls/Control} Control - QUI Control
         */
        $onDragDropDrop : function(QO)
        {
            if ( !this.isApandable( QO ) ) {
                return;
            }

            if ( typeOf( QO ) == 'qui/controls/taskbar/Task' )
            {
                QO = QO.getInstance();

                this.$onDragDropComplete();
            }

            if ( !this.$ddArrow )
            {
                this.appendChild( QO );
                this.recalcPanels();

                return;
            }

            this.appendChild( QO, this.$ddArrow.get( 'data-arrowno' ) );
            this.$onDragDropLeave( QO );

            this.recalcPanels();
        },

        /**
         * event drag drop complete
         *
         * @method qui/controls/desktop/Column#$onDragDropComplete
         * @param {qui/controls/Control} QO - QUI Object
         */
        $onDragDropComplete : function(QO)
        {
            this.$clearDragDropArrows();
            this.normalize();
        },

        /**
         * event: drag drop leave
         *
         * @method qui/controls/desktop/Column#$onDragDropLeave
         * @param {qui/controls/Control} Control - QUI Control
         */
        $onDragDropLeave : function(QO)
        {
            this.$onDragDropComplete();
        },

        /**
         * calculates the position of the drag drop arrows
         * and create the drag drop arrows
         *
         * @method qui/controls/desktop/Column#$onDragDropStart
         */
        $calcDragDropArrows : function()
        {
            var i, y, len, Handler;

            this.$ddArrowPositions = {};

            var Elm    = this.getElm(),
                elmPos = Elm.getPosition(),
                list   = Elm.getElements( '.qui-column-hor-handle' ),
                xPos   = elmPos.x;

            // first arrow
            this.$ddArrowPositions[ elmPos.y + 10 ] = new Element('div', {
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
            this.$ddArrowPositions[ elmPos.y + Elm.getSize().y - 10 ] = new Element('div', {
                'class' : 'qui-column-drag-arrow icon-circle-arrow-left ',
                styles  : {
                    top     : elmPos.y + Elm.getSize().y - 20,
                    left    : xPos,
                    display : 'none'
                },
                'data-arrowno' : i + 1
            }).inject( document.body );
        },

        /**
         * event : drag drop complete
         * destroy all drag drop arrows
         *
         * @method qui/controls/desktop/Column#$onDragDropStop
         */
        $clearDragDropArrows : function()
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
        }
    });
});