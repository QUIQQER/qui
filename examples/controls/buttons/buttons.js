
require([

    'qui/controls/buttons/Button'

], function(Button)
{
    "use strict";

    var StandardButtons = new Element('div', {
        styles : {
            clear: 'both'
        }
    }).inject(
        document.id( 'container' )
    );

    var ColorButtons = new Element('div', {
        styles : {
            clear     : 'both',
            'float'   : 'left',
            marginTop : 30
        }
    }).inject(
        document.id( 'container' )
    );

    var ContextMenuButtons = new Element('div', {
        styles : {
            clear     : 'both',
            'float'   : 'left',
            marginTop : 30
        }
    }).inject(
        document.id( 'container' )
    );


    /**
     * Standard buttons
     */
    new Button({
        text : 'test',
        events :
        {
            onClick : function() {
                console.log('button click');
            }
        }
    }).inject( StandardButtons );

    new Button({
        text : 'test',
        styles : {
            color : 'red'
        },
        events :
        {
            onClick : function() {
                console.log('button click');
            }
        }
    }).inject( StandardButtons );

    new Button({
        text : 'test',
        styles : {
            width : 200
        },
        events :
        {
            onClick : function() {
                console.log('button click');
            }
        }
    }).inject( StandardButtons );


    var Disabled = new Button({
        text : 'disabled',
        styles : {
            width : 100
        },
        events :
        {
            onClick : function() {
                alert( 'click not working' );
            }
        }
    }).inject( StandardButtons );

    Disabled.disable();


    var Active = new Button({
        text : 'active',
        styles : {
            width : 100
        },
        events :
        {
            onClick : function() {
                alert( 'click working' );
            }
        }
    }).inject( StandardButtons );

    Active.setActive();


    new Button({
        text      : 'with text icon',
        textimage : 'icon-coffee'
    }).inject( StandardButtons );

    new Button({
        text : 'with icon',
        icon : 'icon-coffee'
    }).inject( StandardButtons );

    new Button({
        icon : 'icon-bar-chart'
    }).inject( StandardButtons );

    /**
     * Button with contextmenu
     */
    require(['qui/controls/contextmenu/Item'], function(Item)
    {
        var ContextMenuButton = new Button({
            text    : 'Contextmenu Button',
            'class' : 'btn-green'
        }).inject( ContextMenuButtons );

        ContextMenuButton.appendChild(
            new Item({
                'text' : 'Menu entry 1',
                events :
                {
                    click : function(Item) {
                        console.log( Item.getAttribute( 'text' ) );
                    }
                }
            })
        ).appendChild(
            new Item({
                'text' : 'Menu entry 2',
                events :
                {
                    click : function(Item) {
                        console.log( Item.getAttribute( 'text' ) );
                    }
                }
            })
        ).appendChild(
            new Item({
                'text' : 'Menu entry 3',
                events :
                {
                    click : function(Item) {
                        console.log( Item.getAttribute( 'text' ) );
                    }
                }
            })
        );
    });


    /**
     * Color buttons with button.css extensions
     */

    // load css file, normaly you load that at the first require
    // its for the better understanding
    require(['css!extend/buttons.css'], function()
    {
        new Button({
            text    : 'Colored Buttons',
            'class' : 'btn-red',
            events  :
            {
                onClick : function() {
                    console.log('button click');
                }
            }
        }).inject( ColorButtons );


        new Button({
            text    : 'Colored Buttons',
            'class' : 'btn-green',
            events  :
            {
                onClick : function() {
                    console.log('button click');
                }
            }
        }).inject( ColorButtons );


        new Button({
            text    : 'Colored Buttons',
            'class' : 'btn-black',
            events  :
            {
                onClick : function() {
                    console.log('button click');
                }
            }
        }).inject( ColorButtons );


        new Button({
            text    : 'Colored Buttons',
            'class' : 'btn-grey',
            events  :
            {
                onClick : function() {
                    console.log('button click');
                }
            }
        }).inject( ColorButtons );


        new Button({
            text    : 'Colored Buttons',
            'class' : 'btn-white',
            events  :
            {
                onClick : function() {
                    console.log('button click');
                }
            }
        }).inject( ColorButtons );


        new Button({
            text    : 'Colored Buttons',
            'class' : 'btn-blue',
            events  :
            {
                onClick : function() {
                    console.log('button click');
                }
            }
        }).inject( ColorButtons );


        new Button({
            text    : 'Colored Buttons',
            'class' : 'btn-rosy',
            events  :
            {
                onClick : function() {
                    console.log('button click');
                }
            }
        }).inject( ColorButtons );


        new Button({
            text    : 'Customized Buttons',
            'class' : 'btn-pink',
            styles  : {
                padding : 10
            },
            events  :
            {
                onClick : function() {
                    console.log('button click');
                }
            }
        }).inject( ColorButtons );
    });
});
