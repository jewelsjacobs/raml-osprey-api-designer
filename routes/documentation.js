var fs = require('fs'),
  path = require('path'),
  async = require('async'),
  raml2html = require('raml2html'),
  parser = require('raml-parser'),
  //osprey = require('osprey'),
  _ = require('lodash'),
  mongoDbConnection = require('./db.js');

/**
 * Create Documentation
 * @param req
 * @param res
 */
exports.get = function (req, res) {

  var raml2htmlConfig = raml2html.getDefaultConfig();
  var fileList = {};
  var assetsPath = path.join(__dirname, '../dist/assets/');
  var docPath = path.join(__dirname, '../documentation/');

  var manageDir = function(dirPath) {
    fs.exists(dirPath, function (exists) {
      if (exists) {
        rmDir(dirPath);
        fs.mkdirSync(dirPath);
      } else {
        fs.mkdirSync(dirPath);
      }
    });
  };

  var rmDir = function(dirPath) {
    try { var files = fs.readdirSync(dirPath); }
    catch(e) { return; }
    if (files.length > 0)
      for (var i = 0; i < files.length; i++) {
        var filePath = dirPath + '/' + files[i];
        if (fs.statSync(filePath).isFile())
          fs.unlinkSync(filePath);
        else
          rmDir(filePath);
      }
    fs.rmdirSync(dirPath);
  };

  manageDir(assetsPath);
  manageDir(docPath);

  async.waterfall([

    function(callback){
      mongoDbConnection(function (db) {
        db.collection('files', function (err, collection) {
          collection.find({}, function (err, resultCursor) {
            resultCursor.each(function (err, item) {
              callback(err, item)
            })
          })
        })
      })
    },

    function(item, callback){
      if (_.isNull(item)) {
        callback(null, fileList);
      } else {

        fileList[item._id] = item;
        delete fileList[item._id]._id;
        var itemPath = path.join(assetsPath, item.name);

        fs.writeFile(itemPath, decodeURIComponent(item.content));
      }
    },

    function(fileList, callback){
      _.forEach(fileList, function(val) {
        if (_.endsWith(val.name, ".raml")) {

          var apiName = val.name.replace(".raml", "");
          var apiHtmlFile = apiName + ".html";
          var ramlPath = path.join(assetsPath, val.name);
          var apiDocPath = path.join(docPath, apiHtmlFile);
          callback(null, ramlPath, apiDocPath, apiName);
        }
      });
    },

    function(ramlPath, apiDocPath, apiName, callback){
      /**
       * Documentation
       */
      raml2html.render(ramlPath, raml2htmlConfig, function(result) {
        fs.writeFile(apiDocPath, result, function(err) {
          callback(err, ramlPath);
        });
        if (apiName === req.params.name) {
          fs.readFile(apiDocPath, 'utf8', function (error, data) {
            if (error) {
              res.status(500).send(error);
              return;
            }
            res.send(data);
          });
        }
      });
    },

    function(ramlPath, callback){
      /**
       * Create Mock Data With Osprey
       * @TODO Osprey isn't ready for prime time
       */
      parser.loadFile(ramlPath).then( function(data) {
        //app.use(osprey.createServer(data));
      }, function(error) {
        callback(error, ramlPath);
      });
    }], function (err, result) {}
  );

};
