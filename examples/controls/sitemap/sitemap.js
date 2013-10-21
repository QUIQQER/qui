
require([

    'qui/controls/sitemap/Map',
    'qui/controls/sitemap/Item'

], function(SiteMap, SitemapItem)
{
    "use strict";

    var Container = document.id( 'container' );

    /**
     * Create a tabbar
     */

    var MyMap = new SiteMap().inject( Container );


    MyMap.appendChild(
        new SitemapItem({
            text : 'sitemap item 1'
        })
    );

    console.log( MyMap );


});