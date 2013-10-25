
"use strict";
define(function(require) {
	describe('Dummy Test',function(){
		it('should have dummy.a == false', function () {
			var $ = require('jquery'),
				check = typeof $ === 'undefined';
			expect(check).toBe(false);
		});
	});
});
