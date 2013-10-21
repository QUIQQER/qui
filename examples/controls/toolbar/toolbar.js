
require([

    'qui/controls/toolbar/Bar',
    'qui/controls/toolbar/Tab'

], function(Tabbar, Tab)
{
    "use strict";

    var Container = document.id( 'container' );

    /**
     * Create a tabbar
     */
    var MyTabbar = new Tabbar({
        width : 300
    }).inject( Container );

    MyTabbar.appendChild(
        new Tab({
            text : 'Tab 1',
            icon : 'icon-heart'
        })
    ).appendChild(
        new Tab({
            text : 'Tab 2',
            icon : 'icon-bug'
        })
    ).appendChild(
        new Tab({
            text : 'Tab 3',
            icon : 'icon-coffee'
        })
    );

    MyTabbar.firstChild().activate();
});