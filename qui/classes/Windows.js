
/**
 * QUI windows coordinator
 *
 * @module qui/classes/Controls
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require require
 * @require qui/classes/DOM
 */

define('qui/classes/Windows', [

    'require',
    'qui/classes/DOM'

], function(require, DOM)
{
    "use strict";

    /**
     * @class qui/classes/Controls
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: DOM,
        Type: 'qui/classes/Windows',

        Binds : [
            '$onWindowOpen',
            '$onWindowClose',
            '$onWindowDestroy'
        ],

        initialize: function ()
        {
            this.$windows = [];
            this.$currentWindow = null;
        },

        /**
         * Register a popup at the coordinator
         *
         * @param {Object} Popup - qui/controls/windows/Popup
         */
        register : function(Popup)
        {
            Popup.addEvents({
                onOpenBegin : this.$onWindowOpen,
                onDestroy   : this.$onWindowDestroy,
                onClose     : this.$onWindowClose
            });

            this.$windows.push(Popup);
        },

        /**
         * Event on window open
         *
         * @param {Object} Popup - qui/controls/windows/Popup
         */
        $onWindowOpen : function(Popup)
        {
            if (this.$currentWindow) {
                var groundIndex = this.$currentWindow.getElm().getStyle('zIndex');

                Popup.Background.getElm().setStyle('zIndex', groundIndex+1);
                Popup.getElm().setStyle('zIndex', groundIndex+2);
            }

            this.$currentWindow = Popup;
        },

        /**
         * Event on window destroy
         *
         * @param {Object} Popup - qui/controls/windows/Popup
         */
        $onWindowDestroy : function(Popup)
        {
            if (this.$currentWindow == Popup) {
                this.$currentWindow = null;
            }
        },

        /**
         * Event on window close
         *
         * @param {Object} Popup - qui/controls/windows/Popup
         */
        $onWindowClose : function(Popup)
        {
            if (this.$currentWindow == Popup) {
                this.$currentWindow = null;
            }
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
        openAlert : function(params)
        {
            return this.createAlert(params).then(function(Alert) {
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
        openConfirm : function(params)
        {
            return this.createConfirm(params).then(function(Confirm) {
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
        openPopup : function(params)
        {
            return this.createPopup(params).then(function(Popup) {
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
        openPrompt : function(params)
        {
            return this.createPrompt(params).then(function(Prompt) {
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
        openSubmit : function(params)
        {
            return this.createAlert(params).then(function(Alert) {
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
        createAlert : function(params)
        {
            return new Promise(function(response, reject) {
                require(['qui/controls/windows/Alert'], function(Alert) {
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
        createConfirm : function(params)
        {
            return new Promise(function(response, reject) {
                require(['qui/controls/windows/Confirm'], function(Confirm) {
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
        createPopup : function(params)
        {
            return new Promise(function(response, reject) {
                require(['qui/controls/windows/Popup'], function(Popup) {
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
        createPrompt : function(params)
        {
            return new Promise(function(response, reject) {
                require(['qui/controls/windows/Prompt'], function(Prompt) {
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
        createSubmit : function(params)
        {
            return new Promise(function(response, reject) {
                require(['qui/controls/windows/Submit'], function(Submit) {
                    response(new Submit(params));
                }, reject);
            });
        }
    });
});


