/**
 * Dummy Module
 *
 * @author Ben Zörb @bezoerb https://github.com/bezoerb
 * @copyright    Copyright (c) 2014 ben
 * All rights reserved.
 */
(function () {
    'use strict';

    var log = require('loglevel');

    function init(){
        if (false /* check if all dependencies are resolved */) {
            log.info('Component skipped: \'dummy\'');
            return;
        }

        log.info('Component initialized: \'dummy\'');
    }

    module.exports.init = init;
})();
