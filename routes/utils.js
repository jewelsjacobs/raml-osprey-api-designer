require("babel/register");

var fs = require('fs'),
  path = require('path'),
  async = require('async'),
  parser = require('raml-parser'),
  utils = require('./utils'),
  paths = utils.paths,
  _ = require('lodash'),
  mongoDbConnection = require('./db.js');

/**
 * Creates directory, removing it if it already exists
 * @param dirPath {String} - path of directory
 */
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

/**
 * Recursively removes directory
 * @todo lodashify
 * @param dirPath {String} - path of directory
 */
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

/**
 * App Paths for assets and documentation
 * @type {{assets: *, docs: *}}
 */
var paths = {
  assets : path.join(__dirname, '../dist/assets/'),
  docs : path.join(__dirname, '../documentation/')
};

/**
 * Creates asset and documentation app directories
 */
var createAssetAndDocDirs = function() {
  manageDir(paths.assets);
  manageDir(paths.docs);
};

/**
 * Writes files created in API Designer to
 * the asset directory and returns api information
 * needed to create documentation and mock data
 * @returns {*} - api information
 */
exports.writeFilesToDir = function(){

  return new Promise(function (fulfill, reject) {

    var fileList = {};
    var apiObj = [];

    createAssetAndDocDirs();

    async.waterfall([

      /**
      * Gets all file data in files collection
      * @param callback
      */
      function (callback) {
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

      /**
      * Writes files to asset directory
      * @param item {Object} - object in files collection
      * @param callback
      */
      function (item, callback) {
        if (_.isNull(item)) {
          callback(null, fileList);
        } else {
          fileList[item._id] = item;
          delete fileList[item._id]._id;
          var itemPath = path.join(paths.assets, item.name);

          fs.writeFile(itemPath, decodeURIComponent(item.content));
        }
      },

      /**
      * Gets api information from file collection
      * @param fileList {Object} - files collection
      * @param callback
      */
      function (fileList, callback) {
        _.forEach(fileList, function (val) {
          // just find .raml files because those define the apis
          if (_.endsWith(val.name, ".raml")) {
            var apiName = val.name.replace(".raml", "");
            var apiHtmlFile = apiName + ".html";
            var ramlPath = path.join(paths.assets, val.name);
            var apiDocPath = path.join(paths.docs, apiHtmlFile);
            apiObj.push({
              ramlPath: ramlPath,
              apiDocPath: apiDocPath,
              apiName: apiName
            })
          }

        });

        callback(null, apiObj);
      },
    ], function (err, apiObj) {
      fulfill(apiObj);
      if(err) reject(err);
    });
  });
};

/**
 * Exposes to other modules
 * @type {{assets: *, docs: *}}
 */
exports.paths = paths;
