/**
 * Attention
 *
 * @module qui/controls/messages/Attention
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/messages/Message
 */

define('qui/controls/messages/Attention', [
    'qui/controls/messages/Message'
], function(Message) {
    'use strict';

    /**
     * @class qui/controls/messages/Attention
     *
     * @memberof! <global>
     */
    return new Class({
        Extends: Message,
        Type: 'qui/controls/messages/Attention',

        initialize: function(options) {
            this.setAttribute('cssclass', 'message-attention');
            this.parent(options);
        }
    });
});
