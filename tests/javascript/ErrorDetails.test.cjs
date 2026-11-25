const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const vm = require('node:vm');

function loadPrototype() {
    let prototype;
    const context = vm.createContext({
        window: {},
        Class: function(definition) { return definition; },
        define(name, dependencies, factory) {
            if (name === 'qui/classes/QUI') {
                prototype = factory();
            }
        }
    });
    const source = fs.readFileSync(path.resolve(__dirname, '../../qui/classes/QUI.js'), 'utf8');
    vm.runInContext(source, context);
    return prototype;
}

test('trigger forwards all browser error details and preserves the original Error object', () => {
    const prototype = loadPrototype();
    const error = new Error('Basket failed');
    let event;
    const instance = {fireEvent(name, args) { event = {name, args: Array.from(args)}; }};
    const returned = prototype.trigger.call(instance, error.message, '/basket.js', 42, 16, error);
    assert.equal(returned, instance);
    assert.equal(event.name, 'error');
    assert.deepEqual(event.args, [error.message, '/basket.js', 42, 16, error]);
    assert.equal(event.args[4], error);
});

test('legacy three-argument trigger calls remain compatible', () => {
    const prototype = loadPrototype();
    let received;
    prototype.trigger.call({fireEvent(name, args) { received = Array.from(args); }}, 'Failed', '/basket.js', 42);
    assert.deepEqual(received.slice(0, 3), ['Failed', '/basket.js', 42]);
    assert.equal(received[3], undefined);
    assert.equal(received[4], undefined);
});
