
define('qui/controls/windows/locale/en', ['qui/Locale'], function(Locale)
{
    "use strict";

    Locale.set('en', 'qui/controls/windows/Popup', {
        'btn.close' : 'Close',
        'btn.back'  : 'Back'
    });

    Locale.set('en', 'qui/controls/windows/MultiStep', {
        'btn.next' : 'Next',
        'btn.prev' : 'Previous'
    });

    return Locale;
});
