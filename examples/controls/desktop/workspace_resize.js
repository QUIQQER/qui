/**
 *
 */




require([

    'qui/controls/desktop/Workspace',
    'qui/controls/desktop/Column',
    'qui/controls/desktop/Panel',
    'qui/controls/desktop/Tasks',
    'qui/controls/buttons/Button'

], function(Workspace, Column, Panel, TaskPanel, Button)
{
    "use strict";

    // load the default workspace
    var doc_size  = document.body.getSize(),
        Container = document.getElement( '.qui-workspace-container' );

    Container.setStyles({
        height : doc_size.y - 70
    });

    var MyWorkspace = new Workspace().inject( Container );

    // Columns
    var LeftColumn   = new Column(),

        MiddleColumn = new Column({
            width : doc_size.x * 0.8
        });


    MyWorkspace.appendChild( LeftColumn );
    MyWorkspace.appendChild( MiddleColumn );

    // projects panel
    LeftColumn.appendChild(
        new Panel({
            title : 'Projekte',
            icon  : 'icon-heart'
        })
    );

    // bookmarks panel
    LeftColumn.appendChild(
        new Panel({
            title : 'Bookmarks',
            icon  : 'icon-heart'
        })
    );

    // contextmenu
    require([
        'qui/controls/contextmenu/Bar',
        'qui/controls/contextmenu/BarItem',
        'qui/controls/contextmenu/Item'
    ], function(ContextmenuBar, ContextmenuBarItem, ContextmenuItem)
    {
        var Bar = new ContextmenuBar().inject(
            document.getElement( '.qui-menu-container' )
        );


        var Item = new ContextmenuBarItem({
            text : 'huhu'
        }).inject( Bar );

        Item.appendChild(
            new ContextmenuItem({
                text : 'sssssss'
            })
        );

    });
});