
require([

    'qui/controls/sitemap/Filter',
    'qui/controls/sitemap/Map',
    'qui/controls/sitemap/Item'

], function(SitemapFilter, SiteMap, SitemapItem)
{
    "use strict";

    var Container = document.id( 'container' );

    /**
     * Create a tabbar
     */

    var SubItem;

    var MyMap = new SiteMap({
        multible : true	// you can select multible items with CTRL and a mouseclick
    }).inject( Container );


    MyMap.appendChild(
        new SitemapItem({
            text : 'sitemap item 1',
            icon : 'icon-home'
        })
    );

    for ( var i = 0; i < 10; i++ )
    {
        SubItem = new SitemapItem({
            text : 'sub sitemap item '+ i,
            icon : 'icon-coffee'
        }).inject( MyMap.firstChild() );

        new SitemapItem({
            text : 'sub sub item '+ i,
            icon : 'icon-heart'
        }).inject( SubItem );
    }

    new SitemapFilter( MyMap ).inject(
        Container
    );

});