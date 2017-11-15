/**
 * QUI Ajax Class
 * Communication between server and client
 *
 * @module qui/classes/request/Ajax
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/classes/DOM
 * @require qui/controls/messages/Error
 * @require qui/Locale
 */

define('qui/classes/request/Ajax', [

    'qui/QUI',
    'qui/classes/DOM',
    'qui/controls/messages/Error',
    'qui/Locale'

], function (QUI, DOM, MessageError, Locale) {
    "use strict";

    /**
     * QUIQQER Ajax
     *
     * @class qui/classes/request/Ajax
     *
     * @fires onComplete [this]
     * @fires onSuccess [result, this]
     * @fires onProgress [this]
     * @fires onCancel [this]
     * @fires onDestroy [this]
     * @fires onError [qui/controls/messages/Error, this]
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: DOM,
        Type   : 'qui/classes/request/Ajax',

        Binds: [
            '$parseResult'
        ],

        $Request: null,
        $result : null,

        options: {
            method : 'post',
            url    : '',
            async  : true,
            timeout: 10000
        },

        initialize: function (options) {
            this.parent(options);
        },

        /**
         * Send the Request
         *
         * @method qui/classes/request/Ajax#send
         *
         * @param {Object} params - Parameters which to be sent
         * @return {Request} Request Object
         */
        send: function (params) {
            var self = this;

            params = self.parseParams(params || {});

            self.setAttribute('params', params);

            self.$Request = new Request({
                url    : self.getAttribute('url'),
                method : self.getAttribute('method'),
                async  : self.getAttribute('async'),
                timeout: self.getAttribute('timeout'),

                onProgress: function () {
                    self.fireEvent('progress', [self]);
                },

                onComplete: function () {
                    self.fireEvent('complete', [self]);
                },

                onSuccess: self.$parseResult,

                onCancel: function () {
                    self.fireEvent('cancel', [self]);
                }
            });

            var query       = Object.toQueryString(params),
                strlenCheck = parseInt(query.length) +
                    parseInt(self.getAttribute('url').length);

            if (strlenCheck > 2000) {
                self.$Request.options.method = 'post';
            }

            self.$Request.send(query);

            return self.$Request;
        },

        /**
         * Cancel the Request
         *
         * @method qui/classes/request/Ajax#cancel
         */
        cancel: function () {
            this.$Request.cancel();
        },

        /**
         * Fires the onDestroy Event
         *
         * @method qui/classes/request/Ajax#destroy
         * @fires onDestroy
         */
        destroy: function () {
            this.fireEvent('destroy', [this]);
        },

        /**
         * If the Request is synchron, with getResult you can get the result from the request
         *
         * @method qui/classes/request/Ajax#getResult
         *
         * @return {Boolean|String} result
         *
         * @example
         * Ajax.send( myparams );
         * var result = Ajax.getResult();
         */
        getResult: function () {
            return this.$result;
        },

        /**
         * Parse Params for the request
         * It filters undefined, objects and so on
         *
         * @method qui/classes/request/Ajax#parseParams
         *
         * @param {Object} params - params that will be send
         * @return {Object} Param list
         */
        parseParams: function (params) {
            var k, type_of, value;

            var result = {};

            if (typeof params.lang === 'undefined' &&
                typeof Locale !== 'undefined') {
                params.lang = Locale.getCurrent();
            }

            for (k in params) {
                if (!params.hasOwnProperty(k)) {
                    continue;
                }

                if (typeof params[k] === 'undefined') {
                    continue;
                }

                type_of = typeOf(params[k]);

                if (type_of != 'string' &&
                    type_of != 'number' &&
                    type_of != 'array') {
                    continue;
                }

                if (k != '_rf' && type_of == 'array') {
                    continue;
                }

                // if _rf is no array, make an array to it
                if (k == '_rf') {
                    if (typeOf(params[k]) != 'array') {
                        params[k] = [params[k]];
                    }

                    params[k] = JSON.encode(params[k]);
                }

                result[k] = params[k].toString();
            }

            return result;
        },

        /**
         * Parse the result and fire the Events
         *
         * @method qui/classes/request/Ajax#$parseResult
         * @param {String} responseText - request result
         *
         * if changes exists, please update the controls/upload/File.js
         *
         * @ignore
         */
        $parseResult: function (responseText) {
            var i;

            var str   = responseText || '',
                len   = str.length,
                start = 9,
                end   = len - 10;

            if (!str.match('<quiqqer>') || !str.match('</quiqqer>')) {
                return this.fireEvent('error', [
                    new MessageError({
                        message: 'No QUIQQER XML',
                        code   : 500
                    }),
                    this
                ]);
            }

            if (str.substring(0, start) != '<quiqqer>' ||
                str.substring(end, len) != '</quiqqer>') {
                return this.fireEvent('error', [
                    new MessageError({
                        message: 'No QUIQQER XML',
                        code   : 500
                    }),
                    this
                ]);
            }

            // callback
            var res, func;
            var result = {};

            try {
                result = JSON.decode(str.substring(start, end));
            } catch (e) {
                result = eval('(' + str.substring(start, end) + ')');
            }

            var params       = this.getAttribute('params'),
                rfs          = JSON.decode(params._rf || []),
                event_params = [];

            this.$result = result;

            // exist messages?
            if (result.message_handler &&
                result.message_handler.length) {
                var messages = result.message_handler;

                QUI.getMessageHandler(function (MH) {
                    var i, len;

                    var func_add_to_mh = function (Message) {
                        MH.add(Message);
                    };

                    for (i = 0, len = messages.length; i < len; i++) {
                        // parse time for javascript date
                        if ("time" in messages[i]) {
                            messages[i].time = messages[i] * 1000;
                        }

                        MH.parse(messages[i], func_add_to_mh);
                    }
                });
            }

            // exist a main exception?
            if (result.Exception) {
                return this.fireEvent('error', [
                    new MessageError({
                        message   : result.Exception.message || '',
                        code      : result.Exception.code || 0,
                        type      : result.Exception.type || 'Exception',
                        attributes: result.Exception.attributes || false
                    }),
                    this
                ]);
            }

            // check the single function
            for (i = 0, len = rfs.length; i < len; i++) {
                func = rfs[i];
                res  = result[func];

                if (!res) {
                    event_params.push(null);
                    continue;
                }

                if (res.Exception) {
                    this.fireEvent('error', [
                        new MessageError({
                            message   : res.Exception.message || '',
                            code      : res.Exception.code || 0,
                            type      : res.Exception.type || 'Exception',
                            attributes: res.Exception.attributes || false
                        }),
                        this
                    ]);

                    event_params.push(null);
                    continue;
                }

                if (typeof res.result !== 'undefined') {
                    event_params.push(res.result);
                    continue;
                }

                event_params.push(null);
            }

            event_params.push(this);

            this.fireEvent('success', event_params);
        }
    });
});
