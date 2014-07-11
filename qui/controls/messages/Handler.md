# qui/controls/messages/Handler

Der Message-Handler sammelt alle Nachrichten und kann diese für den Nutzer darstellen.
Der Message-Handler ist eines der wenigen Controls welches nicht per create() / inject() erstellt werden muss.

Wenn der Message-Handler im DOM noch nicht eingehängt ist, kann dieser trotzdem geöffnet werden.
Der Message-Handler bindet sich dann in das document.body Element ein und erscheint auf der linken Seite.

Über den Message-Handler lassen sich schnell die verschiedenen Nachrichtentypen senden.


## Die wichtigsten Methoden

+ create()
+ open()
+ close()
+ clear()
+ count()

## Nachrichten Methoden

+ add( qui/controls/messages/Message )
+ addAttention( String )
+ addError( String )
+ addException( Exception )
+ addInformation( String )
+ addSuccess( String )


QUI besitzt einen globalen Message Handler, dieser sollte auch verwendet werden.

```javascript
require(['qui/QUI'], function(QUI)
{
    QUI.getMessageHandler(function( Handler )
    {
        Handler.addError( 'My error message' );
    });
});
```
