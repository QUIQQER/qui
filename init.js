
(function (global)
{
    "use strict";

    var scripts  = document.getElementsByTagName('script'),
        dataMain = false,
        srcMain  = false;

    for (var i = 0, len = scripts.length; i < len; i++)
    {
        if (!scripts[i].getAttribute('src')) {
            continue;
        }

        if (scripts[i].getAttribute('src').match('qui/init.js'))
        {
            dataMain = scripts[i].getAttribute('data-main');
            srcMain  = scripts[i].getAttribute('src');
        }
    }

    // qui config
    var baseUrl = srcMain.replace('qui/init.js', '');

    require.config({
        paths : {
            'qui' : baseUrl +'qui/build/qui'
        },
        map : {
            '*': {
                'css': baseUrl +'qui/build/qui/lib/css.js',
                'image': baseUrl +'qui/build/qui/lib/image.js',
                'text': baseUrl +'qui/build/qui/lib/text.js'
            }
        }
    });


    if (dataMain) {
        require([dataMain]);
    }

}(this));