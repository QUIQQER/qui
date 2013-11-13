
require([

    'qui/controls/taskbar/Bar',
    'qui/controls/taskbar/Task',
    'qui/controls/taskbar/Group'

], function(Taskbar, TaskbarTask, TaskbarGroup)
{
    "use strict";

    var Container = document.id( 'container' );

    /**
     * Create a taskbar
     */

    var MyTaskbar = new Taskbar().inject( Container );

/*
    MyTaskbar.appendChild(
        new SitemapItem({
            text : 'sitemap item 1',
            icon : 'icon-home'
        })
    );
*/

});