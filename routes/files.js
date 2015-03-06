var mongo = require('mongodb'),
  fs = require('fs'),
  path = require('path'),
  BSON = mongo.BSONPure,
  mongoDbConnection = require('./db.js');

exports.findById = function (req, res) {
  var id = req.params.id;
  if (id != 'undefined') {
    console.log('Retrieving file: ' + id);
    mongoDbConnection(function (db) {
      db.collection('files', function (err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(id)}, function (err, item) {
          delete item._id;
          res.header("Access-Control-Allow-Origin", "*");
          res.send(item);
        });
      });
    });
  }
};

exports.findContentByName = function (req, res) {
  var name = req.params.name;
  console.log('Retrieving file contents: ' + name);
  mongoDbConnection(function (db) {
    db.collection('files', function (err, collection) {
      collection.findOne({'name': name}, function (err, item) {
        delete item._id;
        console.log(decodeURIComponent(item.content));
        if (err) {
          sendError(err, 'Error adding file');
        } else {
          res.header("Access-Control-Allow-Origin", "*");
          res.send(decodeURIComponent(item.content))
        }
      });
    });
  });
};

exports.findAll = function (req, res) {
  var fileList = new Object();
  mongoDbConnection(function (db) {
    db.collection('files', function (err, collection) {
      collection.find({}, function (err, resultCursor) {
        resultCursor.each(function (err, item) {
          if (item != null) {
            console.log('Item : ' + item._id + ' : ' + JSON.stringify(item));
            fileList[item._id] = item;
            delete fileList[item._id]._id;
            console.log(item.name);
            console.log(JSON.stringify(fileList));
          }
          else {
            res.header("Access-Control-Allow-Origin", "*");
            res.send(JSON.stringify(fileList));
          }
        });
      });
    });
  });
};

exports.addFile = function (req, res) {
  var file = req.body;
  console.log('Adding file : ' + JSON.stringify(file));
  mongoDbConnection(function (db) {
    db.collection('files', function (err, collection) {
      collection.insert(file, {safe: true}, function (err, result) {
        if (err) {
          sendError(err, 'Error adding file');
        } else {
          console.log(file, result);
          fs.writeFile(path.join(__dirname, '../dist/assets/' + file.name), decodeURIComponent(file.content), function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log(file.name + " was saved");
            }
          });
          console.log('Success: ' + JSON.stringify(result[0]));
          res.header("Access-Control-Allow-Origin", "*");
          res.send(result[0]);
        }
      });
    });
  });
};

exports.updateFile = function (req, res) {
  var id = req.params.id;
  var file = req.body;
  console.log('Updating file: ' + id);
  console.log(JSON.stringify(file));
  mongoDbConnection(function (db) {
    db.collection('files', function (err, collection) {
      collection.update({'_id': new BSON.ObjectID(id)}, file, {safe: true}, function (err, result) {
        console.log(file)
        if (err) {
          sendError(err, 'Error updating file');
        } else {
          console.log('' + result + ' document(s) updated');
          fs.writeFile(path.join(__dirname, '../dist/assets/' + file.name), decodeURIComponent(file.content), function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log(file.name + " was saved");
            }
          });
          res.header("Access-Control-Allow-Origin", "*");
          res.send('{"status":"success","id":"' + id + '","message":"The file was successfully updated."}');
        }
      });
    });
  });
};

exports.deleteFile = function (req, res) {
  var id = req.params.id;
  console.log('Deleting file: ' + id);
  mongoDbConnection(function (db) {
    db.collection('files', function (err, collection) {
      collection.findOne({'_id': new BSON.ObjectID(id)}, function (err, item) {
        if (err) {
          console.log(err);
        } else {
          fs.unlink(path.join(__dirname, '../dist/assets/' + item.name), function(err){
            if (err) {
              console.log('Error deleting file : ' + item.name + ' ' + err);
            } else {
              console.log('Successfully deleted ' + item.name);
            }
          });
        }
      });
      collection.remove({'_id': new BSON.ObjectID(id)}, {safe: true}, function (err, result) {
        if (err) {
          res.send({'error': 'An error has occurred - ' + err});
        } else {
          console.log(req.body);
          res.send(req.body);
        }
      });
    });
  });
};

var sendError = function(err, msg) {
  var msg = msg || "An error has occured: ";
  console.log(msg + err);
  res.send({'error': msg + err});
};



