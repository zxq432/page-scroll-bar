var booxRuler = null;
var booxPage = null;
var booxPageUp = null;
var booxPageThumb = null;
var booxPageDn = null;
var booxVscrollbar = null;
var booxVscrollbarTrack = null;
var booxVscrollbarUp = null;
var booxVscrollbarThumb = null;
var booxVscrollbarDn = null;
var scrollMaxY = 0;
var dragData = {};
var dHeight = 0;
var vW = 0;
var vH = 0;
var tDnUp = 0;
var iDnUp = null;
var docPgs = 1;
var Pg = 1;
var scale = 1.0;
var orientation = '';
var pendingUpdate = false;
const WIDTH = 32;

function init() {
  let zM = 1;
  nodes = document.querySelectorAll('*');
  for (let i = 0; i < nodes.length; ++i) {
    let z = parseInt(window.getComputedStyle(nodes[i]).getPropertyValue('z-index')) || 0;
    if (zM < z) zM = z + 1;
  }

  booxRulerNode(zM);
  booxPageNode(zM);
  booxVscrollbarNode(zM);

  window.addEventListener('scroll', viewportHandler);
  window.addEventListener('resize', viewportHandler);
  viewportHandler();
};

function booxRulerNode(z) {
  if (booxRuler) return;
  let el = document.getElementById('booxRuler');
  if (el) el.parentNode.removeChild(el);

  booxRuler = document.createElement('div');
  booxRuler.setAttribute('id', 'booxRuler');

  booxRuler.style.zIndex = z;

  booxRuler.addEventListener('pointerdown', onPointerDown, true);

  booxRuler.classList.add('enabled');
  document.body.appendChild(booxRuler);
};

function booxPageNode(z) {
  if (booxPage) return;
  let el = document.getElementById('booxPage');
  if (el) el.parentNode.removeChild(el);

  booxPage = document.createElement('div');
  booxPage.setAttribute('id', 'booxPage');

  booxPageUp = document.createElement('img');
  booxPageUp.setAttribute('id', 'booxPageUp');
  booxPageUp.style.backgroundImage = "url('" + browser.extension.getURL("img/up.svg") + "')";
  booxPage.appendChild(booxPageUp);

  booxPageThumb = document.createElement('div');
  booxPageThumb.setAttribute('id', 'booxPageThumb');
  booxPageThumb.setAttribute('draggable', 'true');
  booxPage.appendChild(booxPageThumb);

  booxPageDn = document.createElement('img');
  booxPageDn.setAttribute('id', 'booxPageDn');
  booxPageDn.style.backgroundImage = "url('" + browser.extension.getURL("img/dn.svg") + "')";
  booxPage.appendChild(booxPageDn);

  booxPage.style.zIndex = z;

  booxPageThumb.addEventListener('pointerdown', onPointerDown, true);
  booxPageUp.addEventListener('pointerdown', onPointerDown, true);
  booxPageDn.addEventListener('pointerdown', onPointerDown, true);

  booxPage.classList.add('enabled');
  document.body.appendChild(booxPage);
};

function booxVscrollbarNode(z) {
  if (booxVscrollbar) return;
  let el = document.getElementById('booxVscrollbar');
  if (el) el.parentNode.removeChild(el);

  booxVscrollbar = document.createElement('div');
  booxVscrollbar.setAttribute('id', 'booxVscrollbar');

  booxVscrollbarUp = document.createElement('img');
  booxVscrollbarUp.setAttribute('id', 'booxVscrollbarUp');
  booxVscrollbarUp.style.backgroundImage = "url('" + browser.extension.getURL("img/up.svg") + "')";
  booxVscrollbar.appendChild(booxVscrollbarUp);

  booxVscrollbarTrack = document.createElement('div');
  booxVscrollbarTrack.setAttribute('id', 'booxVscrollbarTrack');
  booxVscrollbar.appendChild(booxVscrollbarTrack);

  booxVscrollbarThumb = document.createElement('div');
  booxVscrollbarThumb.setAttribute('id', 'booxVscrollbarThumb');
  booxVscrollbarThumb.setAttribute('draggable', 'false');
  booxVscrollbarTrack.appendChild(booxVscrollbarThumb);

  booxVscrollbarDn = document.createElement('img');
  booxVscrollbarDn.setAttribute('id', 'booxVscrollbarDn');
  booxVscrollbarDn.style.backgroundImage = "url('" + browser.extension.getURL("img/dn.svg") + "')";
  booxVscrollbar.appendChild(booxVscrollbarDn);

  booxVscrollbar.style.zIndex = z;

  booxVscrollbar.classList.add('enabled');
  document.body.appendChild(booxVscrollbar);
};


