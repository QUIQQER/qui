# QUI Documentation

QUI (QUIQQER User Interface) ist ein modulares kompononenten framework.
QUI bietet verschiedene Controls, basierend auf [requirejs](http://requirejs.org/) und [MooTools](http://mootools.net/).

Diese Dokumentation bietet dir einen ersten Überblick über die wichtigstens Eigenschaften der vorhandenen Klassen.
Für eine genaue Übersicht aller Methoden und Eigenschaften einer Klasse solltest du die generierte API Dokumenatation verwenden.

Diese findest du auf doc.quiqqer.com.

QUI ist in 3 Teilbereiche gegliedert, Klassen, Controls und Utils.

*Klassen* beinhalten Funktionalität, sie bieten keine DOMElement und können somit nicht in Oberfläche integriert werden.

*Controls* bieten immer ein DOM-Element. Sie können in die Oberfläche integriert werden und biten somit eine interaktion mit dem Benutzer.

*Utils* sind kleine Hilfsobjekte die nicht initialisiert werden. Es sind schon bestehende Objekte ohne Klassen Grundlage.
Utils bieten Funktionalität an die nur global verfügbar sein muss (allgemeine Funktionalität / Hilfsfunktionen).

[QUI Download](../build/QUI.zip)

## Los gehts

QUI besitzt einige Abhängigkeiten. Alle Abhängigkeiten sind im Build enthalten, damit das Einbinden einfacher ist.

### QUI in eine Webseiten einbinden

Folgende Abhängigkeiten bestehen:

+ //ajax.googleapis.com/ajax/libs/mootools/1.4.5/mootools-yui-compressed.js"
+ /qui/lib/mootools-more.js
+ /qui/lib/moofx.js
+ /qui/lib/requirejs.js

```html
<script src="//ajax.googleapis.com/ajax/libs/mootools/1.4.5/mootools-yui-compressed.js"></script>
<script src="/qui/lib/mootools-more.js"></script>
<script src="/qui/lib/moofx.js"></script>
<script src="/qui/lib/requirejs.js"></script>

<script>
// requirejs must know where it can be find quiqqer
// requirejs muss wissen wo quiqqer zu finden ist
require.config({
    paths : {
        "qui" : '/PFAD_ZUM_QUIQQER_ORDNER'
    },
    map: {
        '*': {
            'css': '/PFAD_ZUM_QUIQQER_ORDNER/lib/css.js'
        }
    }
});

// now we can use QUI
require(['qui/QUI'], function(QUI)
{
    "use strict";

});

// ein button control
require(['qui/buttons/Button'], function(Button)
{
    "use strict";

});

</script>
```


### Ich habe schon einige Bibliotheken in mein Projekt eingebunden, was nun?

Falls MooFX oder requirejs schon vorhanden sind, müssen diese natürlich nicht neu eingebunden werden.
Dies wären folgende zwei Bibliotheken:

```html
<script src="/qui/lib/moofx.js"></script>
<script src="/qui/lib/requirejs.js"></script>
```

Also diese dann einfach weglassen.
Achte darauf das requirejs in der Version 2 und höher verwendet wird und mooFx in der Version 3.1 und höher.


Falls MooTools und oder MooTools-More schon eingebunden wurde, dann achte bitte auf folgende Abhängigkeiten.

+ MooTools 1.4.5
+ More/More
+ More/Class.Binds
+ More/Array.Extras
+ More/Date
+ More/Date.Extras
+ More/Number.Format
+ More/Element.Measure
+ More/Element.Position
+ More/Element.Shortcuts
+ More/Drag
+ More/Drag.Move


### Was ist mit jQuery oder andere $ Bibliotheken.

MooTools hat eine Kompatibilität zu diesen Bibliotheken und kann neben diesen koexistieren.
QUI achtet stark darauf diese Koexistenz nicht zu zerstören und verzichtet unter anderem auf die Nutzung von _$_.

Falls doch Probleme mit jQuery auftauchen darfst du dich gerne an uns wenden.
Schreib uns eine E-Mail oder melde dich auf den bekannten Kanälen.



## Liste der QUI Komponenten

<?php

    // read subdirs
    $dir = dirname( __FILE__ );
    $src = explode( '/', $dir );
    array_pop( $src );
    $src = implode( '/', $src ) .'/src/';

    chdir( $src );
    exec('find -iname \'*.md\'', $result);

    sort( $result );


    // echo '## qui'."\n";

    foreach ( $result as $entry )
    {
        $entry   = str_replace( array('./', '.md'), '', $entry );

        echo '### qui/'. $entry ."\n";
        echo '[ qui/'. $entry .'](index.php?file='. $entry .')'."\n";
    }

?>