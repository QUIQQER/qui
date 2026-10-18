const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {resolve} = require('node:path');
const {test} = require('node:test');
const vm = require('node:vm');

const root = process.env.QUI_TEST_ROOT || process.cwd();
const source = readFileSync(resolve(root, 'qui/controls/desktop/Column.js'), 'utf8');

function createColumn() {
    let definition;
    let windowWidth = 1000;
    const requests = [];
    const warnings = [];
    const errors = [];
    const panels = [];

    function element() {
        return {
            style: {},
            setStyle(name, value) { this.style[name] = value; },
            addClass() {},
            removeClass() {},
            getSize: () => ({x: 350, y: 800}),
            getChildren: () => panels.map(panel => ({get: () => panel.id}))
        };
    }

    class Panel {
        constructor(attributes) {
            this.attributes = attributes;
            this.id = attributes.name;
            this.element = element();
            this.opened = false;
            this.resizes = 0;
        }
        unserialize(child) { this.child = child; }
        serialize() { return {type: this.child.type, attributes: this.attributes}; }
        getElm() { return this.element; }
        open() {
            assert.equal(column.$__unserialize, false);
            this.opened = true;
        }
        minimize() { this.opened = false; }
        isOpen() { return this.opened; }
        setAttribute(name, value) { this.attributes[name] = value; }
        resize() { this.resizes++; }
    }

    vm.runInNewContext(source, {
        Class: function(value) { return value; },
        define(name, dependencies, factory) {
            definition = factory({
                getWindowSize: () => ({x: windowWidth}),
                getMessageHandler: callback => callback({addError: error => errors.push(error)}),
                Controls: {getById: id => panels.find(panel => panel.id === id)}
            }, {});
        },
        require(modules, success, failure) {
            requests.push({modules: Array.from(modules), success, failure});
        },
        console: {warn: (...args) => warnings.push(args), error: error => errors.push(error)}
    });

    const column = {
        ...definition,
        $Elm: element(),
        $Content: element(),
        $Responsive: element(),
        $Highlight: element(),
        $panels: {},
        $__unserialize: false,
        $responsiveOpen: false,
        $mode: '',
        attributes: {responsive: true, width: 350, height: 800},
        getAttributes() { return this.attributes; },
        getAttribute(name) { return this.attributes[name]; },
        setAttribute(name, value) {
            if (typeof name === 'object') {
                Object.assign(this.attributes, name);
            } else {
                this.attributes[name] = value;
            }
        },
        getElm() { return this.$Elm; },
        isOpen() { return this.$Content.style.display !== 'none'; },
        appendChild(panel) {
            assert.equal(this.$__unserialize, true);
            panels.push(panel);
            this.$panels[panel.id] = panel;
        },
        $syncResponsiveButtons() {},
        recalcPanels() {}
    };

    return {
        column, requests, warnings, errors, panels, Panel,
        setWindowWidth: width => { windowWidth = width; }
    };
}

function child(name, isOpen = false) {
    return {type: 'package/example/' + name, attributes: {name, height: 300}, isOpen};
}

function restore(context, children) {
    context.column.unserialize({attributes: context.column.attributes, children});
}

const settle = () => new Promise(resolve => setImmediate(resolve));

test('missing package panels do not block valid panels or change their saved order', async () => {
    const context = createColumn();
    restore(context, [child('first', true), child('removed-erp'), child('last')]);
    assert.deepEqual(context.requests.map(request => request.modules), [
        ['package/example/first'],
        ['package/example/removed-erp'],
        ['package/example/last']
    ]);

    context.requests[2].success(context.Panel);
    context.requests[1].failure(new Error('Module no longer exists'));
    await settle();
    assert.equal(context.column.$__unserialize, true);
    assert.equal(context.panels.length, 0);

    context.requests[0].success(context.Panel);
    await settle();
    assert.deepEqual(context.panels.map(panel => panel.id), ['first', 'last']);
    assert.equal(context.panels[0].isOpen(), true);
    assert.equal(context.panels[1].isOpen(), false);
    assert.ok(context.panels.every(panel => panel.resizes === 1));
    assert.equal(context.column.$__unserialize, false);
    assert.equal(context.warnings.length, 1);
    assert.match(context.warnings[0][0], /package\/example\/removed-erp/);
    assert.deepEqual(context.errors, []);

    const saved = context.column.serialize();
    assert.deepEqual(Array.from(saved.children, panel => panel.type), [
        'package/example/first',
        'package/example/last'
    ]);
});

test('all missing panels leave an empty column with restoration completed', async () => {
    const context = createColumn();
    restore(context, [child('removed-erp')]);
    context.requests[0].failure(new Error('Module no longer exists'));
    await settle();
    assert.equal(context.column.$__unserialize, false);
    assert.equal(context.panels.length, 0);
    assert.equal(context.warnings.length, 1);
    assert.deepEqual(context.errors, []);

    context.column.resize();
    context.setWindowWidth(1400);
    assert.doesNotThrow(() => context.column.resize());
    assert.equal(context.column.$mode, 'desktop');
    assert.equal(context.column.isOpen(), true);
});

test('empty saved columns complete restoration without loading any modules', async () => {
    const context = createColumn();
    restore(context, []);
    await settle();
    assert.equal(context.column.$__unserialize, false);
    assert.equal(context.requests.length, 0);
    assert.deepEqual(context.errors, []);
});

test('legacy QUI module names are normalized and valid panels retain open state', async () => {
    const context = createColumn();
    const legacy = child('legacy', true);
    legacy.type = 'QUI.controls.desktop.Panel';
    restore(context, [legacy, child('closed')]);
    assert.deepEqual(context.requests[0].modules, ['controls/desktop/Panel']);
    context.requests.forEach(request => request.success(context.Panel));
    await settle();
    assert.equal(context.panels[0].isOpen(), true);
    assert.equal(context.panels[1].isOpen(), false);
    assert.equal(context.column.$__unserialize, false);
    assert.deepEqual(context.warnings, []);
});

test('panel constructor and restore exceptions do not block remaining panels', async () => {
    const context = createColumn();
    restore(context, [child('broken-constructor'), child('broken-restore'), child('valid', true)]);
    context.requests[0].success(class {
        constructor() { throw new Error('Constructor failed'); }
    });
    context.requests[1].success(class {
        unserialize() { throw new Error('Restore failed'); }
    });
    context.requests[2].success(context.Panel);
    await settle();
    assert.deepEqual(context.panels.map(panel => panel.id), ['valid']);
    assert.equal(context.panels[0].isOpen(), true);
    assert.equal(context.column.$__unserialize, false);
    assert.deepEqual(context.errors, ['Error: Constructor failed', 'Error: Restore failed']);
});

test('responsive columns with panels still reopen the first panel on desktop', async () => {
    const context = createColumn();
    restore(context, [child('first'), child('second', true)]);
    context.requests.forEach(request => request.success(context.Panel));
    await settle();
    context.column.resize();
    assert.equal(context.column.$mode, 'responsive');
    context.setWindowWidth(1400);
    context.column.resize();
    assert.equal(context.column.$mode, 'desktop');
    assert.equal(context.panels[0].isOpen(), true);
    assert.equal(context.panels[1].isOpen(), false);
});

test('restoration before DOM creation remains deferred', () => {
    const context = createColumn();
    context.column.$Elm = null;
    const data = {attributes: context.column.attributes, children: [child('first')]};
    assert.equal(context.column.unserialize(data), context.column);
    assert.equal(context.column.$serialize, data);
    assert.equal(context.requests.length, 0);
});
