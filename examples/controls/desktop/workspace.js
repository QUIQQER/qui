
require([

    'qui/controls/desktop/Workspace',
    'qui/controls/desktop/Column',
    'qui/controls/desktop/Panel',
    'qui/controls/buttons/Button'

], function(Workspace, Column, Panel, Button)
{
    "use strict";

    var content_placeholder = 'Minions ipsum ti aamoo! Tatata bala tu gelatooo uuuhhh la bodaaa. ' +
                              'Para tú potatoooo underweaaar aaaaaah. La bodaaa baboiii hahaha hahaha ' +
                              'butt jiji jiji chasy poulet tikka masala tulaliloo tulaliloo. ' +
                              'BEE DO BEE DO BEE DO bananaaaa jiji tank yuuu! Wiiiii baboiii gelatooo. ' +
                              'La bodaaa butt pepete me want bananaaa! Uuuhhh butt la bodaaa tulaliloo po kass. ' +
                              'Gelatooo me want bananaaa! Wiiiii pepete ti aamoo! Poopayee. ' +
                              'Potatoooo tulaliloo chasy underweaaar la bodaaa poopayee tulaliloo jeje.';

    /**
     * The workspace
     */

    var MyWorkspace = new Workspace().inject(
        document.id( 'container' )
    );

    // Columns
    var Column1 = new Column({
        title  : 'My Column 1',
        height : 600,
        width  : 500
    });


    var Column2 = new Column({
        title  : 'My Column 2',
        height : 600,
        width  : 500
    });

    MyWorkspace.appendChild( Column1 );
    MyWorkspace.appendChild( Column2 );


    Column1.appendChild(
        new Panel({
            title   : 'My Panel 1',
            icon    : 'icon-heart',
            content : content_placeholder
        })
    );

    Column1.appendChild(
        new Panel({
            title   : 'My Panel 2',
            icon    : 'icon-coffee',
            content : content_placeholder
        })
    );

    Column1.appendChild(
        new Panel({
            title   : 'My Panel 3',
            icon    : 'icon-bug',
            content : content_placeholder
        })
    );


});