function viewportHandler() {
  if (pendingUpdate) return;
  pendingUpdate = true;
  requestAnimationFrame(() => {

    browser.runtime.sendMessage({
      m: 'c'
    }).then((msg) => {
      pendingUpdate = false;
      let o = screen.orientation.type.slice(0, 1);
      vH = Math.min(document.documentElement.clientHeight, window.innerHeight);
      vW = Math.min(document.documentElement.clientWidth, window.innerWidth);
      dHeight = document.documentElement.scrollHeight;
      scrollMaxY = dHeight - vH;
      let zoom = msg.z ? msg.z : (screen.width / window.innerWidth);
      let h1 = vH * zoom;

      if (o != orientation) {
        if (msg.l) {
          booxPage.style.left = msg.l[0];
          booxVscrollbar.style.left = msg.l[1];
          booxRuler.style.left = msg.l[2];
        } else {
          booxPage.style.left = vW - WIDTH * 5 / 4 + 'px';
          booxVscrollbar.style.left = vW - WIDTH / 4 + 'px';
          booxRuler.style.left = vW + 2 * WIDTH + 'px';
          browser.runtime.sendMessage({
            m: 'l',
            l: [booxPage.style.left, booxVscrollbar.style.left, booxRuler.style.left]
          });
        }
        if (msg.p) {
          booxPage.style.top = msg.p;
        } else {
          booxPage.style.top = (vH - WIDTH * 3) * zoom / 2 + 'px';
          browser.runtime.sendMessage({
            m: 'p',
            p: booxPage.style.top
          });
        }
        booxVscrollbar.style.height = h1 + 'px';
      }
      if (msg.r) {
        let y = msg.r[0];
        let w = 2 * WIDTH / zoom;
        y = y > vH - w ? vH - w : y;
        booxRuler.style.top = y + 'px';
        let h = vH - y - msg.r[1];
        h = h > vH - y ? vH - y : h < w ? w : h;
        booxRuler.style.height = h + 'px';
      } else
        booxRuler.style.height = vH + 'px';

      if (zoom != scale) {
        let t = booxVscrollbar;
        let x = t.offsetLeft;
        let x2 = x > booxPage.offsetLeft;
        x = x < -WIDTH * 3 / 4 ? -WIDTH * 3 / 4 : x > vW - WIDTH / 4 ? vW - WIDTH / 4 : x;
        t.style.left = x + 'px';
        booxPage.style.left = x + (x2 ? -1 : 1) * WIDTH + 'px';
        booxRuler.style.left = x + (x2 ? 5 / 4 : -5 / 4) * WIDTH + 'px';

        booxPage.style['-webkit-transform-origin'] = (x2 ? WIDTH : -1) + 'px -' + booxPage.offsetTop + 'px';
        booxVscrollbar.style['-webkit-transform-origin'] = (x2 ? 0 : WIDTH - 1) + 'px 0';
        booxRuler.style['-webkit-transform-origin'] = (x2 ? booxVscrollbar.offsetLeft : booxPage.offsetLeft - 1) - booxRuler.offsetLeft + 'px ';

        [booxPage, booxVscrollbar].forEach((t) => {
          t.style.transform = 'scale(' + 1 / zoom + ')';
          t.style.left = t.offsetLeft * 100.0 / vW + '%'
        });

        t = booxRuler;
        t.style.transform = 'scaleX(' + 1 / zoom + ')';
        t.style.left = t.offsetLeft * 100.0 / vW + '%'
        browser.runtime.sendMessage({
          m: 'l',
          l: [booxPage.style.left, booxVscrollbar.style.left, booxRuler.style.left]
        });
        scale = zoom;
      }

      if (h1 != booxVscrollbar.offsetHeight) {
        let dh = h1 - booxVscrollbar.offsetHeight;
        booxVscrollbar.style.height = h1 + 'px';
        let y = booxPage.offsetTop + dh;
        let yM = h1 - booxPage.offsetHeight;
        y = y < 0 ? 0 : y > yM ? yM : y;
        booxPage.style.top = y + 'px';
        browser.runtime.sendMessage({
          m: 'p',
          p: booxPage.style.top
        });
      }

      let h2 = h1 - 2 * WIDTH;
      let h = Math.floor(h2 * booxRuler.offsetHeight / dHeight);
      h = h < WIDTH ? WIDTH : h > h2 ? h2 : h;
      booxVscrollbarThumb.style.height = h + 'px';
      booxVscrollbarTrack.style.height = h2 + 'px';
      booxVscrollbarThumb.style.top = (h2 - h) * window.scrollY / scrollMaxY + 'px';

      docPgs = Math.floor((scrollMaxY - 1) / booxRuler.offsetHeight) + 2;
      Pg = Math.floor((window.scrollY - 1) / booxRuler.offsetHeight) + 2;
      booxPageThumb.innerHTML = Pg + "<br>" + docPgs;

      orientation = o;
    }); //browser.runtime.sendMessage
  }); //requestAnimationFrame
};

