require("babel/register");

var express = require('express'),
    files = require('./routes/files'),
    docs = require('./routes/docs'),
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs'),
    async = require('async'),
    osprey = require('osprey'),
    parser = require('raml-parser'),
    routes = require('./routes/'),
    morgan  = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    mockService = require('osprey-mock-service'),
    errorhandler = require('errorhandler'),
    utils = require('./routes/utils.js'),
    port = parseInt(process.env.PORT, 10) || 8081;

var app = module.exports = express();
var mockApp = module.exports = express();

app.use(morgan('combined'));
app.use(methodOverride());
app.use(bodyParser.json({limit: '5mb'}));
app.use(express.static(__dirname + '/dist'));
app.use(errorhandler({
    dumpExceptions: true,
    showStack: true
}));

/**
 * CORS middleware
 * @link {http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs}
 * @param req
 * @param res
 * @param next
 */
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
      next();
    }
};

app.use(allowCrossDomain);

async.waterfall([
  /**
  * Writes the raml included files to the asset directory
  * and returns api specific informaton from the files
  * collection like the names of the apis (apiName), the
  * apiDocPath and the ramlPath
  * @param callback
  */
  function(callback){
    utils.writeFilesToDir().then(function(response) {
      callback(null, response)
    });
  },

  /**
  * Create RAML API Proxy and Mock Data With Osprey
  * @link {https://github.com/mulesoft/osprey}
  * @param apiObj {Object} object returned from utils.writeFilesToDir()
  */
  function(apiObj){

    _.forEach(apiObj, function(api) {

      parser.loadFile(api.ramlPath).then(function (data) {
        /**
         * RAML API Proxy and Mock Data Routes
         */
        if (data.version)
          data.baseUri = data.baseUri.replace("{version}", ":version");

        if (data.baseUriParameters) {
          _.forEach(data.baseUriParameters, function (value, key) {
            data.baseUri = data.baseUri.replace("{" + key + "}", ":" + key);
          });
        }

        var proxyBaseUri = '/' + data.baseUri.split('/').slice(3).join('/');

        mockApp.use(osprey.createServer(data));
        mockApp.use(mockService.createServer(data));

        app.use(proxyBaseUri, mockApp);

      });

    })
  }]
);

/**
* ------
* Routes
* ------
*/

/**
* Api Designer Routes
*/
app.get('/files', files.findAll);
app.get('/files/:id', files.findById);
app.post('/files', files.addFile);
app.put('/files/:id', files.updateFile);
app.delete('/files/:id', files.deleteFile);
app.get('/files/name/:name', files.findContentByName);

/**
* Documentation Route
*/
app.get('/documentation/:name', docs.get);


app.get('/', routes.index);

app.listen(port, function (){
  console.log('Listening on port ' + port);
});
