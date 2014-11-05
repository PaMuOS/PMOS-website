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

```
/tubeEvent <timestamp> <userId> <tubeId> <state> <frequency>
/moveEvent <timestamp> <userId> <x> <y>
```