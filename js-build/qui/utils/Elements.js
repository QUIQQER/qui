define("qui/utils/Elements",[],function(){"use strict";return{isInViewport:function(t){var e=t.getBoundingClientRect();return e.top>=0&&e.left>=0&&e.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&e.right<=(window.innerWidth||document.documentElement.clientWidth)},isInBody:function(t){var e=document.body.getSize(),n=t.getCoordinates();return console.log(n),console.log(e),!1},getComputedZIndex:function(t){var e,n,o,i=0,r=t.getParents();for(e=0,o=r.length;o>e;e++)n=r[e].getStyle("zIndex"),"auto"!=n&&n>i&&(i=n);return i}}});
//# sourceMappingURL=Elements.js.map