# qui/classes/DOM

Einem qui/classes/DOM Objekt können Attribute, Methoden und Events zugewiesen werden.

Die qui/classes/DOM Klasse kann als Elternklasse aller Klassen verwendet werden.
Sie bietet Grundfunktionalität an, wie Event- und Attribute Handling.

## Die wichtigsten Methoden

+ getId
+ getType
+ setAttribute
+ setAttributes
+ getAttribute
+ addEvent
+ getEvent


## Initialisierung / Konstruktor

Beim Erstellen eines qui/classes/DOM Objekt können dem Object Attribute, Methoden, Events zugewiesen werden.


### Eigenschaften hinzufügen

Entweder direkt beim Erstellen

```javascript
require(['qui/classes/DOM'], function(DOM)
{
    var MyObject = new DOM({
        'attribute1' : 'value1',
        'attribute2' : 'value2',
        'attribute3' : 'value3'
    });

    MyObject.getAttribute( 'attribute1' );
});
```

oder per setAttribute / setAttributes


```javascript
require(['qui/classes/DOM'], function(DOM)
{
    var MyObject = new DOM();

    MyObject.setAttribute( 'attribute1', 'value1' );
    MyObject.setAttribute( 'attribute2', 'value2' );
    MyObject.setAttribute( 'attribute3', 'value3' );

    MyObject.getAttribute( 'attribute1' );
});
```


### Events hinzufügen

Entweder direkt beim Erstellen

```javascript
require(['qui/classes/DOM'], function(DOM)
{
    var MyObject = new DOM({
        events :
        {
            onSomething : function() {
                // do something
            }
        }
    });
});
```

oder per addEvent / addEvents

```javascript
require(['qui/classes/DOM'], function(DOM)
{
    var MyObject = new DOM();

    MyObject.addEvent('onSomething', function() {
        // do something
    });
});
```


### Methoden hinzufügen

```javascript
require(['qui/classes/DOM'], function(DOM)
{
    var MyObject = new DOM({
        methods :
        {
            myNewAction : function() {
                // do something
            }
        }
    });

    MyObject.myNewAction();
});
```

## Verwendung in Klassen (Vererbung)

Durch Extends kann eine Klasse sehr einfach von qui/classes/DOM erben.

```javascript
define('my/new/class', ['qui/classes/DOM'], function(DOM) {

    return new Class({

        Extends : DOM,
        Type    : 'my/new/class',

        initialize : function(attributes)
        {
            this.parent( attributes );
        },

        aNewMethodForMyNewClass : function()
        {

        }
    });
]);
```

Mehr über _Class_ findest du unter: http://mootools.net/docs/core/Class/Class
