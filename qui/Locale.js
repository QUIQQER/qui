
/**
 * The QUI Locale Object
 *
 * @author www.namerobot.com (Henning Leutz)
 */
define('qui/Locale', ['qui/classes/Locale'], function(QUILocale)
{
    "use strict";

    if ( typeof window.QUILocale === 'undefined' ) {
        window.QUILocale = new QUILocale();
    }

    return window.QUILocale;
});
