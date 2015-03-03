var express = require('express'),
    files = require('./routes/files'),
    path = require('path'),
    osprey = require('osprey'),
    fs = require('fs'),
    mock = require('./routes/mock'),
    _ = require('lodash'),
    routes = require('./routes/'),
    morgan  = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    parser = require('raml-parser'),
    errorhandler = require('errorhandler'),
    port = parseInt(process.env.PORT, 10) || 3000;

var app = module.exports = express();

/* Configure a simple logger and an error handler. */
app.use(morgan('combined'));
app.use(methodOverride());
app.use(bodyParser.json());
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

api = osprey.create('/api', app, {
  ramlFile: path.join(__dirname, '/dist/assets/api.raml'),
  logLevel: 'debug',  //  logLevel: off->No logs | info->Show Osprey modules initializations | debug->Show all
  enableMocks: true
});

app.get('/files', files.findAll);
app.get('/files/:id', files.findById);
app.post('/files', files.addFile);
app.put('/files/:id', files.updateFile);
app.delete('/files/:id', files.deleteFile);
app.get('/files/name/:name', files.findContentByName);
app.get('/', routes.index);

app.listen(port);
console.log('Listening on port ' + port);
