
/**
 * QUI Control - Select Box DropDown
 *
 * @module qui/controls/buttons/Select
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/Control
 * @require qui/utils/Controls
 * @require qui/controls/contextmenu/Menu
 * @require qui/controls/contextmenu/Item
 * @require qui/utils/Element
 * @require css!qui/controls/buttons/Select.css
 *
 * @event onChange [value, this]
 * @event onClick [this, event]
 */

define('qui/controls/buttons/Select', [

    'qui/controls/Control',
    'qui/utils/Controls',
    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item',
    'qui/utils/Elements',

    'css!qui/controls/buttons/Select.css'

], function(Control, Utils, QUIMenu, QUIMenuItem, QUIElementUtils)
{
    "use strict";

    document.id( document.body ).set( 'tabindex', -1 );

    /**
     * @class qui/controls/buttons/Select
     *
     * @param {Object} options
     * @memberof! <global>
     */
    return new Class({

        Extends : Control,
        Type    : 'qui/controls/buttons/Select',

        Binds : [
            'open',
            'set',
            '$set',
            '$onDestroy',
            '$onBlur',
            '$onKeyUp'
        ],

        options : {
            name    : 'select-box',
            'style' : {},      // mootools css style attributes
            'class' : false,   // extra CSS Class
            menuWidth : 200,
            menuMaxHeight : 300
        },

        params : {},

        initialize : function(options)
        {
            this.parent(options);

            this.$Menu = new QUIMenu({
                width     : this.getAttribute('menuWidth'),
                maxHeight : this.getAttribute('menuMaxHeight')
            });

            this.$Elm      = null;
            this.$value    = null;
            this.$disabled = false;

            this.addEvent('onDestroy', this.$onDestroy);
        },

        /**
         * Create the DOMNode Element
         *
         * @method qui/controls/buttons/Select#create
         * @return {HTMLElement}
         */
        create : function()
        {
            var self = this;

            this.$Elm = new Element('div.qui-select', {
                html : '<div class="icon"></div>' +
                       '<div class="text"></div>' +
                       '<div class="drop-icon"></div>',
                tabindex : -1,
                styles   : {
                    outline : 0,
                    cursor  : 'pointer'
                },

                'data-quiid' : this.getId()
            });

            // ie8 / 9 fix
            this.$Elm.getElements('div').addEvents({
                click : function() {
                    self.$Elm.focus();
                }
            });

            if (this.getAttribute('styles')) {
                this.$Elm.setStyles(this.getAttribute('styles'));
            }

            if (this.getAttribute('class')) {
                this.$Elm.addClass(this.getAttribute('class'));
            }

            this.$Elm.addEvents({
                focus : this.open,
                blur  : this.$onBlur,
                keyup : this.$onKeyUp
            });

            this.$Menu.inject(document.body);
            this.$Menu.hide();

            this.$Menu.getElm().addClass('qui-dropdown');
            this.$Menu.getElm().addEvent('mouseleave', function()
            {
                var Option = self.$Menu.getChildren(
                    self.getAttribute('name') + self.getValue()
                );

                if (Option) {
                    Option.setActive();
                }
            });

            if (this.$Elm.getStyle('width'))
            {
                var width = this.$Elm.getStyle('width').toInt();

                this.$Elm.getElement('.text').setStyles({
                    width    : width - 50,
                    overflow : 'hidden'
                });

            } else
            {
                (function()
                {
                    var width = self.$Elm.getStyle('width').toInt();

                    self.$Elm.getElement('.text').setStyles({
                        width    : width - 50,
                        overflow : 'hidden'
                    });
                }).delay(300);
            }

            return this.$Elm;
        },

        /**
         * Set the value and select the option
         *
         * @method qui/controls/buttons/Select#setValue
         * @param {String} value
         * @return {Object} this (qui/controls/buttons/Select)
         */
        setValue : function(value)
        {
            var i, len;
            var children = this.$Menu.getChildren();

            for (i = 0, len = children.length; i < len; i++)
            {
                if (children[i].getAttribute('value') == value)
                {
                    this.$set(children[i]);
                    return this;
                }
            }

            return this;
        },

        /**
         * Return the current value of the select box
         *
         * @method qui/controls/buttons/Select#getValue
         * @return {String|Boolean}
         */
        getValue : function()
        {
            return this.$value;
        },

        /**
         * Add a option to the select box
         *
         * @method qui/controls/buttons/Select#appendChild
         *
         * @param {String} text - Text of the child
         * @param {String} value - Value of the child
         * @param {String} [icon] - optional
         * @return {Object} this (qui/controls/buttons/Select)
         */
        appendChild : function(text, value, icon)
        {
            this.$Menu.appendChild(
                new QUIMenuItem({
                    name   : this.getAttribute('name') + value,
                    text   : text,
                    value  : value,
                    icon   : icon || false,
                    events : {
                        onMouseDown : this.$set
                    }
                })
            );

            return this;
        },

        /**
         * Return the first option child
         *
         * @method qui/controls/buttons/Select#firstChild
         * @return {Object|Boolean} qui/controls/contextmenu/Item | false
         */
        firstChild : function()
        {
            if ( !this.$Menu ) {
                return false;
            }

            return this.$Menu.firstChild();
        },

        /**
         * Remove all children
         *
         * @method qui/controls/buttons/Select#clear
         */
        clear : function()
        {
            this.$value = '';
            this.$Menu.clearChildren();

            if (this.$Elm.getElement('.text')) {
                this.$Elm.getElement('.text').set('html', '');
            }

            if (this.$Elm.getElement('.icon')) {
                this.$Elm.getElement('.icon').setStyle('background', null);
            }
        },

        /**
         * Opens the select box
         *
         * @method qui/controls/buttons/Select#open
         * @return {Object} this (qui/controls/buttons/Select)
         */
        open : function()
        {
            if (this.isDisabled()) {
                return this;
            }

            if (document.activeElement != this.getElm())
            {
                // because onclick and mouseup makes a focus on body
                (function() {
                    this.getElm().focus();
                }).delay(100, this);

                return this;
            }

            var Elm     = this.getElm(),
                MenuElm = this.$Menu.getElm(),
                pos     = Elm.getPosition(),
                size    = Elm.getSize();

            Elm.addClass('qui-select-open');

            this.$Menu.setAttribute('maxHeight', this.getAttribute('menuMaxHeight'));

            this.$Menu.setPosition(
                pos.x - 20,
                pos.y + size.y
            );

            MenuElm.setStyles({
                zIndex : QUIElementUtils.getComputedZIndex(this.getElm()) + 1
            });

            if (size.x + 20 > 200) {
                MenuElm.setStyles({
                    width  : size.x + 20
                });
            }

            this.$Menu.setAttribute('width', size.x);
            this.$Menu.show();

            var Option = this.$Menu.getChildren(
                this.getAttribute('name') + this.getValue()
            );

            if (Option) {
                Option.setActive();
            }

            return this;
        },

        /**
         * hide the dropdown menu
         *
         * @method qui/controls/buttons/Select#close
         */
        close : function()
        {
            document.body.focus();
            this.$onBlur();
        },

        /**
         * Disable the select
         *
         * @method qui/controls/buttons/Select#disable
         * @return {Object} this (qui/controls/buttons/Select)
         */
        disable : function()
        {
            this.$disabled = true;
            this.getElm().addClass('qui-select-disable');
            this.$Menu.hide();
        },

        /**
         * Is the select disabled?
         *
         * @method qui/controls/buttons/Select#isDisabled
         */
        isDisabled : function()
        {
            return this.$disabled;
        },

        /**
         * Enable the select
         *
         * @method qui/controls/buttons/Select#enable
         * @return {Object} this (qui/controls/buttons/Select)
         */
        enable : function()
        {
            this.$disabled = false;
            this.getElm().removeClass('qui-select-disable');
        },

        /**
         * internal click, mousedown event of the context menu item
         * set the value to the select box
         *
         * @method qui/controls/buttons/Select#$set
         * @param {Object} Item - qui/controls/contextmenu/Item
         */
        $set : function(Item)
        {
            this.$value = Item.getAttribute('value');

            if (this.$Elm.getElement('.text'))
            {
                this.$Elm.getElement('.text')
                         .set('html', Item.getAttribute('text'));
            }

            if (Item.getAttribute('icon') && this.$Elm.getElement('.icon'))
            {
                var value = Item.getAttribute('icon'),
                    Icon  = this.$Elm.getElement('.icon');

                Icon.className = '';
                Icon.addClass('icon');
                Icon.setStyle('background', null);

                if (Utils.isFontAwesomeClass(value))
                {
                    Icon.addClass(value);
                } else
                {
                    Icon.setStyle(
                        'background',
                        'url("'+ value +'") center center no-repeat'
                    );
                }
            }

            document.body.focus();

            this.fireEvent('change', [this.$value, this]);
        },

        /**
         * event : on control destroy
         *
         * @method qui/controls/buttons/Select#$onDestroy
         */
        $onDestroy : function()
        {
            this.$Menu.destroy();
        },

        /**
         * event : on menu blur
         *
         * @method qui/controls/buttons/Select#$onBlur
         */
        $onBlur : function()
        {
            this.$Menu.hide();
            this.getElm().removeClass('qui-select-open');
        },

        /**
         * event : on key up
         * if the element has the focus
         *
         * @method qui/controls/buttons/Select#$onKeyUp
         * @param {HTMLElement} event
         */
        $onKeyUp : function(event)
        {
            if (typeof event === 'undefined') {
                return;
            }

            if (event.key !== 'down' &&
                event.key !== 'up' &&
                event.key !== 'enter')
            {
                return;
            }

            this.$Menu.show();

            if (event.key === 'down')
            {
                this.$Menu.down();
                return;
            }

            if (event.key === 'up')
            {
                this.$Menu.up();
                return;
            }

            if (event.key === 'enter') {
                this.$Menu.select();
            }
        }
    });
});