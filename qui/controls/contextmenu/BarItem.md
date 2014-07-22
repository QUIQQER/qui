# qui/controls/contextmenu/BarItem

Ein Eintrag in einer qui/controls/contextmenu/Bar

[Beispiele](../examples/index.php?file=controls/contextmenu/bar)

## Eigenschaften

+ text
+ icon
+ styles
+ dragable

## Ein Context Menu erstellen

```javascript

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


    // append the bar items to the bar
    Bar.appendChild( File )
       .appendChild( Edit )
       .appendChild( View );

});
```

## Die wichtigsten Methoden

+ focus()
+ blur()
+ show()
+ hide()
+ appendChild( qui/controls/contextmenu/Item )
+ getChildren() - getChildren( String )
+ clear
+ getContextMenu
+ setActive
+ isActive
+ setNormal

