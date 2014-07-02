# qui/controls/windows/Prompt

Eine Prompt Box

Eine Prompt Box ist ein Fenster in dem der Nutzer eine Texteingabe tätigen kann.
Die Prompt Box erbt von qui/controls/windows/Popup und besitzt somit auch dessen Eigenschaften und Methoden.

[Beispiele](../examples/index.php?file=controls/windows/prompt)


## Eigenschaften Prompt

+ maxHeight
+ check
+ autoclose
+ information
+ title
+ titleicon
+ icon
+ cancel_button
+ ok_button

## Ein Prompt erstellen

```javascript

require(['qui/controls/windows/Prompt'], function(Prompt)
{
    "use strict";

    new Prompt({
        title  : 'Our alert message',
        events :
        {
            onSubmit : function() {

            },

            onCancel : function() {

            }
        }
    }).open();
});

```

## Die wichtigsten Methoden

+ getInput()
+ getValue()
+ setValue( value )
+ submit()
+ check()

### getInput()

Gibt das Eingabe DOMNode des Fensters zurück

```javascript
var Node = MyPrompt.getInput();
```

### getValue()

Gibt die aktuelle Eingabe zurück

```javascript
var value = MyPrompt.getValue();
```

### setValue( value )

Setzt die Eingabe des Fensters

```javascript
MyPrompt.setValue( 'my text' );
```

### submit()

Sendet das Prompt-Fenster ab. Führt sozusagen ein enter aus.

```javascript
MyPrompt.submit();
```


### check()

Prüft ob das Fenster abgesendet werden kann.

```javascript
if ( MyPrompt.check() ) {

}
```

