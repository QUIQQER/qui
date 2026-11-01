/** Embedded concrete-color editor. All changes are drafts owned by the surrounding ColorField. */
define('qui/controls/elements/ColorEditor', [
    'qui/controls/elements/ColorValue'
], function(ColorValue) {
    'use strict';

    return class ColorEditor {
        constructor(parent, value, labels, onChange, onValidity) {
            this.labels = labels;
            this.valid = true;
            this.onChange = onChange;
            this.onValidity = onValidity;
            this.elm = document.createElement('div');
            this.elm.className = 'qui-colorEditor';
            parent.appendChild(this.elm);
            this.surface = document.createElement('button');
            this.surface.type = 'button';
            this.surface.dataset.name = 'color-surface';
            this.surface.className = 'qui-colorEditor-surface';
            this.surface.setAttribute('aria-label', labels.saturation + ' / ' + labels.brightness);
            this.surface.title = labels.surfaceHelp;
            this.marker = document.createElement('span');
            this.marker.className = 'qui-colorEditor-marker';
            this.marker.setAttribute('aria-hidden', 'true');
            this.surface.appendChild(this.marker);
            this.elm.appendChild(this.surface);
            const point = (event) => {
                if (!this.valid) {return;}
                const rect = this.surface.getBoundingClientRect();
                this.hsva[1] = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
                this.hsva[2] = 100 - Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100));
                this.change(ColorValue.fromHsv(...this.hsva), true);
            };
            this.surface.addEventListener('pointerdown', (event) => {
                if (event.button !== 0) {return;}
                this.surface.setPointerCapture(event.pointerId);
                point(event);
            });
            this.surface.addEventListener('pointermove', (event) => {
                if (this.surface.hasPointerCapture(event.pointerId)) {point(event);}
            });
            this.surface.addEventListener('keydown', (event) => {
                const directions = {ArrowLeft: [1, -1], ArrowRight: [1, 1], ArrowUp: [2, 1], ArrowDown: [2, -1]};
                if (!directions[event.key]) {return;}
                if (!this.valid) {event.preventDefault(); return;}
                event.preventDefault();
                const [index, step] = directions[event.key];
                this.hsva[index] = Math.max(0, Math.min(100, this.hsva[index] + step * (event.shiftKey ? 10 : 1)));
                this.change(ColorValue.fromHsv(...this.hsva), true);
            });
            this.advanced = document.createElement('details');
            const summary = document.createElement('summary');
            summary.dataset.name = 'advanced';
            summary.textContent = labels.advanced;
            const chevron = document.createElement('span');
            chevron.className = 'fa-solid fa-chevron-down';
            chevron.setAttribute('aria-hidden', 'true');
            summary.appendChild(chevron);
            this.advanced.appendChild(summary);
            this.ranges = ['hue', 'saturation', 'brightness', 'alpha'].map((key, index) => {
                const input = this.input(labels[key], 'range', key);
                if (index === 1 || index === 2) {this.advanced.appendChild(input.parentElement);}
                const output = document.createElement('output');
                input.parentElement.appendChild(output);
                input.output = output;
                input.parentElement.className = 'qui-colorEditor-range qui-colorEditor-range--' + key;
                input.min = 0;
                input.max = index === 0 ? 360 : 100;
                input.step = 1;
                input.addEventListener('input', () => {
                    if (!this.valid) {return;}
                    this.hsva[index] = Number(input.value) / (index === 3 ? 100 : 1);
                    this.change(ColorValue.fromHsv(...this.hsva), true);
                });
                return input;
            });
            const formatLabel = document.createElement('label');
            this.row = document.createElement('div');
            this.row.className = 'qui-colorEditor-values';
            this.elm.appendChild(this.row);
            this.format = document.createElement('select');
            this.format.dataset.name = 'format';
            this.format.setAttribute('aria-label', labels.format);
            ['hex', 'rgb', 'hsl'].forEach((format) => {
                const option = document.createElement('option');
                option.value = format; option.textContent = format.toUpperCase();
                this.format.appendChild(option);
            });
            this.format.value = 'hex';
            formatLabel.appendChild(this.format);
            this.row.appendChild(formatLabel);
            this.format.addEventListener('change', () => {
                Object.entries(this.inputs).forEach(([format, input]) => {
                    input.parentElement.hidden = format !== this.format.value;
                });
            });
            this.inputs = {};
            ['hex', 'rgb', 'hsl'].forEach((format) => {
                const input = this.input(format.toUpperCase(), 'text', format);
                this.inputs[format] = input;
                input.parentElement.hidden = format !== 'hex';
                input.parentElement.className = 'qui-colorEditor-value';
                input.spellcheck = false;
                this.row.appendChild(input.parentElement);
                input.addEventListener('focus', () => {input.alphaBeforeEdit = this.hsva[3];});
                input.addEventListener('beforeinput', () => {
                    if (input.selectionStart === 0 && input.selectionEnd === input.value.length) {
                        input.alphaBeforeEdit = this.hsva[3];
                    }
                });
                input.addEventListener('input', () => {
                    try {
                        // A four-digit intermediate hex must not change the alpha of a completed six-digit entry.
                        const hex = ColorValue.input(input.value, format, input.alphaBeforeEdit ?? this.hsva[3]);
                        this.setValidity(input, true);
                        this.change(hex, false, format);
                    } catch (error) {
                        this.setValidity(input, false);
                    }
                });
                input.addEventListener('blur', () => {
                    if (this.valid) {this.render();}
                });
            });
            this.alpha = this.input(labels.alpha, 'text', 'opacity');
            this.alpha.inputMode = 'decimal';
            this.alpha.parentElement.className = 'qui-colorEditor-opacity';
            const percent = document.createElement('span');
            percent.textContent = '%';
            percent.setAttribute('aria-hidden', 'true');
            this.alpha.parentElement.appendChild(percent);
            this.row.appendChild(this.alpha.parentElement);
            this.alpha.addEventListener('input', () => {
                const value = this.alpha.value.trim();
                const valid = /^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value) && Number(value) <= 100;
                this.setValidity(this.alpha, valid);
                if (!valid) {return;}
                const rgba = ColorValue.rgba(this.value);
                rgba[3] = Number(value) / 100;
                this.change(ColorValue.hex(...rgba), false, 'opacity');
            });
            this.elm.appendChild(this.advanced);
            this.setValue(value);
        }

        input(label, type, name) {
            const wrapper = document.createElement('label');
            const text = document.createElement('span');
            text.textContent = label;
            const input = document.createElement('input');
            input.type = type;
            input.dataset.name = name;
            wrapper.append(text, input);
            this.elm.appendChild(wrapper);
            return input;
        }

        setValidity(input, valid) {
            input.setCustomValidity(valid ? '' : this.labels.invalid);
            input.setAttribute('aria-invalid', String(!valid));
            this.valid = [this.alpha, ...Object.values(this.inputs)].filter(Boolean)
                .every((field) => field.getAttribute('aria-invalid') !== 'true');
            this.format.disabled = !this.valid;
            this.ranges.forEach((range) => {range.disabled = !this.valid;});
            this.onValidity(this.valid);
        }

        setValue(value) {
            this.value = ColorValue.isColor(value) || value === 'transparent' ? value : '#000000';
            this.hsva = ColorValue.hsv(this.value);
            this.render();
        }

        change(hex, keepHsv = false, editing = '') {
            this.value = hex;
            if (!keepHsv) {this.hsva = ColorValue.hsv(hex);}
            this.render(editing);
            this.onValidity(this.valid);
            this.onChange(hex);
        }

        render(editing = '') {
            this.format.disabled = !this.valid;
            if (editing !== 'opacity' && this.alpha.getAttribute('aria-invalid') !== 'true') {
                this.alpha.value = String(Math.round(this.hsva[3] * 100));
            }
            this.surface.style.backgroundColor = ColorValue.fromHsv(this.hsva[0], 100, 100);
            this.surface.setAttribute('aria-description', this.labels.surfaceHelp);
            this.marker.style.left = this.hsva[1] + '%';
            this.marker.style.top = (100 - this.hsva[2]) + '%';
            this.ranges.forEach((input, index) => {
                input.value = Math.round(this.hsva[index] * (index === 3 ? 100 : 1));
                input.setAttribute('aria-valuetext', input.value + (index === 0 ? '°' : '%'));
                input.output.textContent = input.value + '%';
            });
            this.elm.style.setProperty('--_opaque', ColorValue.hex(...ColorValue.rgba(this.value).slice(0, 3)));
            this.elm.style.setProperty('--_hue', ColorValue.fromHsv(this.hsva[0], 100, 100));
            this.elm.style.setProperty('--_saturation-start', ColorValue.fromHsv(this.hsva[0], 0, this.hsva[2]));
            this.elm.style.setProperty('--_saturation-end', ColorValue.fromHsv(this.hsva[0], 100, this.hsva[2]));
            this.elm.style.setProperty('--_brightness-end', ColorValue.fromHsv(this.hsva[0], this.hsva[1], 100));
            const round = (value) => Math.round(value * 1000) / 1000;
            const values = {
                hex: ColorValue.hex(...ColorValue.rgba(this.value)).toUpperCase(),
                rgb: ColorValue.rgba(this.value).slice(0, 3).join(', '),
                hsl: ColorValue.hsl(this.value).slice(0, 3).map((value, index) => round(value) + (index ? '%' : '')).join(', ')
            };
            Object.entries(this.inputs).forEach(([format, input]) => {
                if (input.getAttribute('aria-invalid') === 'true') {return;}
                if (format !== editing) {input.value = values[format];}
            });
        }

        destroy() {this.elm.remove();}
    };
});
