# qui/controls/contextmenu/Menu

Diese Leiste baut eine Menüleiste auf.

[Beispiele](../examples/index.php?file=controls/contextmenu/bar)

## Eigenschaften

+ styles
+ width
+ openening
+ dragable


## Ein Context Menu erstellen

```javascript

require([

    'qui/controls/contextmenu/Bar',
    'qui/controls/contextmenu/BarItem'

], function(QUIMenuBar, QUIMenuBarItem)
{
    "use strict";


require([

    'qui/controls/contextmenu/Bar',
    'qui/controls/contextmenu/BarItem',
    'qui/controls/contextmenu/Item'

], function(QUIBarMenu, QUIBarMenuItem, QUIMenuItem)
{
    "use strict";

    var Bar  = new QUIBarMenu().inject( document.id( 'container' ) ),

        File = new QUIBarMenuItem({
            text : 'File'
        }),

        Edit = new QUIBarMenuItem({
            text : 'Edit'
        }),

        View = new QUIBarMenuItem({
            text : 'View'
        });


    File.appendChild(
        new QUIMenuItem({
            text : 'Menu 1',
            icon : 'icon-home'
        })
    ).appendChild(
        new QUIMenuItem({
            text : 'Menu 2',
            icon : 'icon-star'
        })
    ).appendChild(
        new QUIMenuItem({
            text : 'Menu 3',
            icon : 'icon-time'
        })
    ).appendChild(
        new QUIMenuItem({
            text : 'Menu 4',
            icon : 'icon-home'
        })
    );

    Edit.appendChild(
        new QUIMenuItem({
            text : 'Menu 1'
        })
    ).appendChild(
        new QUIMenuItem({
            text : 'Menu 2'
        })
    );

    View.appendChild(
        new QUIMenuItem({
            text : 'Menu 1'
        })
    ).appendChild(
        new QUIMenuItem({
            text : 'Menu 2'
        })
    ).appendChild(
        new QUIMenuItem({
            text : 'Menu 3'
        })
    );


    // append the bar items to the bar
    Bar.appendChild( File )
       .appendChild( Edit )
       .appendChild( View );

});
```

