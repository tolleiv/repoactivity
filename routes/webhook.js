var async = require('async')

module.exports = function (app) {
    app.post("/payload", function (req, res) {
        if (typeof req.body.commits == 'object') {
            var keys = Object.keys(req.body.commits);
            async.each(keys,
                function(item, cb) {
                    app.get('indexer')
                       .emit('commit', req.body.commits[item], req.body.repository.id);
                    cb();
                },
                function(err) {}
            );
        }
        if (typeof req.body.repository == 'object') {
            app.get('indexer')
               .emit('repository', req.body.repository);
        }

        res.send(200)
    });
};