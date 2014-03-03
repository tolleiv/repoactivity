var http = require('http');
var request = require("request");
var assert = require('assert');
var fs = require('fs');


var server, app, started = false, fixturesOk = false;
exports.req = {
    get: function (path, callback) {
        return request("http://127.0.0.1:3001" + path, callback);
    },
    post: function (path, data, callback) {
        return request.post({
            url: "http://127.0.0.1:3001" + path,
            json: data
        }, callback);
    },

    httpOk: function(cb) {
        return this.respondsPositive(function() {
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
    nullError: function(err) {
        expect(err).toBeNull();
    }
}


var startServer = function (env, indexer) {
    app = require("../app.js").app;
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

exports.loadFixture = function (name, cb) {
    return function () {
        fixturesOk = false
        fs.readFile('./spec/fixtures/' + name + '.json', 'utf-8', function (err, data) {
            cb(JSON.parse(data));
            fixturesOk = true;
        });
    }
};
exports.fixtureOk = function () {
    return true;
};

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
