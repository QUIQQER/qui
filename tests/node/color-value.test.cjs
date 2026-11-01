const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const path = require('node:path');
let ColorValue;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../qui/controls/elements/ColorValue.js'), 'utf8'), {
    define: (_name, _deps, factory) => {ColorValue = factory();}
});
const enhanced = {references: true, dark: true};

test('reference and dark capabilities are independent and explicitly enabled', () => {
    const reference = '{"type":"palette","id":"primary"}';
    const pair = '{"type":"color","light":"#123456","dark":"#abcdef"}';
    assert.throws(() => ColorValue.parse(reference, {}));
    assert.throws(() => ColorValue.parse(pair, {}));
    assert.throws(() => ColorValue.parse(reference, {dark: true}));
    assert.throws(() => ColorValue.parse(pair, {references: true}));
    assert.equal(ColorValue.serialize(ColorValue.parse(reference, enhanced), enhanced), reference);
    assert.equal(ColorValue.serialize(ColorValue.parse(pair, enhanced), enhanced), pair);
});

test('palette references follow changes while copied colors stay independent', () => {
    const palette = {colors: {primary: {value: '#123456'}}};
    const reference = ColorValue.parse('{"type":"palette","id":"primary"}', enhanced);
    const copy = ColorValue.resolve(reference, palette, 'light');
    assert.equal(ColorValue.resolve(reference, palette, 'dark'), '#123456');
    palette.colors.primary = {light: '#112233', dark: '#abcdef'};
    assert.equal(ColorValue.resolve(reference, palette, 'dark'), '#abcdef');
    assert.equal(ColorValue.resolve(copy, palette, 'dark'), '#123456');
    delete palette.colors.primary;
    assert.equal(ColorValue.resolve(reference, palette, 'dark'), '');
});

test('invalid CSS, malformed values and extra properties are rejected', () => {
    for (const value of ['red', '#12', 'null', '[]', '"#123456"',
        'red;display:none', '{"type":"palette","id":"../primary"}',
        '{"type":"palette","id":"primary","extra":true}',
        '{"type":"color","light":"#123456","dark":""}']) {
        assert.throws(() => ColorValue.parse(value, enhanced));
    }
});

test('RGB and HSL conversions retain all alpha bytes, including fully transparent black', () => {
    for (const hex of ['#00000000', '#ff000080', '#12abefcc', '#abcdef', '#ffffff', '#808080']) {
        assert.equal(ColorValue.hex(...ColorValue.rgba(hex)), hex);
        assert.equal(ColorValue.fromHsl(...ColorValue.hsl(hex)), hex);
        assert.equal(ColorValue.fromHsv(...ColorValue.hsv(hex)), hex);
    }
    assert.throws(() => ColorValue.hex(256, 0, 0));
    assert.throws(() => ColorValue.fromHsl(0, 101, 50));
});

test('HSV wraps 360 degrees to zero with every alpha byte and rejects invalid coordinates', () => {
    for (let alpha = 0; alpha <= 255; alpha++) {
        assert.equal(ColorValue.fromHsv(360, 100, 100, alpha / 255), ColorValue.fromHsv(0, 100, 100, alpha / 255));
    }
    assert.equal(ColorValue.fromHsv(360, 100, 100), '#ff0000');
    for (const values of [[361, 100, 100], [-1, 100, 100], [0, 101, 100], [0, 100, -1]]) {
        assert.throws(() => ColorValue.fromHsv(...values));
    }
});

test('flexible input accepts complete hex, functional and selected numeric formats', () => {
    for (const [input, format, expected] of [
        ['#abc', 'rgb', '#aabbcc80'], ['abcd', 'hex', '#abcd'],
        ['rgb(255, 0, 0)', 'hex', '#ff000080'], ['rgba(255, 0, 0, .33)', 'hsl', '#ff000054'],
        ['rgb(100% 0% 0% / 20%)', 'hex', '#ff000033'],
        ['hsl(120, 100%, 50%)', 'hex', '#00ff0080'],
        ['hsla(240, 100%, 50%, 0)', 'rgb', '#0000ff00'],
        ['255, 0, 0, 33%', 'rgb', '#ff000054'], ['120 100% 50% / 100%', 'hsl', '#00ff00']
    ]) {assert.equal(ColorValue.input(input, format, 128 / 255), expected);}
});

test('flexible input rejects partial syntax, arbitrary text, extra components and out of range alpha', () => {
    for (const input of ['red 1 2 3', 'rgb(1,2,3', '1 2 3 rubbish', 'rgb(1,2,3) trailing',
        'rgb(1,,2,3)', 'rgb(1,2,3,4,5)', 'rgb(-1,2,3)', 'rgba(1,2,3,2)', 'hsl(400,20%,30%)',
        'rgb(256,0,0)', 'rgba(0,0,0,101%)', 'hsl(20%,30%,40%)', '1, 2', '', '#12345']) {
        assert.throws(() => ColorValue.input(input, 'rgb'));
    }
    assert.throws(() => ColorValue.input('123456', 'rgb'));
});

test('omitting alpha preserves every alpha byte across all supported input formats', () => {
    for (let byte = 0; byte <= 255; byte++) {
        const alpha = byte / 255;
        for (const [input, format] of [['#123', 'hex'], ['17, 34, 51', 'rgb'], ['hsl(210, 50%, 13.333333%)', 'hex']]) {
            assert.equal(ColorValue.rgba(ColorValue.input(input, format, alpha))[3], alpha);
        }
    }
});
