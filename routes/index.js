/**
 * @author julia.jacobs@rackspace.com (Julia Jacobs)
 * Date: 1/16/14
 * Time: 3:38 PM
 * @file index.js
 * @desc route to get homepage
 */

var fs = require("fs");

/**
 * @public
 * @function index
 * @desc read index.html
 * @param req
 * @param res
 */
exports.index = function(req, res) {
  fs.readFile('./index.html', 'utf8', function(error, data) {
    if (error) {
      res.status(500).send(error);
      return;
    }
    res.send(data);
  });
};
