var express = require('express'),
    files = require('./routes/files'),
    assets = require('./routes/assets'),
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    routes = require('./routes/'),
    raml2html = require('raml2html'),
    morgan  = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    parser = require('raml-parser'),
    errorhandler = require('errorhandler'),
    port = parseInt(process.env.PORT, 10) || 8081;

var app = module.exports = express();
var raml2htmlConfig = raml2html.getDefaultConfig();

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

assets.dumpFiles().then(function(fileList){
  _.forEach(fileList, function(val) {
    if (_.endsWith(val.name, ".raml")) {
      var apiName = val.name.replace(".raml", "");
      var apiHtmlFile = apiName + ".html";
      var assetsPath = path.join(__dirname, '/dist/assets/', val.name);
      var docPath = path.join(__dirname, '/documentation', apiHtmlFile);

      /**
       * Documentation
       */
      raml2html.render(assetsPath, raml2htmlConfig, function(result) {
        fs.writeFile(docPath, result, function(err) {
          if (err)
            console.log(err);
        });
        app.get('/documentation/'+ apiName, function(req, res) {
          fs.readFile(docPath, 'utf8', function(error, data) {
            if (error) {
              res.status(500).send(error);
              return;
            }
            res.send(data);
          });
        });
        console.log('1: ', result.length);
      }, function(error) {
        console.log('error! ', error);
      });

      /**
       * Create Mock Data With Osprey
       * @TODO Osprey isn't ready for prime time
       */
      //parser.loadFile(assetsPath).then( function(data) {
      //  app.use(osprey.createServer(data));
      //}, function(error) {
      //  console.log('Error parsing: ' + error);
      //});
    }
  });

  next();
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
