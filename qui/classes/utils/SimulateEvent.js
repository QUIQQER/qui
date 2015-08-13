
/**
 * Simulate Event to an Element
 * Help from: https://github.com/eduardolundgren/jquery-simulate/blob/master/jquery.simulate.js
 *
 * @module qui/classes/utils/SimulateEvent
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/classes/DOM
 */
define('qui/classes/utils/SimulateEvent', [

    'qui/classes/DOM'

], function(QDOM)
{
    "use strict";

    return new Class({

        Extends : QDOM,
        Type : 'qui/classes/utils/SimulateEvent',

        initialize : function(Elm)
        {
            this.$Elm = Elm;
        },

        /**
         * Simulate an event at the target
         *
         * @param {String} type
         * @param {Object} [options]
         * @returns {DOMEvent}
         */
        simulateEvent : function(type, options)
        {
            var evt = this.createEvent(type, options);
            this.dispatchEvent(type, evt);

            return evt;
        },

        /**
         * Create event
         *
         * @param {String} type
         * @param {Object} [options]
         * @returns {DOMEvent}
         */
        createEvent : function(type, options)
        {
            if (/^mouse(over|out|down|up|move)|(dbl)?click$/.test(type)) {
                return this.mouseEvent(type, options);
            }

            if (/^key(up|down|press)$/.test(type)) {
                return this.keyboardEvent(type, options);
            }
        },

        /**
         * dispatch event
         *
         * @param {String} type - event type; eq.: mousedown, mouseup
         * @param {DOMEvent} evt
         * @returns {*}
         */
        dispatchEvent : function(type, evt)
        {
            if (this.$Elm.dispatchEvent) {
                this.$Elm.dispatchEvent(evt);
                return evt;
            }

            if (this.$Elm.fireEvent) {
                this.$Elm.fireEvent('on' + type, evt);
                return evt;
            }

            return evt;
        },

        /**
         * Create Mouse Event
         *
         * @param {String} type
         * @param {Object}  options
         */
        mouseEvent: function(type, options)
        {
            var evt;

            var e = Object.merge({
                bubbles: true,
                cancelable: (type != "mousemove"),
                view: window,
                detail: 0,
                screenX: 0,
                screenY: 0,
                clientX: 0,
                clientY: 0,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                button: 0,
                relatedTarget: undefined
            }, options || {});

            if (typeof document.createEvent === 'function') {

                evt = document.createEvent("MouseEvents");

                evt.initMouseEvent(type, e.bubbles, e.cancelable, e.view, e.detail,
                    e.screenX, e.screenY, e.clientX, e.clientY,
                    e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                    e.button, this.$Elm
                );

            } else
            {
                evt = Object.merge(document.createEventObject(), e);
                evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
            }

            return evt;
        },

        /**
         * Create Keyboard Event
         *
         * @param {String} type
         * @param {Object} options
         */
        keyboardEvent: function(type, options)
        {
            var evt;

            var e = Object.merge({
                bubbles: true,
                cancelable: true,
                view: window,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                keyCode: 0,
                charCode: 0
            }, options || {});

            if (typeof document.createEvent === 'function')
            {
                try
                {
                    evt = document.createEvent("KeyEvents");

                    evt.initKeyEvent(
                        type,
                        e.bubbles,
                        e.cancelable,
                        e.view,
                        e.ctrlKey,
                        e.altKey,
                        e.shiftKey,
                        e.metaKey,
                        e.keyCode,
                        e.charCode
                    );

                } catch(err)
                {
                    evt = document.createEvent("Events");
                    evt.initEvent(type, e.bubbles, e.cancelable);

                    $.extend(evt, { view: e.view,
                        ctrlKey: e.ctrlKey, altKey: e.altKey, shiftKey: e.shiftKey, metaKey: e.metaKey,
                        keyCode: e.keyCode, charCode: e.charCode
                    });
                }

            } else if (document.createEventObject)
            {
                evt = Object.merge(document.createEventObject(), e);
            }

            // ie || opera
            if (Browser.name == 'ie' || Browser.name == 'opera') {
                evt.keyCode = (e.charCode > 0) ? e.charCode : e.keyCode;
                evt.charCode = undefined;
            }

            return evt;
        }
    });
});