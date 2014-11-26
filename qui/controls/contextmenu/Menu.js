
/**
 * A Context Menu
 *
 * @module qui/controls/contextmenu/Menu
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require css!qui/controls/contextmenu/Menu.css
 */

define('qui/controls/contextmenu/Menu', [

    'qui/QUI',
    'qui/controls/Control',
    'qui/utils/Elements',

    'css!qui/controls/contextmenu/Menu.css'

], function(QUI, Control, QUIElementUtil)
{
    "use strict";

    /**
     * @class qui/controls/contextmenu/Menu
     *
     * @fires onShow [this]
     * @fires onHide [this]
     * @fires onBlur [this]
     * @fires onFocus [this]
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/contextmenu/Menu',

        Binds : [
            '$keyup'
        ],

        options : {
            styles : null,   // mootools css styles
            width  : 200,    // menü width
            title  : false,  // title of the menu (optional) : String
            shadow : true,   // menü with shadow (true) or not (false)
            corner : false,  // corner for the menü

            dragable : false
        },

        initialize : function(options)
        {
            this.parent( options );

            this.$items  = [];
            this.$Title  = null;
            this.$Active = null;
        },

        /**
         * Create the DOM Element
         *
         * @method qui/controls/contextmenu/Menu#create
         * @return {HTMLElement} main DOM-Node Element
         */
        create : function()
        {
            this.$Elm = new Element('div.qui-contextmenu', {
                html     : '<div class="qui-contextmenu-container"></div>',
                tabindex : -1,
                styles   : {
                    display : 'none',
                    outline : 'none',
                    '-moz-outline': 'none'
                },
                events :
                {
                    blur : function() {
                        this.fireEvent( 'blur', [ this ] );
                    }.bind( this ),

                    keyup : this.$keyup
                },
                'data-quiid' : this.getId()
            });

            this.$Container = this.$Elm.getElement( '.qui-contextmenu-container' );

            if ( this.getAttribute( 'width' ) ) {
                this.$Elm.setStyle( 'width', this.getAttribute( 'width' ) );
            }

            if ( this.getAttribute( 'styles' ) ) {
                this.$Elm.setStyles( this.getAttribute( 'styles' ) );
            }

            if ( this.getAttribute( 'title' ) ) {
                this.setTitle( this.getAttribute( 'title' ) );
            }

            if ( this.getAttribute( 'shadow' ) ) {
                this.$Container.addClass( 'qui-contextmenu-shadow' );
            }

            for ( var i = 0, len = this.$items.length; i < len; i++ ) {
                this.$items[ i ].inject( this.$Container );
            }

            return this.$Elm;
        },

        /**
         * Shows the Menu, clears the display style
         *
         * @method qui/controls/contextmenu/Menu#show
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        show : function()
        {
            if ( !this.$Elm ) {
                return this;
            }

            var Parent = this.$Elm.getParent(),
                Elm    = this.$Elm;

            if ( this.getAttribute( 'corner' ) )
            {
                Elm.removeClass( 'qui-context-corner-top' );
                Elm.removeClass( 'qui-context-corner-bottom' );
                Elm.removeClass( 'qui-context-corner-left' );
                Elm.removeClass( 'qui-context-corner-left' );
            }

            switch ( this.getAttribute( 'corner' ) )
            {
                case 'top':
                    Elm.addClass( 'qui-context-corner-top' );
                break;

                case 'bottom':
                    Elm.addClass( 'qui-context-corner-bottom' );
                break;

                case 'left':
                    Elm.addClass( 'qui-context-corner-left' );
                break;

                case 'right':
                    Elm.addClass( 'qui-context-corner-right' );
                break;
            }

            // zindex
            if ( this.getParent() && QUI.Controls.isControl( this.getParent() ) )
            {
                var ParentElm = this.getParent().getElm();

                if ( ParentElm )
                {
                    Elm.setStyle(
                        'zIndex',
                        QUIElementUtil.getComputedZIndex( ParentElm ) + 1
                    );
                }
            }

            Elm.setStyles({
                display : ''
            });

            var elm_size = Elm.getSize();

            this.$Container.setStyles({
                height : elm_size.y
            });


            // if parent is the body element
            // context menu don't get out of the body
            this.setAttribute( 'menuPosLeft', false );

            if ( Parent.nodeName === 'BODY' )
            {
                var elm_pos   = Elm.getPosition(),
                    body_size = Parent.getSize();

                if ( elm_pos.x + elm_size.x + 50 > body_size.x ) {
                    this.$Elm.setStyle( 'left', body_size.x - elm_size.x - 50 );
                }

                if ( elm_pos.y + elm_size.y + 50 > body_size.y ) {
                    this.$Elm.setStyle( 'top', body_size.y - elm_size.y - 50 );
                }
            }

            if ( this.$Active ) {
                this.$Active.setActive();
            }

            this.fireEvent( 'show', [ this ] );

            return this;
        },

        /**
         * Hide the Menu, set the display style to none
         *
         * @method qui/controls/contextmenu/Menu#hide
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        hide : function()
        {
            this.getElm().setStyles({
                display : 'none'
            });

            this.fireEvent( 'hide', [ this ] );

            return this;
        },

        /**
         * Set the focus to the Menu, the blur event would be triggerd
         *
         * @method qui/controls/contextmenu/Menu#focus
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        focus : function()
        {
            this.getElm().focus();
            this.fireEvent( 'focus', [ this ] );

            return this;
        },

        /**
         * Set the Position of the Menu
         *
         * if parent is the body element
         * context menu don't get out of the body
         *
         * @method qui/controls/contextmenu/Menu#setPosition
         * @param {Number} x - from the top (x axis)
         * @param {Number}y - from the left (y axis)
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        setPosition : function(x, y)
        {
            if ( this.$Elm )
            {
                this.$Elm.setStyles({
                    left : x,
                    top  : y
                });
            }

            return this;
        },

        /**
         * Set and create the menu title
         *
         * @method qui/controls/contextmenu/Menu#setTitle
         * @param {String} text - Title text
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        setTitle : function(text)
        {
            if ( this.$Container && !this.$Title )
            {
                this.$Title = new Element('div.qui-contextmenu-title');
                this.$Title.inject( this.$Container, 'top' );
            }

            if ( this.$Title ) {
                this.$Title.set( 'html', text );
            }

            this.setAttribute( 'title', text );

            return this;
        },

        /**
         * Get an Child Element
         *
         * @method qui/controls/contextmenu/Menu#getChildren
         * @param {String} name - [Name of the Children, optional, if no name given, returns all Children]
         * @return {Array|Boolean|Object} List of children | false | Child (qui/controls/contextmenu/Item)
         */
        getChildren : function(name)
        {
            if ( typeof name !== 'undefined' )
            {
                var i, len;
                var items = this.$items;

                for ( i = 0, len = items.length; i < len; i++ )
                {
                    if ( items[ i ].getAttribute( 'name' ) == name ) {
                        return items[ i ];
                    }
                }

                return false;
            }

            return this.$items;
        },

        /**
         * Return the first child Element
         *
         * @method qui/controls/contextmenu/Menu#firstChild
         * @return {Object|Boolean} Child (qui/controls/contextmenu/Item) | false
         */
        firstChild : function()
        {
            if ( this.$items[ 0 ] ) {
                return this.$items[ 0 ];
            }

            return false;
        },

        /**
         * Return the number of children
         *
         * @method qui/controls/contextmenu/Menu#count
         * @return {Number} count of children
         */
        count : function()
        {
            return this.$items.length;
        },

        /**
         * Add the Child to the Menü
         *
         * @method qui/controls/contextmenu/Menu#appendChild
         * @param {Object} Child - qui/controls/contextmenu/Item
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        appendChild : function(Child)
        {
            if ( !Child || typeof Child === 'undefined' ) {
                return this;
            }

            this.$items.push( Child );

            Child.setParent( this );

            if ( this.getAttribute( 'dragable' ) ) {
                Child.setAttribute( 'dragable', true );
            }

            // children events
            /*
            Child.addEvent( 'onClick', function(Item, event)
            {
                this.hide();

                document.body.focus();

                if ( typeof event !== 'undefined' ) {
                    event.stop();
                }
            }.bind( this ) );

            Child.addEvent( 'onActive', function(Item)
            {
                if ( this.$Active == Item ) {
                    return;
                }

                if ( this.$Active ) {
                    this.$Active.setNormal();
                }

                this.$Active = Item;
            }.bind( this ));
            */

            if ( this.$Container ) {
                Child.inject( this.$Container );
            }

            return this;
        },

        /**
         * Destroy all children items
         *
         * @method qui/controls/contextmenu/Menu#clearChildren
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        clearChildren : function()
        {
            for ( var i = 0, len = this.$items.length; i < len; i++ )
            {
                if ( this.$items[ i ] ) {
                    this.$items[ i ].destroy();
                }
            }

            this.$items = [];

            return this;
        },

        /**
         * clearChildren() alternative
         *
         * @method qui/controls/contextmenu/Menu#clear
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        clear : function()
        {
            return this.clearChildren();
        },

        /**
         * Return the active item
         *
         * @method qui/controls/contextmenu/Menu#getActive
         * @return {Object|Boolean} Active Child (qui/controls/contextmenu/Item) | false
         */
        getActive : function()
        {
            return this.$Active ? this.$Active : false;
        },

        /**
         * Return the next children / item of the item
         *
         * @method qui/controls/contextmenu/Menu#getNext
         * @param {Object} Item - qui/controls/contextmenu/Item
         * @return {Object|Boolean} qui/controls/contextmenu/Item | false
         */
        getNext : function(Item)
        {
            for ( var i = 0, len = this.$items.length; i < len; i++ )
            {
                if ( this.$items[ i ] != Item ) {
                    continue;
                }

                if ( typeof this.$items[ i + 1 ] !== 'undefined' ) {
                    return this.$items[ i + 1 ];
                }
            }

            return false;
        },

        /**
         * Return the previous children / item of the item
         *
         * @method qui/controls/contextmenu/Menu#getPrevious
         * @param {Object} Item - qui/controls/contextmenu/Item
         * @return {Object|Boolean} qui/controls/contextmenu/Item | false
         */
        getPrevious : function(Item)
        {
            var i = this.$items.length - 1;

            for ( ; i >= 0; i-- )
            {
                if ( i === 0 ) {
                    return false;
                }

                if ( this.$items[ i ] == Item ) {
                    return this.$items[ i - 1 ];
                }
            }

            return false;
        },

        /**
         * Deselect all children
         *
         * @method qui/controls/contextmenu/Menu#deselectItems
         * @return {Object} this (qui/controls/contextmenu/Menu)
         */
        deselectItems : function()
        {
            if ( this.$Active ) {
                this.$Active = null;
            }

            return this;
        },

        /**
         * Keyup event if the menu has the focus
         * so you can select with keyboard the contextmenu items
         *
         * @method qui/controls/contextmenu/Menu#$keyup
         */
        $keyup : function(event)
        {
            if ( event.key === 'down' )
            {
                this.down();
                return;
            }

            if ( event.key === 'up' )
            {
                this.up( event );
                return;
            }

            if ( event.key === 'enter' ) {
                this.select( event );
            }
        },

        /**
         * Simulate a arrow up, select the element up
         *
         * @method qui/controls/contextmenu/Menu#up
         */
        up : function()
        {
            if ( !this.$items.length ) {
                return;
            }

            var len = this.$items.length;

            // select last element if nothing is active
            if ( !this.$Active )
            {
                this.$items[ len - 1 ].setActive();
                return;
            }

            var Prev = this.getPrevious( this.$Active );

            this.$Active.setNormal();

            if ( !Prev )
            {
                this.$items[ len - 1 ].setActive();
                return;
            }

            Prev.setActive();
        },

        /**
         * Simulate a arrow down, select the element down
         *
         * @method qui/controls/contextmenu/Menu#down
         */
        down : function()
        {
            if ( !this.$items.length ) {
                return;
            }

            // select first element if nothing is selected
            if ( !this.$Active )
            {
                this.$items[ 0 ].setActive();
                return;
            }

            var Next = this.getNext( this.$Active );

            this.$Active.setNormal();

            if ( !Next )
            {
                this.$items[ 0 ].setActive();
                return;
            }

            Next.setActive();
        },

        /**
         * Makes a click on the active element
         *
         * @method qui/controls/contextmenu/Menu#select
         * @param {DOMEvent} [event] - optional
         */
        select : function(event)
        {
            // Last Element
            if ( this.$Active )
            {
                this.$Active.fireEvent( 'mouseDown', [ this.$Active, event ] );
                this.$Active.fireEvent( 'click', [ this.$Active, event ] );
            }
        }
    });
});
