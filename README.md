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

Websocket messages
-------------------

#### Coordinates

Should take for reference the top left corner of **the bounding box** of the tubes.


#### Timestamps

Timestamps are given in number of milliseconds since EPOCH.


#### Messages

```
<channel> <timestamp> <x> <y> <num> <frequency>
```
Logs a message from the OF application to the website. All parameters are separated by a space. 
- **channel** : *int*, the user or channel that triggered that event.
- **timestamp** : *int*, timestamp when the message was created.
- **x** : *float*, x coordinate of the position of the user. 
- **y** : *float*, y coordinate of the position of the user. 
- **num** : *int*, the ID of the tube currently activated.
- **frequency** : *float*, the frequency of the associated synth. The frequency is 0 if no tube is activated.
