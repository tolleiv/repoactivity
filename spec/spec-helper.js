var http = require('http');
var request = require("request");
var assert = require('assert');
var fs = require('fs');


var server, app, started = false, fixturesOk = false;
exports.req = {
    get: function (path, callback) {
        return request("http://127.0.0.1:3000" + path, callback);
    },
    post: function (path, data, callback) {
        return request.post({
            url: "http://127.0.0.1:3000" + path,
            json: data
        }, callback);
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
            expect(err).toBe(null)
            expect(res.statusCode).toBeGreaterThan(399)
            expect(res.statusCode).toBeLessThan(500)
            cb && cb(body);
        }
    }
};


var startServer = function (env, indexer) {
    app = require("../app.js").app;
    app.set('env', env);
    app.set('indexer', indexer)
    server = http.createServer(app);
    server.listen(3000)
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
