
require([
    'qui/QUI',
    'qui/controls/buttons/Button'

], function(QUI, QUIButton)
{
    "use strict";

    var Container = document.id( 'container' );

    // button to send an error
    new QUIButton({
        text : 'Trigger an error message',
        styles : {
            margin: 10
        },
        events :
        {
            onClick : function()
            {
                // send an error
                QUI.getMessageHandler(function(MessageHandler) {
                    MessageHandler.addError( 'Oh my god, an error!' );
                });
            }
        }
    }).inject( Container );

 // button to send an error
    new QUIButton({
        text : 'Trigger an success message',
        styles : {
            margin: 10
        },
        events :
        {
            onClick : function()
            {
                // send an error
                QUI.getMessageHandler(function(MessageHandler) {
                    MessageHandler.addSuccess( 'All works find :-)' );
                });
            }
        }
    }).inject( Container );



    // button to show the message handler
    new QUIButton({
        text : 'Show message handler',
        styles : {
            margin: 10
        },
        events :
        {
            onClick : function()
            {
                // send an error
                QUI.getMessageHandler(function(MessageHandler) {
                    MessageHandler.open();
                });
            }
        }
    }).inject( Container );
});