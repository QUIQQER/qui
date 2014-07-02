# qui/Locale

Das globale Locale Objekt. Dieses Objekt besitzt alle verfügbaren Übersetzungen in verschiedenen Sprachen.

## Die wichtigsten Methoden

+ get()
+ set( group, var, params )
+ getCurrent()

### Das Locale Objekt

```javascript
require(['qui/Locale'], function(Locale)
{
    // gibt die aktuelle Sprache zurück
    Locale.getCurrent();
});

```

### get() - Übersetzung einer Variable bekommen

Übersetzungen werden in Gruppen und Variablen unterteilt. Somit wird eine Übersetzung wie folgt abgefragt

```javascript
require(['qui/Locale'], function(Locale)
{
    // eine locale ohne variablen im text
    Locale.get( 'my/group', 'my.translation.var' );


    // eine locale mit variablen im text
    Locale.get( 'my/group', 'my.translation.var', {
        myReplaceVar : 'Text'
    });
});

```

### set() - Übersetzung einer Variable setzen

```javascript
require(['qui/Locale'], function(Locale)
{
    // für de
    Locale.set('de', 'my/group', {
        'my.translation.var1' : 'Mein Text in deutsch',
        'my.translation.var2' : 'Mein Text in deutsch mit [variable]'
    });

    // für ne
    Locale.set('en', 'my/group', {
        'my.translation.var1' : 'My Text in english',
        'my.translation.var2' : 'My Text in english with a [variable]'
    });
});
```

### getCurrent() - aktuelle Sprache erhalten


```javascript
require(['qui/Locale'], function(Locale)
{
    Locale.getCurrent();
});
```

