PMOS-website
==============

Installation
---------------

Installing node modules `npm install`.

To build the frontend you must also install `gulp` with the following command `npm install -g gulp`.

To run the tests, some tools must be installed first. Install those with the following command `npm install -g mocha mocha-phantomjs phantomjs` 


Deployment
------------

All commits to `master` branch should be deployed automatically as there is a commit hook setup in the github repository.

Otherwise to deploy manually, run `jitsu deploy`.


Backend
=========

Starting the server
---------------------

To start the server locally, run `node backend/main.js`.


Running the tests
-------------------

`mocha --recursive backend/test`


Frontend
==========

Building
---------

To build the frontend, run `gulp build`. This will also minify the file, so if you want to develop and have a non-minified build, simply run `gulp`


Tests
--------

This is a bit complicated because for some tests it is easier to test within node (to have control over the server, start, stop it for example), for some other tests it is better to have the browser and be able to have a DOM, jquery, etc ... Therefore tests are divided in 2 folder : `node` and `browser`.

Tests in `node` are ran with `mocha --recursive frontend/test/node`

Browsers test use [mocha-phantomjs](http://metaskills.net/mocha-phantomjs/). To run the tests : `browserify frontend/test/browser/index.js > tmp/frontend-tests.js ; mocha-phantomjs frontend/test/browser/index.html` this builds the test file and runs it with phantomJS.


API
=====================

#### Coordinates

Should take for reference the top left corner of **the bounding box** of the tubes.


#### Timestamps

Timestamps are given in number of milliseconds since EPOCH.


#### Websocket server

```
{
  "channel": <channel>,
  "timestamp": <timestamp>,
  "x": <x>,
  "y": <y>,
  "num": <num>,
  "frequency": <frequency>
}
```
Logs a message from the OF application to the website. Message should be sent as JSON.
- **channel** : *int*, the user or channel that triggered that event.
- **timestamp** : *int*, timestamp when the message was created.
- **x** : *float*, x coordinate of the position of the user. 
- **y** : *float*, y coordinate of the position of the user. 
- **num** : *int*, the ID of the tube currently activated.
- **frequency** : *float*, the frequency of the associated synth. The frequency is 0 if no tube is activated.
