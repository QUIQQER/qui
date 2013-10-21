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

    <title>QUI - Examples</title>

    <link href="../extend/classes.css" rel="stylesheet" />
    <link href="../extend/animate.min.css" rel="stylesheet" />
    <link href="../extend/buttons.css" rel="stylesheet" />
    <link href="../extend/font-awesome/css/font-awesome.min.css" rel="stylesheet" />
    <!-- <link href="../src/themes/pink.css" rel="stylesheet" /> -->
    <!-- <link href="../src/themes/blue.css" rel="stylesheet" /> -->

    <style type="text/css">

    body {
        background: #F3F6FB;
        color: #505050;
        font-family: Helvetica Neue,Open Sans,sans-serif;
        font-size: 13px;
    }

    pre {
        background: #FFFFFF;
        margin: 0px;
    }

    code {
        float: left;
        margin: 10px;
    }

    </style>

    <!-- Prism highlighter -->
    <link rel="stylesheet" href="prism.css" data-noprefix />

    <?php

        $example_code = '';

        if ( isset( $_GET['file'] ) && !empty( $_GET['file'] ) )
        {
            $dir  = dirname( __FILE__ );
            $file = $dir .'/'. $_GET['file'] .'.js';
            $file = str_replace( array('../', '..') , '', $file );

            if ( file_exists( $file ) ) {
                $example_code = file_get_contents( $file );
            }
        }
    ?>
</head>
<body>

    <h1>QUI Examples</h1>
    <p>This examples are extended examples. The examples shows, how QUI can work.</p>
    <p>If you want a first introduction, please visit the <a href="../doc/index.php">QUI Documentation</a></p>

    <h2 style="margin-top: 40px;">
        Examples
    </h2>
    <div id="container"></div>

    <div style="clear:both;"></div>

    <h3 style="margin-top: 40px;">
        The complete example code
    </h3>
    <pre style="height: 300px; overflow: auto; border: 1px solid #DDDDDD;"><code class="language-javascript"><?php echo $example_code; ?></code></pre>

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

            <?php echo $example_code; ?>
        });
    </script>

    <script src="prism.js"></script>

</body>
</html>