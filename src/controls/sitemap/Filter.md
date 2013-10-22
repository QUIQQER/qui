# qui/controls/sitemap/Filter

Ein Sitemap Filter Control.
Mit diesem Control kann eine Suche für eine Sitemap erstellt werden.

[Standard Beispiel](../examples/index.php?file=controls/sitemap/sitemap_filter)

## Eigenschaften

+ styles
+ placeholder
+ withbutton

## Eine Sitemap mit Filter erstellen

```javascript
require([

    'qui/controls/sitemap/Filter',
    'qui/controls/sitemap/Map',
    'qui/controls/sitemap/Item'

], function(SitemapFilter, SiteMap, SitemapItem)
{
    "use strict";

    var Container = document.id( 'container' );

    /**
     * Create a map with a filter control
     */

    var MyMap = new SiteMap().inject( Container );

    MyMap.appendChild(
        new SitemapItem({
            text : 'sitemap item 1',
            icon : 'icon-home'
        })
    );

    var MyFilter = new SitemapFilter( MyMap ).inject(
        Container
    );

});
```

## Die wichtigsten Methoden

+ bindSitemap( qui/controls/sitemap/Map )
+ clearBinds()
+ getInput()
+ filter( str )

### bindSitemap( qui/controls/sitemap/Map )

Koppelt eine Sitemap an das Filter Control.
D.h. das Filter Control durchsucht dann diese Sitemap.

```javascript
MyFilter.bindSitemap( MyMap );
```

Es können auch mehrere Sitemaps an ein Control gekoppelt werden.

```javascript
MyFilter.bindSitemap( MyMap );
MyFilter.bindSitemap( MyMap2 );
MyFilter.bindSitemap( MyMap3 );
```

### clearBinds()

Löscht alle Beziehungen zwischen Sitemaps und diesem Control.

```javascript
MyFilter.clearBinds();
```

### getInput()

Gibt das Eingabe DOMNode Element zurück.

```javascript
var InputElm = MyFilter.getInput();
```

### filter( str )

Führt eine Filtersuche durch.

```javascript
MyFilter.filter( 'search' );
```

