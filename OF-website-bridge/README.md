Install
========

`npm install`

Start with node-forever
=========================

To ensure this is always running even if it crashes, run it with `node-forever`.

Install with `npm install -g forever`.

Then just run `forever main.js` if you want to run the thing in the foreground, or `forever start main.js` to daemonize it.