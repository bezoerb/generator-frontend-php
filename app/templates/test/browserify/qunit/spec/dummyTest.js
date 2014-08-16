"use strict";
var $ = require('jquery');

test('basic test', function () {
    expect(1);
    ok(true, 'this had better work.');
});

test('can access the DOM', function () {
    expect(1);
    var fixture = document.getElementById('qunit-fixture');
    equal(fixture.innerText, 'this had better work.', 'should be able to access the DOM.');
});

test('required jquery should be defined', function () {
    expect(1);
    var check = typeof $ === 'undefined';
    equal(check, false, 'jquery should be defined');
});

test('dummy component is defined and exposes an init function', function () {
    var dummy = require('component/dummy'),
        check = typeof dummy !== 'undefined' && typeof dummy.init === 'function';
    equal(check, true, 'dummy component should be defined and should expose an init function');
});
