# qui/controls/buttons/Select

Mit dem Select Control können Select DropDowns erstellt werden.
Das Select DropDown reagiert auch auf Tastatur Eingaben.
Zum Beispiel können die Arrow Keys (Pfeiltasten) verwendet werden.

[Beispiele](../examples/index.php?file=controls/buttons/select)

## Eigenschaften

+ style
+ class

### style [ optional ]

CSS Style Attribute für das Select.
Mit den _style_ attribute kannst du das Select vom Aussehen verändern.

_style_ ist ein MooTools Style Anweisung.

```javascript
new Select({
    style : {
        border : '1px solid red'
    }
});
```

### class [ optional ]

Mit dem _class_ Attribute kannst du eigene CSS Klassen dem Select Kontrol mit geben.

```javascript
new Select({
    'class' : 'my-own-css-class'
});
```


## Ein Select DropDown erstellen

```javascript

require(['qui/controls/buttons/Select'], function(Select)
{
    "use strict";

    var MySelect = new Select().inject(
        document.id( 'container' )
    );

    MySelect.appendChild(
        'first', '1', 'icon-coffee'
    ).appendChild(
        'second', '2', 'icon-heart'
    );

});

```

## Die wichtigsten Methoden

+ appendChild( text, value, icon )
+ firstChild()
+ clear()
+ setValue( value )
+ getValue()
+ open()
+ close()
+ disable()
+ enable()
+ isDisabled()

### appendChild( text, value, icon )

Fügt ein Kind / Eintrag in das Select DropDown ein.

_text_  = angezeigter Text
_value_ = Der Wert des Eintrages.
_icon_  = Icon welches verwendet werden soll (optional, kann auch eine Font-Awesome Klasse sein)

### firstChild()

```javascript
MySelect.appendChild( 'first', '1', 'icon-coffee' )
```

### clear()

Löscht alle Kinder / Einträge in dem Select DropDown.

```javascript
MySelect.clear()
```

### setValue( value )

Setzt den Wert des Select DropDowns.
Es muss natürlich ein Value sein welches in dem Select DropDown vorhanden ist.

```javascript
MySelect.setValue( '1' );
```

### getValue()

Gibt den aktuellen Wert des Select DropDowns zurück.

```javascript
var value = MySelect.getValue();
```

### open()

Öffnet das DropDown.

```javascript
MySelect.open();
```

### close()

Schließ das DropDown.

```javascript
MySelect.close();
```

### disable()

Deaktiviert das Select DropDown.
Das DropDown kann nicht mehr geöffnet werden, der Wert kann nicht mehr verändert werden.

```javascript
MySelect.disable();
```

### enable()

Aktiviert das DropDown wieder.

```javascript
MySelect.enable();
```

### isDisabled()

Gibt den Aktiv-Status (Boolwert) des Select DropDowns zurück.

```javascript
if ( MySelect.isDisabled() ) {

}
```






