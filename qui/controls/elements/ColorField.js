/**
 * Form-field adapter for the shared ColorPopup.
 *
 * Use this control when a color belongs to a form: it renders a preview button,
 * owns the popup and keeps the selected value in a hidden input. It can create a
 * new field or import an existing input. For a popup attached to an arbitrary
 * button without a form input, use ColorPopup directly. The legacy ColorPicker
 * for ordinary input[type=color] remains a separate control.
 *
 * Import preserves the original input node, name, ID, dependency attributes and
 * listeners. Only the current backend's direct field-container layout transfers
 * its field-container-field class to the visible root; existing wrappers and
 * other layouts are left alone. Keep this compatibility logic in the adapter,
 * not in ColorPopup or in a global rule forcing all fields to full width.
 *
 * Popup editing is a draft. Apply updates the input and preview, dispatches one
 * bubbling DOM change event and emits change(Field, serializedValue, colorName).
 * Cancel, Escape and outside clicks leave the field value unchanged. setValue()
 * is silent; direct clear()/reset() commit immediately through the same events.
 * None of these actions saves to a server: persistence belongs to the form owner.
 *
 * Popup capabilities and labels are forwarded; references and dark variants are
 * opt-in. An optional provider supplies palette data without a Core/Presentation
 * runtime dependency. Destroying the field also destroys its owned popup.
 * Preserve value formats through ColorValue and keep input/event contracts intact.
 *
 * Backend forms call setProject(Project) automatically. The shared project contract
 * is getColorProvider(): provider or Promise<provider>. Only references-enabled
 * fields automatically load project colors; dark alone enables local pairs only.
 * setPalette({colors: ...}) or setProvider(provider) explicitly selects another
 * source and takes precedence over automatic project assignment. In a frontend,
 * setProject(project, palette) accepts supplied data without using a backend API.
 * Neither enabling a capability nor assigning a source converts plain hex to JSON.
 *
 * @module qui/controls/elements/ColorField
 * @see https://dev.quiqqer.com/quiqqer/core/-/wikis/color-controls
 */
