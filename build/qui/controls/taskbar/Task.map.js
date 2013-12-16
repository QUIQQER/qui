{"version":3,"file":"/var/www/git/quiqqer/qui/build/qui/controls/taskbar/Task.js","sources":["/var/www/git/quiqqer/qui/src/controls/taskbar/Task.js"],"names":["define","QUI","Control","QUIDragDrop","Utils","Class","Extends","Type","Binds","options","name","icon","text","cssClass","closeable","dragable","initialize","Instance","this","$Instance","$Elm","addEvents","onDestroy","$onDestroy","setAttribute","addEvent","getAttribute","refresh","Task","destroy","parent","serialize","attributes","getAttributes","type","getType","instance","getInstance","unserialize","data","onfinish","setAttributes","Controls","getByType","Modul","bind","create","self","Element","class","html","styles","outline","tabindex","events","click","focus","event","fireEvent","blur","contextmenu","stop","$_enter","dropables","onEnter","Droppable","quiid","get","getById","highlight","onLeave","normalize","onDrop","Bar","appendChild","addClass","close","inject","$serialize","Icon","getElement","Text","getIcon","className","setStyle","isFontAwesomeClass","getTitle","title","substring","length","set","setInstance","getTaskbar","Taskbar","getParent","typeOf","activate","isActive","removeClass","hide","hasClass","select","isSelected","unselect"],"mappings":"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"}