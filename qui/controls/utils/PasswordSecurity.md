# qui/controls/utils/PasswordSecurity

Stärke eines Passwortes anzeigen.

```javascript

require(['qui/controls/utils/PasswordSecurity'], function(PasswordSecurity)
{
    "use strict";

    var Container = document.id( 'container' );

    // create an input field
    var Input = new Element('input', {
        type   : 'password',
        styles : {
            width : 200
        }
    }).inject( Container );


    // create the password security control
    new QUIPwSec({
        styles : {
            margin : '10px 0'
        }
    }, Input ).inject( Container );


    // set the focus to the input
    Input.focus();
});

```
