
require([

    'qui/controls/desktop/Panel'

], function(Panel)
{
    "use strict";

    var Container = document.id( 'container' );

    Container.setStyles({
        width  : 400,
        height : 700,
        border : '1px solid #DDDDDD'
    });

    /**
     * Insert a loader in a div container
     */
    var MyPanel = new Panel({
        title  : 'My Panel',
        footer : true,
        icon   : 'icon-heart'
    }).inject( Container );

    MyPanel.resize();
});