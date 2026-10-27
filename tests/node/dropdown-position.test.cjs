const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const vm = require('node:vm');
const root = process.env.QUI_TEST_ROOT || process.cwd();

function fixture({width = 800, height = 600, menuWidth = 200, menuHeight = 120, scrollX = 0, scrollY = 0} = {}) {
    let prototype;
    const styles = {};
    const containerStyles = {};
    const classes = new Set();
    const attributes = {};
    const elm = {
        style: Object.assign(styles, {setProperty: (key, value) => styles[key] = value}),
        classList: {
            add: (...names) => names.forEach(name => classes.add(name)),
            remove: (...names) => names.forEach(name => classes.delete(name))
        },
        getBoundingClientRect: () => ({
            width: Math.min(menuWidth, width - 16),
            height: parseFloat(styles.height) || menuHeight
        })
    };
    const container = {
        style: containerStyles,
        getBoundingClientRect: () => ({
            height: containerStyles.maxHeight === ''
                ? menuHeight
                : Math.min(menuHeight, parseFloat(containerStyles.maxHeight))
        })
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'qui/controls/contextmenu/Menu.js'), 'utf8'), {
        document: {documentElement: {clientWidth: width, clientHeight: height}},
        window: {scrollX, scrollY},
        Class: function (definition) {return definition;},
        define: (name, dependencies, factory) => prototype = factory({}, {}, {})
    });
    const menu = Object.assign(Object.create(prototype), {
        $Container: container,
        getElm: () => elm,
        setAttribute: (name, value) => attributes[name] = value,
        show: () => styles.height = menuHeight + 'px',
        setPosition: (left, top) => Object.assign(styles, {left, top})
    });
    const anchor = (left, top, width = 80, height = 40) => ({
        isConnected: true,
        getBoundingClientRect: () => ({left, top, right: left + width, bottom: top + height, width, height})
    });
    return {menu, anchor, styles, classes, containerStyles};
}

test('right-aligned dropdowns meet the button edge and point toward its center', () => {
    const {menu, anchor, styles, classes} = fixture();
    assert.equal(menu.showAt(anchor(700, 40), 'topRight'), menu);
    assert.equal(styles.left, 580);
    assert.equal(styles.top, 90);
    assert.equal(parseFloat(styles['--_qui-menu-arrow-left']) + styles.left + 10, 740);
    assert.ok(classes.has('qui-context-corner-topRight'));
});

test('left-aligned dropdowns retain left alignment', () => {
    const {menu, anchor, styles} = fixture();
    menu.showAt(anchor(100, 40), 'top');
    assert.equal(styles.left, 100);
    assert.equal(styles.top, 90);
});

test('dropdowns flip above buttons near the bottom of the viewport', () => {
    const {menu, anchor, styles, classes} = fixture();
    menu.showAt(anchor(700, 552), 'topRight');
    assert.equal(styles.top, 422);
    assert.ok(classes.has('qui-context-corner-bottomRight'));
    assert.ok(!classes.has('qui-context-corner-topRight'));
});

test('explicit bottom corners prefer above and flip below when necessary', () => {
    const {menu, anchor, styles, classes} = fixture();
    menu.showAt(anchor(100, 400), 'bottom');
    assert.equal(styles.top, 270);
    assert.ok(classes.has('qui-context-corner-bottom'));
    menu.showAt(anchor(100, 8), 'bottom');
    assert.equal(styles.top, 58);
    assert.ok(classes.has('qui-context-corner-top'));
    assert.ok(!classes.has('qui-context-corner-bottom'));
});

test('both viewport edges constrain horizontal placement', () => {
    const {menu, anchor, styles} = fixture();
    menu.showAt(anchor(0, 40), 'topRight');
    assert.equal(styles.left, 8);
    menu.showAt(anchor(750, 40), 'top');
    assert.equal(styles.left, 592);
});

test('long menus scroll within the space below the button', () => {
    const {menu, anchor, styles, containerStyles} = fixture({menuHeight: 900});
    menu.showAt(anchor(100, 30), 'top');
    assert.equal(containerStyles.maxHeight, '512px');
    assert.equal(containerStyles.overflowY, 'auto');
    assert.equal(styles.top, 80);
    assert.equal(parseFloat(styles.height) + styles.top, 592);
});

test('document scrolling is included exactly once', () => {
    const {menu, anchor, styles} = fixture({scrollX: 30, scrollY: 400});
    menu.showAt(anchor(100, 40), 'top');
    assert.equal(styles.left, 130);
    assert.equal(styles.top, 490);
});

test('detached anchors do not open or move a menu', () => {
    const {menu, anchor, styles, classes} = fixture();
    const detached = anchor(100, 40);
    detached.isConnected = false;
    assert.equal(menu.showAt(detached, 'top'), menu);
    assert.equal(styles.left, undefined);
    assert.equal(classes.size, 0);
});
