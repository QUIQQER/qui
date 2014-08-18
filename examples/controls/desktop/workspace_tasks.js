
require([

    'qui/QUI',
    'qui/controls/desktop/Workspace',
    'qui/controls/desktop/Column',
    'qui/controls/desktop/Panel',
    'qui/controls/desktop/Tasks',
    'qui/controls/buttons/Button'

], function(QUI, Workspace, Column, Panel, TaskPanel, Button)
{
    "use strict";

    QUI.addEvent('onError', function(error, file, line)
    {
        console.log( error +' '+ file +' '+ line );
    });


    document.id( 'container' ).setStyle('height', 400);

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

    MyWorkspace.unfix();


    // Columns
    var Column1 = new Column({
        title : 'My Column 1'
    });


    var Column2 = new Column({
        title : 'My Column 2',
        width : document.body.getSize().x * 0.8
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

    // column2 with taskbar
    var MyTaskPanel = new TaskPanel({
        title   : 'My Panel 1',
        icon    : 'icon-heart',
        content : content_placeholder
    });

    Column2.appendChild( MyTaskPanel );


    MyTaskPanel.appendChild(
        new Panel({
            title   : 'My Taskpanel 1',
            icon    : 'icon-bug',
            content : content_placeholder
        })
    );

    MyTaskPanel.appendChild(
        new Panel({
            title   : 'My Taskpanel 2',
            icon    : 'icon-bug',
            content : content_placeholder
        })
    );


});