var fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  fakeIt = require('json-schema-processor');

exports.generateMock = function(){
  var schemaPath = path.join(__dirname, '../api-designer/assets/');
  var sample = require(schemaPath + 'sample-schema.json');

  _.forEach(sample.properties.list.items[0].properties, function(value, key, collection){
    console.log(key);
    console.log(value);
//    loadbalancer.properties[key].fixure = {
//      "type": value.description
//    }
  });

//  console.log(loadbalancer);
//  var mockedJson = fakeIt(loadbalancer);
//  console.log(mockedJson);
}
