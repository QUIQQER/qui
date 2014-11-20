
/**
 * Utils for objects
 * Helps with objects -> {}
 *
 * @module qui/utils/Object
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/utils/Object', {

    /**
     * Combines two Object
     *
     * @method qui/utils/Object#combine
     *
     * @param {Object} first - First Object
     * @param {Object} second - Second Object
     * @return {Object}
     */
    combine : function(first, second)
    {
        first  = first || {};
        second = second || {};

        return Object.append(first, second);
    },

    /**
     * Exists the namespace/ entries / values in the object?
     *
     * @method qui/utils/Object#existsValue
     * @example Object.existsValue('my.sub.vars');
     *
     * @param {Sring} namespace
     * @param {Object} obj
     * @returns {Boolean}
     */
    existsValue : function( namespace, obj )
    {
        var parts = namespace.split( '.' );

        for ( var i = 0, len = parts.length; i < len; ++i )
        {
            if ( typeof obj[ parts[ i ] ] === 'undefined' ) {
                return false;
            }

            obj = obj[ parts[ i ] ];
        }

        return true;
    },

    /**
     * Return the value of a namespace/ entry / value in the object
     *
     * @method qui/utils/Object#getValue
     * @example Object.getValue('my.sub.vars');
     *
     * @param {Sring} namespace
     * @param {Object} obj
     * @returns {unknown_type}
     */
    getValue : function( namespace, obj )
    {
        var parts = namespace.split( '.' );

        for ( var i = 0, len = parts.length; i < len; ++i )
        {
            if ( typeof obj[ parts[ i ] ] === 'undefined' ) {
                return undefined;
            }

            obj = obj[ parts[ i ] ];
        }

        return obj;
    },

    /**
     * Create a namespace in or extend a object
     *
     * @method qui/utils/Object#namespace
     * @param {String} namespace
     * @param {Object} obj
     *
     * @return {Object}
     */
    namespace : function extend( namespace, obj )
    {
        var pl, i;
        var parts  = namespace.split('.'),
            parent = obj;

        pl = parts.length;

        for ( i = 0; i < pl; i++ )
        {
            //create a property if it doesnt exist
            if ( typeof parent[ parts[ i ] ] === 'undefined' ) {
                parent[ parts[ i ] ] = {};
            }

            parent = parent[ parts[ i ] ];
        }

        return parent;
    }
});
