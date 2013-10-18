# qui/utils/Object

Kleine Helfer für Objekte


## Methoden

+ combine

### combine

Verschmelzt, kombiniert zwei Objekte miteinander


## Verwendung

```javascript

require(['qui/utils/Encoding'], function(Encoding)
{
    var o1 = { "test1" : 1};
    var o2 = { "test2" : 1};

    var Combined = Encoding.combine( o1, o2 );
});

```

