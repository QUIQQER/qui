
/**
 * Attention
 *
 * @author www.namerobot.de (Henning Leutz)
 * @copyright NameRobot
 */

define('qui/controls/messages/Attention', [

    'qui/controls/messages/Message'

], function(Message)
{
    return new Class({
        Extends : Message,
        Type    : 'qui/controls/messages/Attention',

        initialize : function(options)
        {
            this.setAttribute( 'cssclass', 'message-attention' );
            this.parent( options );
        }
    });
});
