
"use strict";
describe('Dummy Test',function(){
    it('should have jquery defined', function () {
        var $ = require('jquery'),
            check = typeof $ === 'undefined';
        expect(check).toBe(false);
    });

    it('should have dummy component with init function defined', function(){
        var dummy = require('component/dummy'),
            check = typeof dummy !== 'undefined' && typeof dummy.init === 'function';

        expect(check).toBe(true);
    });
});
