/*global Foundation */
(function() {
    'use strict';

    // load dependencies
    var $ = require('jquery'),
        log = require('loglevel'),
        components = {};



    window.jQuery = $;
    require('foundation');

    components.dummy = require('./component/dummy');

    log.setLevel(0);
    log.info('Running jQuery %s', $().jquery);
    log.info('  + Foundation %s', Foundation.version);
    log.info('');

    // load polyfills
    require('./library/polyfills');

    log.info('Initializing components ...');

    for (var key in components) {
        try {
            components[key].init();
        } catch (err) {
            log.info('initialization failed for component \'' + key + '\'');
            log.error(err);
        }
    }

})();
