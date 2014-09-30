
/**
 * A task for the taskbar
 *
 * @module qui/controls/taskbar/Task
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require qui/classes/utils/DragDrop
 * @require qui/utils/Controls
 * @require css!qui/controls/taskbar/Task.css
 *
 * @event onClick [this, DOMEvent]
 * @event onActivate [this]
 * @event onNormalize [this]
 * @event onRefresh [this]
 * @event onFocus [this, DOMEvent]
 * @event onBlur [this, DOMEvent]
 * @event onClose [this, DOMEvent]
 * @event onContextMenu [this, DOMEvent]
 * @event onHighlight [this]
 * @event onSelect [this]
 */

define([

    'qui/QUI',
    'qui/controls/Control',
    'qui/classes/utils/DragDrop',
    'qui/utils/Controls',

    'css!qui/controls/taskbar/Task.css'

], function(QUI, Control, QUIDragDrop, Utils)
{
    "use strict";

    /**
     * @class qui/controls/taskbar/Task
     *
     * @param {qui/controls/Control} Instance - Control for the task
     * @param {Object} options                - QDOM params
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/taskbar/Task',

        Binds : [
            'close',
            'click',
            '$onDestroy'
        ],

        options : {
            name      : 'qui-task',
            icon      : false,
            text      : '',
            cssClass  : '',
            closeable : true,
            dragable  : true
        },

        initialize : function(Instance, options)
        {
            this.$Instance = Instance || null;
            this.$Elm      = null;

            this.addEvents({
                onDestroy : this.$onDestroy
            });

            if ( typeof Instance === 'undefined' ) {
                return;
            }

            var self = this;

            Instance.setAttribute( 'Task', this );

            // Instance events
            Instance.addEvent('onRefresh', function(Instance) {
                self.refresh();
            });

            Instance.addEvent('onSetAttribute', function(Instance) {
                self.refresh();
            });


            Instance.addEvent('onDestroy', function(Instance)
            {
                self.$Instance = null;
                self.destroy();
            });

            this.parent( options );
        },

        /**
         * Return the save date, eq for the workspace
         *
         * @method qui/controls/taskbar/Task#serialize
         * @return {Object}
         */
        serialize : function()
        {
            return {
                attributes : this.getAttributes(),
                type       : this.getType(),
                instance   : this.getInstance() ? this.getInstance().serialize() : ''
            };
        },

        /**
         * Import the saved data
         *
         * @method qui/controls/taskbar/Task#unserialize
         * @param {Object} data
         * @return {this}
         */
        unserialize : function(data, onfinish)
        {
            this.setAttributes( data.attributes );

            var instance = data.instance;

            if ( !instance ) {
                return this;
            }

            require([ instance.type ], function(Modul)
            {
                var Instance = new Modul( data.instance );
                    Instance.unserialize( data.instance );

                this.initialize( Instance, data.attributes );

            }.bind( this ));
        },

        /**
         * Return the DOM-Node
         *
         * @method qui/controls/buttons/Button#getElm
         * @return {DOMNode} DOM-Node Element
         */
        create : function()
        {
            if ( this.$Elm ) {
                return this.$Elm;
            }

            var self = this;

            this.$Elm = new Element('div', {
                'class' : 'qui-task box',
                html    : '<span class="qui-task-icon"></span>' +
                          '<span class="qui-task-text"></span>',
                styles : {
                    outline: 'none'
                },
                tabindex : -1,
                events   :
                {
                    click : self.click,

                    focus : function(event) {
                        self.fireEvent( 'focus', [ self, event ] );
                    },

                    blur : function(event) {
                        self.fireEvent( 'blur', [ self, event ] );
                    },

                    contextmenu : function(event)
                    {
                        self.fireEvent( 'contextMenu', [ self, event ] );

                        event.stop();
                    }
                }
            });

            if ( this.getAttribute( 'dragable' ) )
            {
                this.$_enter = null;

                var DragDropParent = null;

                new QUIDragDrop(this.$Elm, {
                    dropables : '.qui-task-drop',
                    events    :
                    {
                        onStart : function(Dragable, Element, event) {
                            self.fireEvent( 'dragDropStart', [ self, Element, event ] );
                        },

                        onComplete : function() {
                            self.fireEvent( 'dragDropComplete', [ self ] );
                        },

                        onDrag : function(Dragable, Element, event)
                        {
                            self.fireEvent( 'drag', [ self, event ] );

                            if ( DragDropParent ) {
                                DragDropParent.fireEvent( 'dragDropDrag', [ self, event ] );
                            }
                        },

                        onEnter : function(Dragable, Element, Dropable)
                        {
                            var quiid = Dropable.get( 'data-quiid' );

                            if ( !quiid ) {
                                return;
                            }

                            DragDropParent = QUI.Controls.getById( quiid );

                            if ( !DragDropParent ) {
                                return;
                            }

                            if ( DragDropParent ) {
                                DragDropParent.fireEvent( 'dragDropEnter', [ self, Element ] );
                            }
                        },

                        onLeave : function(Dragable, Element, Dropable)
                        {
                            if ( DragDropParent )
                            {
                                DragDropParent.fireEvent( 'dragDropLeave', [ self, Element ] );
                                DragDropParent = null;
                            }
                        },

                        onDrop : function(Dragable, Element, Dropable, event)
                        {
                            if ( !Dropable ) {
                                return;
                            }

                            if ( DragDropParent ) {
                                DragDropParent.fireEvent( 'dragDropDrop', [ self, Element, Dropable, event ] );
                            }
                        }
                    }
                });
            }


            if ( this.getAttribute( 'cssClass' ) ) {
                this.$Elm.addClass( this.getAttribute( 'cssClass' ) );
            }

            if ( this.getAttribute('closeable') )
            {
                new Element('div', {
                    'class' : 'qui-task-close',
                    'html'  : '<span class="icon-remove"></span>',
                    events  : {
                        click : this.close
                    }
                }).inject( this.$Elm );
            }

            // exist serialize data?
            if ( typeof this.$serialize !== 'undefined' ) {
                this.unserialize( this.$serialize );
            }

            this.refresh();

            return this.$Elm;
        },

        /**
         * Refresh the task display
         *
         * @method qui/controls/taskbar/Task#refresh
         */
        refresh : function()
        {
            if ( !this.$Elm )
            {
                this.fireEvent( 'refresh', [ this ] );
                return;
            }

            var Icon = this.$Elm.getElement( '.qui-task-icon' ),
                Text = this.$Elm.getElement( '.qui-task-text' );

            if ( this.getIcon() )
            {
                var icon = this.getIcon();

                Icon.className = 'qui-task-icon';
                Icon.setStyle( 'background-image', null );

                if ( Utils.isFontAwesomeClass( icon ) )
                {
                    Icon.addClass( icon );
                } else
                {
                    Icon.setStyle( 'background-image', 'url('+ icon +')' );
                }

            }

            if ( this.getTitle() )
            {
                var title = this.getTitle();
                    title = title.substring( 0, 19 );

                if ( title.length > 19 ) {
                    title = title +'...';
                }

                Text.set( 'html', title );
            }

            this.fireEvent( 'refresh', [ this ] );
        },

        /**
         * Return the instance icon
         *
         * @method qui/controls/taskbar/Task#refresh
         * @return {String|false}
         */
        getIcon : function()
        {
            if ( !this.getInstance() ) {
                return '';
            }

            return this.getInstance().getAttribute( 'icon' );
        },

        /**
         * Return the instance title
         *
         * @method qui/controls/taskbar/Task#getTitle
         * @return {String|false}
         */
        getTitle : function()
        {
            if ( !this.getInstance() ) {
                return '';
            }

            return this.getInstance().getAttribute( 'title' );
        },

        /**
         * Return the binded instance to the task
         *
         * @method qui/controls/taskbar/Task#getInstance
         * @return {qui/controls/Control}
         */
        getInstance : function()
        {
            return this.$Instance;
        },

        /**
         * Set / Bind an instance to the task
         *
         * @method qui/controls/taskbar/Task#setInstance
         * @param {qui/controls/Control} Instance
         */
        setInstance : function(Instance)
        {
            this.$Instance = Instance;
        },

        /**
         * Return the Taskbar object
         *
         * @method qui/controls/taskbar/Task#getTaskbar
         * @return {qui/controls/taskbar/Taskbar}
         */
        getTaskbar : function()
        {
            var Taskbar = this.getParent();

            if ( typeOf( Taskbar ) == "qui/controls/taskbar/Group" ) {
                Taskbar = Taskbar.getParent();
            }

            return Taskbar;
        },

        /**
         * Set the Tab active
         *
         * @method qui/controls/taskbar/Task#activate
         * @return {this}
         */
        activate : function()
        {
            if ( this.isActive() || !this.$Elm ) {
                return this;
            }

            this.$Elm.addClass( 'active' );
            this.fireEvent( 'activate', [ this ] );

            return this;
        },

        /**
         * Normalize the tab
         *
         * @method qui/controls/taskbar/Task#normalize
         * @return {this}
         */
        normalize : function()
        {
            if ( this.$Elm )
            {
                this.$Elm.removeClass( 'active' );
                this.$Elm.removeClass( 'highlight' );
                this.$Elm.removeClass( 'select' );

                this.$Elm.setStyle( 'display', null );
            }

            this.fireEvent( 'normalize', [ this ] );

            return this;
        },

        /**
         * Hide the task tab
         *
         * @method qui/controls/taskbar/Task#hide
         * @return {this}
         */
        hide : function()
        {
            if ( this.$Elm ) {
                this.$Elm.setStyle( 'display', 'none' );
            }

            return this;
        },

        /**
         * Return true if the Task is active
         *
         * @method qui/controls/taskbar/Task#isActive
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
         * Trigger the click event
         *
         * @method qui/controls/taskbar/Task#click
         * @return {this}
         */
        click : function(event)
        {
            this.fireEvent( 'click', [ this, event ] );

            if ( !this.isActive() ) {
                this.activate();
            }

            return this;
        },

        /**
         * Trigger the close event
         *
         * @method qui/controls/taskbar/Task#close
         * @return {this}
         */
        close : function(event)
        {
            this.fireEvent( 'close', [ this, event ] );
            this.destroy();

            return this;
        },

        /**
         * Set the focus to the task DOMNode element
         *
         * @method qui/controls/taskbar/Task#focus
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
         * Highlight the Task
         *
         * @method qui/controls/taskbar/Task#highlight
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
         * Select the Task
         *
         * @method qui/controls/taskbar/Task#select
         * @return {this}
         */
        select : function()
        {
            if ( this.$Elm ) {
                this.$Elm.addClass( 'select' );
            }

            this.fireEvent( 'select', [ this ] );

            return this;
        },

        /**
         * Is the Task selected?
         *
         * @method qui/controls/taskbar/Task#isSelected
         * @return {Bool}
         */
        isSelected : function()
        {
            if ( this.$Elm ) {
                return this.$Elm.hasClass( 'select' );
            }

            return false;
        },

        /**
         * Unselect the Task
         *
         * @method qui/controls/taskbar/Task#unselect
         * @return {this}
         */
        unselect : function()
        {
            if ( this.$Elm ) {
                this.$Elm.removeClass( 'select' );
            }

            this.fireEvent( 'unselect', [ this ] );

            return this;
        },

        /**
         * on destroy task event
         *
         * @method qui/controls/taskbar/Task#$onDestroy
         */
        $onDestroy : function()
        {
            if ( this.getInstance() ) {
                this.getInstance().destroy();
            }

            this.$Instance = null;
        }
    });
});
