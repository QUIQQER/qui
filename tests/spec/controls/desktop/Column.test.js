/* global beforeAll, beforeEach, afterEach, spyOn */
describe('qui/controls/desktop/Column responsive panels', function() {
    'use strict';

    let QUI, Column, Panel, Host, Sidebar, Main, First, Second, WindowSize;

    const settle = function() {
        return new Promise(function(resolve) {
            setTimeout(resolve, 600);
        });
    };

    const buttons = function() {
        return Sidebar.getElm().querySelectorAll('[data-name="responsive-panel"]');
    };

    beforeAll(function(done) {
        require(['qui/QUI', 'qui/controls/desktop/Column', 'qui/controls/desktop/Panel'],
            function(QUIClass, ColumnClass, PanelClass) {
                QUI = QUIClass;
                Column = ColumnClass;
                Panel = PanelClass;
                done();
            });
    });

    beforeEach(async function() {
        WindowSize = spyOn(QUI, 'getWindowSize').and.returnValue({x: 1000, y: 900});
        Host = document.createElement('div');
        Object.assign(Host.style, {position: 'fixed', inset: '0', width: '1000px', height: '900px'});
        document.body.appendChild(Host);

        Sidebar = new Column({responsive: true, width: 300, height: 850}).inject(Host);
        Main = new Column({width: 950, height: 850}).inject(Host);
        First = new Panel({title: 'Webseiten', icon: 'fa fa-home', height: 700});
        Second = new Panel({title: 'E-COYN', icon: 'fa fa-shopping-cart', height: 200});
        Sidebar.appendChild(First);
        Sidebar.appendChild(Second);
        First.open();
        Second.minimize();
        Sidebar.resize();
        await settle();
    });

    afterEach(async function() {
        First.destroy();
        Second.destroy();
        Sidebar.destroy();
        Main.destroy();
        Host.remove();
        await settle();
    });

    it('opens the second panel when hovering its icon, keeping its header near the pointer', async function() {
        const iconTop = buttons()[1].getBoundingClientRect().top;
        buttons()[1].dispatchEvent(new MouseEvent('mouseenter'));
        await settle();

        expect(Second.isOpen()).toBe(true);
        expect(First.isOpen()).toBe(false);
        expect(Math.abs(Second.getElm().getBoundingClientRect().top - iconTop)).toBeLessThan(50);
    });

    it('keeps the icon in place and its panel open when a click follows hover', async function() {
        const Button = buttons()[1];
        const before = Button.getBoundingClientRect();
        Button.dispatchEvent(new MouseEvent('mouseenter'));
        await settle();
        const after = Button.getBoundingClientRect();
        expect(after.x).toBe(before.x);
        expect(after.y).toBe(before.y);
        expect(after.width).toBe(before.width);
        expect(after.height).toBe(before.height);
        Button.click();
        await settle();
        expect(Second.isOpen()).toBe(true);
        expect(First.isOpen()).toBe(false);
    });

    it('switches panels through the visible icon strip without resizing the columns again', async function() {
        buttons()[1].dispatchEvent(new MouseEvent('mouseenter'));
        await settle();
        const mainWidth = Main.getAttribute('width');
        buttons()[0].dispatchEvent(new MouseEvent('mouseenter'));
        await settle();
        expect(First.isOpen()).toBe(true);
        expect(Second.isOpen()).toBe(false);
        expect(Main.getAttribute('width')).toBe(mainWidth);
        expect(buttons()[0].getAttribute('aria-expanded')).toBe('true');
        expect(buttons()[1].getAttribute('aria-expanded')).toBe('false');
    });

    it('still opens the first panel when hovering the first icon', async function() {
        buttons()[0].dispatchEvent(new MouseEvent('mouseenter'));
        await settle();

        expect(First.isOpen()).toBe(true);
        expect(Second.isOpen()).toBe(false);
    });

    it('supports keyboard activation while keeping the icon focused', async function() {
        const Button = buttons()[1];
        expect(Button.tagName).toBe('BUTTON');
        expect(Button.getAttribute('aria-label')).toBe('E-COYN');
        Button.focus();
        Button.click();
        await settle();

        expect(Second.isOpen()).toBe(true);
        expect(First.isOpen()).toBe(false);
        expect(document.activeElement).toBe(Button);
        expect(Button.getAttribute('aria-expanded')).toBe('true');
        expect(buttons()[0].getAttribute('aria-expanded')).toBe('false');
    });

    it('supports a click without an earlier hover', async function() {
        buttons()[1].dispatchEvent(new MouseEvent('click', {detail: 1}));
        await settle();

        expect(Second.isOpen()).toBe(true);
        expect(First.isOpen()).toBe(false);
    });

    it('can reopen a different panel without changing the total column width', async function() {
        const mainWidth = Main.getAttribute('width');
        buttons()[1].dispatchEvent(new MouseEvent('mouseenter'));
        await settle();
        Sidebar.getElm().dispatchEvent(new window.PointerEvent('pointerleave', {pointerType: 'mouse'}));
        await settle();

        expect(Sidebar.getAttribute('width')).toBe(50);
        expect(Main.getAttribute('width')).toBe(mainWidth);

        buttons()[0].dispatchEvent(new MouseEvent('mouseenter'));
        await settle();
        expect(First.isOpen()).toBe(true);
        expect(Second.isOpen()).toBe(false);
        expect(Main.getAttribute('width') + Sidebar.getAttribute('width')).toBe(mainWidth + 50);
    });

    it('keeps the panel open when a touch pointer leaves on finger release', async function() {
        buttons()[1].click();
        await settle();
        Sidebar.getElm().dispatchEvent(new window.PointerEvent('pointerleave', {pointerType: 'touch'}));
        Sidebar.getElm().dispatchEvent(new MouseEvent('mouseleave'));
        await settle();
        expect(Second.isOpen()).toBe(true);
        expect(Sidebar.getAttribute('width')).toBeGreaterThan(50);
    });

    it('returns to desktop layout after leaving the responsive column', async function() {
        buttons()[1].dispatchEvent(new MouseEvent('mouseenter'));
        await settle();
        Sidebar.getElm().dispatchEvent(new window.PointerEvent('pointerleave', {pointerType: 'mouse'}));
        WindowSize.and.returnValue({x: 1400, y: 900});
        Sidebar.resize();
        await settle();

        expect(Sidebar.getAttribute('width')).toBeGreaterThan(50);
        expect(buttons()[0].getBoundingClientRect().width).toBe(0);
        expect(First.isOpen()).toBe(true);
    });
});