function preventDefault(ev) {
  ev.preventDefault();
  ev.stopPropagation();
};


function onPointerDown(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  let t = ev.target;
  t.setPointerCapture(ev.pointerId);
  if (t.hasAttribute('draggable')) t.addEventListener('pointermove', onPointerMove, true);
  else t.addEventListener('pointermove', preventDefault, true);
  t.addEventListener('pointerup', onPointerUp, true);
  switch (t) {
    case booxPageDn:
      if (iDnUp) break;
      tDnUp = 250;
      (function variableInterval() {
        if (window.scrollY === scrollMaxY) return;
        window.scrollBy(0, booxRuler.offsetHeight);
        if (tDnUp > 20) tDnUp -= 20;
        iDnUp = setTimeout(variableInterval, tDnUp);
      })();
      break;
    case booxPageUp:
      if (iDnUp) break;
      tDnUp = 250;
      (function variableInterval() {
        if (window.scrollY === 0) return;
        window.scrollBy(0, -booxRuler.offsetHeight);
        if (tDnUp > 20) tDnUp -= 20;
        iDnUp = setTimeout(variableInterval, tDnUp);
      })();
      break;
    case booxPageThumb:
    case booxVscrollbarThumb:
    case booxRuler:
      dragData = {
        x0: booxPage.offsetLeft,
        y0: (t == booxPageThumb ? booxPage : t).offsetTop,
        cX: ev.clientX,
        cY: ev.clientY
      };
      break;
  }
  t.classList.add("active");
};

function onPointerMove(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  let t = ev.target;
  if (!t.hasPointerCapture(ev.pointerId)) return;
  if (t.hasAttribute('draggable')) t.classList.add('dragging');
  let x = ev.clientX - dragData.cX + dragData.x0;
  let y = (ev.clientY - dragData.cY) * scale + dragData.y0;
  switch (t) {
    case booxPageThumb:
      x = x < WIDTH / 4 ? WIDTH / 4 : x > vW - WIDTH * 5 / 4 ? vW - WIDTH * 5 / 4 : x;
      booxPage.style.left = x + 'px';
      let x2 = x > vW / 2;
      booxVscrollbar.style.left = x + (x2 ? 1 : -1) * WIDTH + 'px';
      booxRuler.style.left = x + (x2 ? 9 / 4 : -9 / 4) * WIDTH + 'px';

      booxPage.style['-webkit-transform-origin'] = (x2 ? WIDTH : -1) + 'px -' + booxPage.offsetTop + 'px';
      booxVscrollbar.style['-webkit-transform-origin'] = (x2 ? 0 : WIDTH - 1) + 'px 0';
      booxRuler.style['-webkit-transform-origin'] = (x2 ? booxVscrollbar.offsetLeft : booxPage.offsetLeft - 1) - booxRuler.offsetLeft + 'px ';
      booxVscrollbar.style.left = booxVscrollbar.offsetLeft * 100.0 / vW + '%';
      booxPage.style.left = booxPage.offsetLeft * 100.0 / vW + '%';
      booxRuler.style.left = booxRuler.offsetLeft * 100.0 / vW + '%';
      browser.runtime.sendMessage({
        m: 'l',
        l: [booxPage.style.left, booxVscrollbar.style.left, booxRuler.style.left]
      });

      let yM = booxVscrollbar.offsetHeight - booxPage.offsetHeight;
      y = y < 0 ? 0 : y > yM ? yM : y;
      booxPage.style.top = y + 'px';
      break;
    case booxVscrollbarThumb:
      window.scrollTo(window.scrollX, y * scrollMaxY / (booxVscrollbarTrack.offsetHeight - t.offsetHeight));
      break
  }
};

