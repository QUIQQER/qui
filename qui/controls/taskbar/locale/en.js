
/**
 * english translation utils
 *
 * @module qui/controls/taskbar/en
 * @author www.pcsg.de (Jan Wennrich)
 */

define('qui/controls/taskbar/locale/en', ['qui/Locale'], function(Locale)
{
    "use strict";

    Locale.set("en", "qui/controls/taskbar/Bar", {
        "task.close.this" : "Close task",
        "task.close.other" : "Close other tasks",
        "task.close.all" : "Close all tasks"
    });

    return Locale;
});
