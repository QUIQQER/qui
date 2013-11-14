<?php

$dir    = dirname( __FILE__ );
$quiDir = str_replace( '/build', '', $dir );

$src  = $quiDir .'/src/';
$find_js  = 'find '. $src .' -type f -name \*.js';
$find_css = 'find '. $src .' -type f -name \*.css';

$js_result  = shell_exec( $find_js );
$css_result = shell_exec( $find_css );

$js_files   = explode( "\n", $js_result );
$css_files  = explode( "\n", $css_result );

if ( file_exists( $dir .'/QUI.zip' ) ) {
    unlink( $dir .'/QUI.zip' );
}

if ( is_dir( $dir .'/qui' ) ) {
    system( 'rm -rf '. $dir .'/qui' );
}

// uglify
// uglifyjs sourceFile --output=outputFile --source-map=sourceMapFile

// execute the build
foreach ( $js_files as $file )
{
    if ( empty( $file ) ) {
        continue;
    }

    $dir = str_replace('/src/', '/build/qui/', dirname( $file ) );

    $build_file   = str_replace('/src/', '/build/qui/', $file );
    $src_map_file = str_replace('.js', '.map.js', $build_file );

    // create the dir if not exist
    if ( !is_dir( $dir ) ) {
        mkdir( $dir, 0700, true );
    }

    $uglify = "uglifyjs $file --output=$build_file --source-map=$src_map_file";

    echo "\n". $file;
    shell_exec( $uglify );
    echo "... done\n";
}

// css files
foreach ( $css_files as $file )
{
    if ( empty( $file ) ) {
        continue;
    }

    $dir = str_replace('/src/', '/build/qui/', dirname( $file ) );

    $build_file = str_replace('/src/', '/build/qui/', $file );

    // create the dir if not exist
    if ( !is_dir( $dir ) ) {
        mkdir( $dir, 0700, true );
    }

    $uglifycss = "uglifycss $file > $build_file";

    echo "\n". $file;
    shell_exec( $uglifycss );
    echo "... done\n";
}

// copy readme.md
system( 'cp '. $quiDir .'/README.md '. $dir .'/qui/README.md' );

// zip the qui folder
system( 'zip -r QUI.zip qui/' );
