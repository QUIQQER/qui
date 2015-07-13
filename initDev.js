
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

        if (scripts[i].getAttribute('src').match('qui/initDev.js'))
        {
            dataMain = scripts[i].getAttribute('data-main');
            srcMain  = scripts[i].getAttribute('src');
        }
    }

    // qui config
    var baseUrl = srcMain.replace('qui/initDev.js', '');

    require.config({
        paths : {
            'qui' : baseUrl +'qui/qui'
        },
        map : {
            '*': {
                'css': baseUrl +'qui/qui/lib/css.js',
                'image': baseUrl +'qui/qui/lib/image.js',
                'text': baseUrl +'qui/qui/lib/text.js'
            }
        }
    });

    if (dataMain) {
        require([dataMain]);
    }

}(this));