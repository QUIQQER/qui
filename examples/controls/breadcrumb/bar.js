
require([

    'qui/controls/breadcrumb/Bar',
    'qui/controls/breadcrumb/Item'

], function(Bar, Item)
{
    "use strict";

    var Breadcrumb = new Bar().inject(
        document.id( 'container' )
    );

    new Item({
        text : 'entry 1',
        events :
        {
            onClick : function(Item, event) {
                console.log(Item);
            }
        }
    }).inject( Breadcrumb ) ;

    new Item({
        text : 'entry 2'
    }).inject( Breadcrumb ) ;

    new Item({
        text : 'entry 3'
    }).inject( Breadcrumb ) ;


    /**
     * Breadcrumb 2 with border radius
     */
    var Breadcrumb2 = new Bar({
        itemClasses : 'radius5'
    }).inject(
        document.id( 'container' )
    );

    new Item({
        text : 'entry 1',
        icon : 'icon-heart'
    }).inject( Breadcrumb2 ) ;

    new Item({
        text : 'entry 2',
        icon : 'icon-heart'
    }).inject( Breadcrumb2 ) ;

    new Item({
        text : 'entry 3',
        icon : 'icon-heart'
    }).inject( Breadcrumb2 ) ;

});