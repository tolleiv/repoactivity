var proxyquire = require('proxyquire');
var events = require('events');
var solrStub = {};
var solrModule = function() { return solrStub; };
var emitter = new events.EventEmitter();

var indexer = proxyquire('../lib/solr-indexer', { './solr': solrModule })(emitter);

describe("The Solr indexer", function() {
    it("connects the repo emitter and the solr client", function(done) {
        var repoData = { id : 10};
        solrStub.addRepository = function(data) {
            expect(data).toEqual(jasmine.objectContaining(repoData));
            done();
        };
        emitter.emit('repository', repoData);
    });
    it("connects the commit emitter and the solr client", function(done) {
        var commitData = { id : 10};
        solrStub.addCommit = function(data, repo) {
            expect(data).toEqual(jasmine.objectContaining(commitData));
            expect(repo).toEqual(20);
            done();
        };
        emitter.emit('commit', commitData, 20);
    });
});