function onPointerUp(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  let t = ev.target;
  switch (t) {
    case booxPageDn:
    case booxPageUp:
      if (iDnUp) {
        clearInterval(iDnUp);
        iDnUp = null;
      }
      break;
    case booxPageThumb:
      let x = booxVscrollbar.offsetLeft;
      if (x > 0 && x < vW - WIDTH / scale && booxVscrollbarThumb.getAttribute('draggable') == 'false') {
        booxVscrollbarUp.addEventListener('pointerdown', onPointerDown, true);
        booxVscrollbarTrack.addEventListener('pointerdown', onPointerDown, true);
        booxVscrollbarDn.addEventListener('pointerdown', onPointerDown, true);
        booxVscrollbarThumb.addEventListener('pointerdown', onPointerDown, true);

        booxVscrollbarThumb.setAttribute('draggable', 'true');
      }
      if ((x < 0 || x > vW - WIDTH / scale) && booxVscrollbarThumb.getAttribute('draggable') == 'true') {
        booxVscrollbarUp.removeEventListener('pointerdown', onPointerDown, true);
        booxVscrollbarTrack.removeEventListener('pointerdown', onPointerDown, true);
        booxVscrollbarDn.removeEventListener('pointerdown', onPointerDown, true);
        booxVscrollbarThumb.removeEventListener('pointerdown', onPointerDown, true);

        booxVscrollbarThumb.setAttribute('draggable', 'false');
      }
      browser.runtime.sendMessage({
        m: 'p',
        p: booxPage.style.top
      });
      browser.runtime.sendMessage({
        m: 'l',
        l: [booxPage.style.left, booxVscrollbar.style.left, booxRuler.style.left]
      });
      break;
    case booxVscrollbarTrack:
      let y = ev.clientY * scale - booxVscrollbarTrack.offsetTop;
      window.scrollTo(window.scrollX, y * scrollMaxY / (booxVscrollbarTrack.offsetHeight - booxVscrollbarThumb.offsetHeight));
      break;
    case booxVscrollbarUp:
      window.scrollTo(window.scrollX, 0);
      break;
    case booxVscrollbarDn:
      window.scrollTo(window.scrollX, scrollMaxY);
      break;
    case booxRuler:
      {
        let vH = Math.min(document.documentElement.clientHeight, window.innerHeight);
        let y = ev.clientY;
        let w = 2 * WIDTH / scale;
        let b = t.offsetHeight + t.offsetTop;
        let f = Math.abs(ev.clientX - dragData.cX) < w / 2;
        if (dragData.cY < t.offsetTop + t.offsetHeight / 2) {
          y = y < 0 ? 0 : y > b - w ? b - w : y;
          t.style.height = b - (f ? y : 0) + 'px';
          t.style.top = (f ? y : 0) + 'px';
        } else {
          y = y > vH ? vH : y < t.offsetTop + w ? t.offsetTop + w : y;
          t.style.height = (f ? y : vH) - t.offsetTop + 'px';
        }
        browser.runtime.sendMessage({
          m: 'r',
          r: [t.offsetTop, vH - t.offsetTop - t.offsetHeight]
        });

        let h2 = booxVscrollbar.offsetHeight - 2 * WIDTH;
        let h = Math.floor(h2 * booxRuler.offsetHeight / document.documentElement.scrollHeight);
        h = h < WIDTH ? WIDTH : h > h2 ? h2 : h;
        booxVscrollbarThumb.style.height = h + 'px';
        booxVscrollbarTrack.style.height = h2 + 'px';
        booxVscrollbarThumb.style.top = (booxVscrollbarTrack.offsetHeight - booxVscrollbarThumb.offsetHeight) * window.scrollY / scrollMaxY + 'px';

        docPgs = Math.floor((scrollMaxY - 1) / booxRuler.offsetHeight) + 2;
        Pg = Math.floor((window.scrollY - 1) / booxRuler.offsetHeight) + 2;
        booxPageThumb.innerHTML = Pg + "<br>" + docPgs;
      };
      break;
  }
  if (t.hasAttribute('draggable')) {
    t.removeEventListener('pointermove', onPointerMove, true);
    t.classList.remove('dragging');
  } else t.removeEventListener('pointermove', preventDefault, true);
  t.removeEventListener('pointerup', onPointerUp, true);
  t.classList.remove("active");
};

//browser.runtime.sendMessage({m:'z'}).then(init);
init();