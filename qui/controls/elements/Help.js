/**
 * Display a help message
 *
 * @module qui/controls/elements/Help
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onClick [self]
 */

define('qui/controls/elements/Help', [

    'qui/QUI',
    'qui/controls/Control',

    'css!qui/controls/elements/Help.css'

], function(QUI, QUIControl) {
    'use strict';

    return new Class({

        Extends: QUIControl,
        Type: 'qui/controls/elements/Help',

        Binds: [
            '$onInject'
        ],

        options: {
            text: '',
            link: false,
            nowrap: true
        },

        initialize: function(options) {
            this.parent(options);

            this.addEvents({
                onInject: this.$onInject
            });
        },

        /**
         * Return the DOMNode Element
         *
         * @returns {HTMLDivElement}
         */
        create: function() {
            var text = this.getAttribute('text'),
                icon = '<span class="fa fa-question-circle icon-question-sign"></span>';

            this.$Elm = new Element('div', {
                'class': 'qui-elements-help',
                html: '<div class="qui-elements-help-cell">' + icon + text + '</div>'
            });


            if (this.getAttribute('nowrap')) {

                text = text.replace('<p>', '').replace('</p>', '');

                this.$Elm.addClass('qui-elements-help-nowrap');

                this.$Elm.setStyles({
                    cursor: 'pointer',
                    display: 'table',
                    tableLayout: 'fixed',
                    width: '100%'
                });

                this.$Elm.addEvent('click', function() {
                    if (this.getAttribute('link')) {
                        window.open(this.getAttribute('link'));
                    }

                    this.fireEvent('click', [this]);
                }.bind(this));

                this.$Elm.set(
                    'html',
                    '<div class="qui-elements-help-cell">' + icon + text + '</div>'
                );

                this.$Elm.getElements('br').destroy();

                this.$Elm.set(
                    'title',
                    this.$Elm.getElement('.qui-elements-help-cell').get('text')
                );
            }

            return this.$Elm;
        },

        /**
         * event on inject
         */
        $onInject: function() {
            if (this.getAttribute('nowrap')) {

                (function() {
                    var size = this.getElm().getSize();


                }.delay(200, this));
            }
        }
    });
});