/**
 * The Main Class for the Main QUI Object
 *
 * @module qui/classes/QUI
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require require
 * @require qui/classes/DOM
 * @require qui/classes/Controls
 * @require qui/classes/storage/Storage
 * @require qui/lib/polyfills/Promise
 *
 * @event onError : if there is an error
 * @event onResize : globale window resize event
 */

define('qui/classes/QUI', [

    'require',
    'qui/classes/DOM',
    'qui/classes/Controls',
    'qui/classes/Windows',
    'qui/classes/storage/Storage',
    'qui/utils/Functions',
    'qui/lib/polyfills/Promise',
    'qui/lib/polyfills/AnimationFrame'

], function (require, DOM, Controls, Windows, Storage, QUIFunctionUtils) {
    "use strict";

    /**
     * The QUIQQER main object
     *
     * @class QUI
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: DOM,
        Type   : 'qui/classes/QUI',

        initialize: function (options) {
            /**
             * defaults
             */
            this.setAttributes({
                'debug'      : false,
                'fetchErrors': true
            });

            this.parent(options);

            this.$winSize = {
                x: 0,
                y: 0
            };

            // error handling
            if (this.getAttribute('fetchErrors')) {
                var self = this;

                require.onError = function (requireType, requireModules) {
                    self.trigger(
                        'ERROR :' + requireType + '\n' +
                        'Require :' + requireModules
                    );
                };

                window.onerror = this.trigger.bind(this);
            }

            this.Controls = new Controls();
            this.Windows  = new Windows();
            this.Storage  = new Storage();

            // global resize event
            if (typeof window !== 'undefined') {

                window.requestAnimationFrame(function () {
                    this.$winSize = window.getSize();

                    if (this.$winSize.x === 0 || this.$winSize.y === 0) {
                        this.$winSize = document.getSize();
                    }

                }.bind(this));

                window.addEvent('resize', QUIFunctionUtils.debounce(function () {

                    window.requestAnimationFrame(function () {
                        this.$winSize = window.getSize();

                        if (this.$winSize.x === 0 || this.$winSize.y === 0) {
                            this.$winSize = document.getSize();
                        }

                        this.fireEvent('resize', [this]);
                    }.bind(this));

                }.bind(this), 100));

                window.addEvent('domready', function() {
                    this.$winSize = window.getSize();

                    if (this.$winSize.x === 0 || this.$winSize.y === 0) {
                        this.$winSize = document.getSize();
                    }
                }.bind(this));
            }

            this.MessageHandler = null;
        },

        /**
         * Return the current win size
         * Please use QUI.getWinSize() and make not 1000 document.getSize() calls
         *
         * @method qui/classes/QUI#getWindowSize
         * @returns {{x: number, y: number}|*}
         */
        getWindowSize: function () {
            return this.$winSize;
        },

        /**
         * Creates Namespaces
         * based on YAHOO code - nice solution!!
         *
         * @method qui/classes/QUI#namespace
         * @example QUI.namespace('my.name.space'); -> QUI.my.name.space
         * @deprecated
         */
        namespace: function () {
            var tlen;

            var a    = arguments,
                o    = this,
                i    = 0,
                j    = 0,

                len  = a.length,
                tok  = null,
                name = null;

            // iterate on the arguments
            for (; i < len; i = i + 1) {
                tok  = a[i].split(".");
                tlen = tok.length;

                // iterate on the object tokens
                for (j = 0; j < tlen; j = j + 1) {
                    name    = tok[j];
                    o[name] = o[name] || {};
                    o       = o[name];
                }
            }

            return o;
        },

        /**
         * parse qui controls
         *
         * @param {HTMLElement} [Parent] - optional, if no parent given, document.body would be use
         * @param {Function} [callback] - optional
         * @return Promise
         */
        parse: function (Parent, callback) {
            return new Promise(function (resolve, reject) {
                if (typeof Parent === 'undefined') {
                    Parent = document.body;
                }

                if (typeOf(Parent) !== 'element') {
                    resolve();

                    if (typeof callback !== 'undefined') {
                        callback();
                    }

                    return;
                }

                // parse all qui controls
                var nodes = document.id(Parent).getElements('[data-qui]'),
                    list  = nodes.map(function (Elm) {
                        return Elm.get('data-qui');
                    });

                // cleanup -> empty data-qui
                list = list.filter(function (item) {
                    return item !== '';
                }).clean();

                nodes = nodes.filter(function (Elm) {
                    return Elm.get('data-qui') !== '';
                }).clean();

                require(list, function () {
                    var i, len, Cls, Elm;

                    var formNodes = {
                        'TEXTAREA': true,
                        'INPUT'   : true
                    };

                    for (i = 0, len = list.length; i < len; i++) {
                        Cls = arguments[i];
                        Elm = nodes[i];

                        // already initialized
                        if (Elm.get('data-quiid')) {
                            continue;
                        }

                        if (typeof formNodes[Elm.nodeName] !== 'undefined' ||
                            Elm.get('html').trim() !== '') {
                            new Cls().imports(Elm);
                        } else {
                            new Cls().replaces(Elm);
                        }
                    }

                    resolve();

                    if (typeof callback !== 'undefined') {
                        callback();
                    }

                }, function (err) {
                    reject(err);
                });
            });
        },

        /**
         * Fire the Error Event
         *
         * @method qui/classes/QUI#triggerError
         *
         * @param {qui/classes/messages/Message|Exception} Exception - Exception Objekt
         * @return {Object} this (qui/classes/QUI)
         */
        triggerError: function (Exception) {
            return this.trigger(Exception.getMessage(), '', 0);
        },

        /**
         * trigger some messages to the console
         *
         * @method qui/classes/QUI#trigger
         *
         * @param {String} msg
         * @param {String} [url] - optional
         * @param {Number} [linenumber] - optional
         *
         * @return {Object} this (qui/classes/QUI)
         */
        trigger: function (msg, url, linenumber) {
            /*
             var message = msg +"\n"+
             "File: "+ url +"\n"+
             "Linenumber: "+ linenumber;
             */
            this.fireEvent('error', [msg, url, linenumber]);

            return this;
        },

        /**
         * Return the message handler
         *
         * @method qui/classes/QUI#getMessageHandler
         * @param {Function} [callback] - optional, callback function
         * @return Promise
         */
        getMessageHandler: function (callback) {
            var self = this;

            return new Promise(function (resolve, reject) {
                if (typeof self.$execGetMessageHandler !== 'undefined' && !self.MessageHandler) {
                    self.$execGetMessageHandler = true;

                    (function () {
                        self.getMessageHandler(callback);
                    }).delay(20, self);

                    return;
                }

                self.$execGetMessageHandler = true;

                if (self.MessageHandler) {
                    if (typeOf(callback) === 'function') {
                        callback(self.MessageHandler);
                    }

                    resolve(self.MessageHandler);
                    return;
                }

                require(['qui/controls/messages/Handler'], function (Handler) {
                    self.MessageHandler = new Handler();

                    if (typeOf(callback) === 'function') {
                        callback(self.MessageHandler);
                    }

                    resolve(self.MessageHandler);
                }, reject);
            });
        },

        /**
         * Return the message handler
         *
         * @method qui/classes/QUI#getControls
         * @param {Function} callback
         */
        getControls: function (callback) {
            if (this.Controls) {
                callback(this.Controls);
            }
        }
    });
});
