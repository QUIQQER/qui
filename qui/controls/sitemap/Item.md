# qui/controls/sitemap/Item

Ein item für eine Sitemap.

[Standard Beispiel](../examples/index.php?file=controls/sitemap/sitemap),
[Standard multible](../examples/index.php?file=controls/sitemap/sitemap_multible)

## Eigenschaften

+ value
+ text
+ icon
+ alt
+ title
+ hasChildren

### value

Wert des Items. Durch ein Wert kann später das Kind besser gefunden werden.

### text

text welcher das Item besitzt.

### icon [optional]

icon kann ein Bild oder eine Font-Awesome Klasse sein.

### alt

Alternativ Text für das Item

### title

Titel Text für das Item (mouseover text)

### hasChildren (bool)

Hat das Item Kinder oder nicht. Generell wird diese Eigenschaft automatisch gesetzt.
Jedoch bei asynchronem Verhalten kann dies selbst gesetzt werden, damit die Kinder während der Laufzeit eingefügt werden können.


## Eine Sitemap erstellen

```javascript

require([

    'qui/controls/sitemap/Map',
    'qui/controls/sitemap/Item'

], function(SiteMap, SitemapItem)
{
    "use strict";

    var Container = document.id( 'container' );

    /**
     * Create a sitemap
     */
    var MyMap = new SiteMap().inject( Container );

    MyMap.appendChild(
        new SitemapItem({
            text : 'sitemap item 1',
            icon : 'icon-home'
        })
    );
});
```

## Die wichtigsten Methoden

### Icons

+ addIcon( icon )
+ removeIcon( icon )

### Verhalten

+ activate()
+ deactivate()
+ select()
+ deselect()
+ normalize()
+ holdBack()
+ click()
+ open()
+ close()
+ toggle()
+ isOpen()

### Kinder

+ appendChild( Child )
+ firstChild()
+ hasChildren()
+ getChildren()
+ clearChildren()
+ countChildren()

### Parents

+ getMap()
+ setMap()
+ getContextMenu()



