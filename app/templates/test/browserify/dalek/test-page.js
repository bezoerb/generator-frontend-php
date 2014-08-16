var baseUrl = 'http://127.0.0.1:9999';

module.exports = {
    'dummy': function (test) {
        test.open(baseUrl+'/index.php')
            // assert something
            .assert.height('body').is.gt(0)
            .done();
    }
};