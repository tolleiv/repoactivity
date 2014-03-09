var solr = require('solr-client');
var helper = require('./indexing-helper')

try {
    var config = require('../solr.json');
} catch (e) {
    console.log(e.message)
}

module.exports = function (env) {
    var client = solr.createClient(config[env]);

    var qf = {
        repository: {name : 1 , description : 2, language: 1},
        commit: {message: 1}
    };

    var findById = function(type, id, cb) {
        var query = client.createQuery()
            .q({'id' : id, 'type' : type})
            .rows(1);
        client.search(query,function(err, result) {
            cb(err, err ? null : result.response.docs[0])
        });
    };

    var find = function(type, search, cb) {
        var query = client.createQuery();
        if(typeof search == 'function') {
            cb = search;
            query.q('id:*')
        } else {
            query.dismax()
                .q(search)
                .qf(qf[type]);
        }
        query.matchFilter('type', type);
        // console.log(query.build())
        client.search(query,function(err, result) {
            cb(err, err ? null : result.response.docs)
        });
    };
    var add = function(type, data, cb) {
        var postfix;
        data = helper.flattenInput(data);
        data = helper.filterInput(type, data);

        data.type = type;
        findById(type, data.id, function(err, oldData) {
            if (oldData) {
                data = helper.mergeInputs(oldData, data);
                delete data['_version_'];
            }
            client.add(data, function(err) {
                err && cb && cb(err);
                client.commit(cb)
            });
        });
    };


    return {
        ping: function (cb) {
            client.ping(cb);
        },
        addRepository: add.bind(this, 'repository'),
        findRepositoryById: findById.bind(this, 'repository'),
        findRepositories: find.bind(this, 'repository'),

        addCommit: add.bind(this, 'commit'),
        findCommitById: findById.bind(this, 'commit'),
        findCommits: find.bind(this, 'commit'),

        findCommitsByRepository: function(repo, cb) {
            var query = client.createQuery();
            query.q("id:*")
                .matchFilter('repository_id', repo)
                .matchFilter('type', 'commit');
            client.search(query,function(err, result) {
                cb(err, err ? null : result.response.docs)
            });
        },

        clearAll: function(cb) {
            client.delete('id','*',function(err,obj){
                err && cb(err);
                client.commit(cb)
            });
        }
    }
};



