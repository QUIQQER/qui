
# QUI

Copyright www.pcsg.de

www.pcsg.de
www.quiqqer.com

Licence MIT

## About QUIQQER

QUIQQER-UI is a modular user interface component framework written in JavaScript from NameRobot GmbH

If you search a documentation, please look at http://doc.quiqqer.com/qui/doc/.
QUIQQER-UI or QUI are mainly used at QUIQQER

## Installation

### Installation via composer

*composer.json*

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

    php composer.phar install


If you use no MooTools, please place MooTools and moofx before requirejs:


``` html

<!-- mootools -->
<script src="components/qui/build/qui/lib/mootools-core.js"></script>
<script src="components/qui/build/qui/lib/mootools-more.js"></script>
<script src="components/qui/build/qui/lib/moofx.js"></script>

<-- include components -->
<script src="components/require-built.js"></script>

<-- include qui -->
<script src="components/qui/init.js" data-main="your_start_script.js"></script>

```


### Installation via bower

    bower install http://dev.quiqqer.com:3000/quiqqer/qui.git



## Usage

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




## Complete example

```html
<!DOCTYPE HTML>
<html>
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

    <!-- mootools -->
    <script src="components/qui/build/qui/lib/mootools-core.js"></script>
    <script src="components/qui/build/qui/lib/mootools-more.js"></script>
    <script src="components/qui/build/qui/lib/moofx.js"></script>

    <title>Insert title here</title>

</head>
<body>



<script src="components/require-built.js"></script>
<script src="components/qui/init.js" data-main="your_start_script.js"></script>

</body>
</html>
```





## Thanks

Parts of QUI are free open-source software and not from us.
We thank all for the nice work.

- Composer ( http://getcomposer.org )
- MooTools ( http://mootools.net/ )
- requirejs ( requirejs.org/ )
- AMD css! plugin curl.js ( https://github.com/cujojs/curl )

- QUIQQER / QUI Font: http://fontfabric.com/multicolore-free-fonts/

Last but not least, the QUIQQER UI based on MochaUI.
We decided to reimplement MochaUI.
We implemented the AMD definition and rewrite all controls.

Thanks for all the nice lines of code.
If we forget somebody, please not hesitate and write us an email.

Henning from QUIQQER
