/**
 * sudo jsdoc qui/ -c build-jsdoc.js
 */

{
    "tags": {
        "allowUnknownTags": true
    },

    "source": {
        "exclude": [ "qui/lib/" ]
    },

    "opts": {
        "destination" : "./jsdoc/",
        "recurse"     : true,
        "template"    : "/var/www/git/jaguarjs-jsdoc",
        "verbose"     : true
    },

    "templates": {
        "applicationName": "QUI",
        "disqus" : false,
        "googleAnalytics": false,
        "openGraph": {
            "title": "",
            "type": "website",
            "image": "",
            "site_name": "",
            "url": ""
        },
        "meta": {
            "title"       : "",
            "description" : "",
            "keyword"     : ""
        },
        "linenums": true
    }
}