# qui/controls/sitemap/Map

Mit den Sitemap Controls können Sie Navigationsbäume erstellen. Die Kinder können auf und zugeklappt werden.

[Standard Beispiel](../examples/index.php?file=controls/sitemap/sitemap),
[Standard multible](../examples/index.php?file=controls/sitemap/sitemap_multible)

## Eigenschaften

+ multible

### multible

true oder false
Schaltet mehrfach selektieren an oder aus. Standard = aus

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

+ firstChild()
+ appendChild()
+ clearChildren()
+ getSelectedChildren()
+ getChildren()
+ getChildrenByValue( value )
+ deselectAllChildren()
+ search( text )


### firstChild()

Gibt das erste Kind zurück


```javascript
MyMap.firstChild();
```

### appendChild()

Fügt ein Kind (qui/controls/sitemap/Item) in die Sitemap ein.

```javascript
MyMap.appendChild(
    new SitemapItem({
        text  : 'sitemap item 1',
        icon  : 'icon-home',
        value : 'home'
    })
);
```


### clearChildren()

Löscht alle Kinder aus der Sitemap

```javascript
MyMap.clearChildren();
```


### getSelectedChildren()

Gibt alle selektierten / markierten Kinder zurück.

```javascript
var list = MyMap.getSelectedChildren();
```

### getChildren( [selector] )

Gibt alle sichtbaren Kinder zurück.

```javascript
var list = MyMap.getChildren();
```

_selector_ ist optional, mit diesem können Filter übergeben werden um nur bestimmte Kinder zu erhalten..
_selector_ ist ein CSS selector. zB.

```javascript
var selector = '[data-value="2"]';
```

oder

```javascript
var selector = '.my-css-class';
```


### getChildrenByValue( value )

Gibt bestimmte Kinder mit dem gewünschten Wert zurück.

```javascript
MyMap.getChildrenByValue( value );
```

Ist sozusagen eine alternative für

```javascript
MyMap.getChildren( '[data-value="'+ value +'"]' );
```


### deselectAllChildren()

Demarkiert alle Kinder, falls welche markiert sind.

```javascript
MyMap.deselectAllChildren( value );
```

### search( text )

Sucht bestimmte Kinder und gibt diese zurück. Es wird der Text der einzelnen Kinder durchsucht.

```javascript
var result = MyMap.search( 'home' );
```
