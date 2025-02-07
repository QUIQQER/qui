/**
 * Error
 *
 * @module qui/controls/messages/Error
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/controls/messages/Message'
 */

define('qui/controls/messages/Error', ['qui/controls/messages/Message'], function(Message) {
    'use strict';

    /**
     * @class qui/controls/messages/Error
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: Message,
        Type: 'qui/controls/messages/Error',

        initialize: function(options) {
            this.setAttribute('cssclass', 'message-error');
            this.parent(options);
        }
    });
});