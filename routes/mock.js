var fs = require('fs'),
  path = require('path'),
  fakeIt = require('json-schema-processor');

exports.generateMock = function(){
  var schemaPath = path.join(__dirname, '../api-designer/assets/');
  var loadbalancer = require(schemaPath + 'loadbalancer-schema.json');
  console.log(loadbalancer.properties);
//  var mockedJson = fakeIt(loadbalancer)
}
