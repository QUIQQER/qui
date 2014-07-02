
/**
 * Success Message
 *
 * @author www.namerobot.de (Henning Leutz)
 * @copyright NameRobot
 */

define('qui/controls/messages/Success', [

    'qui/controls/messages/Message'

], function(Message)
{
    "use strict";

    return new Class({
        Extends : Message,
        Type    : 'qui/controls/messages/Success',

        initialize : function(options)
        {
            this.setAttribute( 'cssclass', 'message-success' );
            this.parent( options );
        }
    });
});
