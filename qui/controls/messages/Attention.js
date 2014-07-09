
/**
 * Attention
 *
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/controls/messages/Attention', [

    'qui/controls/messages/Message'

], function(Message)
{
    "use strict";

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
