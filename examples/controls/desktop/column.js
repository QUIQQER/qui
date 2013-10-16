
require([

    'qui/controls/desktop/Column',
    'qui/controls/desktop/Panel',
    'qui/controls/buttons/Button'

], function(Column, Panel, Button)
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
            title   : 'My Panel 1',
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

    MyColumn.appendChild(
        new Panel({
            title   : 'My Panel 3',
            icon    : 'icon-bug',
            content : content_placeholder
        })
    );



    // extras, its not for the column creation
    // its an api demonstration
    var BtnContainer = new Element('div', {
        styles : {
            clear   : 'both',
            'float' : 'left',
            margin  : '30px 0 0 0'
        }
    }).inject( document.id( 'container' ) );

    new Button({
        text : 'column serialize',
        events :
        {
            onClick : function() {
                alert( JSON.encode( MyColumn.serialize() ) );
            }
        }
    }).inject( BtnContainer );

});