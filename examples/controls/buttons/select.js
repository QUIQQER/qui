
require(['qui/controls/buttons/Select'], function(Select)
{
    "use strict";

    var MySelect = new Select({

    }).inject(
        document.id( 'container' )
    );

    MySelect.appendChild(
        'first', '1', 'icon-coffee'
    ).appendChild(
        'second', '2', 'icon-heart'
    );

});
