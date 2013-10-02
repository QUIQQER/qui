# qui/classes/Controls

Der Control-Manager.

Mit dem Control-Manager hast du Zugriff auf verschiedene Controls die während der Laufzeit erzeugt wurden.
Er verwaltet alle Controls und kann diese auch wieder zerstören / erstellen.

Der Control-Manager wird im globale QUI standardmäßig initialisiert.

Er ist aufrufbar über:

```javascript
QUI.Controls;
```

oder

```javascript
require(['qui/QUI'], , function(QUI) {
    QUI.Controls;
});
```
