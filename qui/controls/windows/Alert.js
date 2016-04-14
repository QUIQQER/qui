/**
 * Alert Box
 *
 * @module qui/controls/windows/Alert
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/windows/Popup
 * @require css!qui/controls/windows/Alert.css
 */

define('qui/controls/windows/Alert', [

    'qui/controls/windows/Popup',

    'css!qui/controls/windows/Alert.css'

], function (Popup) {
    "use strict";

    /**
     * @class qui/controls/windows/Alert
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Popup,
        Type   : 'qui/controls/windows/Alert',

        Binds: [
            '$onCreate'
        ],

        options: {
            maxHeight: 300,
            icon     : 'icon-bell fa fa-bell',
            title    : 'Alert'
        },

        initialize: function (params) {
            this.parent(params);
            this.addEvent('onCreate', this.$onCreate);
        },

        /**
         * event : oncreate
         *
         * @method qui/controls/windows/Alert#$onCreate
         */
        $onCreate: function () {
            this.getElm().addClass('qui-windows-alert');
        }
    });
});