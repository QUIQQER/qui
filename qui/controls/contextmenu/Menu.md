# qui/controls/contextmenu/Menu

Context Menü für Elemente.
Dieses Menü kann für Elemente und oder für die rechte Maustaste verwendet werden.


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