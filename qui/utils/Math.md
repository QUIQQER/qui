# qui/utils/Math

Hilfsobjekt für mathematische Operationen.


## Wichtigste Methoden

+ resizeVar
+ parseAmountToFloat
+ percent
+ calcMwst


## Verwendung

```javascript

require(['qui/utils/Math'], function(Math)
{
    var result  = Math.calcMwst(0.20, false, 19);
    var percent = Math.percent( 25, 3200 );
});

```

