/**
 * @author julia.jacobs@rackspace.com (Julia Jacobs)
 * Date: 1/16/14
 * Time: 3:38 PM
 * @file index.js
 * @desc route to get homepage
 */

var fs = require("fs");
var mongoDbConnection = require('./db.js');
var assets = require('./assets');
var path = require("path");

/**
 * @public
 * @function index
 * @desc read index.html
 * @param req
 * @param res
 */
exports.index = function(req, res) {
  mongoDbConnection(function(db) {
    db.collection('files', function(error, collection) {
      collection.find().toArray(function(error, results) {
        if (error) {
          console.log("The 'files' collection doesn't exist. Use POST to add RAML files...");
          populateDB();
        }
      });
    });
  });
  assets.dumpFiles().then(function(fileList){
    res.sendfile(path.join(__dirname, '../dist/index.html'));
  });
};

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function () {

  var files = [
    {
      path: "/api.raml",
      name: "api.raml",
      content: "#%25RAML%200.8%0Atitle:"
    }
  ];
  mongoDbConnection(function(db) {
    db.collection('files', function (err, collection) {
      collection.insert(files, {safe: true}, function (err, result) {
        if (err) {
          console.log('Error inserting file : ' + files.name);
        } else {
          console.log(files.name + ' inserted');
        }
      });
    });
  });

};
