# qui/controls/buttons/Button

Mit dem Button Control können Buttons erstellt und auf Ihre Events reagiert werden.

[Beispiele](../examples/index.php?file=controls/buttons/buttons)

## Eigenschaften

+ text
+ textimage
+ title
+ icon
+ style
+ class

## Einen Button erstellen

```javascript
require(['qui/controls/buttons/Button'], function(Button)
{
    "use strict";

    new Button({
        text   : 'test',
        events :
        {
            onClick : function() {
                console.log('button click');
            }
        }
    }).inject( document.id( 'container' ) );
});
```

## Die wichtigsten Methoden

+ click()
+ setActive()
+ isActive()
+ disable()
+ enable()
