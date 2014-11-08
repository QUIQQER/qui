
/**
 * A task bar
 *
 * @module qui/controls/taskbar/Bar
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require qui/controls/taskbar/Task
 * @require qui/controls/taskbar/Group
 * @require qui/controls/buttons/Button
 * @require qui/controls/contextmenu/Item
 * @require css!qui/controls/taskbar/Bar.css
 *
 * @event onAppendChild [
 *     {qui/controls/taskbar/Bar},
 *     {qui/controls/taskbar/Task}
 * ]
 * @event onAppendChildBegin [
 *     {qui/controls/taskbar/Bar},
 *     {qui/controls/taskbar/Task}
 * ]
 *
 * @event onUnserializeFinish [ {qui/controls/taskbar/Bar} ]
 */

define([

    'qui/controls/Control',
    'qui/controls/taskbar/Task',
    'qui/controls/taskbar/Group',
    'qui/controls/buttons/Button',
    'qui/controls/contextmenu/Item',

    'css!qui/controls/taskbar/Bar.css'

], function(Control, TaskbarTask, TaskbarGroup, Button, ContextmenuItem)
{
    "use strict";

    /**
     * @class qui/controls/taskbar/Bar
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/taskbar/Bar',

        Binds : [
            '$onTaskRefresh',
            '$onTaskClick',
            '$onTaskDestroy',
            '$openContextMenu',
            'scrollToLeft',
            'scrollToRight'
        ],

        options : {
            width    : false,
            styles   : false,
            position : 'bottom' // bottom or top
        },

        initialize : function(options)
        {
            this.$Elm    = null;
            this.$tasks  = [];

            this.$Active      = null;
            this.$LastTask    = null;
            this.$ContextMenu = null;

            this.$TaskButton    = null;
            this.$Left          = null;
            this.$Right         = null;
            this.$Container     = null;
            this.$TaskContainer = null;


            this.$unserializedTasks = 0;
            this.$overflowed        = false;

            this.parent( options );
        },

        /**
         * Return the save date, eq for the workspace
         *
         * @method qui/controls/taskbar/Bar#serialize
         * @return {Object}
         */
        serialize : function()
        {
            var tasks = [];

            for ( var i = 0, len = this.$tasks.length; i < len; i++ ) {
                tasks.push( this.$tasks[ i ].serialize() );
            }

            return {
                attributes : this.getAttributes(),
                type       : this.getType(),
                tasks      : tasks
            };
        },

        /**
         * Import the saved data
         *
         * @method qui/controls/taskbar/Bar#unserialize
         * @param {Object} data
         * @return {this}
         */
        unserialize : function(data)
        {
            this.setAttributes( data.attributes );

            if ( !this.$Elm )
            {
                this.fireEvent( 'unserializeFinish', [ this ] );
                this.$serialize = data;
                return this;
            }

            var tasks = data.tasks;

            if ( !tasks )
            {
                this.fireEvent( 'unserializeFinish', [ this ] );
                return this;
            }


            if ( !tasks.length )
            {
                this.fireEvent( 'unserializeFinish', [ this ] );
                return this;
            }

            var self = this;
            var i, len, Task;

            var importInit = function( Task )
            {
                self.appendChild( Task );
                self.$unserializedTasks++;

                if ( self.$unserializedTasks == tasks.length ) {
                    self.fireEvent( 'unserializeFinish', [ self ] );
                }
            };

            for ( i = 0, len = tasks.length; i < len; i++ )
            {
                if ( tasks[ i ].type === 'qui/controls/taskbar/Group' )
                {
                    Task = new TaskbarGroup();
                } else
                {
                    Task = new TaskbarTask();
                }

                Task.addEvent( 'onInit', importInit );
                Task.unserialize( tasks[i] );
            }
        },

        /**
         * Create the DOMNode for the Bar
         *
         * @method qui/controls/taskbar/Bar#create
         * @return {DOMNode}
         */
        create : function()
        {
            if ( this.$Elm )
            {
                this.refresh();
                return this.$Elm;
            }

            this.$Elm = new Element('div', {
                'class'      : 'qui-taskbar qui-task-drop box',
                'data-quiid' : this.getId(),
                html         : '<div class="qui-taskbar-container">'+
                                   '<div class="qui-taskbar-container-tasks"></div>'+
                               '</div>',
                events : {
                    contextmenu : this.$openContextMenu
                }
            });

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            if ( this.getAttribute( 'position' ) == 'bottom' ) {
                this.$Elm.addClass( 'qui-taskbar-bottom' );
            }

            if ( this.getAttribute( 'position' ) == 'top' ) {
                this.$Elm.addClass( 'qui-taskbar-top' );
            }

            this.$Container     = this.$Elm.getElement( '.qui-taskbar-container' );
            this.$TaskContainer = this.$Elm.getElement( '.qui-taskbar-container-tasks' );

            this.$ContainerScroll = new Fx.Scroll( this.$Container );

            this.$TaskContainer.setStyles({
                left     : 0,
                position : 'relative',
                top      : 0
            });

            this.$Left = new Button({
                name    : 'qui-taskbar-left',
                'class' : 'icon-angle-left fa fa-angle-left',
                events  : {
                    onClick : this.scrollToLeft
                },
                styles  : {
                    width  : 30,
                    height : 30
                }
            }).inject( this.$Elm, 'top' );

            this.$Right = new Button({
                name    : 'qui-taskbar-left',
                'class' : 'icon-angle-right fa fa-angle-right',
                events  : {
                    onClick : this.scrollToRight
                },
                styles  : {
                    width  : 30,
                    height : 30
                }
            }).inject( this.$Elm );

            this.$TaskButton = new Button({
                name    : 'qui-taskbar-btn-'+ this.getId(),
                'class' : 'qui-taskbar-button',
                icon    : 'icon-chevron-up',
                menuCorner : this.getAttribute('position'),
                styles  : {
                    width  : 30,
                    height : 30
                }
            }).inject( this.$Elm );


            // exist serialize data
            if ( typeof this.$serialize !== 'undefined' ) {
                this.unserialize( this.$serialize );
            }


            return this.$Elm;
        },

        /**
         * Resize the elements
         */
        resize : function()
        {
            var maxWidth     = this.$Elm.getComputedSize().totalWidth,
                buttonsWidth = 94,

                tasksSize = this.$Elm.getElements( '.qui-task' ).map(function(Item) {
                    return Item.getComputedSize().totalWidth;
                }).sum();

            if ( tasksSize > maxWidth )
            {
                this.$Container.setStyle( 'width', maxWidth - buttonsWidth );

                this.$Left.show();
                this.$Right.show();
                this.$TaskButton.show();

                this.$overflowed = true;

            } else
            {
                this.$Container.setStyle( 'width', maxWidth );

                this.$Left.hide();
                this.$Right.hide();
                this.$TaskButton.hide();

                this.$overflowed = false;
            }

            this.$TaskContainer.setStyle( 'width', tasksSize );
        },

        /**
         * refresh?
         *
         * @method qui/controls/taskbar/Bar#refresh
         */
        refresh : function()
        {

        },

        /**
         * Append a child to the Taskbar
         *
         * @method qui/controls/taskbar/Bar#appendChild
         * @param {qui/controls/taskbar/Task|qui/controls/taskbar/Group} Task
         */
        appendChild : function(Task)
        {
            this.fireEvent( 'appendChildBegin', [ this, Task ] );

            var Parent = Task.getParent();

            if ( Parent && Parent.getType() === 'qui/controls/taskbar/Bar' )
            {
                Task.removeEvent( 'refresh', Parent.$onTaskRefresh );
                Task.removeEvent( 'click', Parent.$onTaskClick );
            }

            Task.setParent( this );

            Task.addEvent( 'onRefresh', this.$onTaskRefresh );
            Task.addEvent( 'onClick', this.$onTaskClick );
            Task.addEvent( 'onDestroy', this.$onTaskDestroy );

            Task.normalize();
            Task.inject( this.$TaskContainer );

            this.$tasks.push( Task );


            this.$TaskButton.appendChild(
                new ContextmenuItem({
                    icon   : Task.getIcon(),
                    text   : Task.getTitle(),
                    name   : Task.getId(),
                    Task   : Task,
                    events :
                    {
                        onMouseDown : function(Item, event) {
                            Item.getAttribute( 'Task' ).click();
                        }
                    }
                })
            );

            this.fireEvent( 'appendChild', [ this, Task ] );
            this.resize();

            return this;
        },

        /**
         * Return the first task children
         *
         * @method qui/controls/taskbar/Bar#firstChild
         * @return {qui/controls/taskbar/Task|qui/controls/taskbar/Group|false}
         */
        firstChild : function()
        {
            if ( typeof this.$tasks[ 0 ] !== 'undefined' ) {
                return this.$tasks[ 0 ];
            }

            return false;
        },

        /**
         * Return the last task children
         *
         * @method qui/controls/taskbar/Bar#lastChild
         * @return {qui/controls/taskbar/Task|qui/controls/taskbar/Group|false}
         */
        lastChild : function()
        {
            if ( this.$tasks.length ) {
                return this.$tasks[ this.$tasks.length - 1  ];
            }

            return false;
        },

        /**
         * Remove a task from the bar
         *
         * @method qui/controls/taskbar/Bar#removeChild
         * @return {qui/controls/taskbar/Task}
         */
        removeChild : function(Task)
        {
            var Child = false;

            if ( this.$TaskButton )
            {
                this.$TaskButton.getContextMenu(function(Menu)
                {
                    var Child = Menu.getChildren( Task.getId() );

                    if ( Child ) {
                        Child.destroy();
                    }
                });
            }

            Task.destroy();
        },

        /**
         * highlight the toolbar
         *
         * @method qui/controls/taskbar/Bar#highlight
         * @return {this}
         */
        highlight : function()
        {
            this.$Elm.addClass( 'highlight' );

            return this;
        },

        /**
         * normalize the toolbar
         *
         * @method qui/controls/taskbar/Bar#normalize
         * @return {this}
         */
        normalize : function()
        {
            this.$Elm.removeClass( 'highlight' );

            return this;
        },

        /**
         * Scroll the taskbar to the left
         */
        scrollToLeft : function()
        {
            if ( this.$ContainerScroll ) {
                this.$ContainerScroll.toLeft();
            }
        },

        /**
         * Scroll the taskbar to the right
         */
        scrollToRight : function()
        {
            if ( this.$ContainerScroll ) {
                this.$ContainerScroll.toRight();
            }
        },

        /**
         * Scroll the taskbar to the Task
         *
         * @param {qui/controls/taskbar/Task} Task
         */
        scrollToTask : function(Task)
        {
            if ( !this.$overflowed ) {
                return;
            }

            if ( this.$ContainerScroll ) {
                this.$ContainerScroll.toElement( Task.getElm() );
            }
        },

        /**
         * Refresh the context menu item of the task, if the task refresh
         *
         * @method qui/controls/taskbar/Bar#$onTaskRefresh
         * @param {qui/controls/taskbar/Task}
         */
        $onTaskRefresh : function(Task)
        {
            if ( !this.$TaskButton ) {
                return;
            }

            this.$TaskButton.getContextMenu(function(Menu)
            {
                var Child = Menu.getChildren( Task.getId() );

                if ( !Child ) {
                    return;
                }

                Child.setAttribute( 'icon', Task.getIcon() );
                Child.setAttribute( 'text', Task.getTitle() );
            });
        },

        /**
         * event task click
         *
         * @method qui/controls/taskbar/Bar#$onTaskClick
         * @param {qui/controls/taskbar/Task} Task
         * @param {DOMEvent} event
         */
        $onTaskClick : function(Task, event)
        {
            if ( this.$Active == Task ) {
                return;
            }

            if ( this.$Active )
            {
                this.$Active.normalize();
                this.$LastTask = this.$Active;
            }

            if ( this.$overflowed ) {
                this.scrollToTask( Task );
            }

            this.$Active = Task;
            this.$Active.activate();
        },

        /**
         * event task destroy
         *
         * @method qui/controls/taskbar/Bar#$onTaskDestroy
         * @param {qui/controls/taskbar/Task} Task
         */
        $onTaskDestroy : function(Task)
        {
            // clear internal array
            var i, len, tasks = [];
            for ( i = 0, len = this.$tasks.length; i < len; i++ )
            {
                if ( Task.getId() !== this.$tasks[ i ].getId() ) {
                    tasks.push( this.$tasks[ i ] );
                }
            }

            this.$tasks = tasks;


            // destroy entry in context menu
            this.$TaskButton.getContextMenu(function(Menu)
            {
                var Child = Menu.getChildren( Task.getId() );

                if ( Child ) {
                    Child.destroy();
                }
            });


            // open other task
            if ( this.$LastTask &&
                 this.$LastTask.getId() == Task.getId() )
            {
                this.$LastTask = null;
            }

            this.resize.delay( 200, this );

            if ( this.$Active !== null && this.$Active != Task ) {
                return;
            }


            this.$Active = null;

            if ( this.$LastTask &&
                 this.$LastTask.getId() != Task.getId() )
            {
                this.$LastTask.click();
                return;
            }

            var FirstTask = this.firstChild();

            if ( FirstTask && Task.getId() == FirstTask.getId() )
            {
                if ( typeof this.$tasks[ 1 ] !== 'undefined' ) {
                    return this.$tasks[ 1 ].click();
                }

                return;
            }

            if ( FirstTask ) {
                FirstTask.click();
            }
        },

        /**
         * Open the bar context menu
         *
         * @param {DOMEvent} event
         */
        $openContextMenu : function(event)
        {

        }
    });
});
