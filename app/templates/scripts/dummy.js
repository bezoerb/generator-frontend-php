/**
 * JS Modul Definition
 *
 * @author Ben Zörb @bezoerb https://github.com/bezoerb
 * @copyright    Copyright (c) 2014 ben
 * All rights reserved.
 */
define(function (require) {
    'use strict';

    var log = require('loglevel');

    return {
        init: function(){
            if (false /* check if all dependencies are resolved */) {
                log.debug('Component skipped: \'dummy\'');
                return;
            }


            log.debug('Component initialized: \'dummy\'');
        }
    };
});