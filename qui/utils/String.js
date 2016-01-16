/**
 * string helper
 * Helps with string operations
 *
 * @module qui/utils/String
 * @author www.pcsg.de (Henning Leutz)
 */
define('qui/utils/String', {

    /**
     * get params from an url
     *
     * @method qui/utils/String#getUrlParams
     *
     * @param {String} str - index.php?param1=12&param2=test
     * @return {Object}
     */
    getUrlParams: function (str) {
        "use strict";

        var params = str.split('?');

        if (typeof params[1] === 'undefined') {
            return {};
        }

        params = params[1].split('&');

        var i, len, sp;
        var r = {};

        for (i = 0, len = params.length; i < len; i++) {
            sp = params[i].split('=');

            r[sp[0]] = sp[1];
        }

        return r;
    },

    /**
     * Format bytes in readable formats
     *
     * @param bytes
     * @param decimals
     * @returns {String}
     */
    formatBytes: function (bytes, decimals) {
        "use strict";

        if (bytes === 0) {
            return '0 Byte';
        }

        var k     = 1000;
        var dm    = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i     = Math.floor(Math.log(bytes) / Math.log(k));

        return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
    }
});
