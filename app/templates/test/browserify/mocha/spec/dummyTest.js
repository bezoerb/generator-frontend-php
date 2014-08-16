"use strict";

describe('Give it some context', function () {

    var $ = require('jquery');
    describe('maybe a bit more context here', function () {
        it('should run here few assertions', function () {
            var check = typeof $ === 'undefined';
            expect(check).to.equal(false);
        });

        it('should have dummy component with init function defined', function(){
            var dummy = require('component/dummy'),
                check = typeof dummy !== 'undefined' && typeof dummy.init === 'function';

            expect(check).to.equal(true);
        });
    });

});