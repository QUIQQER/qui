{"version":3,"file":"/var/www/git/quiqqer/qui/build/qui/lib/css.js","sources":["/var/www/git/quiqqer/qui/src/lib/css.js"],"names":["global","createElement","parentNode","setTimeout","doc","document","head","shouldCollectSheets","createStyleSheet","documentMode","ieCollectorSheets","ieCollectorPool","ieCollectorQueue","ieMaxCollectorSheets","loadSheet","msgHttp","hasEvent","getElementsByTagName","loadImport","loadLink","setLoadDetection","event","hasNative","createLink","link","rel","type","loadHandler","cb","onload","errorHandler","onerror","url","eb","coll","push","failure","Error","getIeCollector","loadNextImport","imp","collSheet","shift","styleSheet","ss","imports","addImport","finalize","returnIeCollector","el","length","appendChild","isLinkReady","ready","sheet","rules","href","isDocumentComplete","cssRules","insertRule","deleteRule","ex","Object","prototype","toString","call","window","opera","test","message","noop","isFinalized","loadWatcher","wait","errorWatcher","linkLoaded","load","waitForDocumentComplete","linkErrored","error","period","complete","readyState","nameWithExt","name","defaultExt","lastIndexOf","define","normalize","resourceId","resources","normalized","split","i","len","join","require","callback","config","sheets","cssWatchPeriod","cssNoWait","loadingCount","loaded","failed","reject","plugin-builder","pluginBuilder","this"],"mappings":"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"}