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

// workaround for typeof() function because of mootools 1.4 / 1.5 to 1.6
window.typeOf = function (i) {
    "use strict";

    if (i === null || i === undefined) {
        return "null";
    }

    if (typeof i.getType === 'function') {
        return i.getType();
    }

    if (typeof i.$family === 'function') {
        return i.$family();
    }

    if (i.nodeName) {
        if (i.nodeType === 1) {
            return "element";
        }

        if (i.nodeType === 3) {
            return (/\S/).test(i.nodeValue) ? "textnode" : "whitespace";
        }
    } else {
        if (typeof i.length == "number") {
            if (i.callee) {
                return "arguments";
            }
            if ("item" in i) {
                return "collection";
            }
        }
    }

    return typeof i;
};

define('qui/classes/QUI', [

    'require',
    'qui/classes/DOM',
    'qui/classes/Controls',
    'qui/classes/Windows',
    'qui/classes/storage/Storage',
    'qui/classes/utils/Animate',
    'qui/utils/Functions',
    'qui/lib/polyfills/Promise',
    'qui/lib/polyfills/AnimationFrame'

], function (require, DOM, Controls, Windows, Storage, Animate, QUIFunctionUtils) {
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

            this.$winScroll = {
                x: 0,
                y: 0
            };

            this.$bodySize = {
                x: 0,
                y: 0
            };

            this.$isScrolling = false;

            // error handling
            if (this.getAttribute('fetchErrors')) {
                require.onError = (requireType, requireModules) => {
                    this.trigger(
                        'ERROR :' + requireType + '\n' +
                        'Require :' + requireModules
                    );
                };

                window.onerror = this.trigger.bind(this);
            }

            this.Controls = new Controls();
            this.Windows  = new Windows();
            this.Storage  = new Storage();

            const Ghost = new Element('div', {
                styles: {
                    background: 'transparent',
                    display   : 'none',
                    height    : '100%',
                    left      : 0,
                    position  : 'fixed',
                    top       : 0,
                    width     : '100%',
                    zIndex    : 1
                }
            });

            // global resize event
            if (typeof window !== 'undefined') {
                let win  = document.id(window);
                let body = document.id(document.body);

                win.requestAnimationFrame(() => {
                    Ghost.setStyle('display', null);
                    this.$winSize = Ghost.getSize();
                    Ghost.setStyle('display', 'none');

                    this.$winScroll = win.getScroll();

                    if (typeof body !== 'undefined' && body) {
                        this.$bodySize   = body.getSize();
                        this.$bodyScroll = body.getScrollSize();
                    }

                    if (this.$winSize.x === 0 || this.$winSize.y === 0) {
                        this.$winSize = document.getSize();
                    }
                });

                win.addEvent('resize', QUIFunctionUtils.debounce(() => {
                    win.requestAnimationFrame(function () {
                        if (typeof body === 'undefined' || !body) {
                            body = document.id(document.body);
                        }

                        Ghost.setStyle('display', null);
                        this.$winSize = Ghost.getSize();
                        Ghost.setStyle('display', 'none');

                        this.$winScroll  = win.getScroll();
                        this.$bodySize   = body.getSize();
                        this.$bodyScroll = body.getScrollSize();

                        if (this.$winSize.x === 0 || this.$winSize.y === 0) {
                            this.$winSize = document.getSize();
                        }

                        this.fireEvent('resize', [this]);
                    }.bind(this));
                }, 100));

                win.addEvent('domready', () => {
                    Ghost.inject(document.body);
                    Ghost.setStyle('display', null);
                    this.$winSize = Ghost.getSize();
                    Ghost.setStyle('display', 'none');

                    this.$winScroll = win.getScroll();

                    if (typeof body === 'undefined' || !body) {
                        body = document.id(document.body);
                    }

                    this.$bodySize   = body.getSize();
                    this.$bodyScroll = body.getScrollSize();

                    if (this.$winSize.x === 0 || this.$winSize.y === 0) {
                        this.$winSize = document.getSize();
                    }
                });

                // scroll events
                let scrollDelay        = 200;
                let isScrollingTimeout = null;

                if ("addEventListener" in win) {
                    win.addEventListener('scroll', () => {
                        win.requestAnimationFrame(() => {
                            this.$isScrolling = true;
                            this.$winScroll   = win.getScroll();
                            this.fireEvent('scroll');

                            // isScrolls Flag
                            if (isScrollingTimeout) {
                                clearTimeout(isScrollingTimeout);
                            }

                            isScrollingTimeout = (() => {
                                this.$isScrolling = false;
                                this.fireEvent('scrollEnd');
                            }).delay(scrollDelay, this);

                        });
                    }, {
                        passive: true,
                        capture: true,
                        once   : false
                    });
                } else if ("attachEvent" in win) {
                    win.attachEvent('scroll', () => {
                        win.requestAnimationFrame(() => {
                            this.$isScrolling = true;
                            this.$winScroll   = win.getScroll();
                            this.fireEvent('scroll');

                            // isScrolls Flag
                            if (isScrollingTimeout) {
                                clearTimeout(isScrollingTimeout);
                            }

                            isScrollingTimeout = (() => {
                                this.$isScrolling = false;
                                this.fireEvent('scrollEnd');
                            }).delay(scrollDelay, this);
                        });
                    });
                }

                body.addEventListener('click', (e) => {
                    if (e.target.getParent('button')) {
                        return;
                    }

                    if (e.target.getParent('.qui-contextmenu-baritem')) {
                        return;
                    }

                    if (e.target.getParent('.qui-contextmenu')) {
                        return;
                    }

                    this.hideContextMenus();
                });
            }

            this.MessageHandler = null;
        },

        /**
         * Return the current win size
         * Please use QUI.getWinSize() and make not 1000 document.getSize() calls
         *
         * @returns {{x: number, y: number}|*}
         */
        getWindowSize: function () {
            return this.$winSize;
        },

        /**
         * Return the current body size
         * Please use QUI.getBodySize() and make not 1000 document.body.getSize() calls
         *
         * @returns {{x: number, y: number}|*}
         */
        getBodySize: function () {
            return this.$bodySize;
        },

        /**
         * Return the current body scrll size
         * Please use QUI.getBodyScrollSize() and make not 1000 document.body.getSize() calls
         *
         * @returns {{x: number, y: number}|*}
         */
        getBodyScrollSize: function () {
            return this.$bodyScroll;
        },

        /**
         * Return the current scroll position
         * Please use QUI.getScroll() and make not 1000 window.getScroll() calls
         *
         * @returns {{x: number, y: number}|*}
         */
        getScroll: function () {
            return this.$winScroll;
        },

        /**
         * Is being scrolled?
         *
         * @returns {boolean}
         */
        isScrolling: function () {
            return this.$isScrolling;
        },

        /**
         * Creates Namespaces
         * based on YAHOO code - nice solution!!
         *
         * @example QUI.namespace('my.name.space'); -> QUI.my.name.space
         * @deprecated
         */
        namespace: function () {
            let tlen;

            let a    = arguments,
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
            this.fireEvent('parseBegin', [this, Parent]);

            return new Promise((resolve, reject) => {
                if (typeof Parent === 'undefined') {
                    Parent = document.body;
                }

                if (typeOf(Parent) !== 'element' &&
                    typeOf(Parent) !== 'elements'
                ) {
                    resolve();

                    if (typeof callback !== 'undefined') {
                        callback();
                    }

                    return;
                }

                // parse all qui controls
                let nodes = [];

                if (typeOf(Parent) === 'elements') {
                    Parent.getElements('[data-qui]').each(function (elements) {
                        Array.combine(nodes, elements.filter(function (Node) {
                            return Node;
                        }));
                    });
                } else {
                    nodes = document.id(Parent).getElements('[data-qui]');
                }

                let list = nodes.map(function (Elm) {
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
                    let i, len, Cls, Elm;

                    let formNodes = {
                        'TEXTAREA': true,
                        'INPUT'   : true,
                        'SELECT'  : true
                    };

                    for (i = 0, len = nodes.length; i < len; i++) {
                        Cls = arguments[i];
                        Elm = nodes[i];

                        // already initialized
                        if (Elm.get('data-quiid')) {
                            continue;
                        }

                        if (Elm.get('data-qui-parsed')) {
                            continue;
                        }

                        Elm.set('data-qui-parsed', 1);

                        if (typeof formNodes[Elm.nodeName] !== 'undefined' ||
                            Elm.get('html').trim() !== '') {
                            try {
                                new Cls().imports(Elm);
                            } catch (e) {
                                console.error(Cls, i, list);
                                console.error(e);
                            }
                        } else {
                            try {
                                new Cls().replaces(Elm);
                            } catch (e) {
                                console.error(Cls, i, list);
                                console.error(e);
                            }
                        }
                    }

                    this.fireEvent('parse', [this, Parent]);

                    resolve();

                    if (typeof callback !== 'undefined') {
                        callback();
                    }
                }.bind(this), function (err) {
                    reject(err);
                });
            });
        },

        /**
         * Fire the Error Event
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
         * @param {Number} [lineNumber] - optional
         *
         * @return {Object} this (qui/classes/QUI)
         */
        trigger: function (msg, url, lineNumber) {
            this.fireEvent('error', [msg, url, lineNumber]);

            return this;
        },

        /**
         * Return the message handler
         *
         * @param {Function} [callback] - optional, callback function
         * @return Promise
         */
        getMessageHandler: function (callback) {
            return new Promise((resolve, reject) => {
                if (typeof this.$execGetMessageHandler !== 'undefined' && !this.MessageHandler) {
                    this.$execGetMessageHandler = true;

                    (function () {
                        this.getMessageHandler(callback).then(resolve);
                    }).delay(20, this);

                    return;
                }

                this.$execGetMessageHandler = true;

                if (this.MessageHandler) {
                    if (typeOf(callback) === 'function') {
                        callback(this.MessageHandler);
                    }

                    resolve(this.MessageHandler);
                    return;
                }

                require(['qui/controls/messages/Handler'], (Handler) => {
                    this.MessageHandler = new Handler();

                    if (typeOf(callback) === 'function') {
                        callback(this.MessageHandler);
                    }

                    resolve(this.MessageHandler);
                }, reject);
            });
        },

        /**
         * Return the message handler
         *
         * @param {Function} callback
         */
        getControls: function (callback) {
            if (this.Controls) {
                callback(this.Controls);
            }
        },

        /**
         * hide all context menus
         */
        hideContextMenus: function() {
            this.Controls.getByType('qui/controls/contextmenu/Menu').map((Instance) => {
                if (Instance.getElm().getStyle('display') !== 'none') {
                    Instance.hide();
                }
            });
        },

        /**
         * Return fx animation object for the node
         *
         * @param {HTMLElement} Node
         * @return {Object}
         */
        fx: function (Node) {
            return new Animate(Node);
        }
    });
});
