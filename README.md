# RAML API DESIGNER

## What is this being used for?
Front end app devs who wish to communicate to back end devs how they would like an application centric API schema to look like.

Back end devs who want to sketch out an API and test it without full development

Easy API Designer based on the [RAML](http://raml.org/) spec with nice RAML documentation.
The documentation can be found by the name of the RAML file created, ie. if the RAML file is `api.raml`, the documentation will be found at http://localhost:8081/documentation/api.

Documentation is generated with [raml2html](https://github.com/kevinrenskers/raml2html).

### API Designer
![Screenshot](api-designer.png?raw=true "RAML API Designer Screen")
### API Documentation
![Doc](doc.png?raw=true "RAML API Documentation Screen")
### API Documentation Detail
![Doc-Detail](doc-detail.png?raw=true "RAML API Documentation Detail Screen")

## Demo
- Designer: [http://104.130.18.74:8081/](http://104.130.18.74:8081/)
- Documentation: [http://104.130.18.74:8081/documentation/jukebox-api](http://104.130.18.74:8081/documentation/jukebox-api)

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

## Build and Run

Install global tools
```
npm install -g grunt-cli
npm install -g bower
npm install -g karma # Optional for running the test suite
```

Install node modules
```
npm install 
```

Install bower modules
```
bower install
```

Install webdriver required to run `localScenario` task
```
node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update
```

Run the application locally
```
grunt server
```

Run the test suite
```
grunt test
```

Build the application
```
grunt
```

# Server info

It runs as a [forever-service](https://github.com/zapty/forever-service) with [nodemon](https://github.com/remy/nodemon) called `raml`.

Here's the command to install the service:

```bash
npm install forever-service -g
npm install nodemon -g
cd /pathtoapp
forever-service install raml --script server.js -f " -c nodemon" -o " --delay 10 --watch dist/assets -e json,raml --exitcrash" -e "PATH=/usr/local/bin:$PATH"
```

Commands to interact with service `raml`:

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
http://localhost:8081/files

$ curl -i -X GET http://localhost:8081/files
```

## Hacking the app

To hack the front end, look at the instructions here:
[RAML API Designer](https://github.com/mulesoft/api-designer).

The front end code is all in there except for the `server.js` and `/routes` file(s) / folder.

The app uses [osprey](https://github.com/mulesoft/osprey) and [osprey-mock-service](https://github.com/mulesoft-labs/osprey-mock-service) to serve the example json as mock data.

## Coming soon
 - Support for multiple projects
 - Export files
