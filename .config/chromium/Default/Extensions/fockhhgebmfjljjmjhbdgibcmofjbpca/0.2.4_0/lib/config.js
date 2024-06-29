var config = {};

config.url = {
  "tor": "https://check.torproject.org/",
  "ip": "https://webbrowsertools.com/ip-address/",
  "github": "https://github.com/jeremy-jr-benthum/onion-browser-button/releases",
};

config.welcome = {
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.tor = {
  set id (val) {app.storage.write("torid", val)},
  set log (val) {app.storage.write("torlog", val)},
  get id () {return app.storage.read("torid") !== undefined ? app.storage.read("torid") : "OFF"},
  get log () {return app.storage.read("torlog") !== undefined ? app.storage.read("torlog") : "Onion Browser Button"}
};

config.addon = {
  set state (val) {app.storage.write("state", val)},
  set whitelist (val) {app.storage.write("whitelist", val)},
  get whitelist () {return app.storage.read("whitelist") || ''},
  get state () {return app.storage.read("state") !== undefined ? app.storage.read("state") : "OFF"}
};