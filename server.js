
var express = require('express'),
files = require('./routes/files'),
path = require('path'),
osprey = require('osprey'),
fs = require('fs'),
mock = require('./routes/mock'),
_ = require('lodash'),
routes = require('./routes/');
 
var app = module.exports = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/api-designer'));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

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
  ramlFile: path.join(__dirname, '/api-designer/assets/lbs-api.raml'),
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

app.listen(app.get("port"));
mock.generateMock();
console.log('Listening on port 3000...');
