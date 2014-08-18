require.config({
	baseUrl: '../bower_components'
});

//phantom.log('test');

// require the unit tests.
require(['spec/dummyTest'], function(dummyTest){

	dummyTest.run();
	QUnit.start();
});

