require("babel/register");

var fs = require('fs'),
  async = require('async'),
  osprey = require('osprey'),
  parser = require('raml-parser'),
  utils = require('./utils');

/**
 * Create and serve mock data
 * @param req
 * @param res
 */
exports.get = function (req, res) {
  async.waterfall([

    /**
     * Writes the raml included files to the asset directory
     * and returns api specific informaton from the files
     * collection like the names of the apis (apiName), the
     * apiDocPath and the ramlPath
     * @param callback
     */
      function(callback){
        utils.writeFilesToDir().then(function(response) {
          callback(null, response)
        });
      },

      /**
      * Create Mock Data With Osprey
      * @TODO Osprey isn't ready for prime time
      * @link {https://github.com/mulesoft/osprey}
      * @param apiObj {Object} object returned from utils.writeFilesToDir()
      */
      function(apiObj){

        _.forEach(apiObj, function(api) {

          if (api.apiName === req.params.name) {
            parser.loadFile(api.ramlPath).then(function (data) {
              app.use(osprey.createServer(data));
            });
          }

        })
      }]
  );

};
