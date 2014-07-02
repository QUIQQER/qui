# qui/controls/loader/Loader

Erstellt eine Ladeanimation in einem DOM Element

[Beispiele](../examples/index.php?file=controls/loader/loader)

## Die wichtigsten Methoden

+ show()
+ hide()

## Eine Ladeanimation erstellen

```javascript

require(['qui/controls/loader/Loader'], function(Loader)
{
    "use strict";

    /**
     * Insert a loader in a div container
     */
    var Loader = new Loader().inject(
        document.id( 'container' )
    );
});
```

### Eine Ladeanimation anzeigen lassen

```javascript
    Loader.show();
```


### Eine Ladeanimation mit Text anzeigen lassen

```javascript
    Loader.show( 'Some Text' );
```


### Einen Ladeanimation verbergen

```javascript
    Loader.hide();
```
