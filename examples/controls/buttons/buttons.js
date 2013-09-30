
// now we can build our UI
require(['qui/controls/buttons/Button'], function(Button)
{
    "use strict";

    new Button({
        text : 'test',
        events :
        {
            onClick : function() {
                console.log('button click');
            }
        }
    }).inject( document.id( 'container' ) );

    new Button({
        text : 'test',
        styles : {
            color : 'red'
        },
        events :
        {
            onClick : function() {
                console.log('button click');
            }
        }
    }).inject( document.id( 'container' ) );

});
