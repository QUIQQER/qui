/**
 * A task bar
 *
 * @module qui/controls/taskbar/Bar
 * @author www.pcsg.de (Henning Leutz)
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

define('qui/controls/taskbar/Bar', [

    'qui/Locale',

    'qui/controls/Control',
    'qui/controls/taskbar/Task',
    'qui/controls/taskbar/Group',
    'qui/controls/buttons/Button',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',

    'qui/controls/taskbar/locale/de',
    'qui/controls/taskbar/locale/en',

    'css!qui/controls/taskbar/Bar.css'

], function (QUILocale, Control, TaskbarTask, TaskbarGroup, Button, Contextmenu, ContextmenuItem) {
    "use strict";

    var lg = 'qui/controls/taskbar/Bar';

    /**
     * @class qui/controls/taskbar/Bar
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type   : 'qui/controls/taskbar/Bar',

        Binds: [
            '$onTaskRefresh',
            '$onTaskClick',
            '$onTaskDestroy',
            '$openContextMenu',
            '$onTaskContextMenu',
            'scrollToLeft',
            'scrollToRight'
        ],

        options: {
            width   : false,
            styles  : false,
            position: 'bottom' // bottom or top
        },

        initialize: function (options) {
            this.$Elm   = null;
            this.$tasks = [];

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

            this.parent(options);
        },

        /**
         * Return the save date, eq for the workspace
         *
         * @method qui/controls/taskbar/Bar#serialize
         * @return {Object}
         */
        serialize: function () {
            var tasks = [];

            for (var i = 0, len = this.$tasks.length; i < len; i++) {
                tasks.push(this.$tasks[i].serialize());
            }

            return {
                attributes: this.getAttributes(),
                type      : this.getType(),
                tasks     : tasks,
                active    : this.$Active.$Instance.getType()
            };
        },

        /**
         * Import the saved data
         *
         * @method qui/controls/taskbar/Bar#unserialize
         * @param {Object} data
         * @return {Object} this (qui/controls/taskbar/Bar)
         */
        unserialize: function (data) {
            this.setAttributes(data.attributes);

            if (!this.$Elm) {
                this.fireEvent('unserializeFinish', [this]);
                this.$serialize = data;
                return this;
            }

            var tasks = data.tasks;

            if (!tasks) {
                this.fireEvent('unserializeFinish', [this]);
                return this;
            }


            if (!tasks.length) {
                this.fireEvent('unserializeFinish', [this]);
                return this;
            }

            var self = this;
            var i, len, Task;

            var importInit = function (Task) {
                self.appendChild(Task);
                self.$unserializedTasks++;

                if (self.$unserializedTasks === tasks.length) {
                    self.fireEvent('unserializeFinish', [self]);
                }
            };

            for (i = 0, len = tasks.length; i < len; i++) {
                if (tasks[i].type === 'qui/controls/taskbar/Group') {
                    Task = new TaskbarGroup();
                } else {
                    Task = new TaskbarTask();
                }

                Task.addEvent('onInit', importInit);
                Task.unserialize(tasks[i]);
            }
        },

        /**
         * Create the DOMNode for the Bar
         *
         * @method qui/controls/taskbar/Bar#create
         * @return {HTMLElement}
         */
        create: function () {
            if (this.$Elm) {
                this.refresh();
                return this.$Elm;
            }

            this.$Elm = new Element('div', {
                'class'     : 'qui-taskbar qui-task-drop box',
                'data-quiid': this.getId(),
                html        : '<div class="qui-taskbar-container">' +
                    '<div class="qui-taskbar-container-tasks"></div>' +
                    '</div>',
                events      : {
                    contextmenu: this.$openContextMenu
                }
            });

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            if (this.getAttribute('position') === 'bottom') {
                this.$Elm.addClass('qui-taskbar-bottom');
            }

            if (this.getAttribute('position') === 'top') {
                this.$Elm.addClass('qui-taskbar-top');
            }

            this.$Container     = this.$Elm.getElement('.qui-taskbar-container');
            this.$TaskContainer = this.$Elm.getElement('.qui-taskbar-container-tasks');

            this.$ContainerScroll = new Fx.Scroll(this.$Container);

            this.$TaskContainer.setStyles({
                left    : 0,
                position: 'relative',
                top     : 0
            });

            this.$Left = new Button({
                name   : 'qui-taskbar-left',
                'class': 'icon-angle-left fa fa-angle-left',
                events : {
                    onClick: this.scrollToLeft
                },
                styles : {
                    width : 30,
                    height: 30
                }
            }).inject(this.$Elm, 'top');

            this.$Right = new Button({
                name   : 'qui-taskbar-left',
                'class': 'icon-angle-right fa fa-angle-right',
                events : {
                    onClick: this.scrollToRight
                },
                styles : {
                    width : 30,
                    height: 30
                }
            }).inject(this.$Elm);

            this.$TaskButton = new Button({
                name      : 'qui-taskbar-btn-' + this.getId(),
                'class'   : 'qui-taskbar-button',
                icon      : 'icon-chevron-up',
                menuCorner: this.getAttribute('position'),
                styles    : {
                    width : 30,
                    height: 30
                }
            }).inject(this.$Elm);


            // exist serialize data
            if (typeof this.$serialize !== 'undefined') {
                this.unserialize(this.$serialize);
            }


            return this.$Elm;
        },

        /**
         * Resize the elements
         */
        resize: function () {
            var maxWidth     = this.$Elm.getComputedSize().totalWidth,
                buttonsWidth = 94,

                tasksSize    = this.$Elm.getElements('.qui-task').map(function (Item) {
                    return Item.getComputedSize().totalWidth;
                }).sum();

            if (tasksSize > maxWidth) {
                this.$Container.setStyle('width', maxWidth - buttonsWidth);

                this.$Left.show();
                this.$Right.show();
                this.$TaskButton.show();

                this.$overflowed = true;

            } else {
                this.$Container.setStyle('width', maxWidth);

                this.$Left.hide();
                this.$Right.hide();
                this.$TaskButton.hide();

                this.$overflowed = false;
            }

            this.$TaskContainer.setStyle('width', tasksSize);
        },

        /**
         * refresh?
         *
         * @method qui/controls/taskbar/Bar#refresh
         */
        refresh: function () {

        },

        /**
         * Append a child to the Taskbar
         *
         * @method qui/controls/taskbar/Bar#appendChild
         * @param {Object} Task - qui/controls/taskbar/Task | qui/controls/taskbar/Group
         * @param {String} pos - Can be 'top', 'bottom', 'after', or 'before'
         */
        appendChild: function (Task, pos) {
            this.fireEvent('appendChildBegin', [this, Task]);

            var Parent = Task.getParent();

            if (Parent && Parent.getType() === 'qui/controls/taskbar/Bar') {
                Task.removeEvent('refresh', Parent.$onTaskRefresh);
                Task.removeEvent('click', Parent.$onTaskClick);
            }

            if (Parent && "dependChild" in Parent) {
                Parent.dependChild(Task.getInstance());
            }

            Task.setParent(this);

            Task.addEvents({
                onRefresh    : this.$onTaskRefresh,
                onClick      : this.$onTaskClick,
                onDestroy    : this.$onTaskDestroy,
                onContextMenu: this.$onTaskContextMenu
            });


            Task.normalize();

            if (typeof pos !== 'undefined') {
                Task.inject(this.$TaskContainer, pos);
            } else {
                Task.inject(this.$TaskContainer);
            }

            this.$tasks.push(Task);


            this.$TaskButton.appendChild(
                new ContextmenuItem({
                    icon  : Task.getIcon(),
                    text  : Task.getText(),
                    name  : Task.getId(),
                    Task  : Task,
                    events: {
                        onMouseDown: function (Item) {
                            Item.getAttribute('Task').click();
                        }
                    }
                })
            );

            this.fireEvent('appendChild', [this, Task]);
            this.resize();

            return this;
        },

        /**
         * Return the number of the children tasks
         *
         * @return {Number}
         */
        length: function () {
            return this.$tasks.length;
        },

        /**
         * Return the first task children
         *
         * @method qui/controls/taskbar/Bar#firstChild
         * @return {Object|Boolean} qui/controls/taskbar/Task | qui/controls/taskbar/Group | false
         */
        firstChild: function () {
            if (typeof this.$tasks[0] !== 'undefined') {
                return this.$tasks[0];
            }

            return false;
        },

        /**
         * Return the last task children
         *
         * @method qui/controls/taskbar/Bar#lastChild
         * @return {Object|Boolean} qui/controls/taskbar/Task | qui/controls/taskbar/Group | false
         */
        lastChild: function () {
            if (this.$tasks.length) {
                return this.$tasks[this.$tasks.length - 1];
            }

            return false;
        },

        /**
         * Remove a task from the bar
         *
         * @method qui/controls/taskbar/Bar#removeChild
         * @param {Object} Task - qui/controls/taskbar/Task
         */
        removeChild: function (Task) {
            if (this.$TaskButton) {
                this.$TaskButton.getContextMenu(function (Menu) {
                    var Child = Menu.getChildren(Task.getId());

                    if (Child) {
                        Child.destroy();
                    }
                });
            }

            Task.destroy();
        },

        /**
         * Return tasks list
         *
         * @return {Array}
         */
        getChildren: function () {
            return this.$tasks;
        },

        /**
         * Close / Remove all tasks from the bar
         *
         * @method qui/controls/taskbar/Bar#closeAllTasks
         * @return {Object} qui/controls/taskbar/Bar
         */
        closeAllTasks: function () {
            if (this.$TaskButton) {
                this.$TaskButton.getContextMenu(function (Menu) {
                    Menu.clear();
                });
            }

            var tasks = this.$tasks;

            for (var i = 0, len = tasks.length; i < len; i++) {
                tasks[i].destroy();
            }

            this.$tasks = [];

            return this;
        },

        /**
         * Close / Remove all other tasks from the bar
         *
         * @method qui/controls/taskbar/Bar#closeOtherTasks
         * @param {Object} Task - qui/controls/taskbar/Task
         * @return {Object} qui/controls/taskbar/Bar
         */
        closeOtherTasks: function (Task) {
            var tasks = this.$tasks,
                tid   = Task.getId();

            for (var i = 0, len = tasks.length; i < len; i++) {
                if (tid !== tasks[i].getId()) {
                    tasks[i].destroy();
                }
            }

            return this;
        },

        /**
         * Close / Remove the task from the bar
         *
         * @method qui/controls/taskbar/Bar#closeTask
         * @param {Object} Task - qui/controls/taskbar/Task
         * @return {Object} qui/controls/taskbar/Bar
         */
        closeTask: function (Task) {
            this.removeChild(Task);

            return this;
        },

        /**
         * highlight the toolbar
         *
         * @method qui/controls/taskbar/Bar#highlight
         * @return {Object} this (qui/controls/taskbar/Bar)
         */
        highlight: function () {
            this.$Elm.addClass('highlight');

            return this;
        },

        /**
         * normalize the toolbar
         *
         * @method qui/controls/taskbar/Bar#normalize
         * @return {Object} this (qui/controls/taskbar/Bar)
         */
        normalize: function () {
            this.$Elm.removeClass('highlight');

            return this;
        },

        /**
         * Scroll the taskbar to the left
         */
        scrollToLeft: function () {
            if (!this.$ContainerScroll) {
                return;
            }

            var scrollPos = this.$Container.getScroll(),
                size      = this.$Container.getSize(),
                pos       = scrollPos.x - (size.x * 0.8).round();

            this.$ContainerScroll.start(pos, 0);
        },

        /**
         * Scroll the taskbar to the right
         */
        scrollToRight: function () {
            if (!this.$ContainerScroll) {
                return;
            }

            var scrollPos = this.$Container.getScroll(),
                size      = this.$Container.getSize(),
                pos       = scrollPos.x + (size.x * 0.8).round();

            this.$ContainerScroll.start(pos, 0);
        },

        /**
         * Scroll the taskbar to the Task
         *
         * @param {Object} Task - qui/controls/taskbar/Task
         */
        scrollToTask: function (Task) {
            if (!this.$overflowed) {
                return;
            }

            if (this.$ContainerScroll) {
                this.$ContainerScroll.toElement(Task.getElm());
            }
        },

        /**
         * Refresh the context menu item of the task, if the task refresh
         *
         * @method qui/controls/taskbar/Bar#$onTaskRefresh
         * @param {Object} Task - qui/controls/taskbar/Task
         */
        $onTaskRefresh: function (Task) {
            if (!this.$TaskButton) {
                return;
            }

            this.$TaskButton.getContextMenu(function (Menu) {
                var Child = Menu.getChildren(Task.getId());

                if (!Child) {
                    return;
                }

                Child.setAttribute('icon', Task.getIcon());
                Child.setAttribute('text', Task.getText());
            });
        },

        /**
         * event task click
         *
         * @method qui/controls/taskbar/Bar#$onTaskClick
         * @param {Object} Task - qui/controls/taskbar/Task
         */
        $onTaskClick: function (Task) {
            if (this.$Active == Task) {
                return;
            }

            if (this.$Active) {
                this.$Active.normalize();
                this.$LastTask = this.$Active;
            }

            if (this.$overflowed) {
                this.scrollToTask(Task);
            }

            this.$Active = Task;
            this.$Active.activate();
        },

        /**
         * event task destroy
         *
         * @method qui/controls/taskbar/Bar#$onTaskDestroy
         * @param {Object} Task - qui/controls/taskbar/Task
         */
        $onTaskDestroy: function (Task) {
            // clear internal array
            var i, len, tasks = [];
            for (i = 0, len = this.$tasks.length; i < len; i++) {
                if (Task.getId() !== this.$tasks[i].getId()) {
                    tasks.push(this.$tasks[i]);
                }
            }

            this.$tasks = tasks;


            // destroy entry in context menu
            this.$TaskButton.getContextMenu(function (Menu) {
                var Child = Menu.getChildren(Task.getId());

                if (Child) {
                    Child.destroy();
                }
            });

            Task.removeEvents({
                onRefresh    : this.$onTaskRefresh,
                onClick      : this.$onTaskClick,
                onDestroy    : this.$onTaskDestroy,
                onContextMenu: this.$onTaskContextMenu
            });


            // open other task
            if (this.$LastTask &&
                this.$LastTask.getId() === Task.getId()) {
                this.$LastTask = null;
            }

            this.resize.delay(200, this);

            if (this.$Active !== null && this.$Active != Task) {
                return;
            }


            this.$Active = null;

            if (this.$LastTask &&
                this.$LastTask.getId() !== Task.getId()) {
                this.$LastTask.click();
                return;
            }

            var FirstTask = this.firstChild();

            if (FirstTask && Task.getId() === FirstTask.getId()) {
                if (typeof this.$tasks[1] !== 'undefined') {
                    return this.$tasks[1].click();
                }

                return;
            }

            if (FirstTask) {
                FirstTask.click();
            }
        },

        /**
         * Open the bar context menu
         *
         * @param {DOMEvent} event
         */
        $openContextMenu: function (event) {
            event.stop();

            var self = this;

            if (!this.$ContextMenu) {
                this.$ContextMenu = new Contextmenu({
                    name  : 'taskbar-contextmenu',
                    corner: this.getAttribute('position'),
                    events: {
                        onBlur: function (Menu) {
                            Menu.hide();

                            self.$tasks.each(function (Task) {
                                Task.deHighlight();
                            });
                        }
                    }
                });

                this.$ContextMenu.hide();
                this.$ContextMenu.inject(document.body);

                this.$ContextMenu.appendChild(
                    new ContextmenuItem({
                        name  : 'close-task',
                        text  : QUILocale.get(lg, 'task.close.this'),
                        icon  : 'icon-remove',
                        events: {
                            onClick: function (Item) {
                                var Task = Item.getAttribute('Task');

                                if (Task) {
                                    self.closeTask(Task);
                                }
                            }
                        }
                    })
                ).appendChild(
                    new ContextmenuItem({
                        name  : 'close-other-task',
                        text  : QUILocale.get(lg, 'task.close.other'),
                        icon  : 'icon-remove-sign',
                        events: {
                            onClick: function (Item) {
                                var Task = Item.getAttribute('Task');

                                if (Task) {
                                    self.closeOtherTasks(Task);
                                    Task.focus();
                                }
                            }
                        }
                    })
                ).appendChild(
                    new ContextmenuItem({
                        name  : 'close-all-task',
                        text  : QUILocale.get(lg, 'task.close.all'),
                        icon  : 'icon-remove-circle',
                        events: {
                            onClick: function () {
                                self.closeAllTasks();
                            }
                        }
                    })
                );
            }

            var Target = event.target;

            if (!Target.hasClass('qui-task')) {
                Target = Target.getParent('.qui-task');
            }

            if (!Target) {
                return;
            }

            var pos = Target.getPosition();

            this.$ContextMenu.getChildren('close-task').disable();
            this.$ContextMenu.getChildren('close-other-task').disable();

            this.$ContextMenu.setPosition(pos.x, pos.y);
            this.$ContextMenu.setTitle('---');
            this.$ContextMenu.show();
            this.$ContextMenu.focus();

            return this.$ContextMenu;
        },

        /**
         * event : on task contextmenu
         *
         * @param {Object} Task - qui/controls/taskbar/Task
         * @param {DOMEvent} event - DOMEvent
         */
        $onTaskContextMenu: function (Task, event) {
            this.$tasks.each(function (Task) {
                Task.deHighlight();
            });

            var Menu       = this.$openContextMenu(event),
                CloseTask  = Menu.getChildren('close-task'),
                CloseOther = Menu.getChildren('close-other-task');

            Menu.setTitle(Task.getText());

            CloseTask.setAttribute('Task', Task);
            CloseOther.setAttribute('Task', Task);

            CloseTask.enable();
            CloseOther.enable();

            Task.highlight();
        }
    });
});
