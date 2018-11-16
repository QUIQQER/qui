/**
 * Locale translation class
 *
 * @module qui/classes/Locale
 * @author www.pcg.de (Henning Leutz)
 *
 * @event onError [ {String}, {this} ] - triggered if no_translation === false and no translation exist
 */

define('qui/classes/Locale', ['qui/classes/DOM'], function (DOM) {
    "use strict";

    /**
     * @class qui/classes/Locale
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: DOM,
        Type   : 'qui/classes/Locale',

        /**
         * Current lang, use getCurrent() to get the lang
         */
        current: 'en',

        /**
         * Available langs
         */
        langs: {},

        /**
         * No translation flag, makes no translation
         * if true, get() returns the translation group
         * usefull to show all translation groups
         */
        no_translation: false,

        /**
         * init
         *
         * @param options - dom options
         */
        initialize: function (options) {
            this.parent(options);
        },

        /**
         * Set the current lang
         *
         * @method qui/classes/Locale#setCurrent
         * @param {String} lang
         */
        setCurrent: function (lang) {
            this.current = lang;
        },

        /**
         * Return the current Lang
         *
         * @method qui/classes/Locale#getCurrent
         * @return {String}
         */
        getCurrent: function () {
            return this.current;
        },

        /**
         * Return list of translation groups
         *
         * @returns {Array}
         */
        getGroups: function () {
            if (!(this.current in this.langs)) {
                return [];
            }

            return Object.keys(this.langs[this.current]);
        },

        /**
         * Set a translation for a translation group
         *
         * @method qui/classes/Locale#set
         *
         * @param {String} lang - language, which is translated
         * @param {String} group - group, which is translated
         * @param {String|Object} values - variable(s) which is translated
         * @param {String} value - the translation value
         *
         * @example Locale.set("en", "my/group", "my.translation.variable", "Some text is translated")
         * @example Locale.set("de", "my/group", "my.translation.variable", "Ein Text der übersetzt wird")
         */
        set: function (lang, group, values, value) {
            if (!this.langs[lang]) {
                this.langs[lang] = {};
            }

            if (!this.langs[lang][group]) {
                this.langs[lang][group] = {};
            }

            if (typeof value !== 'undefined') {
                this.langs[lang][group][values] = value;
                return this;
            }

            var _key = this.langs[lang][group];

            for (var k in values) {
                if (values.hasOwnProperty(k)) {
                    _key[k] = values[k];
                }
            }

            this.langs[lang][group] = _key;
        },

        /**
         * Retrurn the translation of a translation group
         *
         * @method qui/classes/Locale#get
         *
         * @param {String} group - Group of the translation
         * @param {String} value - Translation value / name
         * @param {Object} repl  - Assoziative Array of replacements
         * @return {String}
         *
         * @example Locale.get('my/group', 'my.translation.variable')
         * @example Locale.get('my/group', 'my.translation.variable', {
         *      placeholder : 'my replace'
         * })
         */
        get: function (group, value, repl) {
            if (typeof repl === 'undefined') {
                return this.$get(group, value);
            }

            var result = this.$get(group, value);

            for (group in repl) {
                if (repl.hasOwnProperty(group)) {
                    result = result.replace(
                        new RegExp('\\[' + group + '\\]', "g"),
                        repl[group]
                    );
                }
            }

            return result;
        },

        /**
         * Helper for get translation
         *
         * @method qui/classes/Locale#$get
         *
         * @param {String} key   - Group / Key of the translation
         * @param {String} value - Translation value / name
         * @return {String}
         */
        $get: function (key, value) {
            if (this.no_translation) {
                return '[' + key + '] ' + value;
            }

            if (this.langs[this.current] &&
                this.langs[this.current][key] &&
                this.langs[this.current][key][value]) {
                return this.langs[this.current][key][value];
            }

            if (this.langs[this.current] &&
                this.langs[this.current][key] &&
                typeof value === 'undefined') {
                return this.langs[this.current][key];
            }

            this.fireEvent('error', [
                'No translation found for [' + key + '] ' + value,
                this
            ]);

            return '[' + key + '] ' + value;
        },

        /**
         * Exist the variable in the translation?
         *
         * @param {String} group
         * @param {String} value
         *
         * @returns {Boolean}
         */
        exists: function (group, value) {
            if (this.langs[this.current] &&
                this.langs[this.current][group] &&
                this.langs[this.current][group][value]) {
                return true;
            }

            if (this.langs[this.current] &&
                this.langs[this.current][group] &&
                typeof value === 'undefined') {
                return true;
            }

            return false;
        }
    });
});
