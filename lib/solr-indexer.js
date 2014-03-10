var solr = require('./solr')(process.env.NODE_ENV || 'development')

module.exports = function(eventemitter) {
    eventemitter.on('commit', function(data, repo) {
        solr.addCommit(data, repo)
    });

    eventemitter.on('repository', function(data) {
        solr.addRepository(data)
    });
};