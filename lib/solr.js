var solr = require('solr-client');

try {
    var config = require('../solr.json');
} catch (e) {
    console.log(e.message)
}

module.exports = function (env) {
    var client = solr.createClient(config[env]);

    var fields = {
        repository: ["id", "name", "url", "description", "watchers", "stargazers",
            "forks", "fork", "size", "open_issues", "language", "type", "owner_name", "owner_email"],
        commit: ["id", "message", "repository_id", "author_name", "author_email", "author_username",
            "committer_name", "committer_email", "committer_username"]
    };
    var qf = {
        repository: {name : 1 , description : 2, language: 1},
        commit: {message: 1}
    };

    var flattenObject = function(input) {
        var toReturn = {};
        for (var i in input) {
            if (!input.hasOwnProperty(i)) continue;

            if ((typeof input[i]) == 'object') {
                var flatObject = flattenObject(input[i]);
                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue;
                    toReturn[i + '_' + x] = flatObject[x];
                }
            } else {
                toReturn[i] = input[i];
            }
        }
        return toReturn;
    };

    var add = function(type, data, cb) {
        data = flattenObject(data);
        Object.keys(data).forEach(function(entry) {
            if (fields[type].indexOf(entry) == -1) {
                delete data[entry]
            }
        });
        data.type = type;
        client.add(data, function(err) {
            err && cb(err);
            client.commit(cb)
        });
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



