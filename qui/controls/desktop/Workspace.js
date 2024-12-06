/**
 * Workspace
 *
 * You can append the Workspace with columns and panels
 * Save the Workspace and load the workspace
 *
 * @module qui/controls/desktop/Workspace
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onLoaded - if the workspace is loaded
 * @event onSave [ {this}, {JSON ObjectString} ]
 * @event onColumnContextMenu [ {this}, {qui/controls/desktop/Column}, {DOMEvent} ]
 */

define('qui/controls/desktop/Workspace', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/controls/desktop/Column',
    'qui/classes/storage/Storage',
    'qui/utils/Math',
    'qui/classes/utils/DragDrop'

], function(QUI, QUIControl, QUILoader, QUIColumn, QUIStorage, QUIMath, QUIDragDrop) {
    'use strict';

    /**
     * @class qui/controls/desktop/Workspace
     *
     * @param {HTMLElement} Parent - Parent node
     * @param {Object} options . QDOM params
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: QUIControl,
        Type: 'qui/controls/desktop/Workspace',

        Binds: [
            'resize',
            '$onHandlerContextMenu',
            '$onHandlerContextMenuHighlight',
            '$onHandlerContextMenuNormalize',
            '$onHandlerContextMenuClick',
            '$onColumnContextMenu',
            '$onColumnDestroy'
        ],

        options: {
            limit: {}
        },

        initialize: function(options) {
            this.parent(options);

            this.Loader = null;

            this.$columns = [];
            this.$fixed = false;
            this.$dragDrops = {};
        },

        /**
         * Clear the workspace and destroy all panels
         */
        clear: function() {
            for (let i = 0, len = this.$columns.length; i < len; i++) {
                if (typeOf(this.$columns[i]) === 'qui/controls/desktop/Column') {
                    this.$columns[i].destroy();
                }
            }

            this.$columns = [];
            this.$Elm.set('html', '');
        },

        /**
         * Workspace resize
         *
         * @method qui/controls/desktop/Workspace#resize
         * @param {Array|Boolean} [workspace] - optional, json decoded serialized workspace
         */
        resize: function(workspace) {
            let i, len, width, perc, Column;
            const wlist = [];

            if (typeof workspace === 'undefined' ||
                typeof workspace.length === 'undefined') {
                workspace = false;
            }

            if (workspace) {
                let attr;

                for (i = 0, len = workspace.length; i < len; i++) {
                    attr = workspace[i].attributes;

                    if (attr.width && attr.width > 0) {
                        wlist.push(attr.width);
                    } else {
                        wlist.push(200);
                    }
                }
            } else {
                for (i = 0, len = this.$columns.length; i < len; i++) {
                    Column = this.$columns[i];

                    // width list
                    if (Column.getAttribute('width') &&
                        Column.getAttribute('width') > 0) {
                        wlist.push(
                            Column.getAttribute('width')
                        );
                    } else {
                        wlist.push(200);
                    }
                }
            }

            // resize columns width %
            let old_max = 0,
                elmSize = this.$Elm.getSize(),
                maxHeight = elmSize.y,
                maxWidth = elmSize.x;

            for (i = 0, len = wlist.length; i < len; i++) {
                old_max = old_max + wlist[i];
            }

            let availableWidth = maxWidth;

            // calc the % and resize it
            for (i = 0, len = wlist.length; i < len; i++) {
                perc = QUIMath.percent(wlist[i], old_max);

                if (wlist[i] !== 50) {
                    width = (maxWidth * (perc / 100)).round();
                } else {
                    width = wlist[i];
                }

                if (availableWidth < width) {
                    width = availableWidth;
                }

                // if last panel, use rest size
                if (i === len - 1 && availableWidth > width) {
                    width = availableWidth - 4;
                }

                if (i !== 0) {
                    width = width - 4; // resizer width
                }

                this.$columns[i].setAttribute('width', width);
                this.$columns[i].setAttribute('height', maxHeight);
                this.$columns[i].resize();

                availableWidth = availableWidth - this.$columns[i].getAttribute('width');
            }
        },

        /**
         * fix the workspace
         * the columns and panels are not more movable
         */
        fix: function() {
            let i, len;

            this.$fixed = true;

            for (i = 0, len = this.$columns.length; i < len; i++) {
                this.$columns[i].fix();
            }

            // set column handlers to default
            let list = this.$Elm.getElements('.qui-column-handle');

            for (i = 0, len = list.length; i < len; i++) {
                list[i].removeClass('qui-column-handle-enabled');
            }

            // disable drag drops
            Object.each(this.$dragDrops, function(DragDrop) {
                DragDrop.disable();
            });
        },

        /**
         * unfix the workspace
         * the columns and panels are movable, again
         */
        unfix: function() {
            let i, len;

            this.$fixed = false;

            for (i = 0, len = this.$columns.length; i < len; i++) {
                this.$columns[i].unfix();
            }

            // set column handlers to default
            let list = this.$Elm.getElements('.qui-column-handle');

            for (i = 0, len = list.length; i < len; i++) {
                list[i].addClass('qui-column-handle-enabled');
            }

            // enable drag drops
            Object.each(this.$dragDrops, function(DragDrop) {
                DragDrop.enable();
            });
        },

        /**
         * Create the DOMNode
         *
         * @method qui/controls/desktop/Workspace#create
         * @return {HTMLElement}
         */
        create: function() {
            this.$Elm = new Element('div.qui-workspace', {
                styles: {
                    'float': 'left',
                    height: '100%',
                    overflow: 'hidden',
                    width: '100%'
                }
            });

            this.Loader = new QUILoader({
                styles: {
                    zIndex: 100
                }
            }).inject(this.$Elm);

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            return this.$Elm;
        },

        /**
         * Save the Workspace to the localstorage
         *
         * @method qui/controls/desktop/Workspace#save
         * @return {Boolean}
         */
        save: function() {
            this.fireEvent('save', [
                this,
                JSON.encode(this.serialize())
            ]);

            return true;
        },

        /**
         * Serialize the workspace
         *
         * @method qui/controls/desktop/Workspace#serialize
         * @return {Object}
         */
        serialize: function() {
            let i, len, Column;

            const columns = this.$Elm.getChildren('.qui-column'),
                result = [];

            for (i = 0, len = columns.length; i < len; i++) {
                Column = QUI.Controls.getById(
                    columns[i].get('data-quiid')
                );

                result.push(Column.serialize());
            }

            return result;
        },

        /**
         * Load saved wrokspace into the workspace
         *
         * @method qui/controls/desktop/Workspace#unserialize
         * @param {Object} workspace - serialize object from serialize();
         */
        unserialize: function(workspace) {
            const self = this;

            if (!workspace.length) {
                self.fireEvent('loaded');
                return;
            }

            require(['qui/controls/desktop/Panel'], function() {
                if (!workspace.length) {
                    self.fireEvent('loaded');
                    return;
                }

                let i, len, Column;

                // make columns
                for (i = 0, len = workspace.length; i < len; i++) {
                    Column = new QUIColumn(
                        workspace[i].attributes
                    );

                    if (workspace[i].children) {
                        Column.unserialize(workspace[i]);
                    }

                    self.appendChild(Column);
                }

                // resize columns width %
                self.resize(workspace);
                self.fireEvent('loaded');
            });
        },

        /**
         * Add a column to the workspace
         *
         * @method qui/controls/desktop/Workspace#appendChild
         * @param {Object} Column - qui/controls/desktop/Column | column params
         * @return {Object} this (qui/controls/desktop/Workspace)
         */
        appendChild: function(Column) {
            if (typeOf(Column) !== 'qui/controls/desktop/Column') {
                Column = new QUIColumn(Column);
            }

            let max_width = this.$Elm.getSize().x,
                col_width = Column.getAttribute('width');

            if (!this.count()) {
                col_width = max_width;
            }

            if (!col_width) {
                col_width = 200;
            }

            Column.setAttribute('width', col_width);
            Column.setParent(this);
            Column.inject(this.$Elm);

            Column.removeEvents('contextMenu');

            Column.addEvents({
                onContextMenu: this.$onColumnContextMenu,
                onDestroy: this.$onColumnDestroy
            });

            if (this.$fixed) {
                Column.fix();
            } else {
                Column.unfix();
            }

            if (this.count()) {
                const Handler = new Element('div', {
                    html: '&nbps;',
                    'class': 'qui-column-handle smooth',
                    styles: {
                        width: 4,
                        borderWidth: '0 1px'
                    },
                    events: {
                        contextmenu: this.$onHandlerContextMenu
                    }
                });

                if (!this.$fixed) {
                    Handler.addClass('qui-column-handle-enabled');
                }

                Handler.inject(Column.getElm(), 'before');

                this.$bindResizeToColumn(Handler, Column);

                // get prev column
                const Sibling = this.lastChild(),
                    sibling_width = max_width - col_width - 4; // -4 because handler

                Sibling.setAttribute('width', sibling_width);
                Sibling.resize();
            }

            this.$columns.push(Column);

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
         * @method qui/controls/desktop/Workspace#appendPanel
         * @param {Object} Panel - qui/controls/dekstop/Panel
         */
        appendPanel: function(Panel) {
            if (QUI.Controls.getByType('qui/controls/desktop/Tasks').length) {
                QUI.Controls.getByType('qui/controls/desktop/Tasks')[0].appendChild(
                    Panel
                );

                return;
            }

            if (QUI.Controls.get('content-panel').length) {
                QUI.Controls.get('content-panel')[0].appendChild(
                    Panel
                );

                return;
            }

            if (this.$columns[1]) {
                this.$columns[1].appendChild(Panel);
                return;
            }

            if (this.$columns[0]) {
                this.$columns[0].appendChild(Panel);
                return;
            }

            QUI.getMessageHandler(function(MH) {
                MH.addError('Could not append the panel to the Workspace');
            });
        },

        /**
         * Return the last column
         *
         * @method qui/controls/desktop/Workspace#lastChild
         * @return {Object|Boolean} qui/controls/desktop/Column | false
         */
        lastChild: function() {
            return this.$columns[this.count() - 1] || false;
        },

        /**
         * Return the first column
         *
         * @method qui/controls/desktop/Workspace#firstChild
         * @return {Object|Boolean} qui/controls/desktop/Column | false
         */
        firstChild: function() {
            return this.$columns[0] || false;
        },

        /**
         * Return the number of columns in the workspace
         *
         * @method qui/controls/desktop/Workspace#count
         * @return {Number}
         */
        count: function() {
            return this.$columns.length;
        },

        /**
         * set the with of the workspace
         *
         * @param {Number} width
         */
        setWidth: function(width) {
            this.$Elm.setStyle('width', width);
        },

        /**
         * set the height of the workspace
         *
         * @param {Number} height
         */
        setHeight: function(height) {
            this.$Elm.setStyle('height', height);
        },

        /**
         * Add the vertical resizing events to the column
         *
         * @method qui/controls/desktop/Workspace#$bindResizeToColumn
         * @param {HTMLElement} Handler
         * @param {Object} Column - qui/controls/desktop/Column
         */
        $bindResizeToColumn: function(Handler, Column) {
            // dbl click
            Handler.addEvent('dblClick', function() {
                Column.toggle();
            });

            // Drag & Drop event
            let min = Column.getAttribute('resizeLimit')[0],
                max = Column.getAttribute('resizeLimit')[1];

            if (!min) {
                min = 50;
            }

            if (!max) {
                max = this.getElm().getSize().x - 50;
            }

            const handlepos = Handler.getPosition().y;

            const DragDrop = new QUIDragDrop(Handler, {
                delay: 50,
                limit: {
                    x: [
                        min,
                        max
                    ],
                    y: [
                        handlepos,
                        handlepos
                    ]
                },
                events: {
                    onStart: function(DragDrop, Dragable) {
                        let pos = Handler.getPosition(),
                            limit = DragDrop.getAttribute('limit');

                        limit.y = [
                            pos.y,
                            pos.y
                        ];

                        DragDrop.setAttribute('limit', limit);

                        Dragable.setStyles({
                            width: 5,
                            padding: 0,
                            top: pos.y,
                            left: pos.x
                        });
                    },

                    onStop: function(DragDrop, Dragable) {
                        if (Column.isOpen() === false) {
                            Column.open();
                        }

                        let change, next_width, this_width;

                        let pos = Dragable.getPosition(),
                            hpos = Handler.getPosition(),
                            Prev = Column.getPrevious(),
                            Next = Column.getNext();


                        change = pos.x - hpos.x - Handler.getSize().x;

                        if (!Next && !Prev) {
                            return;
                        }

                        let Sibling = Next,
                            placement = 'left';

                        if (Prev) {
                            Sibling = Prev;
                            placement = 'right';
                        }

                        this_width = Column.getAttribute('width');
                        next_width = Sibling.getAttribute('width');

                        if (placement === 'left') {
                            Column.setAttribute('width', this_width + change);
                            Sibling.setAttribute('width', next_width - change);

                        } else {
                            if (placement === 'right') {
                                Column.setAttribute('width', this_width - change);
                                Sibling.setAttribute('width', next_width + change);
                            }
                        }

                        Sibling.resize();
                        Column.resize();
                    }
                }
            });

            if (this.$fixed) {
                DragDrop.disable();
            }

            this.$dragDrops[DragDrop.getId()] = DragDrop;
        },

        /**
         * Resize handler context menu
         *
         * @method qui/controls/desktop/Workspace#$onHandlerContextMenu
         * @param {HTMLElement} event
         */
        $onHandlerContextMenu: function(event) {
            if (this.$fixed) {
                return;
            }

            const self = this;

            event.stop();

            require([
                'qui/controls/contextmenu/Menu',
                'qui/controls/contextmenu/Item'
            ], function(Contextmenu, ContextmenuItem) {
                const Menu = new Contextmenu({
                    events: {
                        onBlur: function(Menu) {
                            Menu.destroy();
                        }
                    }
                });

                Menu.setParent(self);

                const Target = event.target,
                    Left = Target.getPrevious('.qui-column'),
                    Next = Target.getNext('.qui-column'),

                    LeftColumn = QUI.Controls.getById(Left.get('data-quiid')),
                    RightColumn = QUI.Controls.getById(Next.get('data-quiid'));


                Menu.hide();
                Menu.appendChild(
                    new ContextmenuItem({
                        icon: 'icon-arrow-left',
                        text: 'Bearbeitungspalte links löschen.',
                        Column: LeftColumn,
                        Handler: Target,
                        events: {
                            onMouseDown: self.$onHandlerContextMenuClick,
                            onActive: self.$onHandlerContextMenuHighlight,
                            onNormal: self.$onHandlerContextMenuNormalize
                        }
                    })
                );

                Menu.appendChild(
                    new ContextmenuItem({
                        icon: 'icon-arrow-right',
                        text: 'Bearbeitungspalte rechts löschen.',
                        target: event.target,
                        Column: RightColumn,
                        events: {
                            onMouseDown: self.$onHandlerContextMenuClick,
                            onActive: self.$onHandlerContextMenuHighlight,
                            onNormal: self.$onHandlerContextMenuNormalize
                        }
                    })
                );

                Menu.inject(document.body);

                Menu.setPosition(
                    event.page.x,
                    event.page.y
                ).show().focus();
            });

        },

        /**
         * event : mouseclick on a contextmenu item on the handler slider
         *
         * @method qui/controls/desktop/Workspace#$onHandlerContextMenuClick
         * @param {Object} Item - qui/controls/contextmenu/Item
         */
        $onHandlerContextMenuClick: function(Item) {
            if (this.$fixed) {
                return;
            }

            Item.getAttribute('Column').destroy();
            Item.getAttribute('Handler').destroy();
        },

        /**
         * event : mouseenter on a contextmenu item on the handler slider
         *
         * @method qui/controls/desktop/Workspace#$onHandlerContextMenuHighlight
         * @param {Object} Item - qui/controls/contextmenu/Item
         */
        $onHandlerContextMenuHighlight: function(Item) {
            if (this.$fixed) {
                return;
            }

            Item.getAttribute('Column').highlight();
        },

        /**
         * event : mouseleave on a contextmenu item on the handler slider
         *
         * @method qui/controls/desktop/Workspace#$onHandlerContextMenuNormalize
         * @param {Object} Item - qui/controls/contextmenu/Item
         */
        $onHandlerContextMenuNormalize: function(Item) {
            if (this.$fixed) {
                return;
            }

            Item.getAttribute('Column').normalize();
        },

        /**
         * event : column context menu
         *
         * @method qui/controls/desktop/Workspace#$onHandlerContextMenuNormalize
         * @param {Object} Column - qui/controls/desktop/Column
         * @param {DOMEvent} event
         */
        $onColumnContextMenu: function(Column, event) {
            if (this.$fixed) {
                return;
            }

            this.fireEvent('columnContextMenu', [
                this,
                Column,
                event
            ]);
        },

        /**
         * event : on column destroy
         *
         * @method qui/controls/desktop/Workspace#$onHandlerContextMenuNormalize
         */
        $onColumnDestroy: function(Column) {
            // destroy two successively handlers
            this.$Elm.getElements('.qui-column-handle+.qui-column-handle').destroy();

            // remove the column from the list
            const newList = [];

            for (let i = 0, len = this.$columns.length; i < len; i++) {
                if (this.$columns[i] !== Column) {
                    newList.push(this.$columns[i]);
                }
            }

            this.$columns = newList;


            // recalc columns
            const LastElm = this.$Elm.getLast('.qui-column'),
                left = this.$getLeftSpace();

            if (!LastElm) {
                return;
            }

            const Last = QUI.Controls.getById(LastElm.get('data-quiid'));

            Last.setAttribute('width', LastElm.getSize().x + left);
            Last.resize();
        },

        /**
         * Return the left space, the empty space which is available
         *
         * @return {Number}
         */
        $getLeftSpace: function() {
            const childrens = this.$Elm.getChildren(),
                contentSize = this.$Elm.getSize().x;

            if (!contentSize) {
                return 0;
            }

            const sum = childrens.getSize().map(function(obj) {
                return obj.x;
            }).sum();

            return contentSize - sum;
        }
    });
});
