/* global beforeEach, afterEach, spyOn */
describe('qui/controls/windows/Popup autoresize', function() {
    'use strict';

    let Popup;
    let Confirm;
    let QUI;
    let Win;

    const waitFor = async function(predicate) {
        const deadline = Date.now() + 2500;

        while (!predicate()) {
            if (Date.now() > deadline) {
                throw new Error('Popup did not settle at the expected size');
            }

            await new Promise(resolve => setTimeout(resolve, 30));
        }
    };

    const height = () => Win.getElm().getBoundingClientRect().height;
    const content = size => '<div data-name="test-content" style="height:' + size + 'px"></div>';
    const open = async function(options) {
        Win = new Popup(Object.assign({autoresize: true, maxHeight: false, title: 'Test', buttons: false}, options));
        await Win.open();
        await waitFor(() => Math.abs(height() - Win.getOpeningHeight()) <= 1);
    };

    beforeEach(function(done) {
        require(['qui/controls/windows/Popup', 'qui/controls/windows/Confirm', 'qui/QUI'], function(PopupClass, ConfirmClass, qui) {
            Popup = PopupClass;
            Confirm = ConfirmClass;
            QUI = qui;
            done();
        });
    });

    afterEach(async function() {
        if (Win) {
            if (Win.isOpened()) {
                await Win.close();
            }

            Win.destroy();
            Win = null;
        }
    });

    it('preserves the fixed height and DOM structure when disabled', async function() {
        await open({autoresize: false, maxHeight: 300, content: content(30)});
        expect(Math.round(height())).toBe(Math.min(300, window.innerHeight));
        expect(Win.getContent().parentElement).toBe(Win.getElm());
        expect(Win.$autoResizeObserver).toBeNull();
    });

    it('fits short content including title and padding', async function() {
        await open({content: content(50)});
        expect(Math.round(height())).toBe(130);
        expect(Win.getContent().querySelector('[data-name="test-content"]')).not.toBeNull();
    });

    it('grows and shrinks after asynchronous DOM changes without calling resize', async function() {
        await open({content: content(30)});
        const initialHeight = height();
        const Extra = document.createElement('div');
        Extra.style.height = '180px';
        await new Promise(resolve => setTimeout(resolve, 40));
        Win.getContent().append(Extra);
        await waitFor(() => Math.abs(height() - initialHeight - 180) <= 1);
        Extra.remove();
        await waitFor(() => Math.abs(height() - initialHeight) <= 1);
    });

    it('reacts to an image gaining its intrinsic height after loading', async function() {
        await open({content: content(30)});
        const initialHeight = height();
        const Image = document.createElement('img');
        Image.alt = '';
        Image.style.display = 'block';
        Win.getContent().append(Image);
        await new Promise(resolve => setTimeout(resolve, 40));
        Image.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="100"/>');
        await waitFor(() => Math.abs(height() - initialHeight - 100) <= 1);
    });

    it('respects maxHeight, scrolls overflowing content and shrinks again', async function() {
        await open({maxHeight: 180, content: content(600)});
        expect(Math.round(height())).toBe(180);
        const Scroll = Win.getElm().querySelector('[data-name="scroll"]');
        expect(Scroll.scrollHeight).toBeGreaterThan(Scroll.clientHeight);
        Scroll.scrollTop = 50;
        expect(Scroll.scrollTop).toBe(50);
        Win.setContent(content(20));
        await waitFor(() => Math.abs(height() - 100) <= 1);
    });

    it('limits unlimited content to the viewport and retains title and buttons', async function() {
        await open({buttons: true, content: content(2000)});
        expect(Math.round(height())).toBe(window.innerHeight);
        const bounds = Win.getElm().getBoundingClientRect();
        const Buttons = Win.$Buttons.getBoundingClientRect();
        expect(bounds.top).toBeGreaterThanOrEqual(0);
        expect(bounds.bottom).toBeLessThanOrEqual(window.innerHeight + 1);
        expect(Buttons.height).toBe(50);
        expect(Buttons.bottom).toBeLessThanOrEqual(bounds.bottom);
    });

    it('recalculates wrapping after an explicit width resize', async function() {
        await open({maxWidth: 300, content: '<div>' + 'Some wrapping content. '.repeat(15) + '</div>'});
        const initialHeight = height();
        Win.setAttribute('maxWidth', 180);
        await Win.resize();
        await waitFor(() => height() > initialHeight + 20 && Math.abs(height() - Win.getOpeningHeight()) <= 1);
        expect(Math.round(Win.getElm().getBoundingClientRect().width)).toBe(180);
    });

    it('settles after multiple content changes during an animation', async function() {
        await open({content: content(20)});
        let resizes = 0;
        Win.addEvent('resizeBegin', () => resizes++);
        Win.setContent(content(100));
        await new Promise(resolve => setTimeout(resolve, 70));
        Win.setContent(content(200));
        await new Promise(resolve => setTimeout(resolve, 70));
        Win.setContent(content(40));
        await waitFor(() => Math.abs(height() - 120) <= 1);
        await new Promise(resolve => setTimeout(resolve, 400));
        expect(Math.round(height())).toBe(120);
        expect(resizes).toBeLessThan(6);
    });

    it('disconnects on close and observes the newly created content after reopening', async function() {
        await open({content: content(30)});
        const OldContent = Win.getContent();
        await Win.close();
        expect(Win.$autoResizeObserver).toBeNull();
        expect(Win.$autoResizeFrame).toBeNull();
        await Win.open();
        expect(Win.getContent()).not.toBe(OldContent);
        Win.getContent().innerHTML = content(70);
        await waitFor(() => Math.abs(height() - 150) <= 1);
    });

    it('works for inherited Confirm windows', async function() {
        Win = new Confirm({autoresize: true, maxHeight: false, title: 'Confirm', buttons: false});
        await Win.open();
        Win.setContent(content(60));
        await waitFor(() => Math.abs(height() - 140) <= 1);
    });

    it('responds to viewport resize events', async function() {
        await open({content: content(1000)});
        const Size = spyOn(QUI, 'getWindowSize').and.returnValue({x: 250, y: 220});
        QUI.fireEvent('resize');
        await waitFor(() => Math.abs(height() - 220) <= 1);
        expect(Math.round(Win.getElm().getBoundingClientRect().width)).toBe(250);
        Size.and.callThrough();
        QUI.fireEvent('resize');
        await waitFor(() => Math.abs(height() - window.innerHeight) <= 1);
    });

    it('recalculates on refresh even without ResizeObserver', async function() {
        const Observer = window.ResizeObserver;
        window.ResizeObserver = undefined;

        try {
            await open({content: content(20)});
            Win.getContent().innerHTML = content(90);
            Win.refresh();
            await waitFor(() => Math.abs(height() - 170) <= 1);
            Win.setContent(content(40));
            await waitFor(() => Math.abs(height() - 120) <= 1);
        } finally {
            window.ResizeObserver = Observer;
        }
    });

    it('disconnects the observer and cancels pending work on destroy', async function() {
        await open({content: content(20)});
        const Observer = Win.$autoResizeObserver;
        const Disconnect = spyOn(Observer, 'disconnect').and.callThrough();
        Win.setContent(content(100));
        expect(Win.$autoResizeFrame).not.toBeNull();
        Win.destroy();
        expect(Disconnect).toHaveBeenCalled();
        expect(Win.$autoResizeObserver).toBeNull();
        expect(Win.$autoResizeFrame).toBeNull();
        await Win.close();
        Win = null;
    });
});
