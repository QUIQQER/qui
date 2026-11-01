/**
 * Standalone, trigger-anchored color-selection dialog without a form input.
 *
 * Use this control for direct palette editing or other callers that own their
 * value and persistence. ColorField wraps it for ordinary form integration.
 * ColorEditor renders the concrete-color editor; ColorValue handles parsing,
 * conversion and serialization. Shared styling lives in ColorField.css.
 * This is independent of the legacy ColorPicker for input[type=color].
 *
 * open(anchor) starts a private draft. Apply commits locally and emits
 * change(Popup, serializedValue, colorName); Cancel, Escape and outside clicks
 * discard the draft. getValue() returns the committed value, not live edits.
 * setValue() is silent. Reset/Clear in the UI only edit the draft, whereas the
 * public reset()/clear() methods commit immediately and emit change.
 * No action writes to a server; the caller owns the subsequent form save.
 *
 * An optional provider supplies palette data and updates. Without one, concrete
 * colors remain usable. references and dark are independent opt-in capabilities;
 * never infer them just from provider availability. References identify an entire
 * palette color, including both variants. Tab navigation must not unlink them:
 * converting to a concrete value requires the explicit unlink/copy action.
 * Field clearing must not archive or delete a project palette entry.
 *
 * Preserve ColorValue's existing formats and alpha precision. Invalid editor text
 * blocks Apply rather than being silently discarded. Keep focus restoration,
 * nested Escape handling and listener/provider cleanup when changing the UI.
 * Destroy the popup with its owner; async palette results must not revive it.
 * Core/Presentation integration and translations are injected, not dependencies.
 *
 * setProject(project) uses an optional getColorProvider() contract. Project palettes
 * are loaded automatically only with references enabled; provider labels can also
 * localize plain fields. Explicit setPalette(data)/setProvider(provider) overrides
 * project selection. setProject(project, palette) works with frontend-supplied data
 * without a CMS endpoint. Explicit sources may also offer copy-only palette selection
 * when references is false. No source changes the capabilities or stored value.
 *
 * @module qui/controls/elements/ColorPopup
 * @see https://dev.quiqqer.com/quiqqer/core/-/wikis/color-controls
 */
