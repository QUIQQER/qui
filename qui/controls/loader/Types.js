/**
 * Available loader types. Shared by the loader and type selection controls.
 *
 * getTypes() returns independent descriptors; callers may safely modify them.
 * supportsColor describes whether the animation uses the loader color.
 */
define('qui/controls/loader/Types', [], function() {
    'use strict';

    var types = {
        standard: {
            title: 'Standard',
            supportsColor: true,
            children: 8,
            files: ['css!qui/controls/loader/Loader.standard.css']
        },

        'line-scale': {
            title: 'Line Scale',
            supportsColor: true,
            children: 5,
            files: ['css!qui/controls/loader/Loader.line-scale.css']
        },

        'ball-clip-rotate': {
            title: 'Ring',
            supportsColor: false,
            children: 1,
            files: ['css!qui/controls/loader/Loader.ball-clip-rotate.css']
        },

        'ball-pulse-rise': {
            title: 'Ball Pulse Rise',
            supportsColor: true,
            children: 5,
            files: ['css!qui/controls/loader/Loader.ball-pulse-rise.css']
        },

        'ball-triangle-path': {
            title: 'Ball Triangle Path',
            supportsColor: true,
            children: 3,
            files: ['css!qui/controls/loader/Loader.ball-triangle-path.css']
        },

        'pacman': {
            title: 'Pacman',
            supportsColor: false,
            children: 5,
            files: ['css!qui/controls/loader/Loader.pacman.css']
        },

        'fa-spinner': {
            title: 'Spinner',
            supportsColor: true,
            icon: 'fa-spinner',
            children: 1,
            files: ['css!qui/controls/loader/Loader.fa-spinner.css']
        },

        'fa-gear': {
            title: 'Gear',
            supportsColor: true,
            icon: 'fa-gear',
            children: 1,
            files: ['css!qui/controls/loader/Loader.fa-spinner.css']
        },

        'fa-refresh': {
            title: 'Refresh',
            supportsColor: true,
            icon: 'fa-refresh',
            children: 1,
            files: ['css!qui/controls/loader/Loader.fa-spinner.css']
        },

        'fa-circle-o-notch': {
            title: 'Circle',
            supportsColor: true,
            icon: 'fa-circle-o-notch fa-circle-notch',
            children: 1,
            files: ['css!qui/controls/loader/Loader.fa-spinner.css']
        }
    };

    return {
        getTypes: function() {
            var result = {};

            Object.keys(types).forEach(function(type) {
                result[type] = Object.assign({}, types[type], {
                    files: types[type].files.slice()
                });
            });

            return result;
        }
    };
});
