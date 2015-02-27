# qui/controls/buttons/Switch

Mit dem onf / off Switch Control können Schieberegler erstellt werden. 
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

Der Schieberegler kann über eine Checkbox gelegt werden.

```javascript
require([
    'qui/QUI',
    'qui/controls/buttons/Switch',
    'qui/controls/buttons/Button'
], function(QUI, QUISwitch, QUIButton)
{           
    var list = document.getElements( '[type="checkbox"]' );

    for ( var i = 0, len = list.length; i < len; i++ )
    {
        new QUISwitch({
            switchTextOn      :  'ON',
            switchTextOnIcon  : 'icon-power-off',

            switchTextOff     :  'OFF',
            switchTextOffIcon : 'icon-power-off'

        }).inject( list[ i ].getParent() );


        list[ i ].destroy();
    }            
});
```

## Die wichtigsten Methoden

+ click()