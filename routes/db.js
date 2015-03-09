var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
//the MongoDB connection
var connectionInstance;

/**
 * Use MongoDB connection as a singleton
 * @param callback
 */
module.exports = function(callback) {

  //if already we have a connection, don't connect to database again
  if (connectionInstance) {
    callback(connectionInstance);
    return;
  }

  var db = new Db(
    'ramldb',
    new Server(
      "localhost",
      Connection.DEFAULT_PORT,
      { auto_reconnect: true, safe:false }
    )
  );

  db.open(function(error, databaseConnection) {
    if (error) throw new Error(error);
    connectionInstance = databaseConnection;
    callback(databaseConnection);
  });

};


