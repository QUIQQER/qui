# QUI Documentation

QUI (QUIQQER User Interface) ist ein modulares kompononenten framework.
QUI bietet verschiedene Controls, basierend auf requirejs und MooTools.

Diese Dokumentation bietet dir einen ersten Überblick über die wichtigstens Eigenschaften der vorhandenen Klassen.
Für eine genaue Übersicht aller Methoden und Eigenschaften einer Klasse solltest du die generierte API Dokumenatation anschauen.

Diese findest du auf doc.quiqqer.com.

QUI ist in 3 Teilbereiche aufgegliedert, Klasse, Controls und Utils.

*Klassen* beinhalten Funktionalität, sie bieten keine Schnittstelle zur Oberfläche sondern bieten reine Funktionalität an.

*Controls* bieten immer ein DOM-Element. Sie können somit in die Oberfläche integriert werden.

*Utils* sind kleine Hilfsobjekte die nicht initialisiert werden. Es sind schon bestehende Objekte ohne Klassen Grundlage.
Utils bieten Funktionalität an die nur global verfügbar sein muss.

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

        echo '## '. $entry ."\n";
        echo '['. $entry .'](index.php?file='. $entry .')'."\n";
    }

?>