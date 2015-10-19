/**
 * system helper
 * Helps with system / browser informations
 *
 * @module qui/utils/System
 * @author www.pcsg.de (Henning Leutz)
 */
define('qui/utils/System', {

    /**
     * return the IOS Version
     * @returns {Array|Boolean} - Versions with subversion
     */
    iOSversion: function () {
        "use strict";

        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);

            return [
                parseInt(v[1], 10),
                parseInt(v[2], 10),
                parseInt(v[3] || 0, 10)
            ];
        }

        return false;
    }
});
