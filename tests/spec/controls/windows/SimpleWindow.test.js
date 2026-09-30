/* global beforeEach, afterEach, spyOn */
describe('qui/controls/windows/SimpleWindow scrollbar clearance', function() {
    'use strict';

    let SimpleWindow;
    let Win;
    let Style;

    const waitFor = async function(predicate) {
        const deadline = Date.now() + 2500;
        while (!predicate()) {
            if (Date.now() > deadline) {
                throw new Error('Close button did not settle at the expected position');
            }
            await new Promise(resolve => setTimeout(resolve, 30));
        }
    };
    const pause = () => new Promise(resolve => setTimeout(resolve, 100));
    const button = () => Win.getElm().querySelector('[name="close"]');
    const visible = () => getComputedStyle(button()).visibility === 'visible';
    const right = () => parseFloat(getComputedStyle(button()).right);
    const scrollbarWidth = Elm => Elm.offsetWidth - Elm.clientWidth;
    const area = () => Win.getContent().querySelector('[data-name="scroll"]');
    const text = size => '<div data-name="text" style="height:' + size + 'px"></div>';
    const layout = function(mode, size) {
        const media = '<div data-name="media" style="flex:0 0 120px"></div>';
        const scroll = '<div data-name="scroll" style="flex:1;min-width:0;min-height:0;overflow:auto">' + text(size) + '</div>';
        return '<div style="display:flex;height:100%;min-height:0;flex-direction:' +
            (mode === 'top' ? 'column' : 'row') + '">' +
            (mode === 'right' ? scroll + media : media + scroll) + '</div>';
    };
    const open = async function(content, options) {
        Win = new SimpleWindow(Object.assign({maxWidth: 500, maxHeight: 300, content: content}, options));
        Win.getElm().classList.add('simple-window-scrollbar-test');
        await Win.open();
        await pause();
    };

    beforeEach(function(done) {
        Style = document.createElement('style');
        Style.textContent = '.simple-window-scrollbar-test *::-webkit-scrollbar {width:16px;height:16px;}' +
            '.simple-window-scrollbar-test *::-webkit-scrollbar-thumb {background:#999;}' +
            '.simple-window-scrollbar-test button[name="close"] {width:44px;height:44px;padding:0;}';
        document.head.append(Style);
        require(['qui/controls/windows/SimpleWindow'], function(Module) {
            SimpleWindow = Module;
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
        Style.remove();
    });

    const firstVisiblePosition = () => new Promise((resolve, reject) => {
        const deadline = Date.now() + 2500;
        const sample = () => {
            if (visible()) {
                resolve(right());
            } else if (Date.now() > deadline) {
                reject(new Error('Close button did not become visible'));
            } else {
                requestAnimationFrame(sample);
            }
        };
        requestAnimationFrame(sample);
    });

    it('is already positioned in its first visible frame with a template transition', async function() {
        // template-presentation applies this transition to all buttons, including the close button.
        Style.textContent += '.btn {transition:all .15s ease-in-out;}';
        Win = new SimpleWindow({maxWidth: 500, maxHeight: 300, content: layout('left', 900)});
        Win.getElm().classList.add('simple-window-scrollbar-test');
        const opening = Win.open();
        const firstPosition = await firstVisiblePosition();
        await opening;
        expect(firstPosition).toBe(4 + scrollbarWidth(area()));
        await pause();
        expect(right()).toBe(firstPosition);
    });

    it('does not animate from the edge after asynchronous content becomes ready', async function() {
        Style.textContent += '.btn {transition:all .15s ease-in-out;}';
        await open('', {contentPending: true});
        Win.getContent().innerHTML = text(900);
        Win.setAttribute('contentPending', false);
        Win.fireEvent('contentReady', [Win]);
        const firstPosition = await firstVisiblePosition();
        expect(firstPosition).toBe(4 + scrollbarWidth(Win.getContent()));
        await pause();
        expect(right()).toBe(firstPosition);
    });

    it('preserves later right transitions and focus when the position is refreshed', async function() {
        Style.textContent += '.btn {transition:all .15s ease-in-out;}';
        await open(text(900));
        await waitFor(visible);
        const initial = right();
        button().focus();
        button().style.right = '64px';
        await waitFor(() => right() > initial && right() < 64);
        Win.refreshCloseButtonPosition();
        await new Promise(resolve => requestAnimationFrame(resolve));
        expect(visible()).toBe(true);
        expect(document.activeElement).toBe(button());
        await waitFor(() => right() === 64);
    });

    it('hides the button during opening and reveals it at the measured position', async function() {
        Win = new SimpleWindow({maxWidth: 500, maxHeight: 300, content: text(900)});
        Win.getElm().classList.add('simple-window-scrollbar-test');
        const opening = Win.open();
        expect(visible()).toBe(false);
        await opening;
        await waitFor(visible);
        expect(right()).toBe(4 + scrollbarWidth(Win.getContent()));
    });

    it('waits for asynchronous initial content before revealing the button', async function() {
        await open('', {contentPending: true});
        expect(visible()).toBe(false);
        Win.getContent().innerHTML = text(900);
        await pause();
        expect(visible()).toBe(false);
        Win.setAttribute('contentPending', false);
        Win.fireEvent('contentReady', [Win]);
        expect(visible()).toBe(false);
        await waitFor(visible);
        expect(right()).toBe(4 + scrollbarWidth(Win.getContent()));
    });

    it('accepts content prepared before opening', async function() {
        Win = new SimpleWindow({maxWidth: 500, maxHeight: 300, contentPending: true});
        Win.getElm().classList.add('simple-window-scrollbar-test');
        Win.getContent().innerHTML = text(900);
        Win.fireEvent('contentReady', [Win]);
        Win.setAttribute('contentPending', false);
        const opening = Win.open();
        expect(visible()).toBe(false);
        await opening;
        await waitFor(visible);
        expect(right()).toBe(4 + scrollbarWidth(Win.getContent()));
    });

    it('reveals an empty window when initial loading finishes with an error', async function() {
        await open('', {contentPending: true});
        expect(visible()).toBe(false);
        Win.setAttribute('contentPending', false);
        Win.fireEvent('contentReady', [Win]);
        await waitFor(visible);
        expect(right()).toBe(4);
    });

    it('keeps the button available after the loading timeout and later updates', async function() {
        await open('', {contentPending: true});
        expect(visible()).toBe(false);
        await waitFor(visible);
        expect(Win.getAttribute('contentPending')).toBe(true);
        Win.getContent().innerHTML = text(900);
        await pause();
        expect(visible()).toBe(true);
        Win.setAttribute('contentPending', false);
        Win.fireEvent('contentReady', [Win]);
        await waitFor(() => right() === 4 + scrollbarWidth(Win.getContent()));
        expect(visible()).toBe(true);
    });

    it('starts hidden again when reopening a window that is still loading', async function() {
        await open('', {contentPending: true});
        await Win.close();
        expect(Win.$closeButtonRevealTimer).toBeNull();
        await Win.open();
        expect(visible()).toBe(false);
        await pause();
        expect(visible()).toBe(false);
        Win.setAttribute('contentPending', false);
        Win.fireEvent('contentReady', [Win]);
        await waitFor(visible);
    });

    it('keeps the base gap without overflowing content', async function() {
        await open(text(20));
        expect(right()).toBe(4);
    });

    it('clears the outer content scrollbar and remains stable', async function() {
        await open(text(900));
        const width = scrollbarWidth(Win.getContent());
        expect(width).toBeGreaterThan(0);
        await waitFor(() => right() === 4 + width);
        await pause();
        expect(right()).toBe(4 + width);
    });

    it('ignores a nested scrollbar below the media header', async function() {
        await open(layout('top', 900));
        expect(scrollbarWidth(area())).toBeGreaterThan(0);
        expect(right()).toBe(4);
    });

    it('clears a nested scrollbar beside the button', async function() {
        await open(layout('left', 900));
        await waitFor(() => right() === 4 + scrollbarWidth(area()));
    });

    it('ignores a scroll area on the other side of the window', async function() {
        await open(layout('right', 900));
        expect(scrollbarWidth(area())).toBeGreaterThan(0);
        expect(right()).toBe(4);
    });

    it('reacts to content growth and shrinkage without an explicit refresh', async function() {
        await open(layout('left', 20));
        expect(right()).toBe(4);
        const Text = area().querySelector('[data-name="text"]');
        Text.style.height = '900px';
        await waitFor(() => right() === 4 + scrollbarWidth(area()) && right() > 4);
        Text.style.height = '20px';
        await waitFor(() => right() === 4);
    });

    it('discovers replaced content and responds to a layout switch', async function() {
        await open(text(20));
        Win.getContent().innerHTML = layout('top', 900);
        await pause();
        expect(right()).toBe(4);
        area().parentElement.style.flexDirection = 'row';
        await waitFor(() => right() === 4 + scrollbarWidth(area()) && right() > 4);
    });

    it('restricts detection to the supplied selector and supports runtime changes', async function() {
        await open(layout('left', 900), {closeButtonScrollSelector: '[data-name="media"]'});
        expect(right()).toBe(4);
        Win.setAttribute('closeButtonScrollSelector', '[data-name="scroll"]');
        Win.refreshCloseButtonPosition();
        await waitFor(() => right() === 4 + scrollbarWidth(area()));
        Win.setAttribute('closeButtonScrollSelector', '[data-name="missing"]');
        Win.refreshCloseButtonPosition();
        await waitFor(() => right() === 4);
    });

    it('does not confuse borders with scrollbar width', async function() {
        await open(layout('left', 20));
        area().style.border = '6px solid transparent';
        await pause();
        expect(right()).toBe(4);
    });

    it('ignores a left-hand RTL scrollbar', async function() {
        await open(layout('left', 900));
        area().dir = 'rtl';
        await waitFor(() => right() === 4);
        expect(area().clientLeft).toBeGreaterThan(0);
    });

    it('does not rescan while idle or measure ordinary text scrolling', async function() {
        await open(layout('left', 900));
        await waitFor(() => right() === 4 + scrollbarWidth(area()));
        await pause();
        const Update = spyOn(Win, '$updateCloseButtonPosition').and.callThrough();
        area().scrollTop = 100;
        await pause();
        expect(Update).not.toHaveBeenCalled();
    });

    it('ignores a scrollbar clipped away above its visible container', async function() {
        await open('<div style="height:120px"></div>' +
            '<div style="height:150px;overflow:hidden">' +
            '<div data-name="scroll" style="position:relative;top:-120px;height:250px;overflow:auto">' +
            text(900) + '</div></div>');
        expect(scrollbarWidth(area())).toBeGreaterThan(0);
        expect(right()).toBe(4);
    });

    it('clears the scrollbar when autoresize wraps the content', async function() {
        await open(text(900), {autoresize: true});
        expect(Win.getContent().parentElement.dataset.name).toBe('scroll');
        expect(scrollbarWidth(Win.getContent())).toBeGreaterThan(0);
        await waitFor(() => right() === 4 + scrollbarWidth(Win.getContent()));
    });

    it('does not add an offset when the scrollbar occupies no layout space', async function() {
        await open(layout('left', 900));
        Style.textContent += '.simple-window-scrollbar-test *::-webkit-scrollbar {width:0;}';
        Win.refreshCloseButtonPosition();
        await waitFor(() => right() === 4);
        expect(area().scrollHeight).toBeGreaterThan(area().clientHeight);
    });

    it('uses layout pixels when the whole window is scaled', async function() {
        await open(layout('left', 900));
        Win.getElm().style.transform = 'scale(0.8)';
        await pause();
        await waitFor(() => right() === 4 + scrollbarWidth(area()));
    });

    it('treats an invalid explicit selector as no matching areas', async function() {
        await open(layout('left', 900), {closeButtonScrollSelector: '['});
        expect(right()).toBe(4);
    });

    it('updates when a loaded image makes nested content overflow', async function() {
        await open(layout('left', 20));
        const Image = document.createElement('img');
        Image.style.display = 'block';
        Image.alt = '';
        area().append(Image);
        await pause();
        Image.src = 'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="900"/>');
        await waitFor(() => right() === 4 + scrollbarWidth(area()) && right() > 4);
    });

    it('disconnects on close and resumes after reopening', async function() {
        await open(text(900));
        await Win.close();
        expect(Win.$closeButtonResizeObserver).toBeNull();
        expect(Win.$closeButtonMutationObserver).toBeNull();
        expect(Win.$closeButtonFrame).toBeNull();
        expect(Win.$closeButtonRevealTimer).toBeNull();
        await Win.open();
        Win.getElm().classList.add('simple-window-scrollbar-test');
        await waitFor(() => right() === 4 + scrollbarWidth(Win.getContent()));
    });

    it('cancels pending measurements when destroyed', async function() {
        await open(text(900));
        Win.refreshCloseButtonPosition();
        Win.destroy();
        expect(Win.$closeButtonResizeObserver).toBeNull();
        expect(Win.$closeButtonMutationObserver).toBeNull();
        expect(Win.$closeButtonFrame).toBeNull();
        expect(Win.$closeButtonRevealTimer).toBeNull();
        await Win.close();
        Win = null;
    });
});
