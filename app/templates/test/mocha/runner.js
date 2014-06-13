require.config({
	baseUrl: '../bower_components'
});

// require the unit tests.
require(['spec/dummyTest'], function(dummyTest){
	dummyTest.run();
	mocha.run();
});

