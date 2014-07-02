
/**
 * Error
 *
 * @author www.namerobot.de (Henning Leutz)
 * @copyright NameRobot
 */

define('qui/controls/messages/Error', [

    'qui/controls/messages/Message'

], function(Message)
{
    "use strict";

    return new Class({

        Extends : Message,
        Type    : 'qui/controls/messages/Error',

        initialize : function(options)
        {
            this.setAttribute( 'cssclass', 'message-error' );
            this.parent( options );
        }
    });
});