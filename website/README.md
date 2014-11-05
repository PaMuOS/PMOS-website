Deploy
=======

backend
--------

git submodule init
git submodule update
npm install
npm install rhizome/


frontend
----------

npm install -g gulp
npm install
gulp build

OSC messages
--------------

/tube <timestamp> <userId> <tubeState> <tubeId> <frequency>
/move <x> <y>