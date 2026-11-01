/** Lossless field values and concrete color conversion; no persistence dependencies. */
define('qui/controls/elements/ColorValue', [], function() {
    'use strict';

    const isColor = (value) => typeof value === 'string' && /^#(?:[a-f\d]{3}|[a-f\d]{4}|[a-f\d]{6}|[a-f\d]{8})$/i.test(value);
    const byte = (value) => Math.round(value).toString(16).padStart(2, '0');

    return {
        isColor: isColor,

        /** Parse the entire editor input; omitted alpha retains the exact previous alpha. */
        input: function(value, format = 'hex', alpha = 1) {
            const text = value.trim();
            const hex = /^#?([a-f\d]{3}|[a-f\d]{4}|[a-f\d]{6}|[a-f\d]{8})$/i.exec(text);
            if (hex && (text.startsWith('#') || format === 'hex')) {
                if (alpha === 1 || hex[1].length === 4 || hex[1].length === 8) {return '#' + hex[1];}
                const rgba = this.rgba('#' + hex[1]);
                if (hex[1].length === 3 || hex[1].length === 6) {rgba[3] = alpha;}
                return this.hex(...rgba);
            }
            if (text === 'transparent') {return '#00000000';}
            const functional = /^(rgba?|hsla?)\((.*)\)$/i.exec(text);
            if (functional) {format = functional[1].toLowerCase().slice(0, 3);}
            if (!['rgb', 'hsl'].includes(format)) {throw new Error('Invalid format');}
            const components = (functional ? functional[2] : text).trim();
            const number = '(?:\\d+(?:\\.\\d+)?|\\.\\d+)%?';
            const comma = new RegExp('^(' + number + ')\\s*,\\s*(' + number + ')\\s*,\\s*(' + number + ')(?:\\s*,\\s*(' + number + '))?$');
            const spaced = new RegExp('^(' + number + ')\\s+(' + number + ')\\s+(' + number + ')(?:\\s*/\\s*(' + number + '))?$');
            const match = comma.exec(components) || spaced.exec(components);
            if (!match) {throw new Error('Invalid components');}
            const parts = match.slice(1, 4).map((part, index) => {
                if (format === 'hsl' && index === 0 && part.endsWith('%')) {throw new Error('Invalid hue');}
                return parseFloat(part) * (format === 'rgb' && part.endsWith('%') ? 255 / 100 : 1);
            });
            if (match[4] !== undefined) {
                alpha = parseFloat(match[4]) / (match[4].endsWith('%') ? 100 : 1);
            }
            return format === 'rgb' ? this.hex(...parts, alpha) : this.fromHsl(...parts, alpha);
        },

        parse: function(value, capabilities = {}) {
            if (value === '' || value === 'transparent' || isColor(value)) {
                return value;
            }

            const parsed = JSON.parse(value);

            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                if (capabilities.references && parsed.type === 'palette' && typeof parsed.id === 'string' &&
                    /^(?:[a-z][a-z0-9-]*|template:[a-z0-9-]+\/[a-z0-9-]+:[a-z][a-z0-9-]*)$/.test(parsed.id) &&
                    Object.keys(parsed).length === 2) {
                    return parsed;
                }

                if (capabilities.dark && parsed.type === 'color' &&
                    isColor(parsed.light) && isColor(parsed.dark) && Object.keys(parsed).length === 3) {
                    return parsed;
                }
            }

            throw new Error('Unsupported color value');
        },

        serialize: function(value, capabilities) {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            this.parse(serialized, capabilities);
            return serialized;
        },

        resolve: function(value, palette, mode) {
            if (typeof value === 'string') {
                return isColor(value) || value === 'transparent' ? value : '';
            }

            let color = value;
            if (value?.type === 'palette') {
                color = Object.hasOwn(palette.colors, value.id) ? palette.colors[value.id] : null;
            }
            const resolved = color?.value ?? color?.[mode] ?? color?.light ?? '';
            return isColor(resolved) ? resolved : '';
        },

        entry: function(value) {
            const parsed = this.parse(value, {dark: true});
            if (typeof parsed === 'string' && isColor(parsed)) {
                return {value: parsed};
            }
            if (parsed?.type === 'color') {
                return {light: parsed.light, dark: parsed.dark};
            }
            throw new Error('A palette entry requires a color');
        },

        field: function(entry) {
            return entry.value ?? (entry.dark
                ? JSON.stringify({type: 'color', light: entry.light, dark: entry.dark}) : entry.light);
        },

        rgba: function(hex) {
            if (hex === 'transparent') {return [0, 0, 0, 0];}
            if (!isColor(hex)) {
                throw new Error('Invalid color');
            }
            let digits = hex.slice(1);
            if (digits.length < 5) {
                digits = digits.split('').map((digit) => digit + digit).join('');
            }
            return [0, 2, 4].map((offset) => parseInt(digits.slice(offset, offset + 2), 16))
                .concat(digits.length === 8 ? parseInt(digits.slice(6), 16) / 255 : 1);
        },

        hex: function(r, g, b, a = 1) {
            if (![r, g, b, a].every(Number.isFinite) || [r, g, b].some((v) => v < 0 || v > 255) || a < 0 || a > 1) {
                throw new Error('Invalid RGB color');
            }
            return '#' + byte(r) + byte(g) + byte(b) + (a < 1 ? byte(a * 255) : '');
        },

        hsv: function(hex) {
            const [r, g, b, a] = this.rgba(hex);
            const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
            let h = 0;
            if (delta) {
                if (max === r) {h = ((g - b) / delta) % 6;}
                else if (max === g) {h = (b - r) / delta + 2;}
                else {h = (r - g) / delta + 4;}
            }
            return [(h * 60 + 360) % 360, max ? delta / max * 100 : 0, max / 255 * 100, a];
        },

        fromHsv: function(h, s, v, a = 1) {
            if (![h, s, v, a].every(Number.isFinite) || h < 0 || h > 360 ||
                s < 0 || s > 100 || v < 0 || v > 100 || a < 0 || a > 1) {
                throw new Error('Invalid HSV color');
            }
            h %= 360;
            const chroma = v / 100 * s / 100;
            const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
            const m = v / 100 - chroma;
            const rgb = h < 60 ? [chroma, x, 0] : h < 120 ? [x, chroma, 0] : h < 180 ? [0, chroma, x] :
                h < 240 ? [0, x, chroma] : h < 300 ? [x, 0, chroma] : [chroma, 0, x];
            return this.hex(...rgb.map((c) => (c + m) * 255), a);
        },

        hsl: function(hex) {
            const [h, s, v, a] = this.hsv(hex);
            const lightness = v / 100 * (1 - s / 200);
            const saturation = lightness === 0 || lightness === 1 ? 0 :
                (v / 100 - lightness) / Math.min(lightness, 1 - lightness);
            return [h, saturation * 100, lightness * 100, a];
        },

        fromHsl: function(h, s, l, a = 1) {
            if (![h, s, l, a].every(Number.isFinite) || h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
                throw new Error('Invalid HSL color');
            }
            const v = l / 100 + s / 100 * Math.min(l / 100, 1 - l / 100);
            return this.fromHsv(h % 360, v ? 200 * (1 - l / 100 / v) : 0, v * 100, a);
        }
    };
});
