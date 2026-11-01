const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
    constructor(tag) {
        this.tagName = tag.toUpperCase();
        this.children = [];
        this.dataset = {};
        this.attributes = {};
        this.listeners = {};
        this.className = '';
        this.style = {setProperty: (key, value) => {this.style[key] = value;}};
        this.classList = {
            contains: (name) => this.className.split(/\s+/).includes(name),
            add: (name) => {this.className += ' ' + name;},
            remove: (name) => {this.className = this.className.split(/\s+/).filter(v => v !== name).join(' ');}
        };
        this.offsetWidth = 350;
        this.offsetHeight = 400;
    }
    get firstElementChild() {return this.children[0];}
    get lastElementChild() {return this.children.at(-1);}
    append(...nodes) {nodes.forEach(node => this.appendChild(node));}
    appendChild(node) {node.remove(); this.children.push(node); node.parentElement = this; return node;}
    replaceChildren(...nodes) {this.children.forEach(node => {node.parentElement = null;}); this.children = []; this.append(...nodes);}
    replaceWith(node) {
        const parent = this.parentElement;
        const index = parent.children.indexOf(this);
        node.remove(); parent.children[index] = node; node.parentElement = parent; this.parentElement = null;
    }
    remove() {
        if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(node => node !== this);
        this.parentElement = null;
    }
    closest() {return null;}
    setAttribute(name, value) {this.attributes[name] = value;}
    getAttribute(name) {return this.attributes[name] ?? null;}
    removeAttribute(name) {delete this.attributes[name];}
    addEventListener(type, listener) {(this.listeners[type] ||= []).push(listener);}
    removeEventListener(type, listener) {this.listeners[type] = (this.listeners[type] || []).filter(fn => fn !== listener);}
    dispatchEvent(event) {(this.listeners[event.type] || []).forEach(fn => fn(event));}
    contains(node) {return this === node || this.children.some(child => child.contains(node));}
    focus() {document.activeElement = this;}
    showPopover() {}
    hidePopover() {}
    setCustomValidity(value) {this.validityMessage = value;}
    getBoundingClientRect() {return {left: 10, top: 10, bottom: 42, width: 350, height: 400};}
    querySelectorAll(selector) {
        const name = selector.match(/data-name="([^"]+)"/)?.[1];
        return this.children.flatMap(child => [
            ...(name ? child.dataset.name === name : Boolean(child.dataset.name)) ? [child] : [],
            ...child.querySelectorAll(selector)
        ]);
    }
    querySelector(selector) {return this.querySelectorAll(selector)[0] || null;}
}
const document = new Element('document');
document.body = new Element('body');
document.createElement = tag => new Element(tag);
document.createTextNode = text => Object.assign(new Element('text'), {textContent: text});
const window = Object.assign(new Element('window'), {innerWidth: 1024, innerHeight: 768});
let nextId = 0;
function Class(definition) {
    function Control(options = {}) {
        this.options = {...definition.options, ...options};
        this.events = {};
        this.id = 'context-' + nextId++;
        this.parent = () => {};
        this.getId = () => this.id;
        this.getAttribute = name => this.options[name];
        this.setAttribute = (name, value) => {this.options[name] = value;};
        this.addEvents = handlers => Object.entries(handlers).forEach(([key, fn]) => (this.events[key] ||= []).push(fn));
        this.fireEvent = (name, args) => (this.events['on' + name[0].toUpperCase() + name.slice(1)] || []).forEach(fn => fn(...args));
        this.getElm = () => this.$Elm || this.create();
        this.destroy = () => {this.fireEvent('destroy', [this]); this.$Elm?.remove();};
        this.addEvents(options.events || {});
        this.initialize(options);
    }
    Control.prototype = definition;
    return Control;
}
const root = path.join(__dirname, '../../qui/controls/elements');
function load(name, dependencies) {
    let result;
    vm.runInNewContext(fs.readFileSync(path.join(root, name + '.js'), 'utf8'), {
        document, window, Class, Event: class {constructor(type) {this.type = type;}},
        define: (_name, _deps, factory) => {result = factory(...dependencies);}
    });
    return result;
}
const Value = load('ColorValue', []);
const Editor = load('ColorEditor', [Value]);
const Popup = load('ColorPopup', [{}, Value, Editor]);
const Field = load('ColorField', [{}, Value, Popup]);
const palette = color => ({colors: {primary: {value: color}}});
const deferred = () => {let resolve; const promise = new Promise(done => {resolve = done;}); return {promise, resolve};};
const edit = (field, value) => {
    const input = field.$Picker.$Popup.querySelector('[data-name="hex"]');
    input.value = value;
    input.dispatchEvent({type: 'input'});
};

