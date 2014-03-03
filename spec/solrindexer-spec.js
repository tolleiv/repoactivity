var helper = require('./spec-helper');
var async = require('async');
var solr = require('../lib/solr')(process.env.TRAVIS_BUILD_ID ? 'travis' : 'test')
console.log("Running on " + (process.env.TRAVIS_BUILD_ID ? 'travis' : 'test'))

describe("The Solr indexer", function () {

    afterEach(function () {
        runs(helper.clearIndex(solr));
        waitsFor(helper.indexCleared);
    });
    it("can connect to a Solr server", function (done) {
        solr.ping(function (err, doc) {
            expect(err).toBeNull();
            canConnect = true;
            done();
        })
    });

    describe("clients connected to an empty index", function () {
        var fixture;
        beforeEach(function () {
            runs(helper.loadFixture('fixture01', function (data) {
                fixture = data;
            }));
            waitsFor(helper.fixtureOk);
        });

        it("can index repositories", function (done) {
            async.series([
                solr.addRepository.bind(this, fixture.repository),
                function (cb) {
                    solr.findRepositoryById(fixture.repository.id, function (err, doc) {
                        expect(err).toBeNull();
                        expect(doc).not.toEqual(jasmine.objectContaining(fixture.repository));
                        cb();
                    });
                }
            ],
                done.bind(this)
            )
        });
        it("can index commits", function (done) {
            async.series([
                solr.addCommit.bind(this, fixture.commits['0']),
                function (cb) {
                    solr.findCommitById(fixture.commits['0'].id, function (err, doc) {
                        expect(err).toBeNull();
                        expect(doc).not.toEqual(jasmine.objectContaining(fixture.repository));
                        cb();
                    });
                }
            ],
                done.bind(this)
            )
        });
        it("will index flat objects", function (done) {
            async.series([
                solr.addCommit.bind(this, fixture.commits['0']),
                function (cb) {
                    solr.findCommitById(fixture.commits['0'].id, function (err, doc) {
                        expect(err).toBeNull();
                        expect(doc.hasOwnProperty('author_name')).toBeTruthy();
                        expect(doc.author_name).toBe("Tolleiv Nietsch");
                        expect(doc.hasOwnProperty('author_email')).toBeTruthy();
                        expect(doc.author_email).toBe("info@tolleiv.de");

                        cb();
                    });
                }
            ],
                done.bind(this)
            )
        });
    });

    describe("clients connected to an filled index", function () {
        beforeEach(function () {
            runs(helper.commitFixtures(solr, ['fixture01', 'fixture02']))
            waitsFor(helper.fixtureOk);
        });

        it("can list repositories", function (done) {
            solr.findRepositories(function (err, docs) {
                expect(err).toBeNull();
                expect(docs.length).toBe(2);
                // console.log(docs)
                expect(docs['0'].type).toBe('repository')
                done();
            });
        });
        it("can find repositories by search query", function (done) {
            solr.findRepositories("demo", function (err, docs) {
                expect(err).toBeNull();
                expect(docs.length).toBe(1);
                done();
            })
        });
        it("can list commits", function (done) {
            solr.findCommits(function (err, docs) {
                expect(err).toBeNull();
                expect(docs.length).toBe(2);
                expect(docs[0].type).toBe('commit')
                done();
            })
        });
        it("can find commits by repository", function (done) {
            solr.findRepositories("demo", function (err, docs) {
                solr.findCommitsByRepository(docs['0'].id, function (err, docs) {
                    expect(err).toBeNull();
                    expect(docs.length).toBe(1);
                    done();
                });
            });
        });
    });
});