define("qui/utils/Elements",{isInViewport:function(e){var t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&t.right<=(window.innerWidth||document.documentElement.clientWidth)},isInBody:function(e){var t=document.body.getSize(),n=e.getCoordinates();return console.log(n),console.log(t),!1},getComputedZIndex:function(e){var t,n,o,i=0,d=e.getParents();for(t=0,o=d.length;o>t;t++)n=d[t].getStyle("zIndex"),"auto"!=n&&n>i&&(i=n);return i}});
//# sourceMappingURL=Elements.js.map