require("babel/register");

var fs = require('fs'),
  async = require('async'),
  raml2html = require('raml2html'),
  parser = require('raml-parser'),
  _ = require('lodash'),
  utils = require('./utils');

/**
 * Create and serve documentation
 * @param req
 * @param res
 */
exports.get = function (req, res) {
  var raml2htmlConfig = raml2html.getDefaultConfig();
  async.waterfall([

    /**
     * Writes the raml included files to the asset directory
     * and returns api specific information from the files
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
     * Generates html doc from raml file
     * @param apiObj {Object} object returned from utils.writeFilesToDir()
     */
    function(apiObj){
      _.forEach(apiObj, function(api) {

        raml2html.render(api.ramlPath, raml2htmlConfig, function (result) {
          fs.writeFileSync(api.apiDocPath, result);

          if (api.apiName === req.params.name) {
            fs.readFile(api.apiDocPath, 'utf8', function (error, data) {
              if (error) {
                res.status(500).send(error);
                return;
              }
              res.send(data);
            });
          }

        });

      })
    }]
  );

};
