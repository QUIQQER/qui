
/**
 * german translation utils
 *
 * @module qui/controls/taskbar/de
 * @author www.pcsg.de (Jan Wennrich)
 */

define('qui/controls/taskbar/locale/de', ['qui/Locale'], function(Locale)
{
    "use strict";

    Locale.set("de", "qui/controls/taskbar/Bar", {
        "task.close.this" : "Task schließen",
        "task.close.other" : "Andere Tasks schließen",
        "task.close.all" : "Alle Tasks schließen"
    });

    return Locale;
});
