module.exports = function (app) {
    app.post("/payload", function (req, res) {
        console.log(JSON.parse(req.body))
        res.send(200)
    });
};