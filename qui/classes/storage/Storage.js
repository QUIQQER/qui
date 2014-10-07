
/**
 * Use Local storage, with fallbacks
 * if local storage not exist, it loads the polyfill
 *
 * some browsers cant use local storage in private mode,
 * so it use internal object storage, therefore the data are kept only in the session
 *
 * @module qui/classes/storage/Storage
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/classes/DOM
 * @require [optional] qui/classes/storage/Polyfill
 */

var needle = ['qui/classes/DOM'];

if ( typeof window.localStorage === 'undefined' ||
     typeof window.sessionStorage === 'undefined')
{
    needle.push( 'qui/classes/storage/Polyfill' );
}

define(needle, function(QDOM, Polyfill)
{
    "use strict";

    /**
     * Local storage
     *
     * @class qui/classes/storage/Storage
     *
     * @memberof! <global>
     */
    return new Class({

        Extends : QDOM,
        Type    : 'qui/classes/storage/Storage',

        $data : {},

        /**
         * Set the value of a key
         *
         * @method qui/classes/storage/Storage#set
         * @param {String} key
         * @param {String|Integer} value
         */
        set : function(key, value)
        {
            try
            {
                window.localStorage.setItem( key, value );

            } catch ( e )
            {
                this.$data[ key ] = value;
            }
        },

        /**
         * Return the value of stored the key
         *
         * @method qui/classes/storage/Storage#get
         * @param {String} key
         * @return {unknown_type} the wanted storage
         */
        get : function(key)
        {
            try
            {
                return window.localStorage.getItem( key );

            } catch ( e )
            {

            }

            if ( typeof this.$data[ key ] !== 'undefined' ) {
                return this.$data[ key ];
            }

            return null;
        },

        /**
         * Remove a stored key
         *
         * @method qui/classes/storage/Storage#remove
         * @param {String} key
         */
        remove : function(key)
        {
            try
            {
                window.localStorage.removeItem( key );

            } catch ( e )
            {

            }

            if ( typeof this.$data[ key ] !== 'undefined' ) {
                delete this.$data[ key ];
            }
        },

        /**
         * Clear the storage
         *
         * @method qui/classes/storage/Storage#clear
         */
        clear : function()
        {
            this.$data = {};

            try
            {
                window.localStorage.clear();

            } catch ( e )
            {

            }
        }
    });
});
