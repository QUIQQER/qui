# qui/controls/windows/Popup

Ein Fenster / Window Layer erstellen.

* Die Fenster sind responsive und passen sich bei kleineren Auflösungen an.
* Die Fenster zentrieren sich in der mitte des Bildschirms
* Die Fenster können asynchron oder synchron mit Inhalt befüllt werden

[Beispiele](../examples/index.php?file=controls/windows/popup)


## Eigenschaften

+ maxWidth
+ maxHeight
+ content
+ buttons
+ closeButtonText


## Ein Popup erstellen

```javascript

require(['qui/controls/windows/Popup'], function(Popup)
{
    "use strict";

    new Popup({
        content : 'Here we can set some text'
    }).open();
});

```

## Die wichtigsten Methoden

+ open()
+ close()
+ getContent()
+ setContent( HTML )
+ addButton( DOMNode )
+ openSheet()


### open()

Öffnet das Popup

### close()

Schließt das Popup

### getContent()

Gibt das Content DOMNode zurück

### setContent( HTML )

Setzt den Inhalt, der Inhalt muss ein String sein kann aber auch HTML beinhalten.

### addButton( DOMNode )

Fügt in die untere Buttonleiste ein DOMNode Element hinzu.


```javascript

require(['qui/controls/windows/Popup'], function(Popup)
{
    "use strict";

    var MyPopup = new Popup({
        content : 'Here we can set some text'
    });

    MyPopup.addButton(
        new Element('div', {
            'class' : 'btn btn-green'
            html    : 'submit',
            styles  : {
                width : 150
            }
        })
    );
});

```


