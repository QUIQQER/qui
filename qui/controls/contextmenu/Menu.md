# qui/controls/contextmenu/Menu

Context Menü für Elemente.
Dieses Menü kann für Elemente und oder für die rechte Maustaste verwendet werden.

[Beispiele](../examples/index.php?file=controls/contextmenu/contextmenu)

## Eigenschaften

+ styles
+ width
+ title
+ shadow
+ corner
+ dragable


## Ein Context Menu erstellen


```javascript

require([

    'qui/controls/contextmenu/Menu',
    'qui/controls/contextmenu/Item'

], function(QUIMenu, QUIMenuItem)
{
    "use strict";

    // create the menu
    var Menu = new QUIMenu({
        events :
        {
            onBlur : function(Menu) {
                Menu.hide();
            }
        }
    }).inject( document.body );

    Menu.appendChild(
        new QUIMenuItem({
            name : 'first',
            text : 'First item',
            icon : 'icon-home',
            events :
            {
                onClick : function(Item) {
                    alert( 'click: '+ Item.getAttribute( 'text' ) );
                }
            }
        })
    );

    Menu.appendChild(
        new QUIMenuItem({
            name   : 'second',
            text   : 'Second item',
            icon   : 'icon-time',
            events :
            {
                onClick : function(Item) {
                    alert( 'click: '+ Item.getAttribute( 'text' ) );
                }
            }
        })
    );


    // open the menu with the context menu
    document.body.addEvent('contextmenu', function(event)
    {
        event.stop();

        Menu.setPosition( event.page.x, event.page.y ).show().focus();
    });
});
```

## Dropdown an einem Button ausrichten

Für ein an `document.body` eingefügtes Menü richtet `showAt()` das Menü an einem
sichtbaren Auslöser aus:

```javascript
Menu.showAt(Button.getElm(), 'topRight');
```

`top` und `topRight` öffnen unterhalb des Auslösers, `bottom` und `bottomRight`
oberhalb. `Right` richtet die rechte Menükante an der rechten Buttonkante aus.
Wenn auf der bevorzugten Seite zu wenig Platz ist, verwendet das Menü die andere
Seite, sofern diese mehr Platz bietet. Das Menü bleibt mit 8px Abstand innerhalb
des sichtbaren Browserbereichs; lange Menüs werden scrollbar. Der Menüzeiger
richtet sich nach dem Auslöser. Die Position wird bei jedem Aufruf neu berechnet.

QUI-Dropdown-Buttons verwenden diese Methode automatisch. Frei positionierte
Kontextmenüs können weiterhin `setPosition(x, y).show()` verwenden.
