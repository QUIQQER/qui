
/**
 * Control standard parent class
 * All controls should inherit {qui/controls/Control}
 *
 * @module qui/controls/Control
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/classes/DOM
 * @require css!qui/controls/Control.css
 *
 * @event onInject [ this ]
 * @event onHighlight [ this ]
 * @event onNormalize [ this ]
 * @event onResize [ this ]
 */

define([

    'qui/QUI',
    'qui/classes/DOM',

    'css!qui/controls/Control.css'

], function(QUI, DOM)
{
    "use strict";

    /**
     * @class qui/controls/Control
     *
     * @event onDrawBegin - if inject() is used, the Event will be triggered
     * @event onDrawEnd   - if inject() is used, the Event will be triggered
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : DOM,
        Type    : 'qui/controls/Control',

        $Parent : null,

        options : {
            name : ''
        },

        /**
         * Init function for inherited classes
         * If a Class inherit from qui/controls/Control, please use this.parent()
         * so the control are registered in QUI.Controls
         * and you can get the control with QUI.Controls.get()
         *
         * @method qui/controls/Control#init
         * @param {Object} option - option params
         */
        initialize : function(options)
        {
            this.parent( options );

            QUI.Controls.add( this );
        },

        /**
         * Create Method, can be overwritten for an own DOM creation
         *
         * @method qui/controls/Control#create
         * @return {DOMNode}
         */
        create : function()
        {
            if ( this.$Elm ) {
                return this.$Elm;
            }

            this.$Elm = new Element( 'div.qui-control' );

            return this.$Elm;
        },

        /**
         * Inject the DOMNode of the Control to a Parent
         *
         * @method qui/controls/Control#inject
         * @param {DOMNode|qui/controls/Control}
         * @param {pos} [optional]
         * @return {this}
         */
        inject : function(Parent, pos)
        {
            this.fireEvent( 'drawBegin', [ this ] );

            if ( typeof this.$Elm === 'undefined' || !this.$Elm ) {
                this.$Elm = this.create();
            }

            if ( typeof QUI !== 'undefined' &&
                 typeof QUI.Controls !== 'undefined' &&
                 QUI.Controls.isControl( Parent ) )
            {
                // QUI Control insertion
                Parent.appendChild( this );
            } else
            {
                // DOMNode insertion
                this.$Elm.inject( Parent, pos );
            }

            this.fireEvent( 'inject', [ this ] );

            return this;
        },

        /**
         * Save the control
         * Placeholder method for sub controls
         *
         * The save method returns all needed attributes for saving the control to the workspace
         * You can overwrite the method in sub classes to save specific attributes
         *
         * @method qui/controls/Control#serialize
         * @return {Object}
         */
        serialize : function()
        {
            return {
                attributes : this.getAttributes(),
                type       : this.getType()
            };
        },

        /**
         * import the saved attributes and the data
         * You can overwrite the method in sub classes to import specific attributes
         *
         * @method qui/controls/Control#unserialize
         * @param {Object} data
         */
        unserialize : function(data)
        {
            if ( data.attributes ) {
                this.setAttributes( data.attributes );
            }
        },

        /**
         * Destroys the DOMNode of the Control
         *
         * @method qui/controls/Control#destroy
         * @fires onDestroy
         */
        destroy : function()
        {
            this.fireEvent( 'destroy', [ this ] );

            if ( typeof this.$Elm !== 'undefined' && this.$Elm ) {
                this.$Elm.destroy();
            }

            this.$Elm = null;

            // destroy it from the controls
            QUI.Controls.destroy( this );
        },

        /**
         * Get the DOMNode from the Button
         *
         * @method qui/controls/Control#getElm
         * @return {DOMNode}
         */
        getElm : function()
        {
            if ( typeof this.$Elm === 'undefined' || !this.$Elm ) {
                this.create();
            }

            return this.$Elm;
        },

        /**
         * If the control have a QUI_Object Parent
         *
         * @method qui/controls/Control#getParent
         * @return {qui/controls/Control|false}
         */
        getParent : function()
        {
            return this.$Parent || false;
        },

        /**
         * Set the Parent to the Button
         *
         * @method qui/controls/Control#setParent
         *
         * @param {qui/controls/Control} Parent
         * @return {this}
         */
        setParent : function(Parent)
        {
            this.$Parent = Parent;
            return this;
        },

        /**
         * Return a path string from the parent names
         *
         * @method qui/controls/Control#getPath
         * @return {String}
         */
        getPath : function()
        {
            var path   = '/'+ this.getAttribute( 'name' ),
                Parent = this.getParent();

            if ( !Parent ) {
                return path;
            }

            return Parent.getPath() + path;
        },

        /**
         * Hide the control
         *
         * @method qui/controls/Control#hide
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
         * Display / Show the control
         *
         * @method qui/controls/Control#show
         * @return {this}
         */
        show : function()
        {
            if ( this.$Elm ) {
                this.$Elm.setStyle( 'display', null );
            }

            return this;
        },

        /**
         * Highlight the control
         *
         * @method qui/controls/Control#highlight
         * @return {this}
         */
        highlight : function()
        {
            this.fireEvent( 'highlight', [ this ] );
            return this;
        },

        /**
         * Dehighlight / Normalize the control
         *
         * @method qui/controls/Control#normalize
         * @return {this}
         */
        normalize : function()
        {
            this.fireEvent( 'normalize', [ this ] );
            return this;
        },

        /**
         * Focus the DOMNode Element
         *
         * @method qui/controls/Control#focus
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
         * Resize the control
         *
         * @method qui/controls/Control#resize
         */
        resize : function()
        {
            this.fireEvent( 'resize', [ this ] );
        }
    });
});
