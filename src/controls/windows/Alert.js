
define('qui/controls/windows/Alert', [

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
            maxHeight : 300
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