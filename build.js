({
    appDir: ".",
    baseUrl : ".",
    dir     : "./js-build",
    useStrict : true,

    mainConfigFile: './build-config.js',
//    findNestedDependencies: true,

    separateCSS: true,
    wrapShim: true,

    fileExclusionRegExp: /\.git|^tests$|^build$|^coverage$|^doc$|^examples$|^r\.js|^composer\.json|^build\.js|^build\-config\.js/,

    paths : {
        qui : 'qui'
    },

    modules: [{
        name: 'qui/QUI'
    }, {
        name: 'qui/Locale'
    }, {
        name: 'qui/utils/Encoding'
    }, {
        name: 'qui/utils/String'
    }, {
        name: 'qui/utils/Elements'
    }, {
        name: 'qui/utils/Object'
    }, {
        name: 'qui/utils/Math'
    }, {
        name: 'qui/utils/Form'
    }, {
        name: 'qui/utils/NoSelect'
    }, {
        name: 'qui/utils/Controls'
    }, {
        name: 'qui/controls/Control'
    }, {
        name: 'qui/controls/contextmenu/Bar'
    }, {
        name: 'qui/controls/contextmenu/Seperator'
    }, {
        name: 'qui/controls/contextmenu/Menu'
    }, {
        name: 'qui/controls/contextmenu/BarItem'
    }, {
        name: 'qui/controls/contextmenu/Item'
    }, {
        name: 'qui/controls/loader/Loader'
    }, {
        name: 'qui/controls/windows/Prompt'
    }, {
        name: 'qui/controls/windows/Popup'
    }, {
        name: 'qui/controls/windows/locale/de'
    }, {
        name: 'qui/controls/windows/locale/en'
    }, {
        name: 'qui/controls/windows/Alert'
    }, {
        name: 'qui/controls/windows/Submit'
    }, {
        name: 'qui/controls/windows/Confirm'
    }, {
        name: 'qui/controls/buttons/Seperator'
    }, {
        name: 'qui/controls/buttons/Select'
    }, {
        name: 'qui/controls/buttons/Button'
    }, {
        name: 'qui/controls/sitemap/Filter'
    }, {
        name: 'qui/controls/sitemap/Map'
    }, {
        name: 'qui/controls/sitemap/Item'
    }, {
        name: 'qui/controls/input/Params'
    }, {
        name: 'qui/controls/utils/Background'
    }, {
        name: 'qui/controls/utils/Progressbar'
    }, {
        name: 'qui/controls/toolbar/Bar'
    }, {
        name: 'qui/controls/toolbar/Tab'
    }, {
        name: 'qui/controls/bookmarks/Panel'
    }, {
        name: 'qui/controls/taskbar/Bar'
    }, {
        name: 'qui/controls/taskbar/Task'
    }, {
        name: 'qui/controls/taskbar/Group'
    }, {
        name: 'qui/controls/breadcrumb/Bar'
    }, {
        name: 'qui/controls/breadcrumb/Item'
    }, {
        name: 'qui/controls/desktop/Tasks'
    }, {
        name: 'qui/controls/desktop/panels/Sheet'
    }, {
        name: 'qui/controls/desktop/Workspace'
    }, {
        name: 'qui/controls/desktop/Column'
    }, {
        name: 'qui/controls/desktop/Panel'
    }, {
        name: 'qui/controls/messages/Information'
    }, {
        name: 'qui/controls/messages/Error'
    }, {
        name: 'qui/controls/messages/Attention'
    }, {
        name: 'qui/controls/messages/Message'
    }, {
        name: 'qui/controls/messages/Handler'
    }, {
        name: 'qui/controls/messages/Favico'
    }, {
        name: 'qui/controls/messages/Success'
    }, {
        name: 'qui/controls/messages/Panel'
    }, {
        name: 'qui/lib/ElementQuery'
    }, {
        name: 'qui/lib/ResizeSensor'
    }, {
        name: 'qui/classes/DOM'
    }, {
        name: 'qui/classes/storage/Polyfill'
    }, {
        name: 'qui/classes/storage/Storage'
    }, {
        name: 'qui/classes/utils/DragDrop'
    }, {
        name: 'qui/classes/QUI'
    }, {
        name: 'qui/classes/request/Ajax'
    }, {
        name: 'qui/classes/Locale'
    }, {
        name: 'qui/classes/Controls'
    }],

    // optimisation
    optimize       : 'uglify2',
    optimizeCss    : "standard",
    generateSourceMaps: true,
    preserveLicenseComments : false
})