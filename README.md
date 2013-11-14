
# QUI

Copyright NameRobot GmbH

www.namerobot.com
www.quiqqer.com

Licence LGPL v3

## About QUIQQER

QUIQQER-UI is a modular user interface component framework written in JavaScript from NameRobot GmbH

If you search a documentation, please look at http://doc.quiqqer.com/qui/doc/.
QUIQQER-UI or QUI are mainly used at QUIQQER

## Usage

``` html
<script src="//ajax.googleapis.com/ajax/libs/mootools/1.4.5/mootools-yui-compressed.js"></script>
<script src="/qui/lib/mootools-more.js"></script>
<script src="/qui/lib/moofx.js"></script>
<script src="/qui/lib/requirejs.js"></script>

<script>
// requirejs must know where it can be find quiqqer
require.config({
    paths : {
        "qui" : '/PATH_TO_THE_QUI_FOLDER'
    },
    map: {
        '*': {
            'css': '/PATH_TO_THE_QUI_FOLDER/lib/css.js'
        }
    }
});
</script>

<script>
// now we can use QUI
require(['qui/QUI'], function(QUI)
{
    "use strict";

});

// ein button control
require(['qui/buttons/Button'], function(Button)
{
    "use strict";

});
</script>

```

## Thanks

Parts of QUIQQER are free open-source software and not from us.
We thank all for the nice work.

- Composer ( http://getcomposer.org )
- MooTools ( http://mootools.net/ )
- requirejs ( requirejs.org/ )
- AMD css! plugin curl.js ( https://github.com/cujojs/curl )
- animate.css ( http://daneden.me/animate/ )
- prism ( http://prismjs.com/ )

- QUIQQER Font: http://fontfabric.com/multicolore-free-fonts/

Last but not least, the QUIQQER UI based on MochaUI.
We decided to reimplement MochaUI.
We implemented the AMD definition and rewrite all controls.

Thanks for all the nice lines of code.
If we forget somebody, please not hesitate and write us an email.

Henning and Moritz from NameRobot / QUIQQER
