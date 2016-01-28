/**
 * QUI control Manager
 *
 * @module qui/classes/Controls
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require require
 * @require qui/classes/DOM
 * @require qui/lib/element-query/ElementQuery
 */
define('qui/classes/Controls', [

    'require',
    'qui/classes/DOM',
    'qui/lib/element-query/ElementQuery'

], function (require, DOM, ElementQuery) {
    "use strict";

    /**
     * @class qui/classes/Controls
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: DOM,
        Type   : 'qui/classes/Controls',

        initialize: function () {
            this.$controls = {};
            this.$cids     = {};
            this.$types    = {};

            this.ElementQueries = new ElementQuery();
        },

        /**
         * Return all controls with tha name
         *
         * @method qui/classes/Controls#get
         * @param {String} n - Name of the Control
         * @return {Array} All Controls with the needle name
         */
        get: function (n) {
            if (typeof this.$controls[n] === 'undefined') {
                return [];
            }

            return this.$controls[n];
        },

        /**
         * Get the Controls by its unique id
         *
         * @method qui/classes/Controls#getById
         * @param {String|Number} id - ID of the wanted Control
         * @return {Object|Boolean} (qui/controls/Control) a QUI control, based on qui/controls/Control or false
         */
        getById: function (id) {
            if (id in this.$cids) {
                return this.$cids[id];
            }

            return false;
        },

        /**
         * Return all QUI Controls in the HTML node Element
         *
         * @param {HTMLElement} Node
         * @return {Array}
         */
        getControlsInElement: function (Node) {
            var i, len, Control;

            if (!Node) {
                return [];
            }

            var list     = [];
            var elements = Node.getElements('[data-quiid]');

            for (i = 0, len = elements.length; i < len; i++) {
                Control = this.getById(elements[i].get('data-quiid'));

                if (Control) {
                    list.push(Control);
                }
            }

            return list;
        },

        /**
         * Return all controls from a type
         *
         * @method qui/classes/Controls#getByType
         * @return {Array}
         */
        getByType: function (type) {
            if (type in this.$types) {
                return this.$types[type];
            }

            return [];
        },

        /**
         * Load a control by a control type
         *
         * @method qui/classes/Controls#loadType
         * @param {String} type
         * @param {Function} onload
         *
         * @example QUI.Controls.loadType('qui/controls/taskbar/Task', function(Modul) { })
         * @deprecated
         */
        loadType: function (type, onload) {
            if (!type.match(/qui\//)) {
                type = 'qui/' + type;
            }

            require([type], onload);
        },

        /**
         * Is the Object a QUI Control?
         *
         * @method qui/controls/Control#isControl
         * @return {Boolean} Obj - true or false
         */
        isControl: function (Obj) {
            if (typeof Obj === 'undefined' || !Obj) {
                return false;
            }

            return typeof Obj.getType !== 'undefined';
        },

        /**
         * Add a Control to the list
         *
         * @method qui/controls/Control#add
         * @param {Object} Control - (qui/controls/Control)
         */
        add: function (Control) {
            var s = this,
                n = Control.getAttribute('name'),
                t = typeOf(Control);

            if (!n || n === '') {
                n = '#unknown';
            }

            if (typeof this.$controls[n] === 'undefined') {
                this.$controls[n] = [];
            }

            if (typeof this.$types[t] === 'undefined') {
                this.$types[t] = [];
            }

            this.$controls[n].push(Control);
            this.$types[t].push(Control);

            this.$cids[Control.getId()] = Control;

            Control.addEvent('onDestroy', function () {
                s.destroy(Control);
            });
        },

        /**
         * Destroy a Control
         *
         * @method qui/controls/Control#destroy
         * @param {Object} Control - (qui/controls/Control)
         */
        destroy: function (Control) {

            if (typeOf(Control) === 'string') {
                Control = this.getById(Control);
            }

            if (this.isControl(Control) === false) {
                return;
            }

            var n  = Control.getAttribute('name'),
                t  = typeOf(Control),
                id = Control.getId();

            if (!n || n === '') {
                n = '#unknown';
            }

            if (typeof this.$cids[id] !== 'undefined') {
                delete this.$cids[id];
            }

            var i, len;
            var tmp = [];

            // refresh controls
            if (typeof this.$controls[n] !== 'undefined') {
                for (i = 0, len = this.$controls[n].length; i < len; i++) {
                    if (id !== this.$controls[n][i].getId()) {
                        tmp.push(this.$controls[n][i]);
                    }
                }

                this.$controls[n] = tmp;

                if (!tmp.length) {
                    delete this.$controls[n];
                }
            }

            // refresh types
            tmp = [];

            if (typeof this.$types[t] !== 'undefined') {
                for (i = 0, len = this.$types[t].length; i < len; i++) {
                    if (id !== this.$types[t][i].getId()) {
                        tmp.push(this.$types[t][i]);
                    }
                }
            }

            this.$types[t] = tmp;
        }
    });
});