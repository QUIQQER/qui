# qui/controls/desktop/Column

Eine Column ist nur eine Art Container für verschiedene Panels in der der Nutzer seine Panels organisieren kann.
Das Column ist somit ein Verwalter für Panels.

In Verbindung mit einem qui/controls/desktop/Workspace Objekt können so aufwändige Applikations Oberflächen einfach und schnell erstellt werden.

## Beispiele

+ [Column Beispiel](../examples/index.php?file=controls/desktop/column)

## Eigenschaften

+ name
+ width
+ height
+ resizeLimit
+ sortable
+ closable

## Eine Column erstellen

```javascript

require(['qui/controls/desktop/Column'], function(Column)
{
    var MyColumn = new Column({
        title  : 'My Column',
        height : 600,
        width  : 500
    }).inject( document.id( 'container' ) );
});
```
