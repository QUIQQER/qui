const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const path = require('node:path');
const root = process.env.QUI_TEST_ROOT || process.cwd();
let Types;
vm.runInNewContext(fs.readFileSync(path.join(root, 'qui/controls/loader/Types.js'), 'utf8'), {
    define: (_name, _deps, factory) => {Types = factory();}
});

test('registry descriptors are isolated and own-color capabilities stay with the types', () => {
    const types = Types.getTypes();
    assert.equal(Object.keys(types).length, 10);
    assert.equal(types.pacman.supportsColor, false);
    assert.equal(types['ball-clip-rotate'].supportsColor, false);
    types.standard.files.push('wrong.css');
    types.standard.title = 'Modified';
    assert.equal(Types.getTypes().standard.files.length, 1);
    assert.equal(Types.getTypes().standard.title, 'Standard');
    for (const descriptor of Object.values(Types.getTypes())) {
        for (const file of descriptor.files) {
            assert.ok(fs.existsSync(path.join(root, file.replace('css!', ''))), file);
        }
    }
});

function loadLoader(moduleType, globalType, instanceType) {
    let prototype;
    let requiredFiles;
    const node = {
        getParent: () => node,
        measure: () => ({x: 200, y: 100}),
        set: () => {}, setStyle: () => {},
        hasClass: () => true
    };
    const context = {
        Promise,
        Class: function(definition) {return definition;},
        define: (_name, _deps, factory) => {
            prototype = factory({config: () => ({type: moduleType})}, {
                getAttribute: () => globalType
            }, {}, Types);
        },
        require: (files) => {requiredFiles = files;}
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'qui/controls/loader/Loader.js'), 'utf8'), context);
    const loader = Object.assign({}, prototype, {
        $animations: Types.getTypes(), $Elm: node, $Message: node,
        $FX: {animate: () => {}}, fireEvent: () => {},
        getAttribute: (key) => key === 'type' ? instanceType : false
    });
    loader.show();
    return requiredFiles[0];
}

test('module configuration is available to the first loader', () => {
    assert.equal(loadLoader('line-scale', false, false), 'css!qui/controls/loader/Loader.line-scale.css');
});
test('instance and explicit global defaults retain precedence', () => {
    assert.equal(loadLoader('line-scale', 'pacman', 'ball-pulse-rise'), 'css!qui/controls/loader/Loader.ball-pulse-rise.css');
    assert.equal(loadLoader('line-scale', 'pacman', false), 'css!qui/controls/loader/Loader.pacman.css');
});
test('unknown, missing and prototype-property types safely use the standard loader', () => {
    for (const type of ['removed-type', '', undefined, 'constructor', '__proto__']) {
        assert.equal(loadLoader(type, false, false), 'css!qui/controls/loader/Loader.standard.css');
    }
    assert.equal(loadLoader('line-scale', false, 'constructor'), 'css!qui/controls/loader/Loader.line-scale.css');
});
