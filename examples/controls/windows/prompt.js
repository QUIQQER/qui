
require(['qui/controls/windows/Prompt'], function(Prompt)
{
    "use strict";

    new Prompt({

        title : 'Minions ipsum poopayee',

        information : 'Minions ipsum poopayee bee do bee do bee do daa jiji wiiiii baboiii ' +
               'hana dul sae chasy tank yuuu! Aaaaaah la bodaaa gelatooo tatata bala ' +
               'tu po kass daa poulet tikka masala tulaliloo tatata bala tu uuuhhh. ' +
               'Aaaaaah gelatooo underweaaar ti aamoo! Hana dul sae daa bappleees poopayee. ' +
               'Poopayee baboiii daa hahaha potatoooo poopayee. Daa tank yuuu! Tulaliloo jiji',

      events :
      {
          onSubmit : function(value, Prompt)
          {
              alert( value );
          },

          onCancel : function()
          {
              alert( 'cancel' );
          }
      }
    }).open();

});