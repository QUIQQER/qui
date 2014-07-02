# qui/controls/toolbar/Tab

[Beispiele](../examples/index.php?file=controls/toolbar/toolbar)

## Eigenschaften

+ text
+ class
+ icon

### text

Toolbar Text

### class

Extra CSS Klass(en) welche dem Tab zugewiesen werden.

### icon

Ist optional.
Bestimmt ein Icon / Bild für Tab.
Kann eine URL zu einem Bild sein oder eine Font-Awesome Klasse.


## Ein Tab erstellen

```javascript

require(['qui/controls/toolbar/Tab'], function(Tabbar, Tab)
{
    "use strict";

    var Container = document.id( 'container' );

    /**
     * Create a tabbar
     */
    var MyTab = new Tab({
        text    : 'Tab 1',
        'class' : 'extra-css-class',
        icon    : 'icon-heart'
    });

});
```
