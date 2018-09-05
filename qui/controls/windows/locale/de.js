
define('qui/controls/windows/locale/de', ['qui/Locale'], function(Locale)
{
    "use strict";

    Locale.set('de', 'qui/controls/windows/Popup', {
        'btn.close' : 'Schließen',
        'btn.back'  : 'Zurück'
    });

    Locale.set('de', 'qui/controls/windows/MultiStep', {
        'btn.next' : 'Weiter',
        'btn.prev' : 'Zurück'
    });

    return Locale;
});