test('late project binding preserves an open editor, its input and focus', async () => {
    for (const value of ['#ff0000', '#12']) {
        const source = deferred();
        const data = deferred();
        const field = new Field({value: '#123456', references: true});
        field.create();
        const pending = field.setProject({getColorProvider: () => source.promise});
        field.open();
        const popup = field.$Picker.$Popup;
        const input = popup.querySelector('[data-name="hex"]');
        edit(field, value);
        input.focus();
        source.resolve({load: () => data.promise});
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(field.$Picker.$Popup, popup);
        data.resolve(palette('#abcdef'));
        await pending;
        assert.equal(field.$Picker.$Popup, popup);
        assert.equal(popup.querySelector('[data-name="hex"]'), input);
        assert.equal(input.value, value);
        assert.equal(document.activeElement, input);
        assert.equal(field.getValue(), '#123456');
        assert.equal(field.$Picker.$Apply.disabled, value === '#12');
        assert.equal(field.$Picker.$palette.colors.primary.value, '#abcdef');
        assert.equal(popup.querySelectorAll('[data-name="view"]').length, 2);
        if (value === '#12') {edit(field, '#ff0000');}
        field.$Picker.$apply();
        assert.equal(field.getValue(), '#ff0000');
        field.destroy();
    }
});

test('an empty field shows loading project colors and can select them once available', async () => {
    const source = deferred();
    const field = new Field({references: true});
    field.create();
    const pending = field.setProject({getColorProvider: () => source.promise});
    field.open();
    const popup = field.$Picker.$Popup;
    assert.equal(field.$Picker.$view, 'palette');
    assert.equal(field.$Picker.$Status.textContent, field.$Picker.$labels.loading);
    source.resolve({load: () => palette('#abcdef')});
    await pending;
    assert.equal(field.$Picker.$Popup, popup);
    assert.equal(field.$Picker.$Status.textContent, '');
    popup.querySelector('[data-name="palette-color"]').dispatchEvent({type: 'click'});
    field.$Picker.$apply();
    assert.equal(field.getValue(), '{"type":"palette","id":"primary"}');
    field.destroy();
});

test('failed project binding keeps individual editing available', async () => {
    const source = deferred();
    const field = new Field({value: '#123456', references: true});
    field.create();
    const pending = field.setProject({getColorProvider: () => source.promise});
    field.open();
    const popup = field.$Picker.$Popup;
    edit(field, '#abcdef');
    source.resolve({load: () => Promise.reject(new Error('unavailable'))});
    await pending;
    assert.equal(field.$Picker.$Popup, popup);
    assert.equal(field.$Picker.$Status.textContent, field.$Picker.$labels.error);
    field.$Picker.$apply();
    assert.equal(field.getValue(), '#abcdef');
    field.destroy();
});

test('late project binding does not reopen a cancelled popup', async () => {
    const source = deferred();
    const field = new Field({value: '#123456', references: true});
    field.create();
    const pending = field.setProject({getColorProvider: () => source.promise});
    field.open();
    edit(field, '#abcdef');
    field.close();
    source.resolve({load: () => palette('#ffffff')});
    await pending;
    assert.equal(field.$Picker.$Popup, null);
    assert.equal(field.getValue(), '#123456');
    field.destroy();
});

test('a project without a provider falls back from loading to individual editing', async () => {
    const source = deferred();
    const field = new Field({references: true});
    field.create();
    const pending = field.setProject({getColorProvider: () => source.promise});
    field.open();
    const popup = field.$Picker.$Popup;
    source.resolve(null);
    await pending;
    assert.equal(field.$Picker.$Popup, popup);
    assert.equal(field.$Picker.$view, 'editor');
    edit(field, '#abcdef');
    field.$Picker.$apply();
    assert.equal(field.getValue(), '#abcdef');
    field.destroy();
});

test('project context supplies labels but does not load a palette or enable capabilities by default', async () => {
    let loads = 0;
    const field = new Field({value: '#AbCdEf'});
    field.create();
    await field.setProject({getColorProvider: () => ({labels: {apply: 'Übernehmen'}, load: () => {loads++; return palette('#fff');}})});
    assert.equal(loads, 0);
    assert.equal(field.$Picker.$labels.apply, 'Übernehmen');
    assert.equal(field.$Picker.$provider, null);
    assert.equal(field.getAttribute('dark'), false);
    assert.equal(field.getValue(), '#AbCdEf');
    field.open();
    assert.equal(field.$Picker.$Popup.querySelector('[data-name="view"]'), null);
    assert.equal(field.$Picker.$Popup.querySelector('[data-name="different"]'), null);
    field.destroy();
});

test('references opt in to the owning project palette without changing plain field values', async () => {
    let events = 0;
    const field = new Field({value: '#AbCdEf', references: true, dark: true, events: {onChange: () => events++}});
    field.create();
    let inputEvents = 0;
    field.$Input.addEventListener('change', () => inputEvents++);
    await field.setProject({getColorProvider: () => ({load: () => palette('#102030')})});
    assert.equal(field.$Picker.$palette.colors.primary.value, '#102030');
    assert.equal(events, 0);
    field.open();
    field.$Picker.$apply();
    assert.equal(field.getValue(), '#AbCdEf');
    field.open(); edit(field, '#ff0000'); field.close();
    assert.equal(field.getValue(), '#AbCdEf');
    field.open(); edit(field, '#ff0000'); field.$Picker.$apply();
    assert.equal(field.getValue(), '#ff0000');
    field.open(); field.$Picker.$select('primary'); field.$Picker.$apply();
    assert.equal(field.getValue(), '{"type":"palette","id":"primary"}');
    assert.equal(events, 3);
    assert.equal(inputEvents, 3);
    field.destroy();
});

