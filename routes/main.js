var cluster = require('cluster');

module.exports = function (app) {
    app.get("/", function (req, res) {
        res.send(200);
    });
};