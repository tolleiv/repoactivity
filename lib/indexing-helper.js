var flattenInput;

exports.flattenInput = flattenInput = function(input) {
    var toReturn = {};
    for (var i in input) {
        if (!input.hasOwnProperty(i)) continue;

        if ((typeof input[i]) == 'object') {
            var flatObject = flattenInput(input[i]);
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

var fields = {
    repository: ["id", "name", "url", "description", "watchers", "stargazers",
        "forks", "fork", "size", "open_issues", "language", "type"],
    commit: ["id", "message", "repository_id"],
    dynamic: ["_name", "_email","_username", "_url", "_count"],
    time: ["_at", "_date"]
};

exports.filterInput = function(type, input) {
    Object.keys(input).forEach(function(entry) {
        postfix = entry.substr(entry.lastIndexOf("_"));
        if (fields[type].indexOf(entry) == -1 && fields['dynamic'].indexOf(postfix) == -1) {
            delete input[entry]
        }

        if (entry === 'timestamp' || fields['time'].indexOf(postfix) != -1) {

        }
    });
    return input;
};

exports.mergeInputs = function(obj1,obj2){
    var attrname, obj3 = {};
    for (attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
};