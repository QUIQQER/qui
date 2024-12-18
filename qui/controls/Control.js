/**
 * Control standard parent class
 * All controls should inherit {qui/controls/Control}
 *
 * @module qui/controls/Control
 * @author www.pcsg.de (Henning Leutz)
 *
 * @event onInject [ this ]
 * @event onHighlight [ this ]
 * @event onNormalize [ this ]
 * @event onResize [ this ]
 */
define('qui/controls/Control', [

    'qui/QUI',
    'qui/Locale',
    'qui/classes/DOM',

    'css!qui/controls/Control.css'

], function(QUI, Locale, DOM) {
    'use strict';

    /**
     * @class qui/controls/Control
     *
     * @event onDrawBegin - if inject() is used, the Event will be triggered
     * @event onDrawEnd   - if inject() is used, the Event will be triggered
     *
     * @param {Object} options
     *
     * @memberof! <global>
     */
    return new Class({

        Extends: DOM,
        Type: 'qui/controls/Control',

        $Parent: false,

        options: {
            name: ''
        },

        /**
         * Init function for inherited classes
         * If a Class inherit from qui/controls/Control, please use this.parent()
         * so the control are registered in QUI.Controls
         * and you can get the control with QUI.Controls.get()
         *
         * @method qui/controls/Control#init
         * @param {Object} options - option params
         */
        initialize: function(options) {
            this.parent(options);

            QUI.Controls.add(this);
            QUI.Controls.ElementQueries.update();
        },

        /**
         * Create Method, can be overwritten for an own DOM creation
         *
         * @method qui/controls/Control#create
         * @return {HTMLElement}
         */
        create: function() {
            if (this.$Elm) {
                return this.$Elm;
            }

            this.$Elm = new Element('div.qui-control');
            this.$Elm.set('data-quiid', this.getId());


            return this.$Elm;
        },

        /**
         * Destroy the Object and all relationships to some Object
         *
         * @method qui/controls/Control#destroy
         */
        destroy: function() {
            this.fireEvent('destroy', [this]);

            if (typeof this.$Elm !== 'undefined' && this.$Elm) {
                this.$Elm.destroy();
            }

            // destroy internal qui controls
            var controls = QUI.Controls.getControlsInElement(this.$Elm),
                controlIds = controls.map(function(InnerControl) {
                    return InnerControl.getId();
                });

            controlIds.each(function(InnerControl) {
                QUI.Controls.destroy(InnerControl);
            });

            this.$Elm = null;
            this.fireEvent('destroyEnd', [this]); // don't move this, if the object no longer exists, the event is not triggered

            // storage clear
            var oid = Slick.uidOf(this);

            if (oid in window.$quistorage) {
                delete window.$quistorage[oid];
            }

            // cant use this.removeEvents, here was/is a mootools bug
            delete this.$events;
        },

        /**
         * Inject the DOMNode of the Control to a Parent
         *
         * @method qui/controls/Control#inject
         * @param {HTMLElement|Object} Parent - (qui/controls/Control) Parent Element
         * @param {String} [pos] - optional
         * @return {Object} qui/controls/Control
         */
        inject: function(Parent, pos) {
            this.fireEvent('drawBegin', [this]);

            if (typeof this.$Elm === 'undefined' || !this.$Elm) {
                this.$Elm = this.create();
            }

            if (this.$Elm.getParent() === Parent) {
                return this;
            }

            if (typeof QUI !== 'undefined' &&
                typeof QUI.Controls !== 'undefined' &&
                QUI.Controls.isControl(Parent)) {
                // QUI Control insertion

                if (this.$Elm.getParent() === Parent.getElm()) {
                    return this;
                }

                Parent.appendChild(this);
            } else {
                // DOMNode insertion
                this.$Elm.inject(Parent, pos);
            }

            this.$Elm.set('data-quiid', this.getId());

            this.fireEvent('inject', [this]);

            (function() {
                try {
                    this.$Elm.fireEvent('load');
                } catch (e) {
                    if (this.getElm()) {
                        this.getElm().fireEvent('load');
                    }
                }

            }).delay(200, this);

            return this;
        },

        /**
         * Import the control to the element
         * The Elm node is the main element, now, and are returned with getElm()
         * if you want to insert the control to a specific place, use inject(),
         *
         * if the html from the control already exists, use import
         * The import() method is for controls, where the html of the control are generated by the server
         *
         * @param {HTMLElement} Elm - Elm node
         * @return {Object} qui/controls/Control
         */
        imports: function(Elm) {
            this.$Elm = Elm;

            this.$readDataOptions(Elm);

            this.$Elm.set('data-quiid', this.getId());
            this.fireEvent('import', [this, Elm]);

            try {
                this.$Elm.fireEvent('load');
            } catch (e) {
                if (this.getElm()) {
                    this.getElm().fireEvent('load');
                }
            }

            return this;
        },

        /**
         * Replaces the passed element with the control element.
         * and assumes the characteristics of the element
         *
         * @param {HTMLElement} Elm - Elm node
         * @return {Object} qui/controls/Control
         */
        replaces: function(Elm) {
            if (this.$Elm) {
                return this.$Elm;
            }

            if (typeof Elm.styles !== 'undefined') {
                this.setAttribute('styles', Elm.styles);
            }

            this.$readDataOptions(Elm);

            var i, len, attr;
            var data = Elm.attributes;

            this.fireEvent('replace', [this, Elm]);
            this.$Elm = this.create();

            for (i = 0, len = data.length; i < len; i++) {
                attr = data[i];
                if (attr.nodeValue !== '') {
                    this.$Elm.set(attr.nodeName, attr.nodeValue);
                }
            }

            this.$Elm.set('data-quiid', this.getId());

            if (Elm.getParent()) {
                this.$Elm.replaces(Elm);
            }

            this.fireEvent('inject', [this]);

            return this;
        },

        /**
         * Read options from DOMNode Element
         *
         * @param {HTMLElement} [Elm]
         */
        $readDataOptions: function(Elm) {
            var TempElm = Elm || this.getElm();

            var attribute, attrName, attrValue, numb;
            var attributes = TempElm.attributes;

            for (var i = 0, len = attributes.length; i < len; i++) {
                attribute = attributes[i];
                attrName = attribute.name;

                if (!attrName.match('data-qui-options-')) {
                    continue;
                }

                attrValue = attribute.value;
                numb = Number.from(attrValue);

                if (typeOf(numb) === 'number' && numb == attrValue) {
                    attrValue = numb;
                }

                this.setAttribute(
                    attrName.replace('data-qui-options-', ''),
                    attrValue
                );
            }
        },

        /**
         * Save the control
         * Placeholder method for sub controls
         *
         * The save method returns all needed attributes for saving the control to the workspace
         * You can overwrite the method in sub classes to save specific attributes
         *
         * @method qui/controls/Control#serialize
         * @return {Object}
         */
        serialize: function() {
            return {
                attributes: this.getAttributes(),
                type: this.getType()
            };
        },

        /**
         * import the saved attributes and the data
         * You can overwrite the method in sub classes to import specific attributes
         *
         * @method qui/controls/Control#unserialize
         * @param {Object} data
         */
        unserialize: function(data) {
            if (data.attributes) {
                this.setAttributes(data.attributes);
            }
        },

        /**
         * Get the DOMNode from the Button
         *
         * @method qui/controls/Control#getElm
         * @return {HTMLElement}
         */
        getElm: function() {
            if (typeof this.$Elm === 'undefined' || !this.$Elm) {
                this.create();
            }

            return this.$Elm;
        },

        /**
         * If the control have a QUI_Object Parent
         *
         * @method qui/controls/Control#getParent
         * @return {Object|Boolean} qui/controls/Control | false
         */
        getParent: function() {
            return this.$Parent || false;
        },

        /**
         * Set the Parent to the Button
         *
         * @method qui/controls/Control#setParent
         *
         * @param {Object} Parent - qui/controls/Control
         * @return {Object} qui/controls/Control
         */
        setParent: function(Parent) {
            this.$Parent = Parent;
            return this;
        },

        /**
         * Return a path string from the parent names
         *
         * @method qui/controls/Control#getPath
         * @return {String}
         */
        getPath: function() {
            var path = '/' + this.getAttribute('name'),
                Parent = this.getParent();

            if (!Parent) {
                return path;
            }

            return Parent.getPath() + path;
        },

        /**
         * Hide the control
         *
         * @method qui/controls/Control#hide
         * @return {Object} qui/controls/Control
         */
        hide: function() {
            if (this.$Elm) {
                this.$Elm.setStyle('display', 'none');
            }

            return this;
        },

        /**
         * Display / Show the control
         *
         * @method qui/controls/Control#show
         * @return {Object} qui/controls/Control
         */
        show: function() {
            if (this.$Elm) {
                this.$Elm.setStyle('display', null);
            }

            return this;
        },

        /**
         * Is the control hidden?
         *
         * @return {Boolean}
         */
        isHidden: function() {
            if (!this.$Elm) {
                return true;
            }

            return this.$Elm.getStyle('display') === 'none';
        },

        /**
         * Highlight the control
         *
         * @method qui/controls/Control#highlight
         * @return {Object} qui/controls/Control
         */
        highlight: function() {
            this.fireEvent('highlight', [this]);
            return this;
        },

        /**
         * Dehighlight / Normalize the control
         *
         * @method qui/controls/Control#normalize
         * @return {Object} qui/controls/Control
         */
        normalize: function() {
            this.fireEvent('normalize', [this]);
            return this;
        },

        /**
         * Focus the DOMNode Element
         *
         * @method qui/controls/Control#focus
         * @return {Object} qui/controls/Control
         */
        focus: function() {
            if (this.$Elm) {
                // try catch for ie 8 fix
                try {
                    this.$Elm.focus();
                } catch (e) {
                }
            }

            return this;
        },

        /**
         * Resize the control
         *
         * @method qui/controls/Control#resize
         */
        resize: function() {
            this.fireEvent('resize', [this]);
        },

        /**
         * set css styles
         *
         * @param {Object} styles
         */
        setStyles: function(styles) {
            this.getElm().setStyles(styles);
        },

        /**
         * set css style
         *
         * @param {String} key
         * @param {String|Number} value
         */
        setStyle: function(key, value) {
            this.getElm().setStyle(key, value);
        },


        /**
         * create and open a new sheet
         *
         * @method qui/controls/Control#openSheet
         * @param {Function} onfinish - callback function
         * @param {Object} [options] - optional { nobuttons : true }
         */
        openSheet: function(onfinish, options) {
            var self = this;

            options = options || {};

            options = Object.merge({
                buttons: true
            }, options);

            var Sheet = new Element('div', {
                'class': 'qui-sheet qui-box',
                html: '<div class="qui-sheet-content box"></div>' +
                    '<div class="qui-sheet-buttons box">' +
                    '<div class="qui-sheet-buttons-back qui-button btn-white">' +
                    '<span>' +
                    Locale.get('qui/controls/Control', 'btn.back') +
                    '</span>' +
                    '</div>' +
                    '</div>',
                styles: {
                    display: 'none',
                    left: -20,
                    opacity: 0
                }
            }).inject(this.$Elm);

            Sheet.getElement('.qui-sheet-buttons-back').addEvent(
                'click',
                function() {
                    Sheet.fireEvent('close');
                }
            );

            var oldOverflow = this.getElm().getStyle('overflow');

            Sheet.addEvent('close', function() {
                self.getElm().setStyle('overflow', oldOverflow);

                moofx(Sheet).animate({
                    left: -20,
                    opacity: 0
                }, {
                    duration: 200,
                    callback: function() {
                        Sheet.destroy();
                    }
                });
            });

            // heights
            var Content = Sheet.getElement('.qui-sheet-content');

            Content.setStyles({
                height: 'calc(100% - 50px)'
            });

            this.getElm().setStyle('overflow', 'hidden');

            if (options.buttons === false) {
                Sheet.getElement('.qui-sheet-buttons').destroy();

                Content.setStyles({
                    height: '100%'
                });
            }


            // effect
            Sheet.setStyle('display', null);

            moofx(Sheet).animate({
                left: 0,
                opacity: 1
            }, {
                duration: 200,
                callback: function() {
                    onfinish(Content, Sheet);
                }
            });

            return Sheet;
        }
    });
});
