var express = require('express'),
    files = require('./routes/files'),
    documentation = require('./routes/documentation'),
    path = require('path'),
    fs = require('fs'),
    routes = require('./routes/'),
    morgan  = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorhandler = require('errorhandler'),
    port = parseInt(process.env.PORT, 10) || 8081;

var app = module.exports = express();


/* Configure a simple logger and an error handler. */
app.use(morgan('combined'));
app.use(methodOverride());
app.use(bodyParser.json({limit: '5mb'}));
app.use(express.static(__dirname + '/dist'));
app.use(errorhandler({
    dumpExceptions: true,
    showStack: true
}));

/**
 * ------
 * ROUTES
 * ------
 */

// ## CORS middleware
//
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};

app.use(allowCrossDomain);

app.get('/files', files.findAll);
app.get('/files/:id', files.findById);
app.post('/files', files.addFile);
app.put('/files/:id', files.updateFile);
app.delete('/files/:id', files.deleteFile);
app.get('/files/name/:name', files.findContentByName);
app.get('/documentation/:name', documentation.get);

app.get('/', routes.index);

app.listen(port);
console.log('Listening on port ' + port);
