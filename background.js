var conf = {};

function handleMsg(msg, sender, response) {
  let id = sender.tab.id;
  let o = screen.orientation.type.slice(0, 1);
  switch (msg.m) {
    case 'c':
      if (!conf[id][o]) conf[id][o] = {};
      if (browser.tabs.getZoom)
        return browser.tabs.getZoom(id).then((zoom) => {
          conf[id][o].z = zoom;
          return conf[id][o];
        });
      else {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(conf[id][o]);
          }, 1);
        });
      }
      break;
    case 'l':
      conf[id][o].l = msg.l;
      break;
    case 'p':
      conf[id][o].p = msg.p;
      break;
    case 'r':
      conf[id][o].r = msg.r;
      let O = o == 'p' ? 'l' : 'p';
      if (!conf[id][O]) conf[id][O] = {};
      if (!conf[id][O].l || !conf[id][O].r) conf[id][O].r = [...conf[id][o].r];
      break;
  }
}

browser.runtime.onMessage.addListener(handleMsg);

browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  if (tab.status == 'complete') {
    if (!conf[id]) conf[id] = {};
    let o = screen.orientation.type.slice(0, 1);
    if (!conf[id][o]) conf[id][o] = {};

    browser.tabs.insertCSS(id, {
      file: "content.css"
    });
    browser.tabs.executeScript(id, {
      file: "content.js"
    });
  }
});

browser.tabs.onRemove.addListener((id, removeInfo) => {
  if (!removeInfo.isWindowClosing) delete conf[id];
});