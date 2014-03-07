var mut = require('../lib/indexing-helper');

describe("The indexer helper", function () {

    describe("flatten functionality", function() {
        var obj={foo: 'bar'};
        it("passes flat objects without modification", function(done) {
            expect(mut.flattenInput(obj)).toEqual(obj);
            done();
        });
        it("merged sub objects and combines names with an underscore", function(done) {
            expect(mut.flattenInput({foo:obj})).toEqual({foo_foo : 'bar'});
            done();
        });
        it("can work with flat and nested properties side-by-side", function(done) {
            var obj2 = {foo:obj, bar: 'foo'};
            expect(mut.flattenInput(obj2)).toEqual({foo_foo : 'bar', bar: 'foo'});
            done();
        });
    });

    describe("filter functionality", function() {
        it("filters unknown properties", function(done) {
            var obj1={id: 1, foo:'bar'};
            expect(mut.filterInput('repository', obj1)).toEqual({id: 1})
            done();
        });

        it("can whitelist fields based on a postfix", function(done) {
            var obj1={id: 1, foo: 'bar', 'random_url': 'text'};
            var obj2={id: 1, random_url: 'text'}
            expect(mut.filterInput('repository', obj1)).toEqual(obj2)
            done();
        });

        it("transforms timezoned fields to UTC", function(done) {
            var objIn = { created_at: "2014-02-24T15:22:10-08:00" }
            expect(mut.filterInput('repository', objIn))
                .toEqual({created_at: "2014-02-24T23:22:10.000Z"});

            objIn = { created_at: "2014-02-24T15:22:10+05:00" }
            expect(mut.filterInput('repository', objIn))
                .toEqual({created_at: "2014-02-24T10:22:10.000Z"});

            done();
        });

        it("transforms timestamps fields into Solr compatible ISO 8601", function(done) {
            var objIn = { created_at: 1393972302 }
            expect(mut.filterInput('repository', objIn))
                .toEqual({created_at: "2014-03-04T22:31:42.000Z"});
            done();
        });

        it("keeps UTC fields in shape", function(done) {
            var objIn = { created_at: "2014-03-04T22:31:42Z" }
            expect(mut.filterInput('repository', objIn))
                .toEqual({created_at: "2014-03-04T22:31:42.000Z"});
            done();
        });

        it("uses 'now' as default if parsing fails", function(done) {
            var objIn = { created_at: "not parsable" }
            expect(mut.filterInput('repository', objIn).hasOwnProperty('created_at'))
                .toBeTruthy();
            done();
        })
    });

    describe("merge functionality", function() {
        it("prioritizes the second object", function(done) {
            var obj1={foo:'0', bar:'2'};
            var obj2={foo:'1', baz:'3'};
            var obj3={foo:'1', bar:'2', baz:'3'}
            expect(mut.mergeInputs(obj1,obj2)).toEqual(obj3);
            done();
        });
    });


});