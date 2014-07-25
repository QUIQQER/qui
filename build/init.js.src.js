
(function (global) {
    var i, len, dataMain = false;
    var scripts = document.getElementsByTagName('script');

    for ( var i = 0, len = scripts.length; i < len; i++  )
    {
        if ( scripts[ i ].getAttribute( 'src' ).match( 'qui/init.js' ) ) {
            dataMain = scripts[ i ].getAttribute( 'data-main' );
        }
    }

    // qui config
    var baseUrl = require.toUrl('');

    require.config({
        paths : {
            'qui' : 'qui/build/qui'
        },
        map : {
            '*': {
                'css': baseUrl +'qui/build/qui/lib/css.js'
            }
        }
    });


    if ( dataMain ) {
        require( [ dataMain ] );
    }

}(this));