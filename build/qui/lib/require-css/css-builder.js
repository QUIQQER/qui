define(["require","./normalize"],function(e,r){function n(e){if("none"==p.optimizeCss)return e;if("undefined"!=typeof process&&process.versions&&process.versions.node&&require.nodeRequire){try{var r=require.nodeRequire("csso")}catch(n){return console.log('Compression module not installed. Use "npm install csso -g" to enable.'),e}var t=e.length;try{e=r.justDoIt(e)}catch(n){return console.log("Compression failed due to a CSS syntax error."),e}return console.log("Compressed CSS output to "+Math.round(e.length/t*100)+"%."),e}return console.log("Compression not supported outside of nodejs environments."),e}function t(e){if("undefined"!=typeof process&&process.versions&&process.versions.node&&require.nodeRequire){var r=require.nodeRequire("fs"),n=r.readFileSync(e,"utf8");return 0===n.indexOf("﻿")?n.substring(1):n}var t,o,n=new java.io.File(e),i=java.lang.System.getProperty("line.separator"),s=new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(n),"utf-8"));try{for(t=new java.lang.StringBuffer,o=s.readLine(),o&&o.length()&&65279===o.charAt(0)&&(o=o.substring(1)),t.append(o);null!==(o=s.readLine());)t.append(i).append(o);return String(t.toString())}finally{s.close()}}function o(e,r){if("undefined"!=typeof process&&process.versions&&process.versions.node&&require.nodeRequire){var n=require.nodeRequire("fs");n.writeFileSync(e,r,"utf8")}else{var t=new java.lang.String(r),o=new java.io.BufferedWriter(new java.io.OutputStreamWriter(new java.io.FileOutputStream(e),"utf-8"));try{o.write(t,0,t.length()),o.flush()}finally{o.close()}}}function i(e){return e.replace(/(["'\\])/g,"\\$1").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r")}var s,a={},l=!!process.platform.match(/^win/),u=/^([^\:\/]+:\/)?\//,c=e.toUrl("base_url").split("/");c[c.length-1]="";var p,d=(c.join("/"),[]),f={};return a.load=function(e,n,o,i){if(p=p||i,s||(s=path.resolve(p.dir||path.dirname(p.out),p.siteRoot||".")+"/",l&&(s=s.replace(/\\/g,"/"))),e.match(u))return o();var a=n.toUrl(e+".css");f[e]=r(t(a),l?a.replace(/\\/g,"/"):a,s),o()},a.normalize=function(e,r){return".css"==e.substr(e.length-4,4)&&(e=e.substr(0,e.length-4)),r(e)},a.write=function(e,r,n){r.match(u)||(d.push(f[r]),0!=p.buildCSS&&n.asModule(e+"!"+r,"define(function(){})"))},a.onLayerEnd=function(e,r){if(p.separateCSS&&p.IESelectorLimit)throw"RequireCSS: separateCSS option is not compatible with ensuring the IE selector limit";if(p.separateCSS){var t=r.path.replace(/(\.js)?$/,".css");console.log("Writing CSS! file: "+t+"\n");var s=d.join("");fs.existsSync(t)&&console.log('RequireCSS: Warning, separateCSS module path "'+t+'" already exists and is being replaced by the layer CSS.'),process.nextTick(function(){o(t,n(s))})}else if(0!=p.buildCSS)for(var a=p.IESelectorLimit?d:[d.join("")],l=0;l<a.length;l++){if(""==a[l])return;e("(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})\n('"+i(n(a[l]))+"');\n")}d=[]},a});
//# sourceMappingURL=css-builder.js.map