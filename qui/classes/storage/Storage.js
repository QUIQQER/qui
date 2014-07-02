/**
 * Use Local storage,
 * if local storage not exist, it loads the polyfill
 *
 * @author www.namerobot.com (Henning Leutz)
 *
 * @module qui/classes/storage/Storage
 * @package com.pcsg.qui.js.classes.users.storage
 */

var needle = ['qui/classes/DOM'];

if ( typeof window.localStorage === 'undefined' ||
     typeof window.sessionStorage === 'undefined')
{
    needle.push( 'qui/classes/storage/' );
}

define('qui/classes/storage/Storage', needle, function(QDOM, Polyfill)
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

        /**
         * Set the value of a key
         *
         * @method qui/classes/storage/Storage#set
         * @param {String} key
         * @param {String|Integer} value
         */
        set : function(key, value)
        {
            window.localStorage.setItem( key, value );
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
            return window.localStorage.getItem( key );
        }
    });
});