define('qui/controls/elements/ColorField', [
    'qui/controls/Control',
    'qui/controls/elements/ColorValue',
    'qui/controls/elements/ColorPopup'
], function(QUIControl, ColorValue, ColorPopup) {
    'use strict';

    return new Class({
        Extends: QUIControl,
        Type: 'qui/controls/elements/ColorField',

        options: Object.assign({}, ColorPopup.prototype.options, {name: ''}),

        initialize: function(options) {
            this.parent(options);
            this.$value = this.getAttribute('value');
            this.addEvents({
                onImport: this.$onImport.bind(this),
                onDestroy: () => {
                    this.$disposed = true;
                    this.$Picker?.destroy();
                }
            });
        },

        create: function() {
            if (this.$Built) {return this.$Elm;}
            this.$Built = true;
            this.$Elm = document.createElement('div');
            this.$Elm.className = 'qui-colorField';
            this.$Elm.dataset.name = 'color-field';
            this.$Elm.dataset.quiid = this.getId();
            this.$Input = document.createElement('input');
            this.$Input.type = 'hidden';
            this.$Input.name = this.getAttribute('name');
            this.$Input.value = this.$value;
            this.$Input.disabled = this.getAttribute('disabled');
            this.$Elm.appendChild(this.$Input);
            this.$Trigger = document.createElement('button');
            this.$Trigger.type = 'button';
            this.$Trigger.dataset.name = 'trigger';
            this.$Trigger.className = 'qui-colorField-button qui-colorField-trigger';
            this.$Trigger.disabled = this.getAttribute('disabled');
            this.$Trigger.setAttribute('aria-haspopup', 'dialog');
            this.$Trigger.setAttribute('aria-expanded', 'false');
            this.$Trigger.addEventListener('click', () => this.open());
            this.$Elm.appendChild(this.$Trigger);

            const options = {};
            Object.keys(ColorPopup.prototype.options).forEach((name) => {
                options[name] = this.getAttribute(name);
            });
            // Register after construction: initial provider notifications need a complete adapter.
            this.$Picker = new ColorPopup(options);
            this.$Picker.addEvents({
                onChange: (Popup, value, name) => {
                    this.setAttribute('colorName', name);
                    this.$commit(value);
                },
                onRemove: () => this.fireEvent('remove', [this]),
                onPaletteLoad: () => this.$refresh(),
                onError: (Popup, message) => {this.$Trigger.title = message;}
            });
            this.$refresh();
            return this.$Elm;
        },

        $onImport: function() {
            const Input = this.getElm();
            this.$value = Input.dataset.realvalue === '' ? '' : Input.value;
            this.setAttribute('name', Input.name);
            this.setAttribute('disabled', Input.disabled);
            const Label = Input.closest('label');
            if (Label) {
                const Container = document.createElement('div');
                Container.className = Label.className;
                if (!this.getAttribute('label')) {this.setAttribute('label', Label.textContent.trim());}
                Container.append(...Label.childNodes);
                Label.replaceWith(Container);
            }
            const Elm = this.create();
            // Preserve the current backend row layout without duplicating an existing field wrapper.
            if (Input.classList.contains('field-container-field') &&
                Input.parentElement?.classList.contains('field-container') &&
                !Input.parentElement.classList.contains('field-container-field')) {
                Elm.classList.add('field-container-field');
                Input.classList.remove('field-container-field');
            }
            Input.replaceWith(Elm);
            // Dependency controls and form listeners may already hold this exact input.
            this.$Input.replaceWith(Input);
            this.$Input = Input;
            Input.type = 'hidden';
            Input.value = this.$value;
            Input.removeAttribute('data-qui');
            Input.removeAttribute('data-quiid');
            Input.removeAttribute('data-realvalue');
        },

        getValue: function() {return this.$value;},

        setValue: function(value) {
            this.$value = value;
            if (this.$Input) {
                this.$Input.value = value;
                this.$Picker.setValue(value);
                this.$refresh();
            }
            return this;
        },

        clear: function() {this.$commit('');},
        reset: function() {this.$commit(this.getAttribute('defaultcolor') || '');},

        $commit: function(value) {
            const serialized = ColorValue.serialize(value, {
                references: this.getAttribute('references'),
                dark: this.getAttribute('dark')
            });
            this.setValue(serialized);
            this.$Input.dispatchEvent(new Event('change', {bubbles: true}));
            this.fireEvent('change', [this, serialized, this.getAttribute('colorName')]);
        },

        $refresh: function() {
            this.$Picker.renderPreview(this.$Trigger, this.$value);
        },

        open: function() {
            if (this.$disposed || this.getAttribute('disabled')) {return;}
            this.getElm();
            Object.keys(ColorPopup.prototype.options).forEach((name) => {
                if (name !== 'provider' && name !== 'value') {
                    this.$Picker.setAttribute(name, this.getAttribute(name));
                }
            });
            this.$Picker.setValue(this.$value);
            this.$Picker.open(this.getAttribute('anchor') || this.$Trigger);
        },

        close: function(restoreFocus = true) {
            this.$Picker?.close(restoreFocus);
        },

        setProvider: function(provider) {
            this.setAttribute('provider', provider);
            this.setAttribute('palette', null);
            if (!this.$Built) {return;}
            return this.$Picker.setProvider(provider);
        },

        /** Backend forms already supply their owning project through this method. */
        setProject: function(project, palette) {
            this.setAttribute('project', project);
            if (palette !== undefined) {
                this.setAttribute('palette', palette);
                this.setAttribute('provider', null);
            }
            if (!this.$Built) {return Promise.resolve();}
            return this.$Picker.setProject(project, palette);
        },

        setPalette: function(palette) {
            this.setAttribute('palette', palette);
            this.setAttribute('provider', null);
            if (!this.$Built) {return Promise.resolve();}
            return this.$Picker.setPalette(palette);
        },

        reload: function() {
            return this.$Picker?.reload() || Promise.resolve();
        }
    });
});
