
require([

    'qui/controls/loader/Loader'

], function(Loader)
{
    "use strict";

    var Container = document.id( 'container' );

    Container.setStyles({
        width  : 400,
        height : 200,
        border : '1px solid #DDDDDD'
    });

    /**
     * Insert a loader in a div container
     */
    new Loader().inject(
        document.id( 'container' )
    ).show( 'loading ...' );

});