
require([

    'qui/controls/desktop/Panel',
    'qui/controls/buttons/Button'

], function(Panel, Button)
{
    "use strict";

    var Container = document.id( 'container' );

    Container.setStyles({
        width : 400
    });

    /**
     * Insert a loader in a div container
     */
    var MyPanel = new Panel({
        title  : 'My Panel',
        footer : true,
        icon   : 'icon-heart',
        height : 700
    }).inject( Container );

    MyPanel.resize();

    MyPanel.setContent(
        '<h1>Some Content</h1>' +
        '<p>Here is some content stuff</p>'
    );

    MyPanel.addButton(
        new Button({
            text      : 'action',
            textimage : 'icon-coffee',
            events    :
            {
                onClick : function()
                {
                    alert( 'action click' );
                }
            }
        })
    );
});