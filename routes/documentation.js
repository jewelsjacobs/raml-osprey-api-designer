var fs = require('fs'),
  path = require('path'),
  async = require('async'),
  raml2html = require('raml2html'),
  //osprey = require('osprey'),
  _ = require('lodash'),
  mongoDbConnection = require('./db.js');

var raml2htmlConfig = raml2html.getDefaultConfig();

/**
 * Create Documentation
 * @todo clean this up with async
 * @param req
 * @param res
 */
exports.get = function (req, res) {
    var fileList = {};
    var assetsPath = path.join(__dirname, '../dist/assets/');
    var docPath = path.join(__dirname, '../documentation/');

    manageDir(assetsPath);
    manageDir(docPath);

    mongoDbConnection(function (db) {
      db.collection('files', function (err, collection) {
        collection.find({}, function (err, resultCursor) {
          resultCursor.each(function (err, item) {

            if (item != null) {

              fileList[item._id] = item;
              delete fileList[item._id]._id;
              var itemPath = path.join(assetsPath, item.name);

              fs.writeFile(itemPath, decodeURIComponent(item.content), function(err) {
                if (err)
                  console.log(err);
              });

            } else {

              _.forEach(fileList, function(val) {

                if (_.endsWith(val.name, ".raml")) {

                  var apiName = val.name.replace(".raml", "");
                  var apiHtmlFile = apiName + ".html";
                  var ramlPath = path.join(assetsPath, val.name);
                  var apiDocPath = path.join(docPath, apiHtmlFile);

                  /**
                   * Documentation
                   */
                  raml2html.render(ramlPath, raml2htmlConfig, function(result) {

                    fs.writeFile(apiDocPath, result, function(err) {
                      if (err)
                        console.log(err);
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

                    console.log('1: ', result.length);

                  }, function(error) {

                    console.log('error! ', error);

                  });

                  /**
                   * Create Mock Data With Osprey
                   * @TODO Osprey isn't ready for prime time
                   */
                  parser.loadFile(assetsPath).then( function(data) {
                    //app.use(osprey.createServer(data));
                  }, function(error) {
                    console.log('Error parsing: ' + error);
                  });
                }
              });
            }
          });
        });
      });
    });
};

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
