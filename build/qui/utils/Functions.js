define("qui/utils/Functions",{debounce:function(n,t,u){"use strict";var e;return function(){var i=this,r=arguments,c=function(){e=null,u||n.apply(i,r)},s=u&&!e;clearTimeout(e),e=setTimeout(c,t),s&&n.apply(i,r)}},once:function(n,t){"use strict";var u;return function(){return n&&(u=n.apply(t||this,arguments),n=null),u}}});
//# sourceMappingURL=Functions.js.map