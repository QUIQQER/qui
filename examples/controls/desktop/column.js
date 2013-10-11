
require([

    'qui/controls/desktop/Column',
    'qui/controls/desktop/Panel'

], function(Column, Panel)
{
    "use strict";

    var MyColumn = new Column({
        title  : 'My Column',
        height : 600,
        width  : 500
    }).inject( document.id( 'container' ) );

    MyColumn.appendChild(
        new Panel({
            title  : 'My Panel',
            icon   : 'icon-heart'
        })
    );

    MyColumn.appendChild(
        new Panel({
            title  : 'My Panel 2',
            icon   : 'icon-coffee'
        })
    );

});