
/**
 * Helper for <form> nodes
 *
 * @module qui/utils/Functions
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/utils/Functions', {

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing.
     * source: http://davidwalsh.name/essential-javascript-functions
     *
     * @param {Function} func
     * @param {Number} wait
     * @param {Boolean} immediate
     *
     * @returns {Function}
     */
    debounce : function(func, wait, immediate)
    {
        "use strict";

        var timeout;

        return function()
        {
            var context = this,
                args = arguments;

            var later = function() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };

            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);

            if (callNow) {
                func.apply(context, args);
            }
        };
    },

    /**
     * Returns a function, that, execute the function only once
     * source: http://davidwalsh.name/essential-javascript-functions
     *
     * @param {Function} func
     * @param {Object} context
     *
     * @returns {Function}
     */
    once : function(func, context)
    {
        "use strict";

        var result;

        return function() {
            if(func) {
                result = func.apply(context || this, arguments);
                func = null;
            }

            return result;
        };
    }

});