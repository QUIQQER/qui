/**
 * Set a suggest to an input field
 *
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/QUI
 * @require qui/controls/Control
 * @require css!qui/controls/input/Suggest.css
 *
 * @event onChange
 * @event onShowBegin [self]
 * @event onShow [self]
 * @event onRefresh
 * @event onSelect [data]
 */
define('qui/controls/input/Suggest', [

    'qui/QUI',
    'qui/controls/Control',

    'css!qui/controls/input/Suggest.css'

], function (QUI, QUIControl) {
    "use strict";

    return new Class({

        Extends: QUIControl,
        Type   : 'qui/controls/input/Suggest',

        Binds: [
            '$onImport',
            '$onCreate',
            '$onKeyup',
            '$onFocus',
            '$onBlur'
        ],

        options: {
            delay     : 200,
            autosearch: true
        },

        initialize: function (options) {
            this.parent(options);

            this.$Input = null;
            this.$Delay = null;
            this.$data  = [];

            this.$Suggests = null;
            this.$open     = false;
            this.$Active   = null;

            this.addEvents({
                onImport: this.$onImport,
                onCreate: this.$onCreate
            });
        },

        /**
         * Create the DOMNode Element
         *
         * @returns {HTMLInputElement}
         */
        create: function () {
            this.$Elm = new Element('div', {
                styles: {
                    display : 'inline',
                    position: 'relative'
                }
            });

            if (this.$Input) {
                this.$Elm.wraps(this.$Input);
            } else {
                this.$Input = new Element('input');
                this.$Input.inject(this.$Elm);
            }

            if (this.getAttribute('styles')) {
                this.$Input.setStyles(this.getAttribute('styles'));
            }

            this.$Input.setStyles({
                display: 'block'
            });

            var inputSize = this.$Input.getComputedSize();

            this.$Suggests = new Element('div', {
                'class': 'qui-suggests-container',
                styles : {
                    display: 'none',
                    top    : inputSize.totalHeight,
                    width  : inputSize.width
                }
            });

            this.$Suggests.inject(this.$Elm);

            this.bindElementEvents();

            return this.$Elm;
        },

        /**
         * Return the INPUT element
         *
         * @returns {HTMLInputElement}
         */
        getInput: function () {
            return this.$Input;
        },

        /**
         * Show suggests
         */
        showSuggest: function () {
            if (this.$open) {
                return;
            }

            this.$open = true;

            this.$Suggests.setStyles({
                display: null,
                opacity: 0
            });

            this.fireEvent('showBegin', [this]);

            moofx(this.$Suggests).animate({
                opacity: 1
            }, {
                duration: 200,
                callback: function () {
                    this.fireEvent('show', [this]);
                }.bind(this)
            });
        },

        /**
         * Hide suggests
         */
        hideSuggest: function () {
            moofx(this.$Suggests).animate({
                opacity: 0
            }, {
                duration: 200,
                callback: function () {
                    this.$Suggests.setStyle('display', 'none');
                    this.$open = false;
                }.bind(this)
            });
        },

        /**
         * select the selected dropdown element
         */
        select: function () {
            if (!this.$open) {
                return;
            }

            if (!this.$Active) {
                return;
            }

            var index = parseInt(this.$Active.get('data-index'));

            if (typeof this.$data[index] === 'undefined') {
                return;
            }

            this.fireEvent('select', this.$data[index]);

            this.$Input.value = this.$data[index].text;
            this.hideSuggest();
        },

        /**
         * Suggest go down
         */
        goDown: function () {
            this.showSuggest();

            if (!this.$Active) {
                var Active = this.$Suggests.getFirst('ul li');

                if (!Active) {
                    return;
                }

                this.$Active = Active;
                this.$Active.addClass('qui-suggests-container-active');
                return;
            }

            var Next = this.$Active.getNext('li');

            if (!Next) {
                Next = this.$Suggests.getFirst('ul li');
            }

            if (!Next) {
                return;
            }

            this.$Active.removeClass('qui-suggests-container-active');
            this.$Active = Next;
            this.$Active.addClass('qui-suggests-container-active');
        },

        /**
         * Suggest go up
         */
        goUp: function () {
            this.showSuggest();

            if (!this.$Active) {
                var Active = this.$Suggests.getLast('ul li');

                if (!Active) {
                    return;
                }

                this.$Active = Active;
                this.$Active.addClass('qui-suggests-container-active');
                return;
            }

            var Prev = this.$Active.getPrevious('li');

            if (!Prev) {
                Prev = this.$Suggests.getLast('ul li');
            }

            if (!Prev) {
                return;
            }

            this.$Active.removeClass('qui-suggests-container-active');
            this.$Active = Prev;
            this.$Active.addClass('qui-suggests-container-active');
        },

        /**
         * refresh suggest list
         */
        refreshSuggest: function () {
            var html   = '<ul>',
                search = this.getAttribute('autosearch'),
                value  = this.$Input.value;

            for (var i = 0, len = this.$data.length; i < len; i++) {
                if (search) {
                    if (this.$data[i].text.match(value)) {
                        html = html + '<li data-index="' + i + '">' +
                               this.$data[i].text +
                               '</li>';
                    }

                    continue;
                }

                html = html + '<li data-index="' + i + '">' +
                       this.$data[i].text +
                       '</li>';
            }

            html = html + '</ul>';

            this.$Suggests.set('html', html);
            this.fireEvent('refresh', this);
        },

        /**
         * event methods
         */

        /**
         * event on import
         */
        $onImport: function () {
            var Elm = this.getElm();

            if (Elm.nodeName == 'INPUT') {
                this.$Input = Elm;
                this.create();
                return;
            }

            this.create().inject(Elm);
        },

        /**
         * Bind all key events to the input element
         */
        bindElementEvents: function () {
            this.$Input.addEvents({
                keyup: this.$onKeyup,
                focus: this.$onFocus,
                blur : this.$onBlur
            });
        },

        /**
         * event : on key up
         * @param {Event} event
         */
        $onKeyup: function (event) {
            if (event.key == 'down') {
                this.goDown();
                return;
            }

            if (event.key == 'up') {
                this.goUp();
                return;
            }

            if (event.key == 'enter') {
                this.select();
                return;
            }

            if (this.$Delay) {
                clearTimeout(this.$Delay);
            }

            this.$Delay = (function () {
                this.showSuggest();
                this.refreshSuggest();
                this.fireEvent('change', this);
            }).delay(this.getAttribute('delay'), this);
        },

        /**
         * on focus
         */
        $onFocus: function () {
            this.showSuggest();
        },

        /**
         * on blur
         */
        $onBlur: function () {
            this.hideSuggest();
        },

        /**
         * option methods
         */

        /**
         * Clear all options
         */
        clearOptions: function () {
            this.options = [];
            this.$Suggests.set('html', '');
        },

        /**
         * Add on option entry
         *
         * @param {String} text - text
         * @param {String} value - value
         * @param {String} icon - icon
         */
        addOption: function (text, value, icon) {
            text  = text || '';
            value = value || '';
            icon  = icon || '';

            this.$data.push({
                text : text,
                value: value,
                icon : icon
            });
        },

        /**
         * Set multible option entries
         *
         * @param {Object} data
         */
        addOptions: function (data) {
            var i, text, value, icon;

            for (i in data) {
                if (!data.hasOwnProperty(i)) {
                    continue;
                }

                text  = data[i].text || '';
                value = data[i].value || '';
                icon  = data[i].icon || '';

                this.$data.push({
                    text : text,
                    value: value,
                    icon : icon
                });
            }
        }
    });
});
