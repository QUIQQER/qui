
# QUI

Copyright www.pcsg.de

www.pcsg.de
www.quiqqer.com

Licence MIT



## About QUIQQER

QUIQQER-UI is a modular user interface component framework written in JavaScript from www.pcsg.de

If you search a documentation, please look at http://doc.quiqqer.com/qui/doc/.
QUIQQER-UI or QUI are mainly used at QUIQQER



## Installation

### Installation via composer

Please add to your *composer.json*

```javascript
{
    "require" : {
        "quiqqer/qui" : "dev-dev"
    },

    "repositories": [{
        "type": "composer",
        "url": "http://update.quiqqer.com/"
    }]
}
```

```bash
php composer.phar install
```

If you dont use MooTools, please place MooTools and moofx before requirejs:


``` html
<!-- mootools -->
<script src="components/qui/qui/lib/mootools-core.js"></script>
<script src="components/qui/qui/lib/mootools-more.js"></script>
<script src="components/qui/qui/lib/moofx.js"></script>

<!-- include require -->
<script src="components/require-built.js"></script>

<!-- include qui -->
<script src="components/qui/init.js" data-main="your_start_script.js"></script>
```


### Installation via bower

``` bash
bower install http://dev.quiqqer.com:3000/quiqqer/qui.git
```

``` html
<!-- mootools -->
<script src="bower_components/qui/qui/lib/mootools-core.js"></script>
<script src="bower_components/qui/qui/lib/mootools-more.js"></script>
<script src="bower_components/qui/qui/lib/moofx.js"></script>

<!-- include require -->
<script src="bower_components/requirejs/require.js"></script>

<!-- include qui -->
<script src="bower_components/qui/init.js" data-main="test.js"></script>
```


### Installation via nodejs


``` bash
npm install -S "git+http://dev.quiqqer.com:3000/quiqqer/qui.git"
```

``` html
<!-- mootools -->
<script src="node_modules/quiqqer-qui/qui/lib/mootools-core.js"></script>
<script src="node_modules/quiqqer-qui/qui/lib/mootools-more.js"></script>
<script src="node_modules/quiqqer-qui/qui/lib/moofx.js"></script>

<!-- include require -->
<script src="node_modules/quiqqer-qui/qui/lib/requirejs.js"></script>

<!-- include qui -->
<script src="node_modules/quiqqer-qui/init.js" data-main="test.js"></script>
```






## Usage example

```javascript

require([

    'qui/controls/buttons/Button'

], function(QUIButton)
{
    new QUIButton({
        text   : 'my button',
        events :
        {
            onClick : function() {
                alert( 1 );
            }
        }
    }).inject( document.body );

});

```

You can find some examples at:
http://doc.quiqqer.com/qui/doc/




## Content-sized popup windows

`Popup` and derived windows such as `Confirm` support opt-in height adjustment:

```javascript
require(['qui/controls/windows/Popup'], function(Popup) {
    new Popup({
        title: 'Content-sized window',
        autoresize: true,
        maxHeight: false,
        content: '<p>The window follows its content height.</p>'
    }).open();
});
```

`autoresize` defaults to `false`. Enable it when creating the window. Its width
continues to follow `maxWidth`. A numeric `maxHeight` still caps the height;
`maxHeight: false` with `autoresize: true` allows growth up to the viewport height.
Overflowing content scrolls while the title and button bar remain visible.

`ResizeObserver` detects changes to the content, including AJAX-loaded controls,
images and removed elements. `setContent()`, `refresh()` and `resize()` also
recalculate the height. Observers are disconnected when the window closes or is
destroyed and are restored on reopening. `getContent()` continues to return the
content element; auto-sized windows wrap it in a separate scroll container.

## SimpleWindow close button and scrollbars

`SimpleWindow` automatically moves its close button left when a native vertical
scrollbar occupies space next to the button. Nested scroll areas below the button
or on the other side of the window do not affect it. Overlay scrollbars occupy no
layout space and do not add an offset.

The default edge gap is 4px and can be themed with
`--qui-window-simpleWindow-closeButton-gap`. The button stays inside the window.
Template transitions remain unchanged, including later `left` or `right` animations.

To restrict detection to particular scroll areas, pass a CSS selector:

```javascript
new SimpleWindow({
    closeButtonScrollSelector: '[data-name="content"], [data-name="popup"]'
}).open();
```

The selector matches only the window's content element and its descendants.
`false` (the default) discovers scroll areas automatically. A selector with no
matches (or an invalid selector) adds no scrollbar offset. The selected areas must still have a native
scrollbar next to the close button; selection does not force an offset.

DOM and element-size changes are observed while the window is open. Updates are
batched into animation frames, with no polling. Normal scrolling inside a single
area does not cause a new measurement. Closing or destroying the window disconnects
observers; reopening starts detection on the new content.

The close button initially stays invisible but measurable. It becomes visible
at its calculated position after the first measurement, then stays visible during
subsequent content changes. Immediately before its first reveal, the button briefly
uses `display: none` with one synchronous layout read to discard any transition
from its initial position. Its original display style is then restored. This reset
runs only once per opening and does not restrict later transitions or interrupt
keyboard focus during subsequent position updates. There is no additional delay
once the content is ready.

For asynchronously loaded initial content, set `contentPending: true` before the
first measurement. After inserting the content (or handling a loading error),
clear the flag and fire `contentReady`:

```javascript
win.setAttribute('contentPending', false);
win.fireEvent('contentReady', [win]);
```

This also works with content prepared before opening. As a fallback, the button
becomes visible one second after the window's `open` event even if content is still
pending. It may then move when late content arrives. Closing or destroying the
window cancels this timer; reopening starts a new initial measurement.

After changing the selector at runtime, or changing external styles without a
DOM or size change, call `refreshCloseButtonPosition()` to request a new scan.
Browsers without `ResizeObserver` still react to DOM changes, loaded media and
window resize events; call this method for other layout changes in those browsers.

## Complete example

```html
<!DOCTYPE HTML>
<html>
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

    <!-- mootools -->
    <script src="bower_components/qui/build/qui/lib/mootools-core.js"></script>
    <script src="bower_components/qui/build/qui/lib/mootools-more.js"></script>
    <script src="bower_components/qui/build/qui/lib/moofx.js"></script>

    <title>Insert title here</title>

</head>
<body>


    <!-- include require -->
    <script src="bower_components/requirejs/require.js"></script>

    <!-- include qui -->
    <script src="bower_components/qui/init.js" data-main="test.js"></script>

</body>
</html>
```



## Thanks

Parts of QUI are free open-source software and not from us.
We thank all for the nice work.

- MooTools ( http://mootools.net/ )
- requirejs ( requirejs.org/ )
- AMD css! plugin curl.js ( https://github.com/cujojs/curl )
- QUIQQER / QUI Font: http://fontfabric.com/multicolore-free-fonts/

An additional thanks to:

- Composer ( http://getcomposer.org )
- Bower ( http://bower.io )
- NodeJS ( http://nodejs.org/ )

Last but not least, the QUIQQER UI Idea based on MochaUI.
We decided to reimplement MochaUI idea, with AMD definition and create more controls.

Thanks for all the nice lines of code.
If we forget somebody, please not hesitate and write us an email.

Henning from QUIQQER
