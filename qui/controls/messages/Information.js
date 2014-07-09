/**
 * Information
 *
 * @author www.pcsg.de (Henning Leutz)
 */

define('qui/controls/messages/Information', [

    'qui/controls/messages/Message'

], function(Message)
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