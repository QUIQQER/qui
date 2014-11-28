// Karma configuration
// Generated on Thu Nov 27 2014 13:56:06 GMT+0100 (CET)

module.exports = function(config)
{
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['requirejs', 'jasmine'],


    // list of files / patterns to load in the browser
    files: [
        {pattern: 'tests/spec/**/*.js'},
        'qui/lib/mootools-core.js',
        'qui/lib/mootools-more.js',
        'qui/lib/moofx.js',
        'tests/require.conf.js',
        {pattern: 'qui/**/*.js', included: false},
        {pattern: 'qui/**/*.css', included: false}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS', 'Firefox'], // 'PhantomJS' ,'Chrome', 'Firefox'


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
