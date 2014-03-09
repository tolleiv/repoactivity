var cluster = require('cluster');

module.exports = function (app) {
    app.get("/", function (req, res) {
        res.send(200);
    });

    app.get("/app-status", function(req, res) {
        var solr = require('./solr')(process.env.NODE_ENV || 'development')
        solr.ping(function (err, doc) {
            res.send(err ? 500 : 200);
        });
    });
};