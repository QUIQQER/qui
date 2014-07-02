# qui/utils/NoSelect

Setzt Eigenschaften auf ein DOM-Element damit dieses nicht mehr markiert werden kann.


## Wichtigste Methoden

+ enable
+ disable

## Verwendung

```javascript

require(['qui/utils/NoSelect'], function(NoSelect)
{
    NoSelect.enable( document.id('my-element') );
    NoSelect.disable( document.id('my-element') );
});

```
