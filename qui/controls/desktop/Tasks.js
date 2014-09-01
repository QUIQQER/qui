
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

define([

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
     *
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

            this.$Elm        = null;
            this.$Taskbar    = null;
            this.$TaskButton = null;
            this.$Active     = null;
            this.$LastTask   = null;

            this.$tmpList = [];
        },

        /**
         * Is the Panel open?
         *
         * @method qui/controls/desktop/Tasks#isOpen
         * @return {Bool}
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
         */
        unserialize : function(data)
        {
            this.setAttributes( data.attributes );

            if ( !this.$Elm )
            {
                this.$serialize = data;
                return this;
            }

            if ( data.bar ) {
                this.$Taskbar.unserialize( data.bar );
            }
        },

        /**
         * Refresh the panel
         *
         * @method qui/controls/desktop/Tasks#refresh
         * @return {this}
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
         * @return {this}
         */
        resize : function()
        {
            var height = this.getAttribute( 'height' );

            if ( !height ) {
                height = '100%';
            }

            this.$Elm.setStyles({
                height : height
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

            this.fireEvent( 'resize', [ this ] );

            return this;
        },

        /**
         * Create DOMNode Element for the Tasks
         *
         * @method qui/controls/desktop/Tasks#create
         * @return {DOMNode}
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
            if ( typeof this.$serialize !== 'undefined' ) {
                this.unserialize( this.$serialize );
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
         * @return {this}
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
         * @return {this}
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
         * @param {qui/controls/Control} Instance - A QUI Control
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
         * @param {qui/controls/desktop/Panel} Panel
         * @return {this} self
         */
        dependChild : function(Panel)
        {
            var self = this,
                Task = Panel.getAttribute( 'Task' );

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
            this.selectTask( Task );

            return this;
        },

        /**
         * Insert a control in the Taskpanel
         *
         * @method qui/controls/desktop/Tasks#appendTask
         * @param {qui/controls/taskbar/Task|qui/controls/taskbar/Group} Task - A QUI task
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
         * @param {qui/controls/taskbar/Task|qui/controls/taskbar/Group} Task
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

                if ( this.$LastTask != Task &&
                     this.$LastTask != _Tmp )
                {
                    this.$LastTask = _Tmp;
                }
            }

            this.$Active = Task;

            if ( !Task.getInstance() ) {
                return;
            }

            var Instance = Task.getInstance(),
                Elm      = Instance.getElm(),
                self     = this;

            Elm.setStyle( 'display', null );


            moofx( Elm ).animate({
                left : 0
            }, {
                callback : function(time)
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
         * @param {qui/controls/taskbar/Task} Task
         */
        $destroyTask : function(Task)
        {
            if ( !Task.getInstance() )
            {
                this.selectTask( Task );
                return;
            }

            var self     = this,
                Instance = Task.getInstance(),
                Elm      = Instance.getElm();

            moofx( Elm ).animate({
                left : (this.$Container.getSize().x + 10) * -1
            }, {
                callback : function(Elm)
                {
                    (function()
                    {
                        Instance.destroy();
                    }).delay( 100 );

                    self.selectTask( Task );
                }
            });
        },

        /**
         * Select the last task, or the last task, or the first task
         *
         * @param {qui/controls/Control} Task
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

            if ( FirstTask.getInstance() && FirstTask.getId() != tid )
            {
                FirstTask.click();
                return;
            }
        },

        /**
         * Helper method
         *
         * Activasion Tab event
         * Hide the instance from the tab
         *
         * @method qui/controls/desktop/Tasks#$normalizeTask
         * @param {qui/controls/taskbar/Task} Task
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
                left : (this.$Container.getSize().x + 10) * -1
            }, {
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
         * @return {qui/controls/taskbar/Task|qui/controls/taskbar/Group|false}
         */
        firstChild : function()
        {
            return this.$Taskbar.firstChild();
        },

        /**
         * Return the last task children
         *
         * @method qui/controls/desktop/Tasks#lastChild
         * @return {qui/controls/taskbar/Task|qui/controls/taskbar/Group|false}
         */
        lastChild : function()
        {
            return this.$Taskbar.lastChild();
        },

        /**
         * Return the taskbar object
         *
         * @method qui/controls/desktop/Tasks#getTaskbar
         * @return {qui/controls/taskbar/Bar|null}
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
             var taskbarSize = this.$Taskbar.getElm().getSize(),
                 contentSize = this.$Elm.getSize();

             return {
                 x : contentSize.x - taskbarSize.x,
                 y : contentSize.y - taskbarSize.y
             };
        },

        /**
         * Enable the dragdrop
         */
        enableDragDrop : function()
        {

        },

        /**
         * Enable the dragdrop
         */
        disableDragDrop : function()
        {

        },

        /**
         * Create a Task for the Control
         *
         * @method qui/controls/desktop/Tasks#instanceToTask
         * @param {qui/controls/Control} Instance - Instance of a QUI control
         * @return {qui/controls/tasksbar/Task}
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
         * @param {qui/controls/taskbar/Bar|qui/controls/taskbar/Group} Bar
         * @param {qui/controls/taskbar/Task} Task
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

            /*
            if ( IParent &&
                 IParent.getId() == this.getId() )
            {
                // if the panel is already in the panel
                // then we do nothing
                if ( this.$Container
                         .getElement( '[data-quiid="'+ Instance.getId() +'"]' ) )
                {
                    return;
                }
            }
            */

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
         * @param {qui/controls/taskbar/Task} Task
         */
        $removeTask : function(Task)
        {
            if ( this.$LastTask &&
                 this.$LastTask.getId() == Task.getId() )
            {
                this.$LastTask = null;
            }

            Task.removeEvents({
                onActivate : this.$activateTask,
                onDestroy  : this.$destroyTask
            });

            if ( Task.isActive() )
            {
                this.$Active = null;

                if ( this.$LastTask )
                {
                    this.$LastTask.click();
                } else
                {
                    this.lastChild().click();
                }
            }

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
