/**
 * A Tasks panel manager
 *
 * A Tasks panel can managed several Panels, Desktop's and other Controls.
 * In a Tasks panel you can insert several controls and you can switch between the Controls
 *
 * @module qui/controls/desktop/Tasks
 * @author www.pcsg.de (Henning Leutz)
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

], function (QUI, Control, Loader, Taskbar, TaskbarTask) {
    "use strict";

    /**
     * @class qui/controls/desktop/Tasks
     * @param {Object} options
     * @memberof! <global>
     */
    return new Class({

        Extends: Control,
        Type   : 'qui/controls/desktop/Tasks',

        Binds: [
            '$activateTask',
            '$destroyTask',
            '$normalizeTask',
            '$onTaskbarAppendChild',
            'open',
            'minimize'
        ],

        options: {
            name: 'taskpanel',
            icon: 'fa fa-tasks',

            // header
            header                 : true,     // true to create a panel header when panel is created
            title                  : 'Tasks',  // the title inserted into the panel's header
            limit                  : false,
            'message.to.much.tasks': false
        },

        initialize: function (options) {
            var limit   = 50;
            var message = 'Unfortunately, too many tasks are open. Some tasks have been closed.';

            if (QUI.getAttribute('control-task-panel-limit')) {
                limit = QUI.getAttribute('control-task-panel-limit');
            }

            if (QUI.getAttribute('control-task-panel-limit-message')) {
                message = QUI.getAttribute('control-task-panel-limit-message');
            }

            options       = options || {};
            options.limit = options.limit || limit;

            options['message.to.much.tasks'] = options['message.to.much.tasks'] || message;

            this.parent(options);

            this.Loader = new Loader();

            this.$Elm      = null;
            this.$Taskbar  = null;
            this.$Active   = null;
            this.$LastTask = null;

            this.$__unserialize = false;
            this.$__serialize   = null;

            this.addEvents({
                onInject: function () {
                    //(function () {
                    //    // exist serialize data
                    //    if (this.$__serialize) {
                    //        this.unserialize(this.$__serialize);
                    //        this.$__serialize = null;
                    //    }
                    //
                    //    this.$__unserialize = false;
                    //
                    //}).delay(20, this);
                }.bind(this)
            });

            this.$tmpList = [];
        },

        /**
         * Is the Panel open?
         *
         * @method qui/controls/desktop/Tasks#isOpen
         * @return {Boolean}
         */
        isOpen: function () {
            return this.$Header.getStyle('display') === 'none';
        },

        /**
         * Return the data for the workspace
         *
         * @method qui/controls/desktop/Tasks#serialize
         * @return {Object}
         */
        serialize: function () {
            return {
                attributes: this.getAttributes(),
                type      : this.getType(),
                bar       : this.$Taskbar.serialize()
            };
        },

        /**
         * Import the saved data
         *
         * @method qui/controls/desktop/Tasks#unserialize
         * @param {Object} data
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        unserialize: function (data) {
            var self = this;

            this.$__unserialize = true;
            this.setAttributes(data.attributes);

            if (!this.$Elm) {
                this.$__serialize   = data;
                this.$__unserialize = false;

                return this;
            }

            if (data.bar) {
                this.$Taskbar.addEvent('onUnserializeFinish', function () {
                    if (self.firstChild()) {
                        self.firstChild().click();
                        self.$Active = self.firstChild();
                    }

                    self.$__unserialize = false;
                });

                this.$Taskbar.unserialize(data.bar);
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
        refresh: function () {
            this.fireEvent('refresh', [this]);

            return this;
        },

        /**
         * Resize the panel
         *
         * @method qui/controls/desktop/Tasks#resize
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        resize: function () {
            var height = this.getAttribute('height'),
                width  = this.getAttribute('width');

            if (!height) {
                height = '100%';
            }

            if (!width) {
                width = '100%';
            }

            this.$Elm.setStyles({
                height: height,
                width : width
            });

            var contentSize  = this.getContentSize(),
                contentSizeY = contentSize.y;

            this.$Container.setStyles({
                height: contentSizeY
            });

            if (this.$Active && this.$Active.getInstance()) {
                this.$Active.getInstance().setAttributes({
                    height: contentSizeY,
                    width : width
                });

                this.$Active.getInstance().resize();
            }

            this.$Taskbar.resize();

            this.fireEvent('resize', [this]);

            return this;
        },

        /**
         * Create DOMNode Element for the Tasks
         *
         * @method qui/controls/desktop/Tasks#create
         * @return {HTMLElement}
         */
        create: function () {
            if (this.$Elm) {
                return this.$Elm;
            }

            this.$Elm = new Element('div', {
                'data-quiid': this.getId(),
                'class'     : 'qui-taskpanel qui-panel qui-panel-drop',

                styles: {
                    height: '100%'
                }
            });

            this.$Container = new Element(
                'div.qui-taskpanel-container'
            ).inject(this.$Elm);

            this.$Header = new Element('div', {
                'class': 'qui-taskpanel-header',
                html   : '<div class="qui-taskpanel-header-text"></div>' +
                    '<div class="qui-taskpanel-header-icon">' +
                    '<span class="icon-chevron-down fa fa-chevron-down"></span>' +
                    '</div>',
                styles : {
                    display: 'none'
                },
                events : {
                    click: this.open
                }
            }).inject(this.$Elm);


            this.$Taskbar = new Taskbar({
                name  : 'qui-taskbar-' + this.getId(),
                type  : 'bottom',
                styles: {
                    bottom  : 0,
                    left    : 0,
                    position: 'absolute'
                },
                events: {
                    onAppendChildBegin: this.$onTaskbarAppendChild
                }
            }).inject(this.$Elm);

            this.$Taskbar.setParent(this);

            // exist serialize data
            if (this.$__serialize) {
                this.unserialize(this.$__serialize);
                this.$__serialize = null;
            }

            for (var i = 0, len = this.$tmpList.length; i < len; i++) {
                this.$Taskbar.appendChild(
                    this.instanceToTask(this.$tmpList[i])
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
        highlight: function () {
            if (this.getElm()) {
                this.getElm().addClass('qui-panel-highlight');
            }

            return this;
        },

        /**
         * Dehighlight the column
         *
         * @method qui/controls/desktop/Tasks#normalize
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        normalize: function () {
            if (this.getElm()) {
                this.getElm().removeClass('qui-panel-highlight');
            }

            return this;
        },

        /**
         * Insert a control in the Taskpanel
         *
         * @method qui/controls/desktop/Tasks#appendChild
         *
         * @param {Object} Instance - (qui/controls/Control) A QUI Control
         * @param {String} pos - Can be 'top', 'bottom', 'after', or 'before'
         */
        appendChild: function (Instance, pos) {
            if (!this.$Taskbar) {
                this.$tmpList.push(Instance);
                return this;
            }

            var self  = this,
                Task  = this.instanceToTask(Instance),
                limit = this.getAttribute('limit');

            if (this.$Taskbar && limit && limit <= this.$Taskbar.length()) {
                var First    = null,
                    children = this.$Taskbar.getChildren(),
                    iType    = Instance.getType();

                for (var i = 0, len = children.length; i < len; i++) {
                    if (children[i].getType() === iType) {
                        First = children[i];
                    }
                }

                if (First === null) {
                    First = children[0];
                }

                if (First) {
                    First.destroy();
                }

                QUI.getMessageHandler().then(function (MH) {
                    MH.addInformation(self.getAttribute('message.to.much.tasks'));
                });
            }

            this.$Taskbar.appendChild(Task, pos);

            return this;
        },

        /**
         * Depends a panel from the column
         *
         * @method qui/controls/desktop/Tasks#dependChild
         * @param {Object} Panel - qui/controls/desktop/Panel
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        dependChild: function (Panel) {
            var Task = Panel.getAttribute('Task');

            if (!Task) {
                return this;
            }

            Panel.getElm().setStyles({
                left    : null,
                position: null,
                top     : null,
                display : null
            });

            Panel.setAttributes({
                collapsible: true,
                Task       : null
            });

            // task events
            Task.removeEvents('normalize');
            Task.removeEvents('activate');
            Task.removeEvents('refresh');
            Task.removeEvents('click');

            Task.setInstance(null);
            Task.destroy();

            Task.removeEvents('destroy');

            this.getTaskbar().removeChild(Task);

            return this;
        },

        /**
         * Insert a control in the Taskpanel
         *
         * @method qui/controls/desktop/Tasks#appendTask
         * @param {Object} Task - (qui/controls/taskbar/Task | qui/controls/taskbar/Group) A QUI task
         */
        appendTask: function (Task) {
            this.$Taskbar.appendChild(Task);
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
        $activateTask: function (Task) {
            return new Promise(function (resolve) {
                if (typeof Task === 'undefined') {
                    return resolve();
                }

                var OldTask = false,
                    Prom    = Promise.resolve();

                if (this.$Active && this.$Active.getType() !== 'qui/controls/taskbar/Group') {
                    OldTask      = this.$Active;
                    this.$Active = Task;

                    Prom = this.$normalizeTask(OldTask);
                }

                Prom.then(function () {
                    this.$Active = Task;

                    if (!Task.getInstance()) {
                        return resolve();
                    }

                    var Instance = Task.getInstance(),
                        Elm      = Instance.getElm(),
                        self     = this;

                    Elm.setStyles({
                        display: null,
                        left   : -20,
                        opacity: 0
                    });

                    moofx(Elm).animate({
                        left   : 0,
                        opacity: 1
                    }, {
                        duration: 200,
                        callback: function () {
                            self.resize();

                            if ("focus" in Instance) {
                                Instance.focus();
                            }

                            Instance.fireEvent('show', [Instance]);

                            if (OldTask) {
                                self.$normalizeTask(OldTask).then(resolve);
                                return;
                            }

                            resolve();
                        }
                    });
                }.bind(this));
            }.bind(this));
        },

        /**
         * Helper method
         *
         * Destroy Tab event
         * Hide the instance from the tab and destroy it
         *
         * @method qui/controls/desktop/Tasks#$destroyTask
         * @param {Object} Task - qui/controls/taskbar/Task
         * @return {Promise}
         */
        $destroyTask: function (Task) {
            return new Promise(function (resolve) {
                if (!Task.getInstance()) {
                    return resolve();
                }

                var Instance = Task.getInstance(),
                    Elm      = Instance.getElm();

                moofx(Elm).animate({
                    left   : -50,
                    opacity: 0
                }, {
                    duration: 200,
                    callback: function () {
                        (function () {
                            Instance.destroy();
                            resolve();
                        }).delay(100);
                    }
                });
            }.bind(this));
        },

        /**
         * Select the last task, or the last task, or the first task
         *
         * @param {Object} Task - qui/controls/Control
         */
        selectTask: function (Task) {
            var tid = false;

            if (typeof Task !== 'undefined') {
                Task.getId();
            }

            if (this.$LastTask && this.$LastTask.getId() !== tid) {
                this.$LastTask.click();
                return;
            }

            var LastTask = this.lastChild();

            if (!LastTask) {
                return;
            }

            if (LastTask.getInstance() && LastTask.getId() !== tid) {
                LastTask.click();
                return;
            }

            var FirstTask = this.firstChild();

            if (FirstTask.getInstance() && FirstTask.getId() !== tid) {
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
        $normalizeTask: function (Task) {
            return new Promise(function (resolve) {
                if (Task === this.$Active) {
                    return resolve();
                }

                if (!Task.getInstance()) {
                    return resolve();
                }

                var Instance = Task.getInstance(),
                    Elm      = Instance.getElm();

                Task.normalize();

                moofx(Elm).animate({
                    left   : -50,
                    opacity: 0
                }, {
                    duration: 200,
                    callback: function (Elm) {
                        Elm.setStyle('display', 'none');
                        resolve();
                    }.bind(this, Elm)
                });

            }.bind(this));
        },

        /**
         * Return the first task children
         *
         * @method qui/controls/desktop/Tasks#firstChild
         * @return {Object|Boolean} qui/controls/taskbar/Task | qui/controls/taskbar/Group | false
         */
        firstChild: function () {
            return this.$Taskbar.firstChild();
        },

        /**
         * Return the last task children
         *
         * @method qui/controls/desktop/Tasks#lastChild
         * @return {Object|Boolean} qui/controls/taskbar/Task | qui/controls/taskbar/Group | false
         */
        lastChild: function () {
            return this.$Taskbar.lastChild();
        },

        /**
         * Return the taskbar object
         *
         * @method qui/controls/desktop/Tasks#getTaskbar
         * @return {Object|null} qui/controls/taskbar/Bar | null
         */
        getTaskbar: function () {
            return this.$Taskbar;
        },

        /**
         * Return the available content size
         *
         * @method qui/controls/desktop/Tasks#getContentSize
         * @return {Object} {x,y}
         */
        getContentSize: function () {
            if (!this.getTaskbar()) {
                return this.$Elm.getSize();
            }

            var taskbarSize = this.getTaskbar().getElm().getSize(),
                contentSize = this.$Elm.getSize();

            return {
                x: contentSize.x - taskbarSize.x,
                y: contentSize.y - taskbarSize.y
            };
        },

        /**
         * do nothing, panel compatibility
         */
        fix: function () {

        },

        /**
         * do nothing, panel compatibility
         */
        unfix: function () {

        },

        /**
         * Enable the collapsible -> do nothing, panel compatibility
         */
        enableCollapsible: function () {

        },

        /**
         * Disable the collapsible -> do nothing, panel compatibility
         */
        disableCollapsible: function () {

        },

        /**
         * Enable the dragdrop -> do nothing, panel compatibility
         */
        enableDragDrop: function () {

        },

        /**
         * Disable the dragdrop -> do nothing, panel compatibility
         */
        disableDragDrop: function () {

        },

        /**
         * Open the Panel -> do nothing, panel compatibility
         *
         * @param {Function} [callback] - optional, callback function
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        open: function (callback) {
            var self = this;

            this.$Container.setStyle('display', null);
            this.$Taskbar.getElm().setStyle('display', null);
            this.$Header.setStyle('display', 'none');


            moofx(this.$Elm).animate({
                height: this.getAttribute('height')
            }, {
                duration: 200,
                equation: 'ease-out',
                callback: function () {
                    self.fireEvent('open', [self]);
                    self.resize();

                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            });

            return this;
        },

        /**
         * Minimize -> do nothing, panel compatibility
         *
         * @param {Function} [callback] - optional, callback function
         * @return {Object} this (qui/controls/desktop/Tasks)
         */
        minimize: function (callback) {
            var self = this;

            this.$Container.setStyle('display', 'none');
            this.$Taskbar.getElm().setStyle('display', 'none');
            this.$Header.setStyle('display', null);

            var texts = [],
                Text  = this.$Header.getElement('.qui-taskpanel-header-text'),
                tasks = this.getTaskbar().getChildren();

            for (var i = 0, len = tasks.length; i < len; i++) {
                texts.push(tasks[i].getText());
            }

            if (texts.length) {
                Text.set('html', texts.join(', '));
            } else {
                Text.set('html', '&nbsp;');
            }


            moofx(this.$Elm).animate({
                height: this.$Header.getSize().y
            }, {
                duration: 200,
                equation: 'ease-out',
                callback: function () {
                    self.fireEvent('minimize', [self]);
                    self.resize();

                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            });

            return this;
        },

        /**
         * Create a Task for the Control
         *
         * @method qui/controls/desktop/Tasks#instanceToTask
         * @param {Object} Instance - (qui/controls/Control) Instance of a QUI control
         * @return {Object} qui/controls/tasksbar/Task
         */
        instanceToTask: function (Instance) {
            // create task
            var closeable = false,
                dragable  = false;

            if (Instance.existAttribute('closeable') === false ||
                Instance.existAttribute('closeable') &&
                Instance.getAttribute('closeable')) {
                closeable = true;
            }

            if (Instance.existAttribute('dragable') === false ||
                Instance.existAttribute('dragable') &&
                Instance.getAttribute('dragable')) {
                dragable = true;
            }

            var Task = Instance.getAttribute('Task');

            if (!Task) {
                Task = new TaskbarTask(Instance);
            } else {
                Task.setInstance(Instance);
            }

            Task.setAttributes({
                closeable: closeable,
                dragable : dragable
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
        $onTaskbarAppendChild: function (Bar, Task) {
            if (Task.getType() === 'qui/controls/taskbar/Group') {
                Task.addEvent('onAppendChild', this.$onTaskbarAppendChild);

                var tasks = Task.getTasks();

                for (var i = 0, len = tasks.length; i < len; i++) {
                    this.$onTaskbarAppendChild(Bar, tasks[i]);
                }

                return;
            }

            var Instance   = Task.getInstance(),
                Taskbar    = Task.getTaskbar(),
                TaskParent = Task.getParent(),
                IParent    = false;

            if (!Instance) {
                return;
            }

            if (Task.getTaskbar()) {
                IParent = Task.getTaskbar().getParent();
            }

            // clear old tasks parent binds
            if (IParent && IParent.getType() === 'qui/controls/desktop/Tasks') {
                IParent.$removeTask(Task);
            }

            Instance.setAttribute('height', this.$Container.getSize().y);
            Instance.setAttribute('collapsible', false);

            Instance.inject(this.$Container);
            Instance.setParent(this);

            Instance.getElm().setStyles({
                position: 'absolute',
                top     : 0,
                left    : (this.$Container.getSize().x + 10) * -1
            });

            // not the best solution
            Instance.tasksPanelDestroy = Instance.destroy;
            Instance.destroy           = this.$onInstanceDestroy.bind(this, Instance);

            // delete the own task destroy event
            // so the tasks panel can destroy the instance
            Task.removeEvent('onDestroy', Task.$onDestroy);

            if (Taskbar) {
                Task.removeEvent('refresh', Taskbar.$onTaskRefresh);
                Task.removeEvent('destroy', Taskbar.$onTaskDestroy);
                Task.removeEvent('click', Taskbar.$onTaskClick);
            }

            // add the new events of the panel to the task
            Task.addEvents({
                onActivate: this.$activateTask,
                onDestroy : this.$destroyTask
            });

            if (this.$__unserialize === true) {
                Task.getInstance().getElm().setStyle('display', 'none');
                return;
            }

            if (!TaskParent ||
                TaskParent && TaskParent.getType() !== 'qui/controls/taskbar/Group') {
                (function () {
                    Task.click();
                }).delay(100, [this]);
            }
        },

        /**
         * Remove a task from the tasks panel and remove all binded events
         *
         * @method qui/controls/desktop/Tasks#$removeTask
         * @param {Object} Task - qui/controls/taskbar/Task
         */
        $removeTask: function (Task) {
            Task.removeEvents({
                onActivate: this.$activateTask,
                onDestroy : this.$destroyTask
            });

            this.getTaskbar().removeChild(Task);
        },

        /**
         * if the instance have been destroyed
         *
         * @method qui/controls/desktop/Tasks#$onInstanceDestroy
         */
        $onInstanceDestroy: function (Instance) {
            Instance.tasksPanelDestroy();

            var Task = Instance.getAttribute('Task');

            if (Task && Task.getElm()) {
                Task.destroy();
            }
        }
    });
});
