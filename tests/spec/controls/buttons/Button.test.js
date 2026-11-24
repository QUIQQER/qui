describe('qui/controls/buttons/Button alignment', function () {
    'use strict';

    let Button;
    let Container;
    let Control;
    const image = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M0 0h16v16H0z"/></svg>'
    );

    const center = element => {
        const bounds = element.getBoundingClientRect();
        return bounds.top + bounds.height / 2;
    };

    beforeEach(function (done) {
        require([
            'qui/controls/buttons/Button',
            'css!qui/controls/desktop/Panel.css'
        ], function (ButtonClass) {
            Button = ButtonClass;
            Container = document.createElement('div');
            Container.className = 'qui-panel-buttons';
            Container.style.fontFamily = 'Arial, sans-serif';
            document.body.appendChild(Container);
            done();
        });
    });

    afterEach(function () {
        Control?.destroy();
        Container.remove();
    });

    it('centers a font icon and its label in a toolbar button', function () {
        Control = new Button({text: 'Save', textimage: 'fa fa-save'}).inject(Container);
        const button = Control.getElm();
        const icon = button.firstElementChild;
        const label = button.lastElementChild;
        // Give the icon content even when the test host does not load Font Awesome.
        icon.textContent = '◆';
        expect(Math.abs(center(icon) - center(label))).toBeLessThan(0.1);
        expect(Math.abs(center(icon) - center(button))).toBeLessThan(0.1);
        expect(button.getBoundingClientRect().height).toBe(34);
    });

    it('centers an image icon next to its label', async function () {
        Control = new Button({text: 'Image', textimage: image}).inject(Container);
        const button = Control.getElm();
        await button.firstElementChild.decode();
        expect(Math.abs(center(button.firstElementChild) - center(button.lastElementChild))).toBeLessThan(0.1);
    });

    it('keeps the icon, label and dropdown arrow on the same center line', async function () {
        Control = new Button({text: 'Actions', textimage: 'fa fa-file'});
        Control.appendChild({text: 'Example action'});
        Control.inject(Container);
        await new Promise(resolve => Control.getContextMenu(() => requestAnimationFrame(resolve)));
        const button = Control.getElm();
        button.firstElementChild.textContent = '◆';
        const label = button.children[1];
        expect(Math.abs(center(button.firstElementChild) - center(label))).toBeLessThan(0.1);
        expect(Math.abs(center(Control.$Drop) - center(label))).toBeLessThan(0.1);
    });

    it('preserves the image-above-text layout', async function () {
        Container.className = '';
        Control = new Button({text: 'Image above', icon: image}).inject(Container);
        const button = Control.getElm();
        const imageContainer = button.firstElementChild;
        await imageContainer.firstElementChild.decode();
        expect(imageContainer.getBoundingClientRect().bottom).toBeLessThan(
            button.lastElementChild.getBoundingClientRect().top + 1
        );
    });

    it('retains the toolbar height for text-only and disabled buttons', function () {
        Control = new Button({text: 'Disabled', disabled: true}).inject(Container);
        expect(Control.getElm().disabled).toBe(true);
        expect(Control.getElm().getBoundingClientRect().height).toBe(34);
    });
});
