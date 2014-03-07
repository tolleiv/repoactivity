module.exports = function(eventemitter) {
    eventemitter.on('commit', function(data, repo) {
        console.log(data)
    });

    eventemitter.on('repository', function(data) {
        console.log(data)
    });
};