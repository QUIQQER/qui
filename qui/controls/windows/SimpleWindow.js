/**
 * SimpleWindow
 */
define('qui/controls/windows/SimpleWindow', [

    'qui/QUI',
    'qui/controls/windows/Popup',
    'css!qui/controls/windows/SimpleWindow.css'

], function (QUI, QUIPopup) {
    'use strict';

    return new Class({

        Extends: QUIPopup,
        Type: 'qui/controls/windows/SimpleWindow',

        Binds: [
            'create',
            'refreshWindowModeClasses',
            '$queueCloseButtonPosition',
            '$onCloseButtonScroll'
        ],

        options: {
            maxHeight: 600,
            maxWidth: 800,
            contentPadding: false,
            contentPending: false,
            mobileMode: 'popup', // popup | fullScreen
            /**
             * Restrict which scroll areas may move the close button away from a native scrollbar.
             * Use this for custom layouts where only specific panels should affect its position.
             * false (default): discover scroll areas automatically.
             * string: CSS selector matching getContent() itself and/or its descendants.
             *
             * Example: mark the scrolling element with data-name="details-scroll" and pass
             * new SimpleWindow({closeButtonScrollSelector: '[data-name="details-scroll"]'}).
             * Select the element with overflow-y: auto/scroll, not its inner text wrapper.
             * This option does not make an element scrollable or force a button offset:
             * only native scrollbars occupying space next to the close button are considered.
             * Invalid selectors or selectors without matches add no scrollbar offset.
             * After changing this option at runtime, call refreshCloseButtonPosition().
             */
            closeButtonScrollSelector: false
        },

        initialize: function (options) {
            this.parent(options);

            this.$closeButtonFrame = null;
            this.$closeButtonRevealTimer = null;
            this.$closeButtonOffset = 0;
            this.$closeButtonTracking = false;
            this.$closeButtonRescan = true;
            this.$closeButtonAreas = [];

            this.addEvents({
                open: this.$startCloseButtonTracking,
                contentReady: this.refreshCloseButtonPosition,
                resize: () => {
                    this.refreshWindowModeClasses();
                    this.$queueCloseButtonPosition(true);
                },
                closeBegin: this.$stopCloseButtonTracking,
                destroy: this.$stopCloseButtonTracking
            });
        },

        create: function () {
            if (this.$Elm) {
                return this.$Elm;
            }

            this.parent();

            this.$Elm.querySelector('.qui-window-popup-title').destroy();
            this.$Elm.querySelector('.qui-window-popup-buttons').destroy();

            this.$Title = document.createElement('div');
            this.$TitleText = document.createElement('div');
            this.$Buttons = document.createElement('div');
            this.$Elm.classList.add('qui-window-simpleWindow');
            this.$Content.classList.remove('qui-window-popup-content');
            this.$Content.classList.add('qui-window-simpleWindow-content');

            if (this.getAttribute('contentPadding')) {
                this.$Content.classList.add('qui-window-simpleWindow-content--withPadding');
            }

            this.refreshWindowModeClasses();

            this.$CloseButton = document.createElement('button');
            this.$CloseButton.type = 'button';
            this.$CloseButton.name = 'close';
            this.$CloseButton.dataset.name = 'close';
            this.$CloseButton.className = 'btn btn-close qui-window-simpleWindow__closeBtn';
            this.$CloseButton.setAttribute('aria-label', this.getAttribute('closeButtonText'));
            this.$CloseButton.innerHTML = '<span class="fa fa-close" aria-hidden="true"></span>';
            this.$CloseButton.style.zIndex = 10;
            this.$CloseButton.style.visibility = 'hidden';
            this.$closeButtonRevealed = false;
            this.$CloseButton.addEventListener('click', () => this.close());
            this.$Elm.append(this.$CloseButton);

            return this.$Elm;
        },

        /**
         * Re-discover scroll areas after changing closeButtonScrollSelector or external styles.
         * Updates are batched; the selector is scoped to getContent(), including the content itself.
         */
        refreshCloseButtonPosition: function () {
            this.$queueCloseButtonPosition(true);
        },

        $startCloseButtonTracking: function () {
            this.$stopCloseButtonTracking();
            this.$closeButtonTracking = true;
            this.$closeButtonRescan = true;
            this.$closeButtonRoot = this.$Content.parentElement.matches('[data-name="scroll"]') ?
                this.$Content.parentElement : this.$Content;

            if (typeof window.ResizeObserver === 'function') {
                this.$closeButtonResizeObserver = new window.ResizeObserver(() => {
                    this.$queueCloseButtonPosition();
                });
            }

            this.$closeButtonMutationObserver = new MutationObserver((records) => {
                this.$queueCloseButtonPosition(records.some(record => record.type === 'attributes' ||
                    [...record.addedNodes, ...record.removedNodes].some(Node => Node.nodeType === 1)));
            });
            this.$closeButtonMutationObserver.observe(this.$closeButtonRoot, {
                subtree: true, childList: true, characterData: true, attributes: true
            });
            this.$closeButtonMutationObserver.observe(this.$Elm, {attributes: true});
            this.$Content.addEventListener('load', this.$queueCloseButtonPosition, true);
            this.$Elm.addEventListener('scroll', this.$onCloseButtonScroll, true);
            // Keep closing available even if initial content never finishes loading.
            this.$closeButtonRevealTimer = setTimeout(() => this.$revealCloseButton(), 1000);
            this.$queueCloseButtonPosition();
        },

        $stopCloseButtonTracking: function () {
            this.$closeButtonTracking = false;
            clearTimeout(this.$closeButtonRevealTimer);
            this.$closeButtonRevealTimer = null;
            if (this.$closeButtonFrame !== null) {
                cancelAnimationFrame(this.$closeButtonFrame);
                this.$closeButtonFrame = null;
            }
            if (this.$closeButtonResizeObserver) {
                this.$closeButtonResizeObserver.disconnect();
                this.$closeButtonResizeObserver = null;
            }
            if (this.$closeButtonMutationObserver) {
                this.$closeButtonMutationObserver.disconnect();
                this.$closeButtonMutationObserver = null;
            }
            if (this.$Content) {
                this.$Content.removeEventListener('load', this.$queueCloseButtonPosition, true);
            }
            if (this.$Elm) {
                this.$Elm.removeEventListener('scroll', this.$onCloseButtonScroll, true);
            }
            this.$closeButtonAreas = [];
            this.$closeButtonOffset = 0;
        },

        $revealCloseButton: function () {
            clearTimeout(this.$closeButtonRevealTimer);
            this.$closeButtonRevealTimer = null;
            if (!this.$closeButtonTracking || !this.$CloseButton || this.$closeButtonRevealed) {
                return;
            }

            const display = this.$CloseButton.style.display;
            this.$CloseButton.style.display = 'none';
            // Commit the hidden layout once to discard the initial transition from the old position.
            this.$CloseButton.getBoundingClientRect();
            this.$CloseButton.style.display = display;
            this.$CloseButton.style.removeProperty('visibility');
            this.$closeButtonRevealed = true;
        },

        $onCloseButtonScroll: function (event) {
            // Scrolling text does not move its scrollbar; only nested scroll areas can change position.
            if (this.$closeButtonAreas.some(Area => Area !== event.target && event.target.contains(Area))) {
                this.$queueCloseButtonPosition();
            }
        },

        $queueCloseButtonPosition: function (rescan) {
            this.$closeButtonRescan = this.$closeButtonRescan || rescan === true;
            if (!this.$closeButtonTracking || this.$closeButtonFrame !== null) {
                return;
            }
            this.$closeButtonFrame = requestAnimationFrame(() => {
                this.$closeButtonFrame = null;
                this.$updateCloseButtonPosition();
            });
        },

        $updateCloseButtonPosition: function () {
            if (!this.$Elm || !this.$CloseButton || !this.$Elm.offsetWidth) {
                return;
            }

            if (this.$closeButtonRescan) {
                const selector = this.getAttribute('closeButtonScrollSelector');
                let elements;

                if (selector) {
                    try {
                        elements = [...this.$Content.querySelectorAll(selector)];
                        if (this.$Content.matches(selector)) {
                            elements.unshift(this.$Content);
                        }
                    } catch (error) {
                        elements = [];
                    }
                } else {
                    elements = [this.$closeButtonRoot, ...this.$closeButtonRoot.querySelectorAll('*')];
                }

                this.$closeButtonAreas = elements.filter(Elm =>
                    /^(auto|scroll|overlay)$/.test(getComputedStyle(Elm).overflowY)
                );

                if (this.$closeButtonResizeObserver) {
                    this.$closeButtonResizeObserver.disconnect();
                    const targets = new Set([this.$Elm, this.$closeButtonRoot, this.$CloseButton]);
                    // Watch layout ancestors and siblings, not every paragraph in a long document.
                    this.$closeButtonAreas.forEach(Area => {
                        for (let Elm = Area; Elm && Elm !== this.$Elm; Elm = Elm.parentElement) {
                            targets.add(Elm);
                            Array.from(Elm.parentElement.children).forEach(Sibling => targets.add(Sibling));
                        }
                    });
                    targets.forEach(Elm => this.$closeButtonResizeObserver.observe(Elm));
                }
                this.$closeButtonRescan = false;
            }

            const windowBounds = this.$Elm.getBoundingClientRect();
            const windowScale = windowBounds.width / this.$Elm.offsetWidth;
            const button = this.$CloseButton.getBoundingClientRect();
            const baseGap = parseFloat(getComputedStyle(this.$CloseButton).right) - this.$closeButtonOffset;
            const originalRight = button.right + this.$closeButtonOffset * windowScale;
            const originalLeft = originalRight - button.width;
            let offset = 0;

            this.$closeButtonAreas.forEach(Area => {
                const styles = getComputedStyle(Area);
                const borderLeft = parseFloat(styles.borderLeftWidth) || 0;
                const borderRight = parseFloat(styles.borderRightWidth) || 0;
                const width = Area.offsetWidth - Area.clientWidth - borderLeft - borderRight;
                if (width <= 0 || !Area.offsetWidth || styles.visibility !== 'visible') {
                    return;
                }

                const bounds = Area.getBoundingClientRect();
                const scale = bounds.width / Area.offsetWidth;
                // clientLeft includes the scrollbar when the browser places it on the left (RTL).
                let left = Area.clientLeft - borderLeft > width / 2 ?
                    bounds.left + borderLeft * scale : bounds.right - (borderRight + width) * scale;
                let right = left + width * scale;
                let top = bounds.top;
                let bottom = bounds.bottom;

                for (let Parent = Area.parentElement; Parent && Parent !== this.$Elm; Parent = Parent.parentElement) {
                    const parentStyles = getComputedStyle(Parent);
                    const parentBounds = Parent.getBoundingClientRect();
                    if (parentStyles.overflowX !== 'visible') {
                        left = Math.max(left, parentBounds.left);
                        right = Math.min(right, parentBounds.right);
                    }
                    if (parentStyles.overflowY !== 'visible') {
                        top = Math.max(top, parentBounds.top);
                        bottom = Math.min(bottom, parentBounds.bottom);
                    }
                }

                if (right > left && bottom > top && top < button.bottom && bottom > button.top &&
                    right > originalLeft && left < originalRight + baseGap * windowScale) {
                    offset = Math.max(offset, (originalRight - left) / windowScale + baseGap);
                }
            });

            offset = Math.ceil(offset);
            if (offset !== this.$closeButtonOffset) {
                this.$closeButtonOffset = offset;
                this.$CloseButton.style.setProperty('--_scrollbar-offset', offset + 'px');
            }
            if (!this.getAttribute('contentPending')) {
                this.$revealCloseButton();
            }
        },

        refreshWindowModeClasses: function () {
            if (!this.$Elm) {
                return;
            }

            const isMobile = window.matchMedia('(max-width: 767px)').matches;
            const mobileMode = isMobile ? this.getAttribute('mobileMode') : false;

            this.$Elm.classList.toggle('qui-window-simpleWindow--mobileFullScreen', mobileMode === 'fullScreen');
            this.$Elm.classList.toggle('qui-window-simpleWindow--mobilePopup', mobileMode === 'popup');
        },

        getOpeningWidth: function () {
            if (window.matchMedia('(max-width: 767px)').matches) {
                if (this.getAttribute('mobileMode') === 'fullScreen') {
                    return QUI.getWindowSize().x;
                }

                if (this.getAttribute('mobileMode') === 'popup') {
                    return Math.max(QUI.getWindowSize().x - 24, 0);
                }
            }

            return this.parent();
        },

        getOpeningHeight: function () {
            if (window.matchMedia('(max-width: 767px)').matches) {
                if (this.getAttribute('mobileMode') === 'fullScreen') {
                    return QUI.getWindowSize().y;
                }

                if (this.getAttribute('mobileMode') === 'popup') {
                    return Math.max(QUI.getWindowSize().y - 24, 0);
                }
            }

            return this.parent();
        }
    });
});
