var async = require('async')

module.exports = function (app) {
    app.post("/payload", function (req, res) {
        var data = req.is('json') ? req.body : JSON.parse(req.body.payload);
        if (typeof data.commits == 'object') {
            var keys = Object.keys(data.commits);
            async.each(keys,
                function(item, cb) {
                    app.get('indexer')
                       .emit('commit', data.commits[item], data.repository.id);
                    cb();
                },
                function(err) {}
            );
        }
        if (typeof data.repository == 'object') {
            app.get('indexer')
               .emit('repository', data.repository);
        }

        res.send(200)
    });
};