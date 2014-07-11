# qui/controls/messages/Success

Eine Erfolgs Nachricht. (Erfolgsmeldung)

QUI unterscheidet zwischen 4 Nachrichten Typen. Attention, Error, Information, Success.
Diese Nachrichten dienen zur Kommunkation mit dem Benutzer.
Erfolgsmeldungen, Fehlermeldungen, Hinweise können dem Benutzer so wiedergegeben werden.

Nachrichten werden meist in Kombination mit dem qui/controls/messages/Handler oder qui/controls/messages/Panel verwendet.
Siehe weiteres unter:

+ qui/controls/messages/Handler
+ qui/controls/messages/Panel

qui/controls/messages/Success erbt von qui/controls/messages/Message


## Eigenschaften

+ message
+ code
+ time
+ cssclass
+ styles

## Die wichtigsten Methoden

+ getMessage()
+ getCode()
+ create()

## Nachricht senden

Die Einfachste Methode um eine Erfolgs Nachricht zu senden ist über den Message-Handler

```javascript
require(['qui/QUI'], function(QUI)
{
    QUI.getMessageHandler(function( Handler )
    {
        Handler.addSuccess( 'My success message' );
    });
});
```
