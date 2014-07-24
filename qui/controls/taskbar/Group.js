
/**
 * A task for the taskbar
 *
 * @module qui/controls/taskbar/Group
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/contextmenu/Menu
 * @require qui/controls/contextmenu/Item
 * @require qui/classes/utils/DragDrop
 * @require qui/controls/taskbar/Task
 * @require css!qui/controls/taskbar/Group.css
 *
 * @event onNormalize [this]
 * @event onHighlight [this]
 * @event onClick [this]
 * @event onActivate [this]
 * @event onFocus [this]
 * @event onBlur [this]
 * @event onContextMenu [this, event]
 * @event onAppendChild [this, {QUI.controls.taskbar.Task}]
 * @event onAppendChildBegin [
 *      {QUI.controls.taskbar.Bar},
 *      {QUI.controls.taskbar.Task}
 * ]
 */

define([

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/classes/utils/DragDrop',
    'qui/controls/taskbar/Task',

    'css!qui/controls/taskbar/Group.css'

], function(QUI, Control, ContextmenuMenu, ContextmenuItem, QUIDragDrop)
{
    "use strict";

    /**
     * @class qui/controls/taskbar/Group
     *
     * @param {Object} options - QDOM params
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/taskbar/Group',

        Binds : [
            'dissolve',
            'close',
            'click',
            '$onTaskRefresh',
            '$onMenuClick'
        ],

        options : {
            icon : false,
            text : '...'
        },

        initialize : function(options)
        {
            options = options || {};

            this.parent( options );

            this.$tasks  = {};
            this.$Elm    = null;
            this.$Menu   = null;
            this.$Active = null;
            this.$ContextMenu = null;

            var self = this;

            this.addEvent('onDestroy', function()
            {
                if ( self.$Menu ) {
                    self.$Menu.destroy();
                }

                if ( self.$ContextMenu ) {
                    self.$ContextMenu.destroy();
                }

                var Parent = self.getTaskbar(),
                    tasks  = self.getTasks();

                for ( var i = 0, len = tasks.length; i < len; i++ ) {
                    tasks[ i ].removeEvent( 'refresh', self.$onTaskRefresh );
                }
            });
        },

        /**
         * Return the DOMNode
         *
         * @method QUI.controls.buttons.Button#getElm
         * @return {DOMNode}
         */
        create : function()
        {
            var self = this;

            this.$Elm = new Element('div', {
                'class' : 'qui-taskgroup radius5 box',
                html    : '<div class="qui-taskgroup-container">' +
                              '<span class="qui-taskgroup-icon"></span>' +
                              '<span class="qui-taskgroup-text"></span>' +
                          '</div>' +
                          '<div class="qui-taskgroup-menu"></div>',
                styles : {
                    outline: 'none'
                },
                tabindex : -1,
                events   :
                {
                    focus : function(event) {
                        self.fireEvent( 'focus', [ self ] );
                    },

                    blur : function(event) {
                        self.fireEvent( 'blur', [ self ] );
                    },

                    contextmenu : function(event)
                    {
                        self.$getContextMenu().setPosition(
                            event.page.x,
                            event.page.y
                        ).show().focus();

                        self.fireEvent( 'contextMenu', [ self, event ] );

                        event.stop();
                    }
                }
            });

            this.$Elm.getElement('.qui-taskgroup-container').addEvents({
                click : this.click
            });

            // Create the menu
            var Menu = this.$Elm.getElement('.qui-taskgroup-menu');

            this.$Menu = new ContextmenuMenu({
                name   : this.getId() +'-menu',
                type   : 'bottom',
                events :
                {
                    onBlur : function(Menu) {
                        Menu.hide();
                    },

                    onShow : function(Menu)
                    {
                        var x = 0, y = 0;

                        var MenuElm  = Menu.getElm(),
                            menusize = MenuElm.getSize(),
                            pos      = self.getElm().getPosition();

                        x = pos.x;
                        y = pos.y - menusize.y;

                        Menu.setPosition( x, y ).focus();

                    }
                }
            });

            this.$Menu.inject( document.body );
            this.$Menu.hide();

            Menu.addEvents({
                click : function()
                {
                    if ( self.$Menu.count() ) {
                        self.$Menu.show();
                    }
                }
            });

            this.refresh();


            // drag drop to the desktop
            new QUIDragDrop(this.$Elm, {
                dropables : [ '.qui-taskbar' ],
                cssClass  : 'radius5',
                events    :
                {
                    onEnter : function(Element, Droppable)
                    {
                        if ( !Droppable ) {
                            return;
                        }

                        var quiid = Droppable.get('data-quiid');

                        if ( !quiid ) {
                            return;
                        }

                        QUI.Controls.getById( quiid ).highlight();
                    }.bind( this ),

                    onLeave : function(Element, Droppable)
                    {
                        if ( !Droppable ) {
                            return;
                        }

                        var quiid = Droppable.get('data-quiid');

                        if ( !quiid ) {
                            return;
                        }

                        QUI.Controls.getById( quiid ).normalize();
                    },

                    onDrop : function(Element, Droppable, event)
                    {
                        if ( !Droppable ) {
                            return;
                        }

                        var quiid = Droppable.get('data-quiid');

                        if ( !quiid ) {
                            return;
                        }

                        var Bar = QUI.Controls.getById( quiid );

                        Bar.normalize();
                        Bar.appendChild( this );
                    }.bind( this )
                }
            });

            return this.$Elm;
        },

        /**
         * Return the binded instance of the active task
         *
         * @return {QUI.controls.Control|null}
         */
        getInstance : function()
        {
            if ( !this.$Active ) {
                return null;
            }

            return this.$Active.getInstance();
        },

        /**
         * Return the instance icon
         *
         * @return {String|false}
         */
        getIcon : function()
        {
            var Instance = this.getInstance();

            if ( !Instance ) {
                return false;
            }

            return Instance.getAttribute( 'icon' );
        },

        /**
         * Return the instance title
         *
         * @return {String|false}
         */
        getTitle : function()
        {
            var Instance = this.getInstance();

            if ( !Instance ) {
                return false;
            }

            return Instance.getAttribute( 'title' );
        },

        /**
         * Return the the parent
         *
         * @return {QUI.controls.taskbar.Bar}
         */
        getTaskbar : function()
        {
            return this.getParent();
        },

        /**
         * Refresh the group display
         *
         * @param {QUI.controls.taskbar.Task} Task - [optional]
         */
        refresh : function(Task)
        {
            var Icon = this.$Elm.getElement( '.qui-taskgroup-icon' ),
                Text = this.$Elm.getElement( '.qui-taskgroup-text' );

            if ( typeof Task !== 'undefined' )
            {
                this.setAttribute( 'icon', Task.getIcon() );
                this.setAttribute( 'text', Task.getTitle() );

                this.$Active = Task;
            }

            if ( this.getAttribute( 'text' ) ) {
                Text.set( 'html', this.getAttribute( 'text' ) );
            }

            if ( this.getAttribute( 'icon' ) ) {
                Icon.setStyle( 'background-image', 'url('+ this.getAttribute('icon') +')' );
            }
        },

        /**
         * Execute a click event
         *
         * @return {this}
         */
        click : function()
        {
            if ( !this.$Active )
            {
                if ( this.count() && this.firstTask() ) {
                    this.refresh( this.firstTask() );
                }

                return this;
            }

            this.$Active.click();
            this.fireEvent( 'click', [ this ] );

            this.activate();
            this.focus();

            return this;
        },

        /**
         * Set the focus to the group DOMNode element
         *
         * @return {this}
         */
        focus : function()
        {
            if ( this.$Elm ) {
                this.$Elm.focus();
            }

            return this;
        },

        /**
         * Highlight the group
         *
         * @return {this}
         */
        highlight : function()
        {
            if ( this.$Elm ) {
                this.$Elm.addClass( 'highlight' );
            }

            this.fireEvent( 'highlight', [ this ] );

            return this;
        },

        /**
         * Normalize the group
         * no highlight
         *
         * @return {this}
         */
        normalize : function()
        {
            if ( this.$Elm )
            {
                this.$Elm.removeClass( 'highlight' );
                this.$Elm.removeClass( 'active' );
            }

            this.fireEvent( 'normalize', [ this ] );

            return this;
        },

        /**
         * Set the group active
         *
         * @return {this}
         */
        activate : function()
        {
            if ( this.$Active ) {
                this.$Active.activate();
            }

            if ( this.isActive() )
            {
                this.fireEvent( 'activate', [ this ] );
                return this;
            }

            if ( this.$Elm ) {
                this.$Elm.addClass( 'active' );
            }

            this.fireEvent( 'activate', [ this ] );

            return this;
        },

        /**
         * Close / Destroy the group and destroy all tasks in it
         */
        close : function()
        {
            var Parent = this.getParent();

            for ( var i in this.$tasks ) {
                this.$tasks[i].close();
            }

            this.$tasks = null;
            this.destroy();

            Parent.firstChild().show();
        },

        /**
         * Close the group but not the tasks
         * The Tasks would be insert to the parent of the group
         */
        dissolve : function()
        {
            var Parent = this.getTaskbar(),
                tasks  = this.getTasks();

            for ( var i = 0, len = tasks.length; i < len; i++ )
            {
                tasks[ i ].removeEvent( 'refresh', this.$onTaskRefresh );

                Parent.appendChild( tasks[ i ] );
            }

            this.$tasks = {};
            this.destroy();

            if ( this.isActive() ) {
                Parent.firstChild().show();
            }
        },

        /**
         * Return true if the group is active
         *
         * @return {Bool}
         */
        isActive : function()
        {
            if ( !this.$Elm ) {
                return false;
            }

            return this.$Elm.hasClass( 'active' );
        },

        /**
         * Add a Task to the group
         *
         * @param {QUI.controls.taskbar.Task} Task
         */
        appendChild : function(Task)
        {
            this.$tasks[ Task.getId() ] = Task;
            this.fireEvent( 'appendChildBegin', [ this, Task ] );

            Task.hide();

            this.$Menu.appendChild(
                new ContextmenuItem({
                    name   : Task.getId(),
                    text   : Task.getTitle(),
                    icon   : Task.getIcon(),
                    Task   : Task,
                    events : {
                        onClick : this.$onMenuClick
                    }
                })
            );

            Task.setParent( this );
            Task.addEvent( 'onRefresh', this.$onTaskRefresh );

            if ( this.count() == 1 || Task.isActive() )
            {
                this.refresh( Task );
            } else
            {
                this.refresh();
            }

            if ( Task.isActive() ) {
                this.click();
            }

            this.fireEvent( 'appendChild', [ this, Task ] );
        },

        /**
         * Return all tasks in the group
         *
         * @return {Array}
         */
        getTasks : function()
        {
            var tasks = [];

            for ( var i in this.$tasks ) {
                tasks.push( this.$tasks[i] );
            }

            return tasks;
        },

        /**
         * Return the first Task
         *
         * @return {QUI.controls.taskbar.Task|null}
         */
        firstTask : function()
        {
            for ( var i in this.$tasks ) {
                return this.$tasks[ i ];
            }

            return null;
        },

        /**
         * Return the tasks number in the group
         *
         * @return {Integer}
         */
        count : function()
        {
            var i;
            var c = 0;

            for ( i in this.$tasks ) {
                c++;
            }

            return c;
        },

        /**
         * Return the context menu
         *
         * @return {QUI.controls.contextmenu.Menu}
         */
        $getContextMenu : function()
        {
            if ( this.$ContextMenu ) {
                return this.$ContextMenu;
            }

            this.$ContextMenu = new ContextmenuMenu({
                name   : this.getId() +'-menu',
                type   : 'bottom',
                events :
                {
                    onBlur : function(Menu) {
                        Menu.hide();
                    }
                }
            });

            this.$ContextMenu.appendChild(
                new ContextmenuMenu({
                    text   : 'Gruppe auflösen',
                    events : {
                        onClick : this.dissolve
                    }
                })
            ).appendChild(
                new ContextmenuMenu({
                    text   : 'Gruppe und Tasks schließen',
                    events : {
                        onClick : this.close
                    }
                })
            );

            this.$ContextMenu.inject( document.body );
            this.$ContextMenu.hide();

            return this.$ContextMenu;
        },

        /**
         * event: on task refresh
         *
         * @param {QUI.controls.taskbar.Task} Task
         */
        $onTaskRefresh : function(Task)
        {
            var MenuItem = this.$Menu.getChildren( Task.getId() );

            if ( !MenuItem ) {
                return;
            }

            MenuItem.setAttribute( 'text', Task.getTitle() );
            MenuItem.setAttribute( 'icon', Task.getIcon() );

            if ( this.$Active.getId() == Task.getId() ) {
                this.refresh( this.$Active );
            }
        },

        /**
         * event: on task selection / menu click
         *
         * @param {QUI.controls.contextmenu.Item} Item
         * @param {DOMEvent} event - [optional]
         */
        $onMenuClick : function(Item, event)
        {
            this.refresh( Item.getAttribute( 'Task' ) );
            this.click();
        }
    });
});
