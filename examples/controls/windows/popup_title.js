
require(['qui/controls/windows/Popup'], function(Popup)
{
    "use strict";

    new Popup({
        content : 'We can set some content for the popup',
        title   : 'this is my window title',
        icon    : 'icon-bug'
    }).open();

});