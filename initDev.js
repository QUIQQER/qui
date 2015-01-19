
(function (global)
{
    "use strict";

    var i, len;

    var scripts  = document.getElementsByTagName('script'),
        dataMain = false,
        srcMain  = false;

    for ( i = 0, len = scripts.length; i < len; i++  )
    {
        if ( !scripts[ i ].getAttribute( 'src' ) ) {
            continue;
        }

        if ( scripts[ i ].getAttribute( 'src' ).match( 'qui/initDev.js' ) )
        {
            dataMain = scripts[ i ].getAttribute( 'data-main' );
            srcMain  = scripts[ i ].getAttribute( 'src' );
        }
    }

    // qui config
    var baseUrl = srcMain.replace( 'qui/initDev.js', '' );

    require.config({
        paths : {
            'qui' : baseUrl +'qui/qui'
        },
        map : {
            '*': {
                'css': baseUrl +'qui/qui/lib/css.js'
            }
        }
    });


    if ( dataMain ) {
        require( [ dataMain ] );
    }

}(this));