require.config({
	baseUrl: '../../scripts'
});

// require the unit tests.
require(['./spec/dummyTest'], function(dummyTest){
	dummyTest.run();
	mocha.run();
});

