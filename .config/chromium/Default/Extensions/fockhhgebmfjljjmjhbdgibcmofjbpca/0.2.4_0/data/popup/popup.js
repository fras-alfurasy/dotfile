var background = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      background.message[id] = callback;
    }
  },
  "send": function (id, data) {
    if (id) {
      chrome.runtime.sendMessage({
        "method": id,
        "data": data,
        "path": "popup-to-background"
      }, function () {
        return chrome.runtime.lastError;
      });
    }
  },
  "connect": function (port) {
    chrome.runtime.onMessage.addListener(background.listener); 
    /*  */
    if (port) {
      background.port = port;
      background.port.onMessage.addListener(background.listener);
      background.port.onDisconnect.addListener(function () {
        background.port = null;
      });
    }
  },
  "post": function (id, data) {
    if (id) {
      if (background.port) {
        background.port.postMessage({
          "method": id,
          "data": data,
          "path": "popup-to-background",
          "port": background.port.name
        });
      }
    }
  },
  "listener": function (e) {
    if (e) {
      for (let id in background.message) {
        if (background.message[id]) {
          if ((typeof background.message[id]) === "function") {
            if (e.path === "background-to-popup") {
              if (e.method === id) {
                background.message[id](e.data);
              }
            }
          }
        }
      }
    }
  }
};

var config = {
  "render": function (e) {
    const ON = document.getElementById("ON");
    const OFF = document.getElementById("OFF");
    const status = document.getElementById("status");
    const whitelist = document.getElementById("whitelist");
    /*  */
    status.textContent = e.log;
    whitelist.value = e.whitelist;
    /*  */
    if (e.id === "CHECK") e.id = "ON";
    if (e.id === "ON" || e.id === "OFF") {
      ON.removeAttribute("type");
      OFF.removeAttribute("type");
      document.getElementById(e.id).setAttribute("type", "active");
    }
  },
  "load": function () {
    const explore = document.getElementById("explore");
    const whitelist = document.getElementById("whitelist");
    /*  */
    whitelist.addEventListener("change", function (e) {
      const value = e.target ? e.target.value : '';
      background.send("popup-data", {
        "whitelist": value,
        "name": "bypassList"
      });
    });
    /*  */
    document.addEventListener("click", function (e) {
      const id = e.target ? e.target.getAttribute("id") : null;
      if (id && id !== "whitelist") {
        background.send("popup-data", {"name": id});
      }
    });
    /*  */
    background.send("load");
    window.removeEventListener("load", config.load, false);
    if (navigator.userAgent.indexOf("Edg") !== -1) explore.style.display = "none";
  }
};

background.receive("tor-data", config.render);
window.addEventListener("load", config.load, false);
background.connect(chrome.runtime.connect({"name": "popup"}));
