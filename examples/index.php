<!doctype html>
<!--[if lt IE 7 ]><html class="ie ie6" lang="de"> <![endif]-->
<!--[if IE 7 ]><html class="ie ie7" lang="de"> <![endif]-->
<!--[if IE 8 ]><html class="ie ie8" lang="de"> <![endif]-->
<!--[if (gte IE 9)|!(IE)]><!--><html lang="de"> <!--<![endif]-->
<head>

    <!-- HTML5
        ================================================== -->
    <!--[if lt IE 9]>
        <script src="html5.js"></script>
    <![endif]-->

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

    <title>QUI - Desktop example</title>
</head>
<body>

    <div id="container"></div>

    <script src="//ajax.googleapis.com/ajax/libs/mootools/1.4.5/mootools-yui-compressed.js"></script>

    <script src="../src/lib/mootools-more.js"></script>
    <script src="../src/lib/moofx.js"></script>
    <script src="../src/lib/requirejs.js"></script>

    <!-- QUI -->
    <script>
        var path;

        path = window.location.pathname.split( '/' );
        path.pop();
        path.pop();
        path = path.join('/') +'/';

        // QUI settings
        require.config({
            baseUrl : path,
            paths : {
                "qui" : path +'src'
            },
            map: {
                '*': {
                    'css': path +'src/lib/css'
                }
            }
        });

        require(['qui/QUI'], function(QUI)
        {
            "use strict";

            <?php

            if ( isset( $_GET['file'] ) && !empty( $_GET['file'] ) )
            {
                $dir  = dirname( __FILE__ );
                $file = $dir .'/'. $_GET['file'] .'.js';
                $file = str_replace( array('../', '..') , '', $file );

                if ( file_exists( $file ) ) {
                    echo file_get_contents( $file );
                }
            }

            ?>
        });
    </script>

</body>
</html>