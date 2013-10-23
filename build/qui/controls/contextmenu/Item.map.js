{"version":3,"file":"/var/www/git/quiqqer/qui/build/qui/controls/contextmenu/Item.js","sources":["/var/www/git/quiqqer/qui/src/controls/contextmenu/Item.js"],"names":["define","QUI","Control","DragDrop","ContextMenu","ContextMenuItem","ContextMenuSeperator","Class","Extends","Type","Binds","options","text","icon","styles","dragable","initialize","items","events","this","parent","$items","$Elm","$Menu","$path","addEvent","$onSetAttribute","length","insert","event","$stringEvent","bind","create","i","len","Element","html","data-quiid","getId","tabindex","click","$onClick","mousedown","$onMouseDown","mouseup","$onMouseUp","mouseenter","$onMouseEnter","mouseleave","$onMouseLeave","getAttribute","Icon","getElement","match","addClass","setStyle","Text","set","dropables","onEnter","Droppable","quiid","get","Controls","getById","highlight","onLeave","normalize","onDrop","Bar","appendChild","Menu","getContextMenu","list","type","Child","push","setParent","inject","setActive","hasClass","getChildren","fireEvent","setNormal","removeClass","name","clear","onShow","children","hide","getParent","key","value","eval","size","getSize","Parent","setPosition","x","show","MenuElm","getElm","elm_pos","getPosition","elm_size","body_size","document","body","stop"],"mappings":"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"}