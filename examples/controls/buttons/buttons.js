
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
            text    : 'Colored Buttons',
            'class' : 'btn-pink',
            events  :
            {
                onClick : function() {
                    console.log('button click');
                }
            }
        }).inject( ColorButtons );
    });

});
