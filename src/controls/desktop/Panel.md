# qui/controls/desktop/Panel

Ein Desktop Panel erzeugt einen kleinen Bereich,
ähnlich wie ein Fenster nur das ein Panel in ein Element integriert ist.

Das Panel kann gechlossen oder geöffnet werden, bietet Drag & Drop Funktionalität und vieles mehr.
Mit einem Panel können kleinere Programme übersichtlich dagestellt werden.

In Kombination mit qui/controls/desktop/Workspace und qui/controls/desktop/Column
können komplizierte Applikationen schnell und einfach erstellt werden.


## Beispiele

+ [Einfaches Panel](../examples/index.php?file=controls/desktop/panel)
+ [Panel mit Buttons](../examples/index.php?file=controls/desktop/panel_with_buttons)

## Eigenschaften

+ name
+ content
+ header
+ title
+ icon
+ footer
+ height
+ class
+ scrollbars
+ collapsible
+ collapseFooter
+ closeable
+ dragable
+ breadcrumb



## Ein Panel erstellen

```javascript
require(['qui/controls/desktop/Panel'], function(Panel)
{
    "use strict";

    /**
     * Insert a loader in a div container
     */
    var MyPanel = new Panel({
        title  : 'My Panel',
        footer : true,
        icon   : 'icon-heart'
    }).inject( document.id( 'container' ) );

    MyPanel.resize();
});
```

### Panel.Loader

Der Loader ist ein [qui/controls/loader/Loader](../examples/index.php?file=controls/loader/Loader) Control.

Loader anzeigen:

```javascript
MyPanel.Loader.show();
```

Loader verbergen:
```javascript
MyPanel.Loader.hide();
```
