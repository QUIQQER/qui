
/**
 * The Main QUI Object
 * create window.QUI
 *
 * @module qui/QUI
 * @author www.pcsg.de (Henning Leutz)
 */

define(['qui/classes/QUI'], function(QUIClass)
{
    "use strict";

    if ( typeof window.QUI === 'undefined' ) {
        window.QUI = new QUIClass();
    }

    document.fireEvent( 'qui-loaded' );

    return window.QUI;
});
