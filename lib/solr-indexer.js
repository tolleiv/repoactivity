var solr = require('./solr')(process.env.NODE_ENV || 'development')

module.exports = function(eventemitter) {
    eventemitter.on('commit', function(data, repo) {
        data.repository_id = repo.id;
        solr.addCommit(data)
    });

    eventemitter.on('repository', function(data) {
        solr.addRepository(data)
    });
};