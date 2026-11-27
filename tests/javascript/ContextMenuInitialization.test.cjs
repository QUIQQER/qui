const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../../qui/classes/QUI.js'), 'utf8');

function initialize(body) {
    const document = new EventTarget();
    document.body = body;
    document.id = value => value;

    const instance = {
        setAttributes() {},
        getAttribute() { return false; },
        parent() {}
    };

    vm.runInNewContext(source, {
        document,
        window: {
            requestAnimationFrame() {},
            addEvent() {},
            addEventListener() {}
        },
        Class: function(definition) { return definition; },
        Element: function() {},
        define(_name, _dependencies, factory) {
            const Service = function() {};
            const functions = {debounce: callback => callback};
            const prototype = factory({}, Service, Service, Service, Service, Service, functions);
            prototype.initialize.call(instance);
        }
    });

    return document;
}

test('registers the context menu click handler when the body is ready', () => {
    const document = initialize(null);
    const listeners = [];
    document.body = {
        addEventListener(name) {
            listeners.push(name);
        }
    };

    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.dispatchEvent(new Event('DOMContentLoaded'));

    assert.deepEqual(listeners, ['click']);
});

test('registers the context menu click handler immediately when the body exists', () => {
    const listeners = [];
    const body = {
        addEventListener(name) {
            listeners.push(name);
        }
    };

    const document = initialize(body);
    assert.deepEqual(listeners, ['click']);

    document.dispatchEvent(new Event('DOMContentLoaded'));
    assert.deepEqual(listeners, ['click']);
});
