require(['qui/controls/windows/MultiStep'], function (MultiStepControl) {
    "use strict";

    var MultiStep = new MultiStepControl();

    MultiStep.addEvent('onOpen', function() {
        MultiStep.addStep(MultiStep.createStepElement('<h1>Step1</h1>', 'step1'));
        MultiStep.addStep(MultiStep.createStepElement('<h1>Step2</h1>', 'step2'));
        MultiStep.addStep(MultiStep.createStepElement('<h1>Step3</h1>', 'step3'));
    });

    MultiStep.open();
});