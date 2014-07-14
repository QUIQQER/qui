/**
 * A task bar
 *
 * @author www.pcsg.de (Henning Leutz)
 *
 * @module qui/controls/taskbar/Bar
 * @package com.pcsg.qui.js.controls.taskbar
 *
 * @event onAppendChild [
 *      {qui/controls/taskbar/Bar},
 *      {qui/controls/taskbar/Task}
 * ]
 * @event onAppendChildBegin [
 *      {qui/controls/taskbar/Bar},
 *      {qui/controls/taskbar/Task}
 * ]
 */

define('qui/controls/taskbar/Bar', [

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
            '$onTaskDestroy',
            '$onTaskClick'
        ],

        options : {
            width    : false,
            styles   : false,
            position : 'bottom' // bottom or top
        },

        initialize : function(options)
        {
            this.$Elm        = null;
            this.$TaskButton = null;
            this.$tasks      = [];
            this.$Active     = null;

            this.parent( options );
        },

        /**
         * Return the save date, eq for the workspace
         *
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
                this.$serialize = data;
                return this;
            }

            var tasks = data.tasks;

            if ( !tasks ) {
                return this;
            }

            var self = this;
            var i, len, Task;

            var importInit = function( Task ) {
                self.appendChild( Task );
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

                Task.addEvent('onInit', importInit);
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
                'class'      : 'qui-taskbar box',
                'data-quiid' : this.getId()
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

            this.$TaskButton.disable();


            // exist serialize data
            if ( typeof this.$serialize !== 'undefined' ) {
                this.unserialize( this.$serialize );
            }


            return this.$Elm;
        },

        /**
         * refresh?
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

            if ( Parent &&
                    Parent.getType() === 'qui/controls/taskbar/Bar' )
            {
                Task.removeEvent( 'refresh', Parent.$onTaskRefresh );
                Task.removeEvent( 'destroy', Parent.$onTaskDestroy );
                Task.removeEvent( 'click', Parent.$onTaskClick );
            }

            Task.setParent( this );

            Task.addEvent( 'onRefresh', this.$onTaskRefresh );
            Task.addEvent( 'onDestroy', this.$onTaskDestroy );
            Task.addEvent( 'onClick', this.$onTaskClick );

            Task.normalize();
            Task.inject( this.$Elm );

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

            this.$TaskButton.enable();

            this.fireEvent( 'appendChild', [ this, Task ] );

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
            if ( this.$tasks[ 0 ] ) {
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

            Task.removeEvent( 'refresh', this.$onTaskRefresh );
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
         * Refresh the context menu if the task would be destroyed
         *
         * @method qui/controls/taskbar/Bar#$onTaskDestroy
         * @param {qui/controls/taskbar/Task} Task
         */
        $onTaskDestroy : function(Task)
        {
            this.removeChild( Task );
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

            if ( this.$Active ) {
                this.$Active.normalize();
            }

            this.$Active = Task;
            this.$Active.activate();
        }
    });
});