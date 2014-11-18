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

OSC messages
--------------

#### Coordinates

Should take for reference the top left corner of **the bounding box** of the tubes.


#### Timestamps

Timestamps are given in number of milliseconds since EPOCH.


#### Messages

```
/messages/<channel> <timestamp> <x> <y> <tubeId> <frequency>
```
Logs a message from the OF application to the website. 
- **timestamp** : *number*, timestamp when the message was created.
- **x** : *number*, x coordinate of the position of the user. 
- **y** : *number*, y coordinate of the position of the user. 
- **tubeId** : *number*, the ID of the tube currently activated. If no tube?
- **frequency** : *number*, the frequency of the associated synth. The frequency is 0 if no tube is activated.
