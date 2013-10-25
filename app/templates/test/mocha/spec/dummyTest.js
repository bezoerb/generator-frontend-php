"use strict";
define( ['jquery'], function($) {
	return {
		run: function() {
			describe('Give it some context', function () {
				describe('maybe a bit more context here', function () {
					it('should run here few assertions', function () {
						var check = typeof $ === 'undefined';
						expect(check).to.equal(false);
					});
				});
			});
		}
	}
});
