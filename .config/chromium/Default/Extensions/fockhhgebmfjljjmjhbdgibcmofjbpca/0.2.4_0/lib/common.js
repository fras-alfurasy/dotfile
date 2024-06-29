var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    core.tor.update(false);
  },
  "notifications": {
    "create": function (message) {
      app.notifications.create({
        "message": message,
        "title": "Onion Browser Button"
      });
    }
  },
  "popup": {
    "send": function () {
      app.button.icon(null, config.tor.id);
      app.popup.post("tor-data", {
        "id": config.tor.id,
        "log": config.tor.log,
        "whitelist": config.addon.whitelist
      });
    }
  },
  "action": {
    "storage": function (changes, namespace) {
      /*  */
    },
    "notifications": function (id) {
      if (id === app.notifications.id) {
        app.tab.open(app.homepage() + "#faq");
      }
    }
  },
  "apply": {
    "proxy": function (callback) {
      if (config.tor.id === "OFF") {
        app.proxy.apply({
          "scope": "regular", 
          "value": {
            "mode": "system"
          }
        }, callback);
      } else {
        app.proxy.apply({
          "scope": "regular",
          "value":  {
            "mode": "fixed_servers",
            "rules": {
              "bypassList": core.tor.bypassList,
              "singleProxy": {
                "port": 9050,
                "scheme": "socks5", 
                "host": "127.0.0.1",
              }
            }
          }
        }, callback);
      }
    }
  },
  "tor": {
    "bypassList": [],
    "stop": function (flag) {
      config.tor.id = "OFF";
      config.tor.log = "TOR proxy is disabled";
      /*  */
      core.apply.proxy(core.popup.send);
      if (flag) core.notifications.create("TOR proxy is disabled.");
    },
    "start": function () {
      config.tor.id = "ON";
      config.tor.log = "Connected to 127.0.0.1:9050";
      /*  */
      core.notifications.create("TOR is running. Connected to 127.0.0.1:9050");
      core.tor.bypassList = config.addon.whitelist ? config.addon.whitelist.split(',') : [];
      core.apply.proxy(core.popup.send);
    },
    "once": function (callback) {
      config.tor.id = "CHECK";
      config.tor.log = "Checking tor proxy connection...";
      /*  */
      core.tor.bypassList = config.addon.whitelist ? config.addon.whitelist.split(',') : [];
      core.apply.proxy(function () {setTimeout(function () {callback(true)}, 300)});
      core.popup.send();
    },
    "update": function (flag) {
      if (config.addon.state === "ON") {
        core.tor.once(function () {
          const url = config.url.tor + "?t=" + new Date().getTime() + "&r=" + Math.round(Math.random() * 10000);
          /*  */
          fetch(url, {"method": "HEAD"}).then(function (response) {
            if (response && response.ok) {
              config.addon.state === "ON" ? core.tor.start() : core.tor.stop(flag);
            } else {
              core.tor.stop(false);
              core.notifications.create("TOR is NOT running. Please connect your computer to TOR network and try again.");
            }
          }).catch(function () {
            core.tor.stop(false);
            core.notifications.create("TOR is NOT running. Please connect your computer to TOR network and try again.");
          });
        });
      } else {
        core.tor.stop(flag);
      }
    }
  }
};

app.popup.receive("popup-data", function (e) {
  if (e.name === "reload") app.tab.reload();
  if (e.name === "ip") app.tab.open(config.url.ip);
  if (e.name === "check") app.tab.open(config.url.tor);
  if (e.name === "support") app.tab.open(app.homepage());
  if (e.name === "install") app.tab.open(config.url.github);
  /*  */
  if (e.name === "bypassList") {
    config.addon.whitelist = e.whitelist;
    core.tor.update(true);
  }
  /*  */
  if (e.name === "ON" || e.name === "OFF") {
    config.addon.state = e.name;
    core.tor.update(true);
  }
});

app.on.startup(core.start);
app.on.installed(core.install);
app.on.storage(core.action.storage);
app.popup.receive("load", core.popup.send);
app.notifications.on.clicked(core.action.notifications);
