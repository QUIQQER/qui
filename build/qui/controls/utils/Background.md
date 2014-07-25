# qui/controls/utils/Background

Erstellt ein einfaches halb transparentes DIV.
Wird unter anderem für qui/controls/windows/Popup verwendet

```javascript

require(['qui/controls/utils/Background'], function(Background) {

    var BG = new Background().inject( document.body );

    BG.show();
});

```