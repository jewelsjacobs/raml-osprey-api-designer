# RAML API DESIGNER

## What is this being used for?
Front end app devs who wish to communicate to back end devs how they would like an application centric API schema to look like.

Back end devs who want to sketch out an API and test it without full development

Easy API Designer based on the [RAML](http://raml.org/) spec with nice RAML documentation.

### API Designer
![Screenshot](api-designer.png?raw=true "RAML API Designer Screen")
### API Console
![Screenshot](console.png?raw=true "API Console")
### API Console Detail
![Screenshot](console-detail.png?raw=true "API Console Detail")

## Using App
You need to be on the OR Dev VPN to use the app since its on the QA server.
You can use the app here:

[API Designer: http://mon0.dev.objectrocket.com:8081](http://mon0.dev.objectrocket.com:8081)

[API Console: http://mon0.dev.objectrocket.com:8081/api/console](http://mon0.dev.objectrocket.com:8081/api/console)

[JSON: http://mon0.dev.objectrocket.com:8081/files](http://mon0.dev.objectrocket.com:8081/files)

## Overview

This application provides a simple storage API plus a persistence plugin which enables you to run the [RAML API Designer](https://github.com/mulesoft/api-designer) locally (rather than use the APIHub cloud service) and still be able to manage and collaborate on your design.
Also using [osprey](https://github.com/mulesoft/osprey) to serve sample data defined in RAML definition.

## Requirements
The service is built with node.js, using express and mongodb.

### Installing Node.js
Go to [nodejs.org](http://nodejs.org), and click the Install button.

### Installing Node.js via package manager (Debian, Ubuntu, etc.)
View instructions [here](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).

### Installing MongoDB
To install MongoDB on your specific platform, refer to the [MongoDB QuickStart](http://docs.mongodb.org/manual/installation/).

To start mongodb as background process:

`cd /usr/local/mongodb`  (mongodb installation directory)

`mongod --fork --logpath /var/log/mongodb.log`

### Installing Express and MongoDB Node.js Driver
From the top-level directory (e.g. raml-store):

`npm install `

# Server info

It runs as a [forever-service](https://github.com/zapty/forever-service) called `raml`.

Commands to interact with service mock-data:

```
Start   - `sudo service raml start`
Stop    - `sudo service raml stop`
Status  - `sudo service raml status`
Restart - `sudo service raml restart`
```

## Testing the Service

```
$ curl -i -X POST -H 'Content-Type: application/json' -d 
'{"name":"myfirstapi.raml","path":"/","contents":"#%25RAML%200.8%0Atitle:%20%20%20DONE!!!"}' 
http://localhost:3000/files

$ curl -i -X GET http://localhost:3000/files
```

## Coming soon
 - Generating faker mock data from RAML with [json-schema-processor](https://www.npmjs.org/package/json-schema-processor)
 - Decent docs
 - Decent CRUD services for mock data
 - Support for multiple projects
 - Export files

 Other fancy stuff
