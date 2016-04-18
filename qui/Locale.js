/**
 * The QUI Locale Object
 *
 * @module qui/Locale
 * @author www.pcsg.de (Henning Leutz)
 *
 * @require qui/classes/Locale
 */

define('qui/Locale', ['qui/classes/Locale'], function (QUILocale) {
    "use strict";

    if (typeof window.QUILocale === 'undefined') {
        window.QUILocale = new QUILocale();
    }

    return window.QUILocale;
});
