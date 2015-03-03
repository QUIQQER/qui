# qui/controls/buttons/Switch

Mit dem on / off Switch Control können Schieberegler erstellt werden. 
Der Schieberegler passt seine Länge und Höhe automatisch an die Textlänge und Schriftgröße an.

##Eigenschaften

+ switchTextOn
+ switchTextOff
+ switchTextOnIcon
+ switchTextOffIcon

### Icons [ optional ]

Der Schieberegler kann auch mit Font Icons verwendet werden. Je nach Bedarf ist es möglich
nur _Text_, nur _Icon_, oder auch _Text_ und _Icon_ anzeigen zu lassen.

Um Icons anzuzeigen muss der Name der gewünschten Icon aus der Iconpack angegeben werden.
Im folgenden Beispiel wird im **off** Zustand eine **x** Icon (**Font Awesome**) ohne Text angezeigt.

```javascript
new QUISwitch({
    switchTextOff     :  '',
    switchTextOffIcon : 'icon-remove',
})
```

## Ein Schieberegler erstellen

```javascript
require(['qui/controls/buttons/Switch'], function(QUISwitch)
{
    new QUISwitch({
        switchTextOn     :  '',
        switchTextOnIcon : 'icon-power-off',

        switchTextOff    :  '',
        switchTextOffIcon : 'icon-power-off'
    }).inject( document.body );
});
```

## Die wichtigsten Methoden

+ toggle()
+ on()
+ off()

### toggle()

Wechselt den Status.

### on()

Setzt den Status auf *1* (on)

### on()

Setzt den Status auf *0* (off)