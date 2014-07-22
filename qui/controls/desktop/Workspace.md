# qui/controls/desktop/Workspace

## Beispiele

+ [Workspace Beispiel](../examples/index.php?file=controls/desktop/workspace)
+ [Workspace Beispiel](../examples/index.php?file=controls/desktop/workspace_tasks)

## Eigenschaften


## Ein Workspace erstellen

```javascript

require([

    'qui/controls/desktop/Workspace',
    'qui/controls/desktop/Column',
    'qui/controls/desktop/Panel',
    'qui/controls/buttons/Button'

], function(Workspace, Column, Panel, Button)
{
    "use strict";


    var MyWorkspace = new Workspace().inject(
        document.id( 'container' )
    );

    // Columns
    var Column1 = new Column({
        title : 'My Column 1'
    });


    var Column2 = new Column({
        title : 'My Column 2',
        width : document.body.getSize().x * 0.8
    });

    MyWorkspace.appendChild( Column1 );
    MyWorkspace.appendChild( Column2 );


    Column1.appendChild(
        new Panel({
            title   : 'My Panel 1',
            icon    : 'icon-heart',
            content : '<p>html</p>'
        })
    );

    Column1.appendChild(
        new Panel({
            title   : 'My Panel 2',
            icon    : 'icon-coffee',
            content : '<p>html</p>'
        })
    );

    Column1.appendChild(
        new Panel({
            title   : 'My Panel 3',
            icon    : 'icon-bug',
            content : '<p>html</p>'
        })
    );

    Column2.appendChild(
        new Panel({
            title   : 'My Panel 1',
            icon    : 'icon-heart',
            content : '<p>html</p>'
        })
    );

    Column2.appendChild(
        new Panel({
            title   : 'My Panel 2',
            icon    : 'icon-coffee',
            content : '<p>html</p>'
        })
    );

    Column2.appendChild(
        new Panel({
            title   : 'My Panel 3',
            icon    : 'icon-bug',
            content : '<p>html</p>'
        })
    );

});

```
