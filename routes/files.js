var mongo = require('mongodb'),
  fs = require('fs'),
  path = require('path'),
  BSON = mongo.BSONPure,
  utils = require('./utils'),
  _ = require('lodash'),
  mongoDbConnection = require('./db.js');

/**
 * Find file object in collection by file id
 * @param req
 * @param res
 */
exports.findById = function (req, res) {
  mongoDbConnection(function (db) {
    if (req.params.id != 'undefined') {
      db.collection('files', function (err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(req.params.id)}, function (err, item) {
          delete item._id;
          res.header("Access-Control-Allow-Origin", "*");
          res.send(item);
        });
      });
    }
  });
};

/**
 * Find file content from file object in collection
 * by file name
 * @param req
 * @param res
 */
exports.findContentByName = function (req, res) {
  mongoDbConnection(function (db) {
    db.collection('files', function (err, collection) {
      collection.findOne({'name': req.params.name}, function (err, item) {
        delete item._id;
        if (err) res.send({'error': err});
        res.header("Access-Control-Allow-Origin", "*");
        res.send(decodeURIComponent(item.content))
      });
    });
  });
};

/**
 * Find all of the files
 * @param req
 * @param res
 */
exports.findAll = function (req, res) {
  var fileList = {};
  mongoDbConnection(function (db) {
    db.collection('files', function (err, collection) {
      collection.find({}, function (err, resultCursor) {
        resultCursor.each(function (err, item) {
          if (_.isNull(item)) {
            res.header("Access-Control-Allow-Origin", "*");
            res.send(JSON.stringify(fileList));
          } else {
            fileList[item._id] = item;
            delete fileList[item._id]._id;
          }
        });
      });
    });
  });
};

/**
 * Add file to collection and write to asset directory
 * @param req
 * @param res
 */
exports.addFile = function (req, res) {
  mongoDbConnection(function (db) {
    db.collection('files', function (err, collection) {
      collection.insert(req.body, {safe: true}, function (err, result) {
        fs.writeFileSync(utils.paths.assets + req.body.name, decodeURIComponent(req.body.content));
        if (err) res.send({'error': err});
        res.header("Access-Control-Allow-Origin", "*");
        res.send(result[0]);
      });
    });
  });
};

/**
 * Update file in collection and asset directory
 * @param req
 * @param res
 */
exports.updateFile = function (req, res) {
  mongoDbConnection(function (db) {
    db.collection('files', function (err, collection) {
      collection.update({'_id': new BSON.ObjectID(req.params.id)}, req.body, {safe: true}, function (err, result) {
        fs.writeFileSync(utils.paths.assets + req.body.name, decodeURIComponent(req.body.content));
        res.header("Access-Control-Allow-Origin", "*");
        res.send(
          '{"status":"success","id":"' +
          req.params.id +
          '","message":"The file was successfully updated."}'
        );
      });
    });
  });
};

/**
 * Delete file in collection and asset directory
 * @param req
 * @param res
 */
exports.deleteFile = function (req, res) {
  mongoDbConnection(function (db) {
    db.collection('files', function (err, collection) {
      collection.findOne({'_id': new BSON.ObjectID(req.params.id)}, function (err, item) {
        fs.unlinkSync(utils.paths.assets + item.name);
      });
      collection.remove({'_id': new BSON.ObjectID(req.params.id)}, {safe: true}, function (err, result) {
          (err) ? res.send({'error': err}) : res.send(req.body);
        }
      );
    });
  });
};
