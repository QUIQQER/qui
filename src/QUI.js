
/**
 * The Main QUI Object
 *
 * create window.QUI
 *
 * @author www.pcsg.de (Henning Leutz)
 */
define('qui/QUI', ['qui/classes/QUI'], function(QUIClass)
{
    "use strict";

    if ( typeof window.QUI === 'undefined' ) {
        window.QUI = new QUIClass();
    }

    return window.QUI;
});
