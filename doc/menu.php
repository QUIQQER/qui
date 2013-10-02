# QUI Documentation

QUI (QUIQQER User Interface) ist ein modulares kompononenten framework.
QUI bietet verschiedene Controls, basierend auf requirejs und MooTools.

Diese Dokumentation bietet dir einen ersten Überblick über die wichtigstens Eigenschaften der vorhandenen Klassen.
Für eine genaue Übersicht aller Methoden und Eigenschaften einer Klasse solltest du die generierte API Dokumenatation anschauen.

Diese findest du auf doc.quiqqer.com.

QUI ist in 3 Teilbereiche aufgegliedert, Klassen, Controls und Utils.

*Klassen* beinhalten Funktionalität, sie bieten keine DOMElement und können somit nicht in Oberfläche integriert werden.

*Controls* bieten immer ein DOM-Element. Sie können in die Oberfläche integriert werden und biten somit eine interaktion mit dem Benutzer.

*Utils* sind kleine Hilfsobjekte die nicht initialisiert werden. Es sind schon bestehende Objekte ohne Klassen Grundlage.
Utils bieten Funktionalität an die nur global verfügbar sein muss (allgemeine Funktionalität / Hilfsfunktionen).

<?php

    // read subdirs
    $dir = dirname( __FILE__ );
    $src = explode( '/', $dir );
    array_pop( $src );
    $src = implode( '/', $src ) .'/src/';

    chdir( $src );
    exec('find -iname \'*.md\'', $result);

    sort( $result );

    foreach ( $result as $entry )
    {
        $entry = str_replace( array('./', '.md'), '', $entry );

        echo '## qui/'. $entry ."\n";
        echo '['. $entry .'](index.php?file='. $entry .')'."\n";
    }

?>