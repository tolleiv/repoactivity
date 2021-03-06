var http = require('http');
var request = require("request");
var assert = require('assert');
var fs = require('fs');


var server, app, loadFixture, started = false, fixturesOk = 0, fixtureReq = 0, indexCleared = false;
exports.req = {
    get: function (path, callback) {
        return request("http://127.0.0.1:3001" + path, callback);
    },
    post: function (path, data, callback, method) {
        var options = {url: "http://127.0.0.1:3001" + path}
        if (method=='form') {
            options.form = {payload: JSON.stringify(data) }
        } else {
            options.json = data;
        }
        return request.post(options, callback);
    },

    httpOk: function (cb) {
        return this.respondsPositive(function () {
            cb && cb();
        })
    },

    respondsPositive: function (cb) {
        return function (err, res, body) {
            expect(err).toBeNull();
            expect(res.statusCode).toEqual(200);
            cb && cb(body);
        }
    },
    respondsNegative: function (cb) {
        return function (err, res, body) {
            expect(err).toBeNull();
            expect(res.statusCode).toBeGreaterThan(399)
            expect(res.statusCode).toBeLessThan(500)
            cb && cb(body);
        }
    }
};

exports.assert = {
    nullError: function (err) {
        expect(err).toBeNull();
    }
}


var startServer = function (env, indexer) {
    app = require("../lib/main.js").app;
    app.set('env', env);
    app.set('indexer', indexer)
    server = http.createServer(app);
    server.listen(3001)
        .on('listening', function () {
            setTimeout(function () {
                started = true;
            }, 100)
        })
        .on('close', function () {
            started = false;
        });
};

exports.loadFixture = loadFixture = function (name, cb) {
    return function (n) {
        fixturesOk = 0;
        fixtureReq = n || 1;
        fs.readFile('./spec/fixtures/' + name + '.json', 'utf-8', function (err, data) {
            expect(err).toBeNull();
            cb(JSON.parse(data));
            fixturesOk++;
        });
    }
};
exports.commitFixtures = function (solr, list) {
    return function () {
        fixturesOk = 0;
        fixtureReq = 3 * list.length;
        list.forEach(function (entry) {
            loadFixture(entry, function (data) {
                solr.addRepository(data.repository, function (err) {
                    expect(err).toBeNull();
                    fixturesOk++;
                });
                solr.addCommit(data.commits['0'], data.repository.id, function (err) {
                    expect(err).toBeNull();
                    fixturesOk++;
                });
            })(fixtureReq);
        })
    }
};

exports.fixtureOk = function () {
    return fixturesOk == fixtureReq;
};

exports.clearIndex = function (solr) {
    return function () {
        indexCleared = false;
        solr.clearAll(function () {
            indexCleared = true;
        });
    }
};
exports.indexCleared = function () {
    return indexCleared;
}


exports.start = function (indexer) {
    return function () {
        startServer('test', indexer)
    }
};

exports.isStarted = function () {
    return started;
};

exports.stop = function (cb) {
    server.close(cb);
};

// Data provider code - see: https://github.com/jphpsf/jasmine-data-provider
exports.using = function (name, values, func) {
    for (var i = 0, count = values.length; i < count; i++) {
        if (Object.prototype.toString.call(values[i]) !== '[object Array]') {
            values[i] = [values[i]];
        }
        func.apply(this, values[i]);
       // jasmine.currentEnv_.currentSpec.description += ' (with "' + name + '" using ' + values[i].join(', ') + ')';
    }
}
