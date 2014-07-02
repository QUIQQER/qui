# qui/controls/Control

Ein qui/controls/Control kann ein DOM-Element erstellen.
Es besitzt somit eine Beziehung zur Oberfläche. Jedes Control kann ein DOM-Element erstellen und dieses auch verändern.

Ein qui/controls/Control erbt von qui/class/DOM.
Somit stehen einem Control auch Event und Attribute Handling zur Verfügung.

## Die wichtigsten Methoden

+ create()
+ inject()


## Ein Control erstellen

mit _.create()_ kann das Control erstellt werden. Die Rückgabe ist immer ein DOM-Element

```javascript

require(['qui/controls/Control'], function(Control)
{
    var DOMNode = new Control().create();
})

```


## Ein Control einfügen

mit _.inject()_ kann das Control in den DOM Baum eibgefügt werden.

```javascript

require(['qui/controls/Control'], function(Control)
{
    new Control().inject(
        document.getElementById( 'my-dom-parent-element' )
    );
})

```