test('dark alone does not load project colors; only choosing a pair changes the format', async () => {
    let loads = 0;
    const field = new Field({value: '#12345680', dark: true});
    field.create();
    await field.setProject({getColorProvider: () => ({load: () => {loads++; return palette('#fff');}})});
    assert.equal(loads, 0);
    field.open();
    field.$Picker.$Popup.querySelector('[data-name="different"]').dispatchEvent({type: 'click'});
    field.$Picker.$apply();
    assert.deepEqual(JSON.parse(field.getValue()), {type: 'color', light: '#12345680', dark: '#12345680'});
    field.destroy();
});

test('explicit frontend palette wins over backend context and snapshots stay isolated', async () => {
    const data = palette('#abcdef');
    const field = new Field({value: '#123456', references: true, palette: data});
    field.create();
    await field.reload();
    data.colors.primary.value = '#000000';
    let requests = 0;
    await field.setProject({getColorProvider: () => {requests++; throw new Error('must not override');}});
    assert.equal(requests, 0);
    assert.equal(field.$Picker.$palette.colors.primary.value, '#abcdef');
    await field.setProject('frontend-project', palette('#fedcba'));
    assert.equal(field.$Picker.getAttribute('project'), 'frontend-project');
    assert.equal(field.$Picker.$palette.colors.primary.value, '#fedcba');
    field.$Picker.$palette.colors.primary.value = '#000000';
    await field.reload();
    assert.equal(field.$Picker.$palette.colors.primary.value, '#fedcba');
    field.destroy();
});

test('project assignment before creation and imported options use the same generic field', async () => {
    const field = new Field({references: true});
    await field.setProject({getColorProvider: () => ({load: () => palette('#abc')})});
    const row = new Element('div'); row.className = 'field-container';
    const input = new Element('input'); input.className = 'field-container-field';
    input.value = '#010203'; input.name = 'background'; input.id = 'original';
    row.appendChild(input); field.$Elm = input; field.$onImport();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(field.$Input, input);
    assert.equal(input.name, 'background');
    assert.equal(input.id, 'original');
    assert.equal(field.getValue(), '#010203');
    assert.ok(field.getElm().classList.contains('field-container-field'));
    assert.equal(field.$Picker.$palette.colors.primary.value, '#abc');
    field.destroy();
});

test('late project providers cannot replace a newer project, explicit palette or destroyed popup', async () => {
    for (const action of ['project', 'palette', 'destroy']) {
        const first = deferred();
        const popup = new Popup({references: true});
        const pending = popup.setProject({getColorProvider: () => first.promise});
        if (action === 'project') await popup.setProject({getColorProvider: () => ({load: () => palette('#222')})});
        if (action === 'palette') await popup.setPalette(palette('#333'));
        if (action === 'destroy') popup.destroy();
        let staleLoads = 0;
        first.resolve({load: () => {staleLoads++; return palette('#111');}});
        await pending;
        assert.equal(staleLoads, 0);
        if (action !== 'destroy') {
            assert.equal(popup.$palette.colors.primary.value, action === 'project' ? '#222' : '#333');
            popup.destroy();
        }
    }
});

test('separate fields retain their own project palettes and unsubscribe on switch or destroy', async () => {
    let subscriptions = 0;
    const project = color => ({getColorProvider: () => ({
        load: () => palette(color),
        subscribe: () => {subscriptions++; return () => subscriptions--;}
    })});
    const a = new Field({references: true}); a.create();
    const b = new Field({references: true}); b.create();
    await Promise.all([a.setProject(project('#111')), b.setProject(project('#222'))]);
    assert.equal(subscriptions, 2);
    assert.equal(a.$Picker.$palette.colors.primary.value, '#111');
    assert.equal(b.$Picker.$palette.colors.primary.value, '#222');
    await a.setProject(project('#333'));
    assert.equal(subscriptions, 2);
    assert.equal(b.$Picker.$palette.colors.primary.value, '#222');
    a.destroy(); b.destroy();
    assert.equal(subscriptions, 0);
});

test('provider failures are handled and custom labels override supplied translations', async () => {
    let errors = 0;
    const popup = new Popup({references: true, labels: {apply: 'Custom'}, events: {onError: () => errors++}});
    await popup.setProject({getColorProvider: () => Promise.reject(new Error('unavailable'))});
    assert.equal(errors, 1);
    await popup.setProject({getColorProvider: () => ({labels: {apply: 'Übernehmen'}, load: () => palette('#fff')})});
    assert.equal(popup.$labels.apply, 'Custom');
    popup.destroy();
});
