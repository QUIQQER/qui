# qui/controls/windows/Alert

Eine Alert Box

Die Alter Box erbt von qui/controls/windows/Popup und besitzt somit auch dessen Eigenschaften und Methoden.

[Beispiele](../examples/index.php?file=controls/windows/alert)


## Ein Alert erstellen

```javascript

require(['qui/controls/windows/Alert'], function(Alert)
{
    "use strict";

    new Alert({
        content : 'Our alert message'
    }).open();
});

```

