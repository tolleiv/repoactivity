var express = require('express');
var favicon = require('serve-favicon');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var morgan  = require('morgan');
var errorhandler = require('errorhandler')
var events = require('events');
var path = require('path');

var indexer = new events.EventEmitter();
var consoleIndexer = require('./console-indexer')(indexer);
var solrIndexer = require('./solr-indexer')(indexer);


var app = express();
exports.app = app;

/* istanbul ignore next */
var env = process.env.NODE_ENV || 'development';

// app.use(express.urlencoded());
// app.use(express.json());
//app.use(express.methodOverride());
// app.use(app.router);
app.set('indexer', indexer);

app.set('view engine', 'jade');
app.locals.pretty = true;
app.use(favicon(path.join(__dirname, '..', 'res', 'public', 'favicon.ico')));
app.use(bodyParser())
app.use(express.static(path.join(__dirname, '..', 'res', 'public')));

/* istanbul ignore if */
if ('development' == env) {
    app.use(morgan({ format: 'dev', immediate: true }));
    app.use(errorhandler());
}

require(path.join(__dirname,'..','routes', 'main'))(app)
require(path.join(__dirname,'..','routes', 'webhook'))(app)

if (__filename == process.argv[1]) {
    app.listen(3000);
}
