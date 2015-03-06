require("babel/register");

var fs = require('fs'),
  path = require('path'),
  mongoDbConnection = require('./db.js');

exports.dumpFiles = function () {
  return new Promise(function (fulfill, reject){
    var fileList = {};
    var assetPath = path.join(__dirname, '../dist/assets/');
    var docPath = path.join(__dirname, '../documentation');

    manageDir(assetPath);
    manageDir(docPath);

    mongoDbConnection(function (db) {
      db.collection('files', function (err, collection) {
        collection.find({}, function (err, resultCursor) {
          resultCursor.each(function (err, item) {
            if (item != null) {
              fileList[item._id] = item;
              delete fileList[item._id]._id;
              var itemAssetPath = path.join(__dirname, '../dist/assets/' + item.name);
              fs.writeFile(itemAssetPath, decodeURIComponent(item.content), function(err) {
                if (err)
                  reject(err);
              });
            } else {
              fulfill(fileList);
            }
          });
        });
      });
    });
  })
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
