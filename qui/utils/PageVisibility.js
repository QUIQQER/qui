/**
 * You can react at your tab visibility
 *
 * @module qui/utils/PageVisibility
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/classes/DOM
 *
 * @event onHide
 * @event onVisible
 */
define('qui/utils/PageVisibility', [

    'qui/classes/DOM'

], function(QDOM) {

    'use strict';

    var hidden, VisibilityHelper;

    hidden = 'hidden';

    VisibilityHelper = new QDOM({
        methods: {
            triggerChange: function(evt) {
                var type;
                var v = 'visible',
                    h = 'hidden',
                    evtMap = {
                        focus: v,
                        focusin: v,
                        pageshow: v,
                        blur: h,
                        focusout: h,
                        pagehide: h
                    };

                evt = evt || window.event;

                if (evt.type in evtMap) {
                    type = evtMap[evt.type];

                } else {
                    type = this[hidden] ? 'hidden' : 'visible';
                }

                switch (type) {
                    case 'hidden':
                        VisibilityHelper.$isVisible = false;
                        VisibilityHelper.fireEvent('hide');
                        break;

                    case 'visible':
                        VisibilityHelper.$isVisible = true;
                        VisibilityHelper.fireEvent('visible');
                        break;
                }
            },

            isVisible: function() {
                return VisibilityHelper.$isVisible;
            }
        }
    });

    // visibilitychange standards:
    if (hidden in document) {
        document.addEventListener('visibilitychange', VisibilityHelper.triggerChange);

    } else {
        if ((hidden = 'mozHidden') in document) {
            document.addEventListener('mozvisibilitychange', VisibilityHelper.triggerChange);

        } else {
            if ((hidden = 'webkitHidden') in document) {
                document.addEventListener('webkitvisibilitychange', VisibilityHelper.triggerChange);

            } else {
                if ((hidden = 'msHidden') in document) {
                    document.addEventListener('msvisibilitychange', VisibilityHelper.triggerChange);

                    // IE 9 and lower:
                } else {
                    if ('onfocusin' in document) {
                        document.onfocusin = document.onfocusout = VisibilityHelper.triggerChange;

                    } else {
                        // All others:
                        window.onpageshow = window.onpagehide = window.onfocus = window.onblur = VisibilityHelper.triggerChange;
                    }
                }
            }
        }
    }

    // set the initial state (but only if browser supports the Page Visibility API)
    if (document[hidden] !== undefined) {
        VisibilityHelper.triggerChange({
            type: document[hidden] ? 'blur' : "focus"
        });
    }

    VisibilityHelper.$isVisible = true;

    return VisibilityHelper;
});
