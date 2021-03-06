var cluster = require('cluster');

module.exports = function (app) {
    app.get("/", function (req, res) {
        res.render('index', { title: 'Home' })
    });

    app.get("/app-status", function (req, res) {
        var solr = require('../lib/solr')(process.env.NODE_ENV || 'development')
        solr.ping(function (err, doc) {
            var status = ( err ? ":( " : ":) ") + (process.env.NODE_ENV || 'development');
            res.send(err ? 500 : 200, status);
        });
    });
};