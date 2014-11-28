
/**
 * QUI type test
 */

var cls;
var quiClasses  = {},
    quiControls = {},
    quiUtils    = {};

for ( var file in window.__karma__.files )
{
    if ( window.__karma__.files.hasOwnProperty( file ) )
    {
        if ( file.match( '.css' ) ) {
            continue;
        }

        if ( file.match( 'qui/lib/' ) ) {
            continue;
        }

        if ( file.match( 'qui/classes/storage/Polyfill' ) ) {
            continue;
        }

        if ( file.match( 'qui/controls/messages/Favico' ) ) {
            continue;
        }



        if ( file.match( 'locale/' ) ) {
            continue;
        }


        /**
         * qui classes
         */
        if ( file.match( 'qui/classes/' ) )
        {
            cls = file.replace( '.js', '' ).replace( '\/base\/', '' );

            quiClasses[ cls ] = file;
            continue;
        }

        /**
         * qui controls
         */
        if ( file.match( 'qui/controls/' ) )
        {
            cls = file.replace( '.js', '' ).replace( '\/base\/', '' );

            quiControls[ cls ] = file;
            continue;
        }

        /**
         * qui utils
         */
        if ( file.match( 'qui/utils/' ) )
        {
            cls = file.replace( '.js', '' ).replace( '\/base\/', '' );

            quiUtils[ cls ] = file;
            continue;
        }
    }
}

//console.log( quiControls );
/*
require(['qui/controls/contextmenu/BarItem'], function(BarItem)
{
    console.log( new BarItem() );

});
*/


// exec test
var functionTestClass = function( cls )
{
    // describe
    describe("QUI Test "+ cls, function()
    {
        beforeEach(function() {
            // jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        });

        it("QUI Test: " + cls, function (done)
        {
            require([ cls ], function (CLS)
            {
                expect( CLS ).toBeDefined();
                expect( new CLS().getType() ).toBe( cls );

                done();
            });
        });
    });
};

// generate tests
for ( var cls in quiClasses ) {
    functionTestClass( cls );
}

for ( var cls in quiControls ) {
    functionTestClass( cls );
}
