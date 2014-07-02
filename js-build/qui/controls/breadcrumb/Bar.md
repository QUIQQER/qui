# qui/controls/breadcrumb/Bar

Das qui/controls/breadcrumb/Bar Control erzeugt ein Breadcrumb Control.
Es stellt das Parent für alle BreadCrumb-Items.


[Beispiele](../examples/index.php?file=controls/breadcrumb/bar)

## Eigenschaften

+ width
+ itemClasses
+ cssclass

### width

Legt die Breite der Breadcrumb fest

### itemClasses

Mit itemClasses können allen Kind Elementen während des hinzufügens extra CSS Klasse vergeben werden.
Diese Eigenschaft hilft bei Formatierungen alle Kind Elementen.

Beispiel:

Jedes Kind bekommt die radius5 Klasse zusätzlich

```javascript
    new Bar({
        itemClasses : 'radius5'
    });
```

Die Eigenschaft kann als String oder Array übergeben werden

```javascript
    new Bar({
        itemClasses : ['radius5', 'icon-heart']
    });
```

## Eine Breadcrumb erstellen

```javascript

require([

    'qui/controls/breadcrumb/Bar',
    'qui/controls/breadcrumb/Item'

], function(Bar, Item)
{
    var Breadcrumb = new Bar().inject(
        document.id( 'container' )
    );

    // Items hinzufügen
    new Item({
        text : 'entry 1',
        events :
        {
            onClick : function(Item, event) {
                console.log(Item);
            }
        }
    }).inject( Breadcrumb ) ;

    new Item({
        text : 'entry 2'
    }).inject( Breadcrumb ) ;

    new Item({
        text : 'entry 3'
    }).inject( Breadcrumb ) ;
});

```

## Die wichtigsten Methoden

+ appendChild( Item )
+ firstChild()
+ lastChild()
+ getChildren()
+ clear()

### appendChild( Item )

Ein Item der Breadcrumb hinzufügen

```javascript
require([

    'qui/controls/breadcrumb/Bar',
    'qui/controls/breadcrumb/Item'

], function(Bar, Item)
{
    var Breadcrumb = new Bar().inject(
        document.id( 'container' )
    );

    Breadcrumb.appendChild(
        new Item({
            text : 'entry 1'
        })
    );

    Breadcrumb.appendChild(
        new Item({
            text : 'entry 1'
        })
    ).appendChild(
        new Item({
            text : 'entry 1'
        })
    ).appendChild(
        new Item({
            text : 'entry 1'
        })
    );
});

```


### firstChild()

Das erste Item in der Breadcrumb bekommen

```javascript
    var Item = Breadcrumb.firstChild();

    Item.getAttribute( 'text' );
```

### lastChild()

Das letzte Item in der Breadcrumb bekommen

```javascript
    var Item = Breadcrumb.lastChild();

    Item.getAttribute( 'text' );
```


### getChildren()

Alle Kinder einer Breadcrumb bekommen

```javascript
    var list = Breadcrumb.getChildren();

    console.log( list.length );
```


### clear()

Breadcrumb leeren


```javascript
    Breadcrumb.clear();

    console.log( Breadcrumb.getChildren().length ); // = 0
```
