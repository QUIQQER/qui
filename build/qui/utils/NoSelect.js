define("qui/utils/NoSelect",{enable:function(e){"use strict";return"undefined"==typeof e.setProperty&&(e=document.id(e)),e.removeClass("qui-utils-noselect"),Browser.ie?void document.removeEvent("selectstart",this.stopSelection):(e.removeProperty("unselectable","on"),e.removeProperty("unSelectable","on"),void e.setStyles({MozUserSelect:"",KhtmlUserSelect:""}))},disable:function(e){"use strict";return"undefined"==typeof e.setProperty&&(e=document.id(e)),e.addClass("qui-utils-noselect"),Browser.ie?void document.addEvent("selectstart",this.stopSelection):(e.setProperty("unselectable","on"),e.setProperty("unSelectable","on"),void e.setStyles({MozUserSelect:"none",KhtmlUserSelect:"none"}))},stopSelection:function(e){"use strict";return e.stop(),!1}});
//# sourceMappingURL=NoSelect.js.map