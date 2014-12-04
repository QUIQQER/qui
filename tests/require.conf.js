
/**
 * http://ariya.ofilabs.com/2013/10/code-coverage-of-jasmine-tests-using-istanbul-and-karma.html
 * karma start tests/karma.conf.js
 *
 * karma config
 *
 * npm install -g karma-cli
 * npm install -g phantomjs
 * npm install -g karma-jasmine@~0.2.0
 * npm install -g karma-jasmine-async
 * npm install -g karma-phantomjs-launcher
 * npm install -g karma-coverage
 * npm install -g karma-requirejs
 */

var tests = [];

for (var file in window.__karma__.files)
{
    if (window.__karma__.files.hasOwnProperty(file))
    {
        // Add all spec files and helpers
        if (/spec\/.+.js$/.test(file)) {
            tests.push(file);
        }
    }
}

// console.log( tests );
// console.log( window.__karma__.files );


require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl    : '',
    catchError : true,
    //deps       : tests,

    paths : {
       "qui" : '/base/qui'
    },

    map : {
        '*': {
            'css': '/base/qui/lib/css.js'
        }
    },

    // we have to kickoff jasmine, as it is asynchronous
    callback: function()
    {
        console.log( 'Start tests ... ' );

        require(['qui/QUI'], function(QUI)
        {
            console.log( 'QUI loaded' );
            console.log( '====================================' );

            QUI.addEvent('onError', function(msg, url, line)
            {
                console.log( msg );
                console.log( url );
                console.log( line );
            });

            window.__karma__.start();
        });
    }
});

require.onError = function( Error )
{
    console.error( 'Message: '+ Error.message );
    console.error( 'Line: '+ Error.line );
    console.error( 'File: '+ Error.sourceURL );
};