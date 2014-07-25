# qui/controls/contextmenu/Item

Context Menü Item für ein Context Menü

[Beispiele](../examples/index.php?file=controls/contextmenu/contextmenu)

## Eigenschaften

+ text
+ icon
+ styles
+ dragable

## Ein Context Menu Item erstellen

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

## Die wichtigsten Methoden

+ appendChild
+ getChildren
+ clear
+ disable
+ isDisabled
+ enable
+ setActive
+ setNormal
