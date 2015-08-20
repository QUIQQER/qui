define("qui/classes/Windows",["require","qui/classes/DOM"],function(n,t){"use strict";return new Class({Extends:t,Type:"qui/classes/Windows",Binds:["$onWindowOpen","$onWindowClose","$onWindowDestroy"],initialize:function(){this.$windows=[],this.$currentWindow=null},register:function(n){n.addEvents({onOpenBegin:this.$onWindowOpen,onDestroy:this.$onWindowDestroy,onClose:this.$onWindowClose}),this.$windows.push(n)},$onWindowOpen:function(n){if(this.$currentWindow){var t=this.$currentWindow.getElm().getStyle("zIndex");n.Background.getElm().setStyle("zIndex",t+1),n.getElm().setStyle("zIndex",t+2)}this.$currentWindow=n},$onWindowDestroy:function(n){this.$currentWindow==n&&(this.$currentWindow=null)},$onWindowClose:function(n){this.$currentWindow==n&&(this.$currentWindow=null)},openAlert:function(n){return this.createAlert(n).then(function(n){return n.open(),n})},openConfirm:function(n){return this.createConfirm(n).then(function(n){return n.open(),n})},openPopup:function(n){return this.createPopup(n).then(function(n){return n.open(),n})},openPrompt:function(n){return this.createPrompt(n).then(function(n){return n.open(),n})},openSubmit:function(n){return this.createAlert(n).then(function(n){return n.open(),n})},createAlert:function(t){return new Promise(function(e,o){n(["qui/controls/windows/Alert"],function(n){e(new n(t))},o)})},createConfirm:function(t){return new Promise(function(e,o){n(["qui/controls/windows/Confirm"],function(n){e(new n(t))},o)})},createPopup:function(t){return new Promise(function(e,o){n(["qui/controls/windows/Popup"],function(n){e(new n(t))},o)})},createPrompt:function(t){return new Promise(function(e,o){n(["qui/controls/windows/Prompt"],function(n){e(new n(t))},o)})},createSubmit:function(t){return new Promise(function(e,o){n(["qui/controls/windows/Submit"],function(n){e(new n(t))},o)})}})});
//# sourceMappingURL=Windows.js.map