
/**
 * Alert Box
 *
 * @module qui/controls/windows/Alert
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/windows/Popup
 * @require css!qui/controls/windows/Alert.css
 */

define([

    'qui/controls/windows/Popup',

    'css!qui/controls/windows/Alert.css'

], function(Popup)
{
    "use strict";

    return new Class({

        Extends : Popup,
        Type    : 'qui/controls/windows/Alert',

        Binds : [
            '$onCreate'
        ],

        options : {
            maxHeight : 300,
            icon      : 'icon-bell',
            title     : 'Alert'
        },

        initialize : function(params)
        {
            this.parent( params );
            this.addEvent( 'onCreate', this.$onCreate );
        },

        /**
         * event : oncreate
         */
        $onCreate : function()
        {
            this.getElm().addClass( 'qui-windows-alert' );
        }
    });
});