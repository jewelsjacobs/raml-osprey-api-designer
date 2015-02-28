var mongo = require('mongodb'),
  Server = mongo.Server,
  fs = require('fs'),
  path = require('path'),
  Db = mongo.Db,
  fakeIt = require('json-schema-processor'),
  BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true, safe:true});
db = new Db('ramldb', server);

db.open(function (err, db) {
  if (!err) {
    console.log("Connected to 'ramldb' database");
    db.collection('files', {strict: true}, function (err, collection) {
      if (err) {
        console.log("The 'files' collection doesn't exist. Use POST to add RAML files...");
        populateDB();
      }
    });
  }
});

exports.findById = function (req, res) {
  var id = req.params.id;
  if (id != 'undefined') {
    console.log('Retrieving file: ' + id);
    db.collection('files', function (err, collection) {
      collection.findOne({'_id': new BSON.ObjectID(id)}, function (err, item) {
        delete item._id;
        res.header("Access-Control-Allow-Origin", "*");
        res.send(item);
      });
    });
  }
};

exports.findContentByName = function (req, res) {
  var name = req.params.name;
  console.log('Retrieving file contents: ' + name);
  db.collection('files', function (err, collection) {
    collection.findOne({'name': name}, function (err, item) {
      delete item._id;
      console.log(decodeURIComponent(item.content));
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.header("Access-Control-Allow-Origin", "*");
        res.send(decodeURIComponent(item.content))
      }
    });
  });
};

var generateMockData = function (schema) {

  var mockedJson = fakeIt(schema);
}

exports.findAll = function (req, res) {
  var fileList = new Object();
  db.collection('files', function (err, collection) {
    collection.find({}, function (err, resultCursor) {
      resultCursor.each(function (err, item) {
        if (item != null) {
          console.log('Item : ' + item._id + ' : ' + JSON.stringify(item));
          fileList[item._id] = item;
          delete fileList[item._id]._id;
          console.log(item.name);
          fs.writeFile(path.join(__dirname, '../api-designer/assets/' + item.name), decodeURIComponent(item.content), function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log("The file was saved!");
            }
          });
          console.log(JSON.stringify(fileList));
        }
        else {
          res.header("Access-Control-Allow-Origin", "*");
          res.send(JSON.stringify(fileList));
        }
      });
    });
  });
};

exports.addFile = function (req, res) {
  var file = req.body;
  console.log('Adding file : ' + JSON.stringify(file));

  db.collection('files', function (err, collection) {
    collection.insert(file, {safe: true}, function (err, result) {
      if (err) {
        res.send({'error': 'An error has occurred'});
      } else {
        console.log(file, result);
        fs.writeFile(path.join(__dirname, '../api-designer/assets/' + file.name), decodeURIComponent(file.content), function(err) {
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
};

exports.updateFile = function (req, res) {
  var id = req.params.id;
  var file = req.body;
  console.log('Updating file: ' + id);
  console.log(JSON.stringify(file));

  db.collection('files', function (err, collection) {
    collection.update({'_id': new BSON.ObjectID(id)}, file, {safe: true}, function (err, result) {
      console.log(file)
      if (err) {
        console.log('Error updating file : ' + err);
        res.send({'error': 'An error has occurred'});
      } else {
        console.log('' + result + ' document(s) updated');
        fs.writeFile(path.join(__dirname, '../api-designer/assets/' + file.name), decodeURIComponent(file.content), function(err) {
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
};

exports.deleteFile = function (req, res) {
  var id = req.params.id;
  console.log('Deleting file: ' + id);
  db.collection('files', function (err, collection) {
    collection.findOne({'_id': new BSON.ObjectID(id)}, function (err, item) {
      if (err) {
        console.log(err);
      } else {
        fs.unlink(path.join(__dirname, '../api-designer/assets/' + item.name), function(err){
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
};

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function () {

  var files = [
    {
      path: "/demo.raml",
      name: "demo.raml",
      content: "#%25RAML%200.8%0Atitle:"
    }
  ];

  db.collection('files', function (err, collection) {
    collection.insert(files, {safe: true}, function (err, result) {
        if (err) {
          console.log('Error inserting file : ' + files.name);
        } else {
          console.log(files.name + ' inserted');
        }
      });
  });

};
