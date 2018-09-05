# qui/controls/windows/MultiStep

Ein Dialog, der schrittweise aufgebaut ist. 

Der MultiStep-Dialog erbt von `qui/controls/windows/Popup` und besitzt somit auch dessen Eigenschaften und Methoden.

Events:
- `onShowStep`: gefeuert wenn irgendein Step angezeigt wurde, der angezeigte Step wird als Parameter übergeben
- `onShowNextStep`: gefeuert wenn der nächste Step angezeigt wurde, der angezeigte Step wird als Parameter übergeben
- `onShowPreviousStep`: gefeuert wenn der vorige Step angezeigt wurde soll, der angezeigte Step wird als Parameter übergeben

[Beispiele](../examples/index.php?file=controls/windows/alert)


## Beispiel

```javascript
require(['qui/controls/windows/MultiStep'], function (MultiStepControl) {
    // Instanz erstellen
    var MultiStep = new MultiStepControl();

        
    // Schritte beim Öffnen des Dialogs hinzufügen (vorher nicht möglich)
    MultiStep.addEvent('onOpen', function() {
        // Schritte (Steps) erzeugen lassen
        var Step1 = MultiStep.createStepElement('<h1>Step1</h1>', 'step1');
        var Step2 = MultiStep.createStepElement('<h1>Step2</h1>', 'step2');
        
        // Schritte hinzufügen
        MultiStep.addStep(Step1);
        MultiStep.addStep(Step2);        
    });


    // Den Dialog öffnen        
    MultiStep.open();
    
    
    // Den gesamten Dialog deaktivieren und wieder aktivieren
    MultiStep.disable();
    MultiStep.enable();
    
    
    // Den Weiter- und Zurück-Button deaktivieren und wieder aktivieren
    MultiStep.disableNextButton();
    MultiStep.disablePreviousButton();
    
    MultiStep.enableNextButton();
    MultiStep.enablePreviousButton();
    
    
    // Schritt-Indikatoren verstecken und wieder anzeigen
    MultiStep.hideStepIndicators();   
    MultiStep.showStepIndicators();
    
    
    // Den nächsten und vorigen Step anzeigen
    MultiStep.showNextStep();
    MultiStep.showPreviousStep();
    
    
    // Den zweiten und dann den ersten Step anzeigen
    MultiStep.showStep(1);
    MultiStep.showStep(0);
    
    
    // Den zweiten Step entfernen
    MultiStep.removeStep(1);
});
```

Weitere Funktionen, wie zum Beispiel das holen/bearbeiten der Buttons sind selbsterklärend und ebenfalls in der `MultiStep.js`-Klasse mit Kommentaren/Dokumentation versehen.