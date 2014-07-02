# qui/controls/toolbar/Bar

[Beispiele](../examples/index.php?file=controls/toolbar/toolbar)

## Eigenschaften

+ menu-button
+ slide
+ width
+ type

## Eine Toolbar erstellen

```javascript

require([
    'qui/controls/toolbar/Bar',
    'qui/controls/toolbar/Tab'
], function(Tabbar, Tab)
{
    "use strict";

    var Container = document.id( 'container' );

    /**
     * Create a tabbar
     */
    new Tabbar({
        width : 300
    }).inject(
        Container
    ).appendChild(
        new Tab({
            text : 'Tab 1'
        })
    ).appendChild(
        new Tab({
            text : 'Tab 2'
        })
    ).appendChild(
        new Tab({
            text : 'Tab 3'
        })
    );
});
```