define('qui/controls/elements/ColorPopup', [
    'qui/controls/Control',
    'qui/controls/elements/ColorValue',
    'qui/controls/elements/ColorEditor',
    'css!qui/controls/elements/ColorField.css'
], function(QUIControl, ColorValue, ColorEditor) {
    'use strict';

    const labels = {
        color: 'Color', own: 'Custom color', linked: 'Uses project color', copy: 'Copy without link',
        light: 'Light', dark: 'Dark', different: 'Separate light & dark', clear: 'Remove color', reset: 'Reset',
        add: 'Add as named project color', remove: 'Remove color', name: 'Name', builtin: 'Project colors',
        custom: 'Own project colors', archived: 'Removed; existing links are retained',
        removeHelp: 'Remove from selection? Existing links retain this color.', confirmRemove: 'Confirm removal',
        invalid: 'Invalid or incomplete color value. Please correct it or cancel.',
        error: 'The palette could not be loaded or changed.', empty: 'No color selected', loading: 'Loading palette…',
        apply: 'Apply', cancel: 'Cancel', back: 'Back to palette', unlink: 'Use as custom color (unlink)',
        chooseVariant: 'Choose the value to copy', merge: 'Choose the color to keep',
        hue: 'Hue', saturation: 'Saturation', brightness: 'Brightness', alpha: 'Opacity',
        surfaceHelp: 'Arrow keys: saturation and brightness. Shift: larger steps.',
        more: 'More actions', advanced: 'Fine tuning', format: 'Format', showNames: 'Show names',
        single: 'One color', pair: 'Light & Dark', projectColor: 'Project color', individual: 'Custom',
        resetHelp: 'Restore the configured default', clearHelp: 'Leave the field without a color',
        copyValue: 'Copy color value', copyLight: 'Copy light', copyDark: 'Copy dark',
        copied: 'Color value copied.', copyError: 'Could not copy the color value.',
        linkedHelp: 'is linked. Changes to the palette also update this field.',
        mergeTitle: 'Use only one color?', mergeHelp: 'Which color should apply to light and dark?',
        keepLight: 'Keep light', keepDark: 'Keep dark', keepPair: 'Keep separate',
        brand: 'Brand colors', status: 'Status colors', neutral: 'Neutral colors', content: 'Content', other: 'Other'
    };

    return new Class({
        Extends: QUIControl,
        Type: 'qui/controls/elements/ColorPopup',

        options: {
            value: '', label: '', references: false, dark: false,
            defaultcolor: false, provider: null, project: null, palette: null, labels: {}, colorNames: {}, disabled: false,
            editableName: false, colorName: '', removable: false, anchor: null, clearable: true, startView: 'palette'
        },

        initialize: function(options) {
            this.parent(options);
            this.$value = this.getAttribute('value');
            this.$palette = {colors: {}};
            this.$labels = Object.assign({}, labels, this.getAttribute('labels'));
            this.$generation = 0;
            this.$disposed = false;
            this.addEvents({
                onDestroy: () => {
                    this.$disposed = true;
                    this.$generation++;
                    this.$busy = false;
                    this.close(false);
                    this.$unsubscribe?.();
                }
            });
            const palette = this.getAttribute('palette');
            this.setProvider(this.getAttribute('provider'));
            if (!this.$customProvider && palette) {
                this.setPalette(palette);
            }
            if (this.getAttribute('project')) {
                this.setProject(this.getAttribute('project'));
            }
        },

        create: function() {
            if (this.$Elm) {return this.$Elm;}
            this.$Elm = document.createElement('div');
            this.$Elm.className = 'qui-colorField qui-colorField-popup';
            this.$Elm.dataset.name = 'color-popup';
            this.$Elm.dataset.quiid = this.getId();
            this.$Elm.id = 'color-popup-' + this.getId();
            this.$Elm.setAttribute('role', 'dialog');
            this.$Elm.setAttribute('popover', 'manual');
            return this.$Elm;
        },

        $button: function(parent, text, action, name = 'action') {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'qui-colorField-button';
            button.dataset.name = name;
            button.textContent = text;
            button.addEventListener('click', action);
            parent.appendChild(button);
            return button;
        },

        $text: function(parent, text) {
            const p = document.createElement('p');
            p.textContent = text;
            parent.appendChild(p);
            return p;
        },

        $icon: function(name, style = 'solid') {
            const icon = document.createElement('span');
            icon.className = 'qui-colorField-icon fa-' + style + ' fa-fw fa-' + name;
            icon.setAttribute('aria-hidden', 'true');
            return icon;
        },

        $capabilities: function() {
            return {references: this.getAttribute('references'), dark: this.getAttribute('dark')};
        },

        getValue: function() {return this.$value;},
        setValue: function(value) {
            this.$value = value;
            return this;
        },
        clear: function() {this.$commit('');},
        reset: function() {this.$commit(this.getAttribute('defaultcolor') || '');},

        $commit: function(value) {
            const serialized = ColorValue.serialize(value, this.$capabilities());
            this.setValue(serialized);
            this.fireEvent('change', [this, serialized, this.getAttribute('colorName')]);
        },

        $parse: function(value) {
            try {return ColorValue.parse(value, this.$capabilities());}
            catch (error) {return null;}
        },

        $name: function(id) {
            return this.$palette.colors[id]?.name || this.$palette.names?.[id] || this.getAttribute('colorNames')[id] || id;
        },

        $swatches: function(parent, value) {
            const entry = value?.type === 'palette' ? this.$palette.colors[value.id] : value;
            const paired = typeof entry === 'object' && entry?.dark !== undefined;
            (paired ? ['light', 'dark'] : ['light']).forEach((mode) => {
                const wrap = document.createElement('span');
                wrap.className = 'qui-colorField-sample';
                const swatch = document.createElement('span');
                swatch.className = 'qui-colorField-swatch';
                const color = ColorValue.resolve(value, this.$palette, mode);
                swatch.style.setProperty('--sample-color', color || 'transparent');
                swatch.dataset.empty = String(!color);
                swatch.setAttribute('aria-hidden', 'true');
                wrap.appendChild(swatch);
                if (paired) {
                    const caption = document.createElement('small');
                    caption.textContent = this.$labels[mode];
                    wrap.appendChild(caption);
                }
                parent.appendChild(wrap);
            });
        },

        $summary: function(parent, value) {
            parent.replaceChildren();
            this.$swatches(parent, value);
            const text = document.createElement('span');
            text.className = 'qui-colorField-caption';
            const linked = value?.type === 'palette';
            text.textContent = linked ? this.$name(value.id) :
                (typeof value === 'string' && value ? value : value?.type === 'color'
                    ? value.light + ' / ' + value.dark : this.$labels.empty);
            parent.appendChild(text);
            if (linked) {
                const indicator = document.createElement('span');
                indicator.textContent = '↗';
                indicator.setAttribute('aria-label', this.$labels.linked);
                parent.appendChild(indicator);
            }
        },

        renderPreview: function(target, rawValue = this.$value) {
            const value = this.$parse(rawValue);
            this.$summary(target, value);
            const invalid = value === null || (value?.type === 'palette' && !Object.hasOwn(this.$palette.colors, value.id));
            if (invalid) {target.lastElementChild.textContent = this.$labels.invalid;}
            target.title = invalid ? this.$labels.invalid :
                (value?.type === 'palette' ? this.$labels.linked + ' ' + this.$name(value.id) : this.$labels.own);
            const entry = value?.type === 'palette' ? this.$palette.colors[value.id] : value;
            let description = target.textContent;
            if (typeof entry === 'object' && entry?.dark !== undefined) {
                description = this.$labels.light + ': ' + entry.light + '; ' + this.$labels.dark + ': ' + entry.dark;
                if (value?.type === 'palette') {description = this.$name(value.id) + '; ' + description;}
            }
            target.setAttribute('aria-label', (this.getAttribute('label') || this.$labels.color) + ': ' +
                (invalid ? this.$labels.invalid : description));
        },

        /** Open beside an element, defaulting to the configured anchor or focused element. */
        open: function(anchor) {
            if (this.$Popup || this.getAttribute('disabled') || this.$disposed) {return this;}
            this.$Anchor = anchor || this.getAttribute('anchor') || document.activeElement;
            this.$draft = this.$parse(this.$value);
            this.$pendingName = this.getAttribute('colorName');
            this.$mode = 'light';
            this.$editorState = null;
            this.$positionState = null;
            this.$view = this.$provider && (this.$draft?.type === 'palette' ||
                (this.$draft === '' && this.getAttribute('startView') === 'palette')) ? 'palette' : 'editor';
            this.$Popup = this.getElm();
            this.$Popup.setAttribute('aria-label', this.getAttribute('label') || this.$labels.color);
            document.body.appendChild(this.$Popup);
            this.$Popup.showPopover?.();
            this.$anchorAttributes = {};
            if (this.$Anchor) {
                ['aria-haspopup', 'aria-expanded', 'aria-controls'].forEach((name) => {
                    this.$anchorAttributes[name] = this.$Anchor.getAttribute(name);
                });
                this.$Anchor.setAttribute('aria-haspopup', 'dialog');
                this.$Anchor.setAttribute('aria-expanded', 'true');
                this.$Anchor.setAttribute('aria-controls', this.$Popup.id);
            }
            this.$renderPopup();
            this.$positionListener = () => this.$position();
            this.$outsideListener = (event) => {
                if (this.$Menu?.open && !this.$Menu.contains(event.target)) {this.$Menu.open = false;}
                if (!this.$Popup?.contains(event.target) && !this.$Anchor?.contains(event.target)) {this.close();}
            };
            this.$keyListener = (event) => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    if (this.$Choice) {this.$closeChoice();}
                    else if (this.$Menu?.open) {this.$closeMenu();}
                    else if (this.$Tooltip) {this.$hideTooltip();}
                    else {this.close();}
                } else if (event.key === 'Tab') {
                    const controls = Array.from((this.$Choice || this.$Popup).querySelectorAll('[data-name]'))
                        .filter((node) => !node.disabled && node.tabIndex >= 0 && node.getClientRects().length);
                    const index = controls.indexOf(document.activeElement);
                    if (event.shiftKey && index <= 0) {
                        event.preventDefault(); controls.at(-1)?.focus();
                    } else if (!event.shiftKey && (index === controls.length - 1 || index < 0)) {
                        event.preventDefault(); controls[0]?.focus();
                    }
                }
            };
            window.addEventListener('resize', this.$positionListener);
            document.addEventListener('scroll', this.$positionListener, true);
            document.addEventListener('pointerdown', this.$outsideListener, true);
            document.addEventListener('keydown', this.$keyListener, true);
            this.fireEvent('open', [this]);
            return this;
        },

        close: function(restoreFocus = true) {
            if (!this.$Popup || this.$busy) {return;}
            this.$hideTooltip();
            if (this.$Choice) {this.$closeChoice(false);}
            this.$Editor?.destroy();
            this.$Editor = null;
            this.$Choice = null;
            this.$Menu = null;
            this.$Popup.remove();
            this.$Popup = null;
            window.removeEventListener('resize', this.$positionListener);
            document.removeEventListener('scroll', this.$positionListener, true);
            document.removeEventListener('pointerdown', this.$outsideListener, true);
            document.removeEventListener('keydown', this.$keyListener, true);
            if (this.$Anchor) {
                Object.entries(this.$anchorAttributes).forEach(([name, value]) => {
                    if (value === null) {this.$Anchor.removeAttribute(name);}
                    else {this.$Anchor.setAttribute(name, value);}
                });
                if (restoreFocus && !this.$disposed) {this.$Anchor.focus();}
            }
            this.fireEvent('close', [this]);
        },

        $position: function() {
            if (!this.$Popup) {return;}
            this.$hideTooltip();
            const rect = (this.$Anchor || document.body).getBoundingClientRect();
            const width = this.$Popup.offsetWidth;
            const height = this.$Popup.offsetHeight;
            const margin = 8;
            const previous = this.$positionState;
            const below = previous ? previous.below : rect.bottom + 4 + height + margin <= window.innerHeight;
            const preferredTop = previous
                ? previous.top + rect.top - previous.anchorTop + (below ? 0 : previous.height - height)
                : below ? rect.bottom + 4 : rect.top - height - 4;
            const top = Math.max(margin, Math.min(preferredTop, window.innerHeight - height - margin));
            this.$Popup.style.left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin)) + 'px';
            this.$Popup.style.top = top + 'px';
            this.$positionState = {below, top, height, anchorTop: rect.top};
        },

        $fullHex: function(mode = 'light') {
            const value = ColorValue.resolve(this.$draft, this.$palette, mode);
            return value ? ColorValue.hex(...ColorValue.rgba(value)).toUpperCase() : '';
        },

        $header: function() {
            this.$Current.replaceChildren();
            const samples = document.createElement('span');
            samples.className = 'qui-colorField-samples';
            this.$swatches(samples, this.$draft);
            const caption = document.createElement('span');
            caption.className = 'qui-colorField-caption';
            const title = document.createElement('strong');
            title.textContent = this.$draft?.type === 'palette' ? this.$name(this.$draft.id) :
                this.$pendingName || this.getAttribute('label') || this.$labels.color;
            const value = document.createElement('small');
            const entry = this.$draft?.type === 'palette' ? this.$palette.colors[this.$draft.id] : this.$draft;
            value.textContent = this.$draft?.type === 'palette' ? this.$labels.projectColor :
                this.$fullHex() + (entry?.dark !== undefined ? ' / ' + this.$fullHex('dark') : '') || this.$labels.empty;
            caption.append(title, value);
            this.$Current.append(samples, caption);
        },

        $closeMenu: function() {
            this.$Menu.open = false;
            this.$Menu.firstElementChild.focus();
        },

        $renderMenu: function(parent) {
            const menu = document.createElement('details');
            this.$Menu = menu;
            menu.className = 'qui-colorField-menu';
            const summary = document.createElement('summary');
            summary.dataset.name = 'more-actions';
            summary.setAttribute('aria-label', this.$labels.more);
            summary.appendChild(this.$icon('ellipsis'));
            menu.appendChild(summary);
            parent.appendChild(menu);
            const items = document.createElement('div');
            items.className = 'qui-colorField-menuItems';
            menu.appendChild(items);
            const action = (label, help, handler, name) => {
                const button = this.$button(items, '', handler, name);
                const icons = {reset: 'arrow-rotate-left', 'unlink-menu': 'link-slash', clear: 'trash-can', remove: 'box-archive'};
                button.appendChild(this.$icon(icons[name] || 'copy', name.startsWith('copy-') ? 'regular' : 'solid'));
                const caption = document.createElement('span');
                caption.className = 'qui-colorField-menuCaption';
                caption.textContent = label;
                const sub = document.createElement('small');
                sub.textContent = help;
                caption.appendChild(sub);
                button.appendChild(caption);
                return button;
            };
            if (this.getAttribute('defaultcolor') !== false) {
                action(this.$labels.reset, this.$labels.resetHelp, () => {
                    this.$draft = this.$parse(this.getAttribute('defaultcolor') || '');
                    this.$renderPopup();
                }, 'reset');
            }
            const entry = this.$draft?.type === 'palette' ? this.$palette.colors[this.$draft.id] : this.$draft;
            (entry?.dark !== undefined ? ['light', 'dark'] : ['light']).forEach((mode) => {
                const label = entry?.dark !== undefined ? this.$labels[mode === 'light' ? 'copyLight' : 'copyDark'] : this.$labels.copyValue;
                const button = action(label, this.$fullHex(mode), async () => {
                    const status = this.$Status;
                    this.$closeMenu();
                    try {
                        await navigator.clipboard.writeText(this.$fullHex(mode));
                        if (this.$Status === status && this.$Popup) {status.textContent = this.$labels.copied;}
                    } catch (error) {
                        if (this.$Status === status && this.$Popup) {status.textContent = this.$labels.copyError;}
                    }
                }, 'copy-' + mode);
                button.disabled = !this.$fullHex(mode);
            });
            if (this.$draft?.type === 'palette') {
                action(this.$labels.unlink, '', () => this.$edit(), 'unlink-menu');
            }
            if (this.getAttribute('clearable')) {
                action(this.$labels.clear, this.$labels.clearHelp, () => {
                    this.$draft = ''; this.$renderPopup();
                }, 'clear');
            }
            if (this.getAttribute('removable')) {
                action(this.$labels.remove, this.$labels.removeHelp, () => {
                    this.$closeMenu();
                    this.$choice(this.$labels.removeHelp, [[this.$labels.confirmRemove, () => {
                        this.close(); this.fireEvent('remove', [this]);
                    }]]);
                }, 'remove');
            }
            menu.addEventListener('toggle', () => {
                if (menu.open) {
                    ['light', 'dark'].forEach((mode) => {
                        const button = items.querySelector('[data-name="copy-' + mode + '"]');
                        if (button) {
                            button.lastElementChild.lastElementChild.textContent = this.$fullHex(mode);
                            button.disabled = !this.$valid || !this.$fullHex(mode);
                        }
                    });
                }
            });
        },

        $renderPopup: function(focusName, focusIndex = 0) {
            this.$hideTooltip();
            if (this.$Editor) {
                this.$editorState = {format: this.$Editor.format.value, advanced: this.$Editor.advanced.open};
                this.$Editor.destroy();
            }
            this.$Editor = null;
            this.$Choice = null;
            this.$Menu = null;
            this.$Popup.replaceChildren();
            this.$valid = this.$draft !== null && (this.$draft?.type !== 'palette' ||
                Object.hasOwn(this.$palette.colors, this.$draft.id));
            const header = document.createElement('header');
            header.className = 'qui-colorField-header';
            this.$Current = document.createElement('div');
            this.$Current.dataset.name = 'current';
            this.$Current.tabIndex = -1;
            header.appendChild(this.$Current);
            this.$Popup.appendChild(header);
            this.$header();
            this.$renderMenu(header);
            this.$Body = document.createElement('div');
            this.$Body.className = 'qui-colorField-body';
            this.$Body.id = this.$Popup.id + '-panel';
            if (this.$provider) {
                const navigation = document.createElement('div');
                navigation.className = 'qui-colorField-tabs';
                navigation.setAttribute('role', 'tablist');
                navigation.setAttribute('aria-label', this.$labels.color);
                this.$Popup.appendChild(navigation);
                ['palette', 'editor'].forEach((view, index) => {
                    const button = this.$button(navigation, this.$labels[view === 'palette' ? 'projectColor' : 'individual'], () => {
                        if (this.$Editor && !this.$valid) {return;}
                        this.$view = view; this.$renderPopup('view', index);
                    }, 'view');
                    button.id = this.$Popup.id + '-' + view;
                    button.setAttribute('role', 'tab');
                    button.setAttribute('aria-selected', String(this.$view === view));
                    button.setAttribute('aria-controls', this.$Body.id);
                    button.tabIndex = this.$view === view ? 0 : -1;
                    button.addEventListener('keydown', (event) => {
                        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {return;}
                        event.preventDefault();
                        if (this.$Editor && !this.$valid) {return;}
                        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
                        this.$view = ['palette', 'editor'][next];
                        this.$renderPopup('view', next);
                    });
                });
                this.$Body.setAttribute('role', 'tabpanel');
                this.$Body.setAttribute('aria-labelledby', this.$Popup.id + '-' + this.$view);
            }
            this.$Popup.appendChild(this.$Body);
            if (this.$view === 'palette') {this.$renderPalette();}
            else {this.$renderEditor();}
            if (this.$draft?.type === 'palette') {
                const linked = this.$text(this.$Body, '');
                linked.append(this.$icon('link'), document.createTextNode(this.$name(this.$draft.id) + ' ' + this.$labels.linkedHelp));
                linked.className = 'qui-colorField-linked';
                if (this.$palette.colors[this.$draft.id]?.archived) {this.$text(this.$Body, this.$labels.archived);}
            }
            this.$Status = this.$text(this.$Body, this.$valid ? '' : this.$labels.invalid);
            this.$Status.setAttribute('role', 'status');
            this.$Status.className = 'qui-colorField-status';
            const actions = document.createElement('footer');
            actions.className = 'qui-colorField-actions';
            this.$Popup.appendChild(actions);
            this.$button(actions, this.$labels.cancel, () => this.close(), 'cancel');
            this.$Apply = this.$button(actions, this.$labels.apply, () => this.$apply(), 'apply');
            this.$Apply.disabled = !this.$valid || (!this.getAttribute('clearable') && this.$draft === '');
            this.$position();
            const focus = focusName && this.$Popup.querySelectorAll('[data-name="' + focusName + '"]')[focusIndex];
            (focus || this.$Current).focus();
        },

        $closeChoice: function(restoreFocus = true) {
            this.$Choice?.remove();
            this.$Choice = null;
            this.$choiceBackground?.forEach(([element, inert]) => {element.inert = inert;});
            this.$choiceBackground = null;
            Array.from(this.$Popup.children).forEach((child) => {child.inert = false;});
            this.$Popup.classList.remove('qui-colorField-popup--choosing');
            if (restoreFocus) {(this.$choiceFocus?.isConnected ? this.$choiceFocus : this.$Current).focus();}
        },

        $choice: function(message, choices, merging = false) {
            this.$hideTooltip();
            this.$choiceFocus = document.activeElement;
            this.$choiceBackground = Array.from(document.body.children)
                .filter((element) => element !== this.$Popup).map((element) => [element, element.inert]);
            this.$choiceBackground.forEach(([element]) => {element.inert = true;});
            Array.from(this.$Popup.children).forEach((child) => {child.inert = true;});
            this.$Popup.classList.add('qui-colorField-popup--choosing');
            const choice = document.createElement('div');
            choice.className = 'qui-colorField-choice';
            choice.setAttribute('role', 'alertdialog');
            choice.setAttribute('aria-modal', 'true');
            choice.setAttribute('aria-label', message);
            this.$Choice = choice;
            this.$Popup.appendChild(choice);
            const card = document.createElement('div');
            card.className = 'qui-colorField-choiceCard';
            choice.appendChild(card);
            this.$text(card, message);
            if (merging) {this.$text(card, this.$labels.mergeHelp);}
            choices.forEach(([text, action, color]) => {
                const button = this.$button(card, text, () => {
                    this.$closeChoice(); action();
                }, 'choice');
                if (color) {
                    button.setAttribute('aria-label', text);
                    button.replaceChildren();
                    const caption = document.createElement('span');
                    caption.textContent = text.split(': ')[0];
                    const value = document.createElement('small');
                    value.textContent = ColorValue.hex(...ColorValue.rgba(color)).toUpperCase();
                    caption.appendChild(value);
                    button.appendChild(caption);
                    this.$swatches(button, color);
                    const arrow = this.$icon('chevron-right');
                    arrow.classList.add('qui-colorField-choiceArrow');
                    button.appendChild(arrow);
                }
            });
            this.$button(card, merging ? this.$labels.keepPair : this.$labels.cancel, () => this.$closeChoice(), 'choice-cancel');
            choice.querySelector('[data-name="choice"]')?.focus();
        },

        $select: function(id) {
            const entry = this.$palette.colors[id];
            if (this.getAttribute('references')) {
                this.$draft = {type: 'palette', id: id};
                this.$renderPopup();
            } else if (entry.dark !== undefined) {
                this.$choice(this.$labels.chooseVariant + ' · ' + this.$labels.copy,
                    ['light', 'dark'].map((mode) => [this.$labels[mode] + ': ' + entry[mode], () => {
                        this.$draft = entry[mode]; this.$renderPopup();
                    }, entry[mode]]));
            } else {
                this.$draft = entry.value ?? entry.light;
                this.$renderPopup();
            }
        },

        $hideTooltip: function() {
            this.$Tooltip?.hidePopover();
            this.$Tooltip = null;
        },

        $showTooltip: function(button, tooltip) {
            if (!tooltip.showPopover) {return;}
            this.$hideTooltip();
            this.$Tooltip = tooltip;
            tooltip.showPopover();
            const rect = button.getBoundingClientRect();
            const margin = 8;
            const width = tooltip.offsetWidth;
            const height = tooltip.offsetHeight;
            const top = rect.top - height >= margin ? rect.top - height : rect.bottom;
            tooltip.style.left = Math.max(margin, Math.min(rect.left + (rect.width - width) / 2,
                window.innerWidth - width - margin)) + 'px';
            tooltip.style.top = Math.max(margin, Math.min(top, window.innerHeight - height - margin)) + 'px';
        },

        $renderPalette: function() {
            const toggle = this.$button(this.$Menu.lastElementChild, this.$labels.showNames, () => {
                this.$showNames = !this.$showNames; this.$renderPopup();
            }, 'show-names');
            toggle.appendChild(this.$icon('font'));
            toggle.setAttribute('aria-pressed', String(Boolean(this.$showNames)));
            ['brand', 'status', 'neutral', 'content', 'other', 'custom'].forEach((group) => {
                const entries = Object.entries(this.$palette.colors).filter(([id, color]) =>
                    !color.archived && (id.startsWith('custom-') ? 'custom' :
                        this.$palette.groups?.[id] || color.displayGroup || 'other') === group);
                if (!entries.length) {return;}
                const fieldset = document.createElement('fieldset');
                fieldset.className = 'qui-colorField-palette';
                const legend = document.createElement('legend');
                legend.textContent = this.$labels[group];
                fieldset.appendChild(legend);
                entries.forEach(([id]) => {
                    const selected = this.$draft?.type === 'palette' && this.$draft.id === id;
                    const button = this.$button(fieldset, '', () => this.$select(id), 'palette-color');
                    button.classList.add('qui-colorField-dot');
                    button.setAttribute('aria-label', this.$name(id));
                    button.setAttribute('aria-pressed', String(selected));
                    const name = document.createElement('span');
                    name.className = this.$showNames ? 'qui-colorField-paletteName' : 'qui-colorField-tooltip';
                    name.textContent = this.$name(id);
                    button.appendChild(name);
                    if (!this.$showNames) {
                        name.setAttribute('popover', 'manual');
                        name.setAttribute('role', 'tooltip');
                        button.addEventListener('pointerenter', () => this.$showTooltip(button, name));
                        button.addEventListener('pointerleave', () => {
                            if (this.$Tooltip === name && document.activeElement !== button) {this.$hideTooltip();}
                        });
                        button.addEventListener('focus', () => this.$showTooltip(button, name));
                        button.addEventListener('blur', () => {
                            if (this.$Tooltip === name) {this.$hideTooltip();}
                        });
                    }
                    this.$swatches(button, {type: 'palette', id: id});
                    if (selected) {
                        button.appendChild(this.$icon('check'));
                    }
                });
                this.$Body.appendChild(fieldset);
            });
            if (!this.getAttribute('references')) {this.$text(this.$Body, this.$labels.copy);}
        },

        $edit: function() {
            if (this.$draft?.type === 'palette') {
                const entry = this.$palette.colors[this.$draft.id];
                if (!entry) {return;}
                if (entry.dark !== undefined && !this.getAttribute('dark')) {
                    this.$choice(this.$labels.chooseVariant, ['light', 'dark'].map((mode) =>
                        [this.$labels[mode] + ': ' + entry[mode], () => {
                            this.$draft = entry[mode]; this.$view = 'editor'; this.$renderPopup();
                        }, entry[mode]]));
                    return;
                }
                this.$draft = entry.dark !== undefined ? {type: 'color', light: entry.light, dark: entry.dark} :
                    (entry.value ?? entry.light);
            }
            this.$view = 'editor';
            this.$renderPopup();
        },

        $variant: function(button, mode) {
            button.replaceChildren();
            const caption = document.createElement('span');
            caption.textContent = this.$labels[mode];
            const value = document.createElement('small');
            value.textContent = this.$fullHex(mode);
            caption.appendChild(value);
            button.appendChild(caption);
            this.$swatches(button, this.$draft[mode]);
        },

        $renderEditor: function() {
            if (this.$draft?.type === 'palette') {
                this.$button(this.$Body, this.$labels.unlink, () => this.$edit(), 'unlink')
                    .appendChild(this.$icon('link-slash'));
                return;
            }
            if (this.getAttribute('editableName')) {
                const label = document.createElement('label');
                label.textContent = this.$labels.name;
                const input = document.createElement('input');
                input.type = 'text';
                input.dataset.name = 'color-name';
                input.maxLength = 100;
                input.value = this.$pendingName;
                input.addEventListener('input', () => {this.$pendingName = input.value; this.$header();});
                label.appendChild(input);
                this.$Body.appendChild(label);
            }
            if (this.getAttribute('dark')) {
                const segments = document.createElement('div');
                segments.className = 'qui-colorField-segments';
                segments.setAttribute('role', 'group');
                segments.setAttribute('aria-label', this.$labels.different);
                this.$Body.appendChild(segments);
                [false, true].forEach((paired) => {
                    const button = this.$button(segments, this.$labels[paired ? 'pair' : 'single'], () => {
                        if (!this.$valid || paired === (this.$draft?.type === 'color')) {return;}
                        if (paired) {
                            const value = this.$draft === 'transparent' ? '#00000000' : this.$draft;
                            this.$draft = {type: 'color', light: value, dark: value};
                            this.$mode = 'light';
                        } else if (ColorValue.rgba(this.$draft.light).join() !== ColorValue.rgba(this.$draft.dark).join()) {
                            this.$choice(this.$labels.mergeTitle, ['light', 'dark'].map((mode) =>
                                [this.$labels[mode === 'light' ? 'keepLight' : 'keepDark'] + ': ' + this.$fullHex(mode), () => {
                                    this.$draft = this.$draft[mode]; this.$renderPopup('single');
                                }, this.$draft[mode]]), true);
                            return;
                        } else {this.$draft = this.$draft.light;}
                        this.$renderPopup(paired ? 'different' : 'single');
                    }, paired ? 'different' : 'single');
                    button.appendChild(this.$icon(paired ? 'circle-half-stroke' : 'circle'));
                    button.setAttribute('aria-pressed', String(paired === (this.$draft?.type === 'color')));
                    button.disabled = !ColorValue.resolve(this.$draft, this.$palette, 'light');
                });
            }
            const variantButtons = {};
            if (this.$draft?.type === 'color') {
                const variants = document.createElement('div');
                variants.className = 'qui-colorField-variants';
                variants.setAttribute('role', 'group');
                variants.setAttribute('aria-label', this.$labels.pair);
                this.$Body.appendChild(variants);
                ['light', 'dark'].forEach((mode) => {
                    const button = this.$button(variants, this.$labels[mode], () => {
                        if (!this.$valid) {return;}
                        this.$mode = mode; this.$renderPopup('variant', mode === 'light' ? 0 : 1);
                    }, 'variant');
                    variantButtons[mode] = button;
                    this.$variant(button, mode);
                    button.setAttribute('aria-pressed', String(this.$mode === mode));
                });
            }
            this.$Editor = new ColorEditor(this.$Body,
                ColorValue.resolve(this.$draft, this.$palette, this.$mode), this.$labels,
                (color) => {
                    if (this.$draft?.type === 'color') {
                        this.$draft[this.$mode] = color;
                        const button = variantButtons[this.$mode];
                        this.$variant(button, this.$mode);
                    } else {this.$draft = color;}
                    this.$header();
                    const toggle = this.$Popup.querySelector('[data-name="different"]');
                    if (toggle) {toggle.disabled = false;}
                }, (valid) => {
                    this.$valid = valid;
                    if (this.$Apply) {this.$Apply.disabled = !valid;}
                    if (this.$Status) {this.$Status.textContent = valid ? '' : this.$labels.invalid;}
                });
            if (this.$editorState) {
                this.$Editor.format.value = this.$editorState.format;
                Object.entries(this.$Editor.inputs).forEach(([format, input]) => {
                    input.parentElement.hidden = format !== this.$editorState.format;
                });
                this.$Editor.advanced.open = this.$editorState.advanced;
            }
            this.$Editor.advanced.addEventListener('toggle', () => this.$position());

        },

        $apply: function() {
            if (!this.$valid || this.$busy || (!this.getAttribute('clearable') && this.$draft === '')) {return;}
            const named = this.getAttribute('editableName');
            if (named && !this.$pendingName.trim()) {
                this.$Status.textContent = this.$labels.name + ': ' + this.$labels.invalid;
                return;
            }
            try {
                // Validate before any provider mutation.
                ColorValue.serialize(this.$draft, this.$capabilities());
                if (named) {ColorValue.entry(ColorValue.serialize(this.$draft, this.$capabilities()));}
                if (this.getAttribute('editableName')) {this.setAttribute('colorName', this.$pendingName.trim());}
                this.$busy = false;
                const draft = this.$draft;
                this.close();
                this.$commit(draft);
            } catch (error) {
                if (this.$Status) {this.$Status.textContent = this.$labels.error;}
            } finally {
                this.$busy = false;
                if (this.$Apply) {this.$Apply.disabled = !this.$valid;}
            }
        },

        /** Explicit sources take precedence over automatic project context. null clears the override. */
        setProvider: function(provider) {
            this.$customProvider = Boolean(provider);
            this.setAttribute('palette', null);
            return this.$setProvider(provider);
        },

        /** Supply a snapshot without requiring a CMS endpoint, e.g. in a frontend integration. */
        setPalette: function(palette) {
            const snapshot = palette ? JSON.parse(JSON.stringify(palette)) : null;
            const result = this.setProvider(snapshot ? {
                load: () => Promise.resolve(JSON.parse(JSON.stringify(snapshot)))
            } : null);
            this.setAttribute('palette', snapshot);
            return result;
        },

        /**
         * Context contract: project.getColorProvider() returns a provider or a promise.
         * Only references-enabled fields automatically load a project's palette. Explicit
         * setPalette/setProvider sources remain usable without that context contract.
         */
        setProject: function(project, palette) {
            this.setAttribute('project', project);
            if (palette !== undefined) {return this.setPalette(palette);}
            if (this.$customProvider || this.$disposed) {return Promise.resolve();}

            this.$setProvider(null);
            if (typeof project?.getColorProvider !== 'function') {return Promise.resolve();}

            const generation = this.$generation;
            return Promise.resolve().then(() => project.getColorProvider()).then((provider) => {
                if (this.$disposed || generation !== this.$generation) {return;}
                return this.$setProvider(this.getAttribute('references') ? provider : null, provider?.labels);
            }).catch(() => {
                if (!this.$disposed && generation === this.$generation) {
                    this.fireEvent('error', [this, this.$labels.error]);
                }
            });
        },

        $setProvider: function(provider, providerLabels = provider?.labels) {
            if (this.$disposed) {return Promise.resolve();}
            this.$unsubscribe?.();
            this.$unsubscribe = null;
            this.$provider = provider;
            this.$generation++;
            this.setAttribute('provider', provider);
            this.$labels = Object.assign({}, labels, providerLabels || {}, this.getAttribute('labels'));
            this.close(false);
            this.$palette = {colors: {}};
            this.fireEvent('paletteLoad', [this]);
            if (provider) {
                this.$unsubscribe = provider.subscribe?.(() => this.reload());
                return this.reload();
            }
            return Promise.resolve();
        },

        reload: function() {
            const generation = ++this.$generation;
            const provider = this.$provider;
            if (!provider) {return Promise.resolve();}
            return Promise.resolve().then(() => provider.load()).then((palette) => {
                if (generation !== this.$generation || this.$disposed) {return;}
                if (palette.damaged) {throw new Error('Damaged palette');}
                this.$palette = palette;
                this.fireEvent('paletteLoad', [this]);
                if (this.$Popup && this.$view === 'palette' && !this.$busy && !this.$Choice) {this.$renderPopup();}
            }).catch(() => {
                if (generation === this.$generation && !this.$disposed) {
                    this.fireEvent('error', [this, this.$labels.error]);
                    if (this.$Status) {this.$Status.textContent = this.$labels.error;}
                }
            });
        }
    });
});
