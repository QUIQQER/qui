
/**
 * A Tasks panel manager
 *
 * A Tasks panel can managed several Panels, Desktop's and other Controls.
 * In a Tasks panel you can insert several controls and you can switch between the Controls
 *
 * @module qui/controls/desktop/Tasks
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/controls/loader/Loader
 * @require qui/controls/taskbar/Bar
 * @require qui/controls/taskbar/Task
 * @require css!qui/controls/desktop/Tasks.css
 *
 * @event onResize [this]
 * @event onRefresh [this]
 */

define('qui/controls/desktop/Tasks', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/controls/loader/Loader',
    'qui/controls/taskbar/Bar',
    'qui/controls/taskbar/Task',

    'css!qui/controls/desktop/Tasks.css'

], function(QUI, Control, Loader, Taskbar, TaskbarTask)
{
    "use strict";

    /**
     * @class qui/controls/desktop/Tasks
     * @param {Object} options
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/desktop/Tasks',

        Binds : [
            '$activateTask',
            '$destroyTask',
            '$normalizeTask',
            '$onTaskbarAppendChild'
        ],

        options : {
            name  : 'taskpanel',
            icon  : 'icon-tasks',

            // header
            header : true,    // true to create a panel header when panel is created
            title  : 'Tasks'  // the title inserted into the panel's header
        },

        initialize : function(options)
        {
            this.parent( options );

            this.Loader = new Loader();

            this.$Elm      = null;
            this.$Taskbar  = null;
            this.$Active   = null;
            this.$LastTask = null;

            this.$__unserialize = false;
            this.$__serialize   = null;

            this.addEvents({
                onInject : function()
                {
                    (function()
                    {
                        // exist serialize data
                        if ( this.$__serialize )
                        {
                            this.unserialize( this.$__serialize );
                            this.$__serialize = null;
                        }

                        this.$__unserialize = false;

                    }).delay( 20, this );

                }.bind( this )
            });

            this.$tmpList = [];
        },

        /**
         * Is the Panel open?
         *
         * @method qui/controls/desktop/Tasks#isOpen
         * @return {Boolean}
         */
        isOpen : function()
        {
            return true;
        },

        /**
         * Return the data for the workspace
         *
         * @method qui/controls/desktop/Tasks#serialize
         * @return {Object}
         */
        serialize : function()
        {
            return {
                attributes : this.getAttributes(),
                type       : this.getType(),
                bar        : this.$Taskbar.serialize()
            };
        },

        /**
         * Import the saved data
         *
         * @method qui/controls/desktop/Tasks#unserialize
         * @param {Object} data
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        unserialize : function(data)
        {
            var self = this;

            this.$__unserialize = true;
            this.setAttributes( data.attributes );

            if ( !this.$Elm )
            {
                this.$__serialize   = data;
                this.$__unserialize = false;

                return this;
            }

            if ( data.bar )
            {
                this.$Taskbar.addEvent('onUnserializeFinish', function()
                {
                    if ( self.firstChild() ) {
                        self.firstChild().click();
                    }

                    self.$__unserialize = false;
                });

                this.$Taskbar.unserialize( data.bar );

                return this;
            }

            this.$__unserialize = false;

            return this;
        },

        /**
         * Refresh the panel
         *
         * @method qui/controls/desktop/Tasks#refresh
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        refresh : function()
        {
            this.fireEvent( 'refresh', [ this ] );

            return this;
        },

        /**
         * Resize the panel
         *
         * @method qui/controls/desktop/Tasks#resize
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        resize : function()
        {
            var height = this.getAttribute( 'height' ),
                width  = this.getAttribute( 'width' );

            if ( !height ) {
                height = '100%';
            }

            if ( !width ) {
                width = '100%';
            }

            this.$Elm.setStyles({
                height : height,
                width  : width
            });

            var contentSize  = this.getContentSize(),
                contentSizeY = contentSize.y;

            this.$Container.setStyles({
                height : contentSizeY
            });

            if ( this.$Active && this.$Active.getInstance()	)
            {
                this.$Active.getInstance().setAttributes({
                    height : contentSizeY
                });

                this.$Active.getInstance().resize();
            }

            this.$Taskbar.resize();

            this.fireEvent( 'resize', [ this ] );

            return this;
        },

        /**
         * Create DOMNode Element for the Tasks
         *
         * @method qui/controls/desktop/Tasks#create
         * @return {HTMLElement}
         */
        create : function()
        {
            if ( this.$Elm ) {
                return this.$Elm;
            }

            this.$Elm = new Element('div', {
                'data-quiid' : this.getId(),
                'class'      : 'qui-taskpanel qui-panel',

                styles : {
                    height : '100%'
                }
            });

            this.$Container = new Element(
                'div.qui-taskpanel-container'
            ).inject( this.$Elm );

            this.$Taskbar = new Taskbar({
                name   : 'qui-taskbar-'+ this.getId(),
                type   : 'bottom',
                styles : {
                    bottom   : 0,
                    left     : 0,
                    position : 'absolute'
                },
                events : {
                    onAppendChildBegin : this.$onTaskbarAppendChild
                }
            }).inject( this.$Elm );

            this.$Taskbar.setParent( this );

            // exist serialize data
            if ( this.$__serialize )
            {
                this.unserialize( this.$__serialize );
                this.$__serialize = null;
            }

            for ( var i = 0, len = this.$tmpList.length; i < len; i++ )
            {
                this.$Taskbar.appendChild(
                    this.instanceToTask( this.$tmpList[ i ] )
                );
            }

            return this.$Elm;
        },

        /**
         * Highlight the column
         *
         * @method qui/controls/desktop/Tasks#highlight
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        highlight : function()
        {
            if ( this.getElm() ) {
                this.getElm().addClass( 'qui-panel-highlight' );
            }

            return this;
        },

        /**
         * Dehighlight the column
         *
         * @method qui/controls/desktop/Tasks#normalize
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        normalize : function()
        {
            if ( this.getElm() ) {
                this.getElm().removeClass( 'qui-panel-highlight' );
            }

            return this;
        },

        /**
         * Insert a control in the Taskpanel
         *
         * @method qui/controls/desktop/Tasks#appendChild
         * @param {Object} Instance - (qui/controls/Control) A QUI Control
         */
        appendChild : function(Instance)
        {
            if ( !this.$Taskbar )
            {
                this.$tmpList.push( Instance );
                return this;
            }

            this.$Taskbar.appendChild(
                this.instanceToTask( Instance )
            );

            return this;
        },

        /**
         * Depends a panel from the column
         *
         * @method qui/controls/desktop/Tasks#dependChild
         * @param {Object} Panel - qui/controls/desktop/Panel
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        dependChild : function(Panel)
        {
            var Task = Panel.getAttribute( 'Task' );

            if ( !Task ) {
                return this;
            }

            Panel.getElm().setStyles({
                left     : null,
                position : null,
                top      : null,
                display  : null
            });

            Panel.setAttributes({
                collapsible : true,
                Task        : null
            });

            // task events
            Task.removeEvents( 'normalize' );
            Task.removeEvents( 'activate' );
            Task.removeEvents( 'destroy' );
            Task.removeEvents( 'refresh' );
            Task.removeEvents( 'destroy' );
            Task.removeEvents( 'click' );

            Task.setInstance( null );
            Task.destroy();

            this.getTaskbar().removeChild( Task );

            return this;
        },

        /**
         * Insert a control in the Taskpanel
         *
         * @method qui/controls/desktop/Tasks#appendTask
         * @param {Object} Task - (qui/controls/taskbar/Task | qui/controls/taskbar/Group) A QUI task
         */
        appendTask : function(Task)
        {
            this.$Taskbar.appendChild( Task );
            return this;
        },

        /**
         * Helper method
         *
         * Activasion Tab event
         * Shows the instance from the tab
         *
         * @method qui/controls/desktop/Tasks#$activateTask
         * @param {Object} Task - qui/controls/taskbar/Task | qui/controls/taskbar/Group
         */
        $activateTask : function(Task)
        {
            if ( typeof Task === 'undefined' ) {
                return;
            }

            if ( this.$Active && this.$Active.getType() != 'qui/controls/taskbar/Group' )
            {
                var _Tmp = this.$Active;
                this.$Active = Task;

                this.$normalizeTask( _Tmp );
            }

            this.$Active = Task;

            if ( !Task.getInstance() ) {
                return;
            }

            var Instance = Task.getInstance(),
                Elm      = Instance.getElm(),
                self     = this;

            Elm.setStyles({
                display : null,
                opacity : 0
            });

            moofx( Elm ).animate({
                left    : 0,
                opacity : 1
            }, {
                equation : 'ease-out',
                callback : function()
                {
                    self.resize();
                    Instance.fireEvent( 'show', [ Instance ] );
                }
            });
        },

        /**
         * Helper method
         *
         * Destroy Tab event
         * Hide the instance from the tab and destroy it
         *
         * @method qui/controls/desktop/Tasks#$destroyTask
         * @param {Object} Task - qui/controls/taskbar/Task
         */
        $destroyTask : function(Task)
        {
            if ( !Task.getInstance() ) {
                return;
            }

            var Instance = Task.getInstance(),
                Elm      = Instance.getElm();

            moofx( Elm ).animate({
                left    : (this.$Container.getSize().x + 10) * -1,
                opacity : 0
            }, {
                callback : function()
                {
                    (function()
                    {
                        Instance.destroy();
                    }).delay( 100 );
                }
            });
        },

        /**
         * Select the last task, or the last task, or the first task
         *
         * @param {Object} Task - qui/controls/Control
         */
        selectTask : function(Task)
        {
            var tid = false;

            if ( typeof Task !== 'undefined' ) {
                Task.getId();
            }

            if ( this.$LastTask && this.$LastTask.getId() != tid )
            {
                this.$LastTask.click();
                return;
            }

            var LastTask = this.lastChild();

            if ( !LastTask ) {
                return;
            }

            if ( LastTask.getInstance() && LastTask.getId() != tid )
            {
                LastTask.click();
                return;
            }

            var FirstTask = this.firstChild();

            if ( FirstTask.getInstance() && FirstTask.getId() != tid ) {
                FirstTask.click();
            }
        },

        /**
         * Helper method
         *
         * Activasion Tab event
         * Hide the instance from the tab
         *
         * @method qui/controls/desktop/Tasks#$normalizeTask
         * @param {Object} Task - qui/controls/taskbar/Task
         */
        $normalizeTask : function(Task)
        {
            if ( Task == this.$Active ) {
                return;
            }

            if ( !Task.getInstance() ) {
                return;
            }

            var Instance = Task.getInstance(),
                Elm      = Instance.getElm();


            moofx( Elm ).animate({
                left    : (this.$Container.getSize().x + 10) * -1,
                opacity : 0
            }, {
                equation : 'ease-out',
                callback : function(Elm)
                {
                    Elm.setStyle( 'display', 'none' );
                }.bind( this, Elm )
            });
        },

        /**
         * Return the first task children
         *
         * @method qui/controls/desktop/Tasks#firstChild
         * @return {Object|Boolean} qui/controls/taskbar/Task | qui/controls/taskbar/Group | false
         */
        firstChild : function()
        {
            return this.$Taskbar.firstChild();
        },

        /**
         * Return the last task children
         *
         * @method qui/controls/desktop/Tasks#lastChild
         * @return {Object|Boolean} qui/controls/taskbar/Task | qui/controls/taskbar/Group | false
         */
        lastChild : function()
        {
            return this.$Taskbar.lastChild();
        },

        /**
         * Return the taskbar object
         *
         * @method qui/controls/desktop/Tasks#getTaskbar
         * @return {Object|null} qui/controls/taskbar/Bar | null
         */
        getTaskbar : function()
        {
            return this.$Taskbar;
        },

        /**
         * Return the available content size
         *
         * @method qui/controls/desktop/Tasks#getContentSize
         * @return {Object} {x,y}
         */
        getContentSize : function()
        {
            if ( !this.getTaskbar() ) {
                return this.$Elm.getSize();
            }

            var taskbarSize = this.getTaskbar().getElm().getSize(),
                contentSize = this.$Elm.getSize();

            return {
                x : contentSize.x - taskbarSize.x,
                y : contentSize.y - taskbarSize.y
            };
        },

        /**
         * Enable the dragdrop -> do nothing, panel compatibility
         */
        enableDragDrop : function()
        {

        },

        /**
         * Enable the dragdrop -> do nothing, panel compatibility
         */
        disableDragDrop : function()
        {

        },

        /**
         * Open the Panel -> do nothing, panel compatibility
         *
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        open : function()
        {
            return this;
        },

        /**
         * Minimize -> do nothing, panel compatibility
         *
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        minimize : function()
        {
            return this;
        },

        /**
         * Create a Task for the Control
         *
         * @method qui/controls/desktop/Tasks#instanceToTask
         * @param {Object} Instance - (qui/controls/Control) Instance of a QUI control
         * @return {Object} qui/controls/tasksbar/Task
         */
        instanceToTask : function(Instance)
        {
            // create task
            var closeable = false,
                dragable  = false;

            if ( Instance.existAttribute( 'closeable' ) === false ||
                 Instance.existAttribute( 'closeable' ) &&
                 Instance.getAttribute( 'closeable' ) )
            {
                closeable = true;
            }

            if ( Instance.existAttribute( 'dragable' ) === false ||
                 Instance.existAttribute( 'dragable' ) &&
                 Instance.getAttribute( 'dragable' ) )
            {
                dragable = true;
            }

            var Task = Instance.getAttribute( 'Task' );

            if ( !Task )
            {
                Task = new TaskbarTask( Instance );
            } else
            {
                Task.setInstance( Instance );
            }

            Task.setAttributes({
                closeable : closeable,
                dragable  : dragable
            });


            return Task;
        },

        /**
         * event on taskbar append child or taskbar group
         *
         * @method qui/controls/desktop/Tasks#$onTaskbarAppendChild
         * @param {Object} Bar - qui/controls/taskbar/Bar | qui/controls/taskbar/Group
         * @param {Object} Task - qui/controls/taskbar/Task
         */
        $onTaskbarAppendChild : function(Bar, Task)
        {
            if ( Task.getType() === 'qui/controls/taskbar/Group' )
            {
                Task.addEvent( 'onAppendChild', this.$onTaskbarAppendChild );

                var tasks = Task.getTasks();

                for ( var i = 0, len = tasks.length; i < len; i++ ) {
                    this.$onTaskbarAppendChild( Bar, tasks[ i ] );
                }

                return;
            }

            var Instance   = Task.getInstance(),
                Taskbar    = Task.getTaskbar(),
                TaskParent = Task.getParent(),
                IParent    = false;

            if ( !Instance ) {
                return;
            }

            if ( Task.getTaskbar() ) {
                IParent = Task.getTaskbar().getParent();
            }


            // clear old tasks parent binds
            if ( IParent && IParent.getType() == 'qui/controls/desktop/Tasks') {
                IParent.$removeTask( Task );
            }

            Instance.setAttribute( 'height', this.$Container.getSize().y );
            Instance.setAttribute( 'collapsible', false );

            Instance.inject( this.$Container );
            Instance.setParent( this );

            Instance.getElm().setStyles({
                position : 'absolute',
                top      : 0,
                left     : (this.$Container.getSize().x + 10) * -1
            });

            // not the best solution
            Instance.__destroy = Instance.destroy;
            Instance.destroy   = this.$onInstanceDestroy.bind( this, Instance );

            // delete the own task destroy event
            // so the tasks panel can destroy the instance
            Task.removeEvent( 'onDestroy', Task.$onDestroy );

            if ( Taskbar )
            {
                Task.removeEvent( 'refresh', Taskbar.$onTaskRefresh );
                Task.removeEvent( 'destroy', Taskbar.$onTaskDestroy );
                Task.removeEvent( 'click', Taskbar.$onTaskClick );
            }

            // add the new events of the panel to the task
            Task.addEvents({
                onActivate : this.$activateTask,
                onDestroy  : this.$destroyTask
            });

            if ( this.$__unserialize === true ) {
                 return;
            }

            if ( !TaskParent ||
                 TaskParent && TaskParent.getType() !== 'qui/controls/taskbar/Group' )
            {
                (function()
                {
                    Task.click();
                }).delay( 100, [ this ] );
            }
        },

        /**
         * Remove a task from the tasks panel and remove all binded events
         *
         * @method qui/controls/desktop/Tasks#$removeTask
         * @param {Object} Task - qui/controls/taskbar/Task
         */
        $removeTask : function(Task)
        {
            Task.removeEvents({
                onActivate : this.$activateTask,
                onDestroy  : this.$destroyTask
            });

            this.getTaskbar().removeChild( Task );
        },

        /**
         * if the instance have been destroyed
         *
         * @method qui/controls/desktop/Tasks#$onInstanceDestroy
         */
        $onInstanceDestroy : function(Instance)
        {
            Instance.__destroy();

            var Task = Instance.getAttribute( 'Task' );

            if ( Task && Task.getElm() ) {
                Task.destroy();
            }
        }
    });
});
