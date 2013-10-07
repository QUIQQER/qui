# qui/controls/windows/Popup

Ein Fenster / Window Layer erstellen.

* Die Fenster sind responsive und passen sich bei kleineren Auflösungen an.
* Die Fenster zentrieren sich in der mitte des Bildschirms
* Die Fenster können asynchron oder synchron mit Inhalt befüllt werden

[Beispiele](../examples/index.php?file=controls/windows/popup)


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

## Eigenschaften

+ maxWidth
+ maxHeight
+ content
+ buttons
+ closeButtonText
+ icon
+ title
+ class

### maxWidth

Optional
Gibt die maximale Breite des Popups an.
Falls die maximale Breite grösser ist als die verfügbare Displaybreite, passt sich das Popup an.

### maxHeight

Optional
Gibt die maximale Höhe des Popups an.
Falls die maximale Höhe grösser ist als die verfügbare Displayhöhe, passt sich das Popup an.

### content

Optional
Inhalt des Popup. Das Popup kann aber auch asynchron mit Inhalt befüllt werden.

Zum Beispiel mit

```javascript
Popup.setContent()
```

### buttons

Optional, Standard = true
Sollen die unteren Buttons des Fensters angezeigt werden oder nicht.


### closeButtonText

Optional
Text für den Schließen-Button

### icon

Optional
Bild für die Titelleiste. Es kann eine Font-Awesome CSS Klasse sein oder ein Pfad zu einem Bild.

### title

Optional
Text für die Titelleiste

### class

Extra CSS Klasse(n) für das Popup


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


