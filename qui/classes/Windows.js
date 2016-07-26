/**
 * QUI windows coordinator
 *
 * @module qui/classes/Controls
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require require
 * @require qui/classes/DOM
 * @require qui/utils/System
 */
define('qui/classes/Windows', [

    'require',
    'qui/classes/DOM',
    'qui/utils/System'

], function (require, DOM, SystemUtils) {
    "use strict";

    /**
     * @class qui/classes/Controls
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: DOM,
        Type   : 'qui/classes/Windows',

        Binds: [
            '$onWindowOpen',
            '$onWindowClose',
            '$onWindowDestroy'
        ],

        initialize: function () {
            this.$windows       = {};
            this.$currentWindow = null;

            try {
                this.calcWindowSize();
            } catch (e) {
                window.addEvent('domready', function () {
                    this.calcWindowSize();
                }.bind(this));
            }

            require(['qui/QUI'], function (QUI) {
                QUI.addEvent('onResize', function () {
                    if (!this.openedWindowsLength()) {
                        this.calcWindowSize();
                    }
                }.bind(this));
            }.bind(this));
        },

        /**
         * calculate the window size
         */
        calcWindowSize: function () {
            if (this.openedWindowsLength()) {
                return;
            }

            this.$oldBodyStyle = {
                overflow: document.body.style.overflow,
                position: document.body.style.position,
                width   : document.body.style.width,
                top     : document.body.style.top,
                scroll  : document.body.getScroll(),
                minWidth: document.body.style.minWidth
            };
        },

        /**
         * Register a popup at the coordinator
         *
         * @param {Object} Popup - qui/controls/windows/Popup
         */
        register: function (Popup) {
            Popup.addEvents({
                onOpenBegin: this.$onWindowOpen,
                onDestroy  : this.$onWindowDestroy,
                onClose    : this.$onWindowClose
            });

            this.$windows[Popup.getId()] = Popup;
        },

        /**
         * Return the initialized window length
         * how many windows / popups exists?
         *
         * @return {Number}
         */
        getLength: function () {
            return Object.getLength(this.$windows);
        },

        /**
         * return the number of the opened windows
         *
         * @returns {Number}
         */
        openedWindowsLength: function () {
            var openWindows = Object.map(this.$windows, function (Win) {
                return Win.isOpened() ? 1 : 0;
            });

            return Object.values(openWindows).sum();
        },

        /**
         * Event on window open
         *
         * @param {Object} Popup - qui/controls/windows/Popup
         */
        $onWindowOpen: function (Popup) {
            var maxIndex = this.$getmaxWindowZIndex();

            Popup.Background.getElm().setStyle('zIndex', maxIndex + 1);
            Popup.getElm().setStyle('zIndex', maxIndex + 2);

            this.$currentWindow = Popup;
        },

        /**
         * Event on window destroy
         *
         * @param {Object} Popup - qui/controls/windows/Popup
         */
        $onWindowDestroy: function (Popup) {
            if (this.$currentWindow == Popup) {
                this.$currentWindow = null;
            }

            if (Popup.getId() in this.$windows) {
                delete this.$windows[Popup.getId()];
            }
        },

        /**
         * Event on window close
         *
         * @param {Object} Popup - qui/controls/windows/Popup
         */
        $onWindowClose: function (Popup) {
            if (this.$currentWindow == Popup) {
                this.$currentWindow = null;
            }

            if (!this.openedWindowsLength()) {
                var oldStyle = this.$oldBodyStyle;

                document.body.setStyles({
                    overflow: oldStyle.overflow || null,
                    position: oldStyle.position || null,
                    width   : oldStyle.width || null,
                    top     : oldStyle.top || null,
                    minWidth: oldStyle.minWidth || null
                });

                // ios fix
                var ios = SystemUtils.iOSversion();

                if (ios) {
                    document.body.setStyles({
                        '-webkit-transform': null,
                        'transform'        : null
                    });
                }

                // scroll to old scroll pos
                document.body.scrollTo(
                    oldStyle.scroll.x,
                    oldStyle.scroll.y
                );
            }
        },

        /**
         * Return the max window index
         *
         * @return {Number}
         */
        $getmaxWindowZIndex: function () {
            var i, index;
            var currentIndex = 0;

            for (i in this.$windows) {
                if (!this.$windows.hasOwnProperty(i)) {
                    continue;
                }

                index = this.$windows[i].getElm().getStyle('zIndex').toInt();

                if (currentIndex < index) {
                    currentIndex = index;
                }
            }

            return currentIndex;
        },

        /**
         * open methods
         */

        /**
         * Create and opens an alert box
         *
         * @param {Object} params - alert box params
         * @returns {Promise}
         */
        openAlert: function (params) {
            return this.createAlert(params).then(function (Alert) {
                Alert.open();

                return Alert;
            });
        },

        /**
         * Create and opens a confirm box
         *
         * @param {Object} params - confirm box params
         * @returns {Promise}
         */
        openConfirm: function (params) {
            return this.createConfirm(params).then(function (Confirm) {
                Confirm.open();

                return Confirm;
            });
        },

        /**
         * Create and opens a popup box
         *
         * @param {Object} params - popup box params
         * @returns {Promise}
         */
        openPopup: function (params) {
            return this.createPopup(params).then(function (Popup) {
                Popup.open();

                return Popup;
            });
        },

        /**
         * Create and opens an alert box
         *
         * @param {Object} params - alert box params
         * @returns {Promise}
         */
        openPrompt: function (params) {
            return this.createPrompt(params).then(function (Prompt) {
                Prompt.open();

                return Prompt;
            });
        },

        /**
         * Create and opens an alert box
         *
         * @param {Object} params - alert box params
         * @returns {Promise}
         */
        openSubmit: function (params) {
            return this.createAlert(params).then(function (Alert) {
                Alert.open();

                return Alert;
            });
        },

        /**
         * create methods
         */

        /**
         * Create an alert box
         *
         * @param {Object} params - alert box params
         * @returns {Promise}
         */
        createAlert: function (params) {
            return new Promise(function (response, reject) {
                require(['qui/controls/windows/Alert'], function (Alert) {
                    response(new Alert(params));
                }, reject);
            });
        },

        /**
         * Create a confirm box
         *
         * @param {Object} params - alert box params
         * @returns {Promise}
         */
        createConfirm: function (params) {
            return new Promise(function (response, reject) {
                require(['qui/controls/windows/Confirm'], function (Confirm) {
                    response(new Confirm(params));
                }, reject);
            });
        },

        /**
         * Create a popup box
         *
         * @param {Object} params - alert box params
         * @returns {Promise}
         */
        createPopup: function (params) {
            return new Promise(function (response, reject) {
                require(['qui/controls/windows/Popup'], function (Popup) {
                    response(new Popup(params));
                }, reject);
            });
        },

        /**
         * Create a prompt box
         *
         * @param {Object} params - alert box params
         * @returns {Promise}
         */
        createPrompt: function (params) {
            return new Promise(function (response, reject) {
                require(['qui/controls/windows/Prompt'], function (Prompt) {
                    response(new Prompt(params));
                }, reject);
            });
        },

        /**
         * Create a submit box
         *
         * @param {Object} params - alert box params
         * @returns {Promise}
         */
        createSubmit: function (params) {
            return new Promise(function (response, reject) {
                require(['qui/controls/windows/Submit'], function (Submit) {
                    response(new Submit(params));
                }, reject);
            });
        }
    });
});
