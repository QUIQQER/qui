
require([

    'qui/controls/desktop/Column',
    'qui/controls/desktop/Panel'

], function(Column, Panel)
{
    "use strict";

    var content_placeholder = 'Minions ipsum ti aamoo! Tatata bala tu gelatooo uuuhhh la bodaaa. ' +
                              'Para tú potatoooo underweaaar aaaaaah. La bodaaa baboiii hahaha hahaha ' +
                              'butt jiji jiji chasy poulet tikka masala tulaliloo tulaliloo. ' +
                              'BEE DO BEE DO BEE DO bananaaaa jiji tank yuuu! Wiiiii baboiii gelatooo. ' +
                              'La bodaaa butt pepete me want bananaaa! Uuuhhh butt la bodaaa tulaliloo po kass. ' +
                              'Gelatooo me want bananaaa! Wiiiii pepete ti aamoo! Poopayee. ' +
                              'Potatoooo tulaliloo chasy underweaaar la bodaaa poopayee tulaliloo jeje.';


    var MyColumn = new Column({
        title  : 'My Column',
        height : 600,
        width  : 500
    }).inject( document.id( 'container' ) );

    MyColumn.appendChild(
        new Panel({
            title   : 'My Panel',
            icon    : 'icon-heart',
            content : content_placeholder
        })
    );

    MyColumn.appendChild(
        new Panel({
            title   : 'My Panel 2',
            icon    : 'icon-coffee',
            content : content_placeholder
        })
    );

});