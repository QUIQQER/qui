<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="chrome=1" />
  <meta name="viewport" content="width=device-width" />

  <title>QUI Documentation</title>

  <!-- Flatdoc -->
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
  <script src="legacy.js"></script>
  <script src="flatdoc.js"></script>

  <!-- Flatdoc theme -->
  <link href="theme-white/style.css" rel="stylesheet" />
  <script src="theme-white/script.js"></script>

  <!-- Initializer -->
  <script>
    <?php

    $md_file = 'menu.php';

    if ( isset( $_GET['file'] ) && !empty( $_GET['file'] ) )
    {
        // read subdirs
        $dir = dirname( __FILE__ );
        $src = explode( '/', $dir );
        array_pop( $src );
        $src = implode( '/', $src ) .'/qui/';

        if ( file_exists( $src . $_GET['file'] .'.md' ) ) {
            $md_file = '../src/'.$_GET['file'] .'.md';
        }
    }

    ?>

    Flatdoc.run({
      fetcher: Flatdoc.file("<?php echo $md_file; ?>")
    });

  </script>
</head>
<body role="flatdoc">

  <div class="header">
    <div class="left">
      <h1><a href="index.php">QUI Documentation</a></h1>
      <h2 role="flatdoc-title"></h2>
    </div>
  </div>

  <div role="flatdoc" class="content-root">
    <div class="menubar">
      <div class="menu section" role="flatdoc-menu"></div>
    </div>
    <div role="flatdoc-content" class="content"></div>
  </div>

</body>
</html>