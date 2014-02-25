var helper = require('./spec-helper');
var events = require('events');

describe("The webhook API", function () {
    var request = helper.req;
    var indexer = new events.EventEmitter();
    var fixture;
    var respondsPositive = helper.req.respondsPositive
    var respondsNegative = helper.req.respondsNegative
    beforeEach(function () {
        runs(helper.loadFixture('single-commit', function (data) {
            fixture = data;
        }));
        waitsFor(helper.fixtureOk);
        runs(helper.start(indexer));
        waitsFor(helper.isStarted);
    });
    afterEach(function() {
        runs(helper.stop);
    });

    it("can retrieve JSON", function (done) {
        request.post("/payload", {demo: 'tolleiv'}, respondsPositive(function (body) {
            done();
        }));
    });

    it("emits all commits for indexing", function (done) {
        indexer.on('commit', function (data, repo) {
            expect(data).toBeDefined();
            expect(data.author).toBeDefined();
            expect(data.message).toBeDefined();
            expect(typeof repo).toBe('number');
            done();
        });
        request.post("/payload", fixture, respondsPositive(function (body) {
            expect(body).toBeDefined();
        }));

    });

    it("emits contained repository information for indexing", function(done) {
        indexer.on('repository', function (data) {
            expect(data.id).toBeDefined();
            expect(data.url).not.toBeNull();
            done();
        });
        request.post("/payload", fixture, respondsPositive(function (body) {
            expect(body).toBeDefined();
        }));
    })

});