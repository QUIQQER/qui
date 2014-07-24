/**
 * Information
 *
 * @module qui/controls/messages/Information
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/messages/Message
 */

define(['qui/controls/messages/Message'], function(Message)
{
    "use strict";

    return new Class({
        Extends : Message,
        Type    : 'qui/controls/messages/Information',

        initialize : function(options)
        {
            this.setAttribute( 'cssclass', 'message-information' );
            this.parent( options );
        }
    });
});