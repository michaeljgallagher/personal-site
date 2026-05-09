(function () {
  var orb = document.getElementById('orb');
  if (!orb) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PUSH_RADIUS = 150;
  var PUSH_FORCE = 38;
  var FRICTION = 0.996;
  var BOUNCE = 0.7;
  var IDLE_NUDGE = 0.10;
  var SMOOTH = 0.18;

  var radius = 0;
  var orbX = 0;
  var orbY = 0;
  var vx = (Math.random() - 0.5) * 0.8;
  var vy = (Math.random() - 0.5) * 0.8;
  var dragging = false;
  var lastPx = 0;
  var lastPy = 0;

  var wordData = [];

  function measureRadius() {
    var r = orb.getBoundingClientRect();
    radius = r.width / 2;
  }

  function placeOrb() {
    orb.style.transform = 'translate(' + (orbX - radius) + 'px, ' + (orbY - radius) + 'px)';
  }

  function wrapWords(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.trim()) nodes.push(n);
    }
    nodes.forEach(function (node) {
      var parent = node.parentElement;
      if (!parent) return;
      var frag = document.createDocumentFragment();
      var parts = node.nodeValue.split(/(\s+)/);
      parts.forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          var span = document.createElement('span');
          span.className = 'orb-word';
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      parent.replaceChild(frag, node);
    });
  }

  function recomputeWords() {
    var sx = window.scrollX || window.pageXOffset || 0;
    var sy = window.scrollY || window.pageYOffset || 0;
    var els = document.querySelectorAll('.orb-word, .orb-push');
    wordData = [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      el.style.transform = '';
      var r = el.getBoundingClientRect();
      wordData.push({
        el: el,
        x: r.left + sx,
        y: r.top + sy,
        w: r.width,
        h: r.height,
        cx: 0,
        cy: 0,
      });
    }
  }

  orb.addEventListener('pointerdown', function (e) {
    dragging = true;
    try { orb.setPointerCapture(e.pointerId); } catch (_) {}
    lastPx = e.clientX;
    lastPy = e.clientY;
    vx = 0;
    vy = 0;
    e.preventDefault();
  });

  orb.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastPx;
    var dy = e.clientY - lastPy;
    orbX += dx;
    orbY += dy;
    vx = dx;
    vy = dy;
    lastPx = e.clientX;
    lastPy = e.clientY;
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    try {
      if (orb.hasPointerCapture(e.pointerId)) orb.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }
  orb.addEventListener('pointerup', endDrag);
  orb.addEventListener('pointercancel', endDrag);

  function tick() {
    if (!dragging) {
      orbX += vx;
      orbY += vy;
      var w = window.innerWidth;
      var h = window.innerHeight;
      if (orbX < radius) { orbX = radius; vx = -vx * BOUNCE; }
      if (orbX > w - radius) { orbX = w - radius; vx = -vx * BOUNCE; }
      if (orbY < radius) { orbY = radius; vy = -vy * BOUNCE; }
      if (orbY > h - radius) { orbY = h - radius; vy = -vy * BOUNCE; }
      vx *= FRICTION;
      vy *= FRICTION;
      var speed = Math.sqrt(vx * vx + vy * vy);
      if (speed < 0.08) {
        vx += (Math.random() - 0.5) * IDLE_NUDGE;
        vy += (Math.random() - 0.5) * IDLE_NUDGE;
      }
    }
    placeOrb();

    var sx = window.scrollX || window.pageXOffset || 0;
    var sy = window.scrollY || window.pageYOffset || 0;
    var orbPageX = orbX + sx;
    var orbPageY = orbY + sy;
    var r2 = PUSH_RADIUS * PUSH_RADIUS;

    for (var i = 0; i < wordData.length; i++) {
      var wd = wordData[i];
      var clampedX = wd.x < orbPageX ? (wd.x + wd.w < orbPageX ? wd.x + wd.w : orbPageX) : wd.x;
      var clampedY = wd.y < orbPageY ? (wd.y + wd.h < orbPageY ? wd.y + wd.h : orbPageY) : wd.y;
      var ddx = clampedX - orbPageX;
      var ddy = clampedY - orbPageY;
      var d2 = ddx * ddx + ddy * ddy;
      var tx = 0, ty = 0;
      if (d2 < r2) {
        var d = Math.sqrt(d2);
        var f = (1 - d / PUSH_RADIUS) * PUSH_FORCE;
        var cdx = (wd.x + wd.w / 2) - orbPageX;
        var cdy = (wd.y + wd.h / 2) - orbPageY;
        var cd = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cd < 0.5) { cdx = 0; cdy = 1; cd = 1; }
        tx = (cdx / cd) * f;
        ty = (cdy / cd) * f;
      }
      wd.cx += (tx - wd.cx) * SMOOTH;
      wd.cy += (ty - wd.cy) * SMOOTH;
      if (Math.abs(wd.cx) < 0.04 && Math.abs(wd.cy) < 0.04) {
        if (wd.el.style.transform) wd.el.style.transform = '';
      } else {
        wd.el.style.transform = 'translate(' + wd.cx.toFixed(2) + 'px, ' + wd.cy.toFixed(2) + 'px)';
      }
    }

    requestAnimationFrame(tick);
  }

  function start() {
    measureRadius();
    orbX = window.innerWidth * 0.72;
    orbY = window.innerHeight * 0.38;
    placeOrb();

    var targets = document.querySelectorAll('.orb-text');
    targets.forEach(wrapWords);
    recomputeWords();

    if (reduced) return;
    requestAnimationFrame(tick);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start, start);
  } else if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start, { once: true });
  }

  var resizeRAF = 0;
  window.addEventListener('resize', function () {
    cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(function () {
      measureRadius();
      recomputeWords();
    });
  });
})();
