/**
 * Success Message
 *
 * @module qui/controls/messages/Success
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/messages/Message
 */

define('qui/controls/messages/Success', ['qui/controls/messages/Message'], function(Message) {
    'use strict';

    /**
     * @class qui/controls/messages/Success
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Message,
        Type: 'qui/controls/messages/Success',

        initialize: function(options) {
            this.setAttribute('cssclass', 'message-success');
            this.parent(options);
        }
    });
});
