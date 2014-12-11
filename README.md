Load fixtures
--------------

node test/fixtures.js

backend
--------

Initializing submodules

```
git submodule init
git submodule update
```

Installing node modules

```
npm install
npm install rhizome/
```

frontend
----------

```
npm install -g gulp
npm install
gulp build
```

frontend tests
----------------

This is a bit complicated because for some tests it is easier to test within node (to have control over the server, start, stop it for example), for some other tests it is better to have the browser and be able to have a DOM, jquery, etc ... Therefore tests are divided in 2 folder : `node` and `browser`.

Tests in `node` are ran with `mocha --recursive frontend/test/node`

Browser test use [mocha-phantomjs](http://metaskills.net/mocha-phantomjs/) , to install it, run `npm install -g mocha-phantomjs phantomjs`, then to run the tests `browserify frontend/test/browser/index.js > tmp/frontend-tests.js ; mocha-phantomjs frontend/test/browser/index.html` to build the test file and run it with phantomJS.


Websocket messages
-------------------

#### Coordinates

Should take for reference the top left corner of **the bounding box** of the tubes.


#### Timestamps

Timestamps are given in number of milliseconds since EPOCH.


#### Messages

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
