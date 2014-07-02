/**
 * The DOM class emulate similar methods
 * like a DOMNode to a normal Object
 *
 * Its easy to use and most classes inherit from {qui/classes/DOM}
 * All objects that inherited from {qui/classes/DOM} can easily extend with Attributes.
 *
 * @author www.quiqqer.com (Henning Leutz)
 *
 * @event onDestroy [this]
 * @event onSetAttribute [key, value]
 *
 * @module classes/DOM
 * @package com.pcsg.qui.js.classes
 */

define('qui/classes/DOM', function()
{
    "use strict";

    window.$quistorage = {};

    /**
     * The DOM class emulate similar methods
     * like a DOMNode to a normal Object
     *
     * @class qui/classes/DOM
     *
     * @param {Object} options -
     *         With options you can set attributes or extend the Object width methods and events
     */
    return new Class({

        Implements : [ Options, Events ],
        Type       : 'qui/classes/DOM',

        options : {},
        $uid    : null,

        initialize : function(options)
        {
            options = options || {};

            if ( options.events )
            {
                this.addEvents( options.events );
                delete options.events;
            }

            if ( options.methods )
            {
                Object.append( this, options.methods );
                delete options.methods;
            }

            this.setAttributes( options );
        },

        /**
         * If this.TYPE is set, this.Type will be return
         *
         * @method qui/classes/DOM#$family
         * @return {String} Type of the Object
         * @ignore
         */
        $family : function()
        {
            if ( typeof this.Type !== 'undefined' ) {
                return this.Type;
            }

            return typeOf( this );
        },

        /**
         * Get the Unique ID from the Object
         *
         * @method qui/classes/DOM#getId
         * @return {String} Object ID
         */
        getId : function()
        {
            if ( !this.$uid ) {
                this.$uid = String.uniqueID();
            }

            return this.$uid;
        },

        /**
         * Get the type from the Object
         *
         * @method qui/classes/DOM#getType
         * @return {String} The type of the object
         */
        getType : function()
        {
            return typeOf( this );
        },

        /**
         * Set an attribute to the Object
         * You can extend the Object with everything you like
         * You can extend the Object width more than the default options
         *
         * @method qui/classes/DOM#setAttribute
         *
         * @param {String} k - Name of the Attribute
         * @param {Object|String|Integer|Array} v - value
         *
         * @return {this} The wanted attribute
         */
        setAttribute : function(k, v)
        {
            this.fireEvent('setAttribute', [ k, v ]);

            if ( typeof this.options[ k ] !== 'undefined' )
            {
                this.options[ k ] = v;
                return;
            }

            var oid = Slick.uidOf( this );

            if ( typeof window.$quistorage[ oid ] === 'undefined' ) {
                window.$quistorage[ oid ] = {};
            }

            window.$quistorage[ oid ][ k ] = v;

            return this;
        },

        /**
         * Destroy the Object and all relationsships to some Object
         *
         * @method qui/classes/DOM#destroy
         */
        destroy : function()
        {
            this.fireEvent( 'destroy', [ this ] );

            // storage clear
            var oid = Slick.uidOf( this );

            if ( oid in window.$quistorage ) {
                delete window.$quistorage[ oid ];
            }

            this.removeEvents();
        },

        /**
         * Alias for setAttributes, please use setAttributes()
         *
         * @see qui/classes/DOM#setAttributes()
         * @method qui/classes/DOM#setOptions
         */
        setOptions : function(options)
        {
            this.setAttributes( options );
        },

        /**
         * If you want set more than one attribute
         *
         * @method qui/classes/DOM#setAttributes
         *
         * @param {Object} attributes - Object with attributes
         * @return {this} self
         *
         * @example Object.setAttributes({
         *   attr1 : '1',
         *   attr2 : []
         * })
         */
        setAttributes : function(attributes)
        {
            attributes = attributes || {};

            for ( var k in attributes ) {
                this.setAttribute( k, attributes[k] );
            }

            return this;
        },

        /**
         * Return an attribute of the Object
         * returns the not the default attributes, too
         *
         * @method qui/classes/DOM#setAttribute
         * @param {Object} attributes - Object width attributes
         * @return {unknown_type|Bool} attribute
         */
        getAttribute : function(k)
        {
            if ( k in this.options ) {
                return this.options[ k ];
            }

            var oid = Slick.uidOf( this );

            if ( typeof window.$quistorage[ oid ] === 'undefined' ) {
                return false;
            }

            if ( typeof window.$quistorage[ oid ][ k ] !== 'undefined' ) {
                return window.$quistorage[ oid ][ k ];
            }

            return false;
        },

        /**
         * Alias for getAttributes, please use getAttributes()
         *
         * @method qui/classes/DOM#getAllAttributes
         * @see qui/classes/DOM#getAttributes()
         * @depricated
         */
        getAllAttributes : function()
        {
            return this.getAttributes();
        },

        /**
         * Return the default attributes
         *
         * @method qui/classes/DOM#getAttributes
         * @return {Object} attributes
         */
        getAttributes : function()
        {
            return this.options;
        },

        /**
         * Return the attributes which stored into the QUI Storage
         *
         * @return {Object}
         */
        getStorageAttributes : function()
        {
            var oid = Slick.uidOf( this );

            if ( oid in window.$quistorage  ) {
                return window.$quistorage[ oid ];
            }

            return {};
        },

        /**
         * Return true if a attribute exist
         *
         * @method qui/classes/DOM#existAttribute
         * @param {String} k - wanted attribute
         * @return {Bool} true or false
         */
        existAttribute : function(k)
        {
            if ( typeof this.options[ k ] !== 'undefined' ) {
                return true;
            }

            var oid = Slick.uidOf( this );

            if ( window.$quistorage[ oid ] && window.$quistorage[ oid ][ k ] ) {
                return true;
            }

            return false;
        },

        /**
         * Return the binded functions of the event name
         *
         * @method qui/classes/DOM#existAttribute
         * @param {String} eventname - wanted event
         * @return {Array|false} Event list
         */
        getEvents : function(eventname)
        {
            if ( typeof this.$events === 'undefined') {
                return false;
            }

            if ( typeof this.$events[ eventname ] !== 'undefined') {
                return this.$events[ eventname ];
            }

            return false;
        }
    });
});
