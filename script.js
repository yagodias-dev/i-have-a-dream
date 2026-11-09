/* ==========================================================================
   Martin Luther King Jr. — O Sonho que Mudou a História
   JavaScript puro, sem dependências.
   Módulos: utilitários · divisão de texto · abertura · observadores ·
   motor de rolagem · contadores · máquina de escrever · cursor ·
   magnetismo e tilt · partículas · holofote · velas · lightbox · menu ·
   linha do tempo · alternância de movimento
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Utilitários ---------- */
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var anim = function () { return root.classList.contains('anim'); };
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var vh = window.innerHeight;
  var vw = window.innerWidth;

  function store(kind, key, val) {
    try {
      var s = kind === 'local' ? window.localStorage : window.sessionStorage;
      if (val === undefined) return s.getItem(key);
      s.setItem(key, val);
    } catch (e) { return null; }
  }

  var yearEl = $('#ano');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Divisão de texto em palavras e letras ---------- */
  function splitChars(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    var label = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', label);
    var i = 0, wi = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'w';
            w.setAttribute('aria-hidden', 'true');
            w.style.setProperty('--wi', wi++);
            Array.from(part).forEach(function (ch) {
              var c = document.createElement('span');
              c.className = 'c';
              c.textContent = ch;
              c.style.setProperty('--i', i++);
              w.appendChild(c);
            });
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);
    // distância do centro, usada pela animação "ripple"
    var chars = $$('.c', el);
    var mid = (chars.length - 1) / 2;
    chars.forEach(function (c, k) { c.style.setProperty('--d', Math.abs(k - mid).toFixed(1)); });
  }

  function splitWords(el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'sw';
            s.textContent = part;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);
  }

  $$('[data-anim]').forEach(function (el) {
    if (['ink', 'dusk'].indexOf(el.dataset.anim) === -1) splitChars(el);
  });
  $$('[data-scrub]').forEach(splitWords);

  // índices para escalonar animações em listas
  [['.jimcrow__list li'], ['.family__list li'], ['.principles__list li'], ['.bars i']].forEach(function (sel) {
    $$(sel[0]).forEach(function (el, k) { el.style.setProperty('--i', k); });
  });
  $$('.stats').forEach(function (g) { $$('.stat', g).forEach(function (el, k) { el.style.setProperty('--i', k); }); });
  $$('.menu__list a').forEach(function (a, k) { a.style.setProperty('--i', k); });

  /* ---------- Grade de 381 dias (Montgomery) ---------- */
  var daysGrid = $('.days__grid');
  var dayDots = [];
  var keyDays = [0, 56, 344, 380]; // 5 dez, 30 jan, 13 nov, 21 dez (dias contados desde 5/12/1955)
  if (daysGrid) {
    var frag = document.createDocumentFragment();
    for (var d = 0; d < 381; d++) {
      var dot = document.createElement('i');
      if (keyDays.indexOf(d) > -1) dot.className = 'key';
      frag.appendChild(dot);
      dayDots.push(dot);
    }
    daysGrid.appendChild(frag);
  }

  /* ---------- Velas do legado ---------- */
  var candleRow = $('.candles__row');
  if (candleRow) {
    var cf = document.createDocumentFragment();
    for (var k = 0; k < 21; k++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mini-candle';
      b.style.setProperty('--i', k);
      b.setAttribute('aria-label', 'Acender vela ' + (k + 1));
      b.setAttribute('aria-pressed', 'false');
      b.appendChild(document.createElement('span'));
      cf.appendChild(b);
    }
    candleRow.appendChild(cf);
    var count = document.createElement('p');
    count.className = 'candles__count';
    count.setAttribute('aria-live', 'polite');
    candleRow.parentNode.appendChild(count);
    var light = function (btn) {
      if (btn.classList.contains('lit')) return;
      btn.classList.add('lit');
      btn.setAttribute('aria-pressed', 'true');
      var n = $$('.mini-candle.lit', candleRow).length;
      count.textContent = n === 21 ? 'Todas as 21 velas acesas. O sonho continua.' : n + (n === 1 ? ' vela acesa' : ' velas acesas');
    };
    candleRow.addEventListener('click', function (e) {
      var btn = e.target.closest('.mini-candle');
      if (btn) light(btn);
    });
    if (finePointer) {
      candleRow.addEventListener('pointerover', function (e) {
        var btn = e.target.closest('.mini-candle');
        if (btn) light(btn);
      });
    }
  }

  /* ---------- Trilho de capítulos ---------- */
  var chapters = $$('main > section[data-chapter]');
  var rail = $('.rail');
  var railLinks = [];
  if (rail) {
    chapters.forEach(function (sec) {
      var a = document.createElement('a');
      a.className = 'rail__link';
      a.href = '#' + sec.id;
      a.dataset.label = sec.dataset.chapter + ' · ' + sec.dataset.name;
      a.setAttribute('aria-label', sec.dataset.name);
      rail.appendChild(a);
      railLinks.push(a);
    });
  }

  /* ---------- Observador de entrada (.is-in) ---------- */
  var heroSection = $('.hero');
  var revealSel = [
    'main > section', '.chapter-head', '.photo', '.diploma', '.margin-note', '.family', '.jimcrow',
    '.principles__list li', '.influence', '.letter', '.stats', '.medal', '.pull', '.law', '.headline',
    '.clock', '.candle', '.qcard', '.flip', '.gallery__item', '.days', '.route'
  ].join(',');
  var onEnterCallbacks = [];
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      if (el === heroSection && root.classList.contains('intro-pending')) return;
      el.classList.add('is-in');
      onEnterCallbacks.forEach(function (fn) { fn(el); });
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  $$(revealSel).forEach(function (el) { io.observe(el); });

  function startHero() {
    if (!heroSection) return;
    heroSection.classList.add('is-in');
    onEnterCallbacks.forEach(function (fn) { fn(heroSection); });
    setTimeout(function () { heroSection.classList.add('is-shine'); }, 1700);
  }

  /* ---------- Contadores ---------- */
  function fmt(v, el) {
    var dec = parseInt(el.dataset.decimals || '0', 10);
    var txt = el.hasAttribute('data-plain') ? String(Math.round(v)) : v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return (el.dataset.prefix || '') + txt + (el.dataset.suffix || '');
  }
  function runCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var to = parseFloat(el.dataset.count);
    var from = parseFloat(el.dataset.from || '0');
    if (!anim()) { el.textContent = fmt(to, el); return; }
    var dur = 2200, t0 = null;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = clamp((t - t0) / dur, 0, 1);
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = fmt(from + (to - from) * e, el);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (anim()) {
    $$('[data-count]').forEach(function (el) { el.textContent = fmt(parseFloat(el.dataset.from || '0'), el); });
  }
  onEnterCallbacks.push(function (el) {
    if (el.matches('.stats') || el === heroSection) $$('[data-count]', el).forEach(runCounter);
  });

  /* ---------- Embaralhamento de texto ---------- */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*';
  function scrambleText(el, duration) {
    var final = el.textContent;
    if (!anim()) return;
    el.setAttribute('aria-label', final);
    var len = final.length, start = null;
    var frame = function (t) {
      if (!start) start = t;
      var p = clamp((t - start) / duration, 0, 1);
      var shown = Math.floor(p * len);
      var out = final.slice(0, shown);
      for (var i = shown; i < len; i++) {
        out += final[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame); else el.textContent = final;
    };
    requestAnimationFrame(frame);
  }
  function scrambleChars(title) {
    $$('.c', title).forEach(function (c, i) {
      var final = c.textContent, n = 0, max = 8 + (i % 6);
      setTimeout(function tick() {
        if (n++ < max) {
          c.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          setTimeout(tick, 45);
        } else {
          c.textContent = final;
        }
      }, i * 28);
    });
  }
  onEnterCallbacks.push(function (el) {
    if (!anim()) return;
    if (el.matches('.headline')) $$('[data-scramble]', el).forEach(function (h) { scrambleText(h, 900); });
    if (el.matches('.chapter-head')) {
      var t = $('[data-anim="scramble"]', el);
      if (t) scrambleChars(t);
    }
  });

  /* ---------- Abertura cinematográfica ---------- */
  function finishIntro(intro) {
    if (!intro || intro.dataset.done) return;
    intro.dataset.done = '1';
    store('session', 'mlk-intro', '1');
    intro.classList.add('is-opening');
    setTimeout(function () { root.classList.remove('intro-pending'); startHero(); }, 500);
    setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 1900);
    document.removeEventListener('keydown', intro._key);
  }
  function playIntro() {
    var intro = $('#intro');
    if (!intro) { startHero(); return; }
    if (!root.classList.contains('intro-pending') || !anim()) {
      intro.parentNode.removeChild(intro);
      root.classList.remove('intro-pending');
      startHero();
      return;
    }
    $$('.intro__line', intro).forEach(function (line) {
      var words = line.textContent.split(' ');
      line.textContent = '';
      words.forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'w';
        s.textContent = w;
        line.appendChild(s);
        if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });
    var dreamText = $('.intro__dream-text', intro);
    var txt = dreamText.textContent;
    dreamText.textContent = '';
    Array.from(txt).forEach(function (ch) {
      var s = document.createElement('span');
      s.className = 'c';
      s.textContent = ch === ' ' ? ' ' : ch;
      dreamText.appendChild(s);
    });

    var timers = [];
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var showWords = function (n, gap) {
      var line = $('[data-intro="' + n + '"]', intro);
      $$('.w', line).forEach(function (w, i) { at(i * (gap || 110), function () { w.classList.add('on'); }); });
    };
    var skip = function () { timers.forEach(clearTimeout); finishIntro(intro); };
    intro._key = function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); skip(); } };
    document.addEventListener('keydown', intro._key);
    $('.intro__skip', intro).addEventListener('click', skip);

    at(350, function () { showWords(1); });
    at(1500, function () { showWords(2); });
    at(2650, function () { showWords(3, 90); });
    at(4500, function () { $$('[data-intro="1"],[data-intro="2"],[data-intro="3"]', intro).forEach(function (l) { l.classList.add('is-out'); }); });
    at(5000, function () {
      $$('.c', dreamText).forEach(function (c, i) { at(i * 95, function () { c.classList.add('on'); }); });
    });
    at(6500, function () { $('.intro__dream', intro).classList.add('is-shine'); });
    at(6900, function () { showWords(5, 160); });
    at(8500, function () { finishIntro(intro); });
  }

  /* ---------- Motor de rolagem (um único requestAnimationFrame) ---------- */
  var header = $('.site-header');
  var progress = $('.progress');
  var indNum = $('.chapter-indicator__num');
  var indName = $('.chapter-indicator__name');
  var menuLinks = $$('.menu__list a');
  var heroLayers = $$('.hero__layer[data-depth]');
  var chapterNums = $$('.chapter-num');
  var bgParallax = $$('.media-bg__img[data-depth]');
  var photos = $$('.photo[data-reveal]');
  var timeline = $('.timeline');
  var tlItems = $$('.tl-item');
  var days = $('.days');
  var daysNum = $('.days__num');
  var route = $('.route');
  var routeDraw = $('.route__draw');
  var routeWalker = $('.route__walker');
  var routeKm = $('.route__km-num');
  var routeLen = routeDraw ? routeDraw.getTotalLength() : 0;
  var medal = $('.medal__coin');
  var dream = $('.dream-words');
  var scrubParas = $$('[data-scrub]');
  var scrubTitle = $('[data-anim="scrub"]');
  var dawn = $('.dawn');
  var lastY = window.scrollY;
  var currentChapter = '';
  var ticking = false;
  var pointer = { x: 0, y: 0 };
  var litDays = -1;

  if (routeDraw) {
    routeDraw.style.strokeDasharray = routeLen;
    routeDraw.style.strokeDashoffset = routeLen;
  }

  // conjunto de elementos visíveis (para só calcular o que está na tela)
  var visible = new Set();
  var visIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
    requestTick();
  }, { rootMargin: '25% 0px 25% 0px' });
  [].concat(photos, chapterNums, bgParallax, scrubParas,
    [timeline, days, route, medal, dream, scrubTitle, dawn, heroSection]).forEach(function (el) { if (el) visIO.observe(el); });

  function progressOf(el, startFrac, endFrac) {
    // 0 quando o topo do elemento cruza startFrac*vh; 1 quando o fim cruza endFrac*vh
    var r = el.getBoundingClientRect();
    var start = vh * startFrac;
    var end = vh * endFrac;
    return clamp((start - r.top) / (r.height + start - end), 0, 1);
  }

  function setChapter(sec) {
    if (!sec || sec.id === currentChapter) return;
    currentChapter = sec.id;
    if (indNum) indNum.textContent = sec.dataset.chapter;
    if (indName) {
      indName.classList.add('is-swap');
      setTimeout(function () { indName.textContent = sec.dataset.name; indName.classList.remove('is-swap'); }, 220);
    }
    railLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + sec.id); });
    menuLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + sec.id); });
  }

  function tick() {
    ticking = false;
    var y = window.scrollY;
    var docH = document.documentElement.scrollHeight - vh;
    var a = anim();

    // progresso de leitura
    if (progress) progress.style.setProperty('--p', docH > 0 ? (y / docH).toFixed(4) : 0);

    // cabeçalho
    if (header) {
      header.classList.toggle('is-scrolled', y > 40);
      if (!root.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > lastY && y > vh * 0.6);
    }
    lastY = y;

    // capítulo atual
    var cur = chapters[0];
    for (var i = 0; i < chapters.length; i++) {
      if (chapters[i].getBoundingClientRect().top <= vh * 0.4) cur = chapters[i];
    }
    setChapter(cur);

    // hero: parallax em camadas (rolagem + mouse)
    if (a && visible.has(heroSection)) {
      heroLayers.forEach(function (l) {
        var dp = parseFloat(l.dataset.depth);
        l.style.transform = 'translate3d(' + (pointer.x * dp * 60).toFixed(1) + 'px,' + (y * dp + pointer.y * dp * 40).toFixed(1) + 'px,0)';
      });
    }

    // números gigantes dos capítulos e fundos
    if (a) {
      chapterNums.forEach(function (n) {
        if (!visible.has(n)) return;
        var r = n.getBoundingClientRect();
        n.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -0.25).toFixed(1) + 'px,0)';
      });
      bgParallax.forEach(function (img) {
        if (!visible.has(img)) return;
        var r = img.parentNode.getBoundingClientRect();
        img.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -parseFloat(img.dataset.depth)).toFixed(1) + 'px,0)';
      });
    }

    // fotos: P&B → sépia/cor conforme a rolagem + parallax interno
    photos.forEach(function (ph) {
      if (!visible.has(ph)) return;
      if (!a) { ph.style.setProperty('--rv', 1); ph.style.removeProperty('--py'); return; }
      var r = ph.getBoundingClientRect();
      var p = clamp((vh - r.top) / (vh * 0.8), 0, 1);
      ph.style.setProperty('--rv', p.toFixed(3));
      ph.style.setProperty('--py', clamp((r.top + r.height / 2 - vh / 2) * -0.03, -14, 14).toFixed(1) + 'px');
    });

    // linha do tempo que se desenha
    if (timeline && visible.has(timeline)) {
      var tp = a ? progressOf(timeline, 0.62, 0.62) : 1;
      timeline.style.setProperty('--tp', tp.toFixed(4));
      var th = timeline.getBoundingClientRect().height || 1;
      tlItems.forEach(function (it) {
        var dot = it.offsetTop + 22;
        it.classList.toggle('lit', !a || dot / th <= tp + 0.002);
      });
    }

    // 381 dias
    if (days && visible.has(days)) {
      var dp2 = a ? progressOf(days, 0.92, 0.45) : 1;
      var n = Math.round(dp2 * 381);
      if (n !== litDays) {
        var from = Math.max(0, Math.min(n, litDays));
        var to = Math.max(n, litDays);
        for (var j = from; j < to; j++) dayDots[j].classList.toggle('on', j < n);
        litDays = n;
        if (daysNum) daysNum.textContent = n;
      }
    }

    // rota de Selma
    if (route && visible.has(route) && routeDraw) {
      var rp = a ? progressOf(route, 0.85, 0.35) : 1;
      routeDraw.style.strokeDashoffset = (routeLen * (1 - rp)).toFixed(1);
      if (routeWalker) {
        var pt = routeDraw.getPointAtLength(routeLen * rp);
        var svg = routeDraw.ownerSVGElement.getBoundingClientRect();
        var rr = route.getBoundingClientRect();
        routeWalker.style.setProperty('--wx', (svg.left - rr.left + pt.x / 1000 * svg.width).toFixed(1) + 'px');
        routeWalker.style.setProperty('--wy', (svg.top - rr.top + pt.y / 260 * svg.height).toFixed(1) + 'px');
      }
      if (routeKm) routeKm.textContent = Math.round(87 * rp);
    }

    // medalha do Nobel gira com a rolagem
    if (medal && visible.has(medal) && a) {
      var mp = progressOf(medal, 1, 0);
      medal.style.setProperty('--rot', (mp * 540 - 90).toFixed(1) + 'deg');
      $$('.medal__face', medal).forEach(function (f) { f.style.setProperty('--shine', mp.toFixed(3)); });
    }

    // "I have a dream" gigante
    if (dream && visible.has(dream)) dream.style.setProperty('--p', a ? progressOf(dream, 0.95, 0.4).toFixed(3) : 1);

    // parágrafos que acendem palavra por palavra
    if (a) {
      scrubParas.forEach(function (para) {
        if (!visible.has(para)) return;
        var words = para._words || (para._words = $$('.sw', para));
        var sp = progressOf(para, 0.88, 0.55);
        var lit = Math.round(sp * words.length);
        if (lit === para._lit) return;
        para._lit = lit;
        words.forEach(function (w, k) { w.classList.toggle('lit', k < lit); });
      });
      if (scrubTitle && visible.has(scrubTitle)) {
        var cs = scrubTitle._c || (scrubTitle._c = $$('.c', scrubTitle));
        var tp2 = progressOf(scrubTitle, 0.9, 0.5);
        var litc = Math.round(tp2 * cs.length);
        cs.forEach(function (c, k) { c.classList.toggle('lit', k < litc); });
      }
    }

    // amanhecer do legado
    if (dawn && visible.has(dawn)) dawn.style.setProperty('--dawn', a ? progressOf(dawn, 1, 0.2).toFixed(3) : 1);
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; vw = window.innerWidth; resizeCanvas(); requestTick(); });

  if (heroSection && finePointer) {
    heroSection.addEventListener('pointermove', function (e) {
      pointer.x = e.clientX / vw - 0.5;
      pointer.y = e.clientY / vh - 0.5;
      requestTick();
    });
  }

  /* ---------- Máquina de escrever das citações ---------- */
  var tw = $('.typewriter');
  var qcards = $$('.qcard');
  if (tw && qcards.length) {
    var quotes = qcards.map(function (q) {
      return { pt: $('.qcard__pt', q).textContent, en: $('.qcard__en', q).textContent, src: $('.qcard__src', q).innerHTML };
    });
    var twText = $('.typewriter__text', tw), twEn = $('.typewriter__en', tw), twSrc = $('.typewriter__src', tw), twCount = $('.typewriter__count', tw);
    var qi = 0, twTimer = null, twVisible = false, twToken = 0;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var showQuote = function (idx, instant) {
      clearTimeout(twTimer);
      var token = ++twToken;
      qi = (idx + quotes.length) % quotes.length;
      var q = quotes[qi];
      twCount.textContent = pad(qi + 1) + ' / ' + pad(quotes.length);
      twEn.textContent = q.en;
      twSrc.innerHTML = q.src;
      if (instant || !anim()) { twText.textContent = q.pt; tw.classList.remove('is-typing'); return; }
      tw.classList.add('is-typing');
      twText.textContent = '';
      var i = 0;
      var type = function () {
        if (token !== twToken) return;
        i++;
        twText.textContent = q.pt.slice(0, i);
        if (i < q.pt.length) {
          var ch = q.pt[i - 1];
          twTimer = setTimeout(type, /[,;.]/.test(ch) ? 260 : 24 + Math.random() * 30);
        } else {
          tw.classList.remove('is-typing');
          twTimer = setTimeout(function () { if (twVisible) erase(token); }, 6500);
        }
      };
      twTimer = setTimeout(type, 300);
    };
    var erase = function (token) {
      if (token !== twToken) return;
      tw.classList.add('is-typing');
      var t = twText.textContent;
      var back = function () {
        if (token !== twToken) return;
        t = t.slice(0, -3);
        twText.textContent = t;
        if (t.length) twTimer = setTimeout(back, 12); else showQuote(qi + 1);
      };
      back();
    };
    showQuote(0, true);
    new IntersectionObserver(function (en) {
      twVisible = en[0].isIntersecting;
      if (twVisible && anim() && !tw.dataset.started) { tw.dataset.started = '1'; showQuote(0); }
    }, { threshold: 0.4 }).observe(tw);
    $$('.tw-btn', tw).forEach(function (btn) {
      btn.addEventListener('click', function () { showQuote(qi + (btn.dataset.tw === 'next' ? 1 : -1)); });
    });
    qcards.forEach(function (card, k) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Mostrar em destaque: ' + quotes[k].pt);
      var go = function () { tw.scrollIntoView({ behavior: anim() ? 'smooth' : 'auto', block: 'center' }); showQuote(k); };
      card.addEventListener('click', go);
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }

  /* ---------- Cartas de curiosidades ---------- */
  $$('.flip__inner').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var li = btn.parentNode;
      var on = li.classList.toggle('is-flipped');
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  });

  /* ---------- Filtros da linha do tempo ---------- */
  var chips = $$('.chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) { var on = c === chip; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      if (f === 'todos') { timeline.classList.remove('is-filtered'); return; }
      timeline.classList.add('is-filtered');
      var first = null;
      tlItems.forEach(function (it) {
        var m = it.dataset.era === f;
        it.classList.toggle('is-match', m);
        if (m && !first) first = it;
      });
      if (first) {
        var r = first.getBoundingClientRect();
        if (r.top < vh * 0.15 || r.top > vh * 0.75) first.scrollIntoView({ behavior: anim() ? 'smooth' : 'auto', block: 'center' });
      }
    });
  });

  /* ---------- Cursor personalizado ---------- */
  var cursor = $('.cursor');
  var cur = { x: vw / 2, y: vh / 2, rx: vw / 2, ry: vh / 2, running: false };
  var cDot = cursor && $('.cursor__dot', cursor), cRing = cursor && $('.cursor__ring', cursor), cLabel = cursor && $('.cursor__label', cursor);
  function cursorLoop() {
    if (!root.classList.contains('has-cursor')) { cur.running = false; return; }
    cur.rx = lerp(cur.rx, cur.x, 0.18);
    cur.ry = lerp(cur.ry, cur.y, 0.18);
    cRing.style.transform = 'translate3d(' + cur.rx.toFixed(1) + 'px,' + cur.ry.toFixed(1) + 'px,0)';
    requestAnimationFrame(cursorLoop);
  }
  function enableCursor() {
    if (!cursor || !finePointer || !anim()) return;
    root.classList.add('has-cursor');
    if (!cur.running) { cur.running = true; requestAnimationFrame(cursorLoop); }
  }
  if (cursor && finePointer) {
    window.addEventListener('pointermove', function (e) {
      cur.x = e.clientX; cur.y = e.clientY;
      if (cDot) cDot.style.transform = 'translate3d(' + cur.x + 'px,' + cur.y + 'px,0)';
      cursor.classList.remove('is-hidden');
    }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      var t = e.target;
      var img = t.closest('.photo__frame, .gallery__btn');
      var link = !img && t.closest('a, button, [role="button"], .tl-card, .chip, [data-tilt]');
      cursor.classList.toggle('is-img', !!img);
      cursor.classList.toggle('is-link', !!link);
      if (cLabel) cLabel.textContent = img ? 'Ampliar' : '';
    });
    document.addEventListener('pointerdown', function () { cursor.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { cursor.classList.remove('is-down'); });
    document.documentElement.addEventListener('pointerleave', function () { cursor.classList.add('is-hidden'); });
    enableCursor();
  }

  /* ---------- Botões magnéticos e cartões com inclinação 3D ---------- */
  if (finePointer) {
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        if (!anim()) return;
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.translate = (dx * 0.22).toFixed(1) + 'px ' + (dy * 0.3).toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = ''; });
      el.style.transition = (getComputedStyle(el).transition || '') + ', translate .5s cubic-bezier(.22,1,.36,1)';
    });
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        if (!anim()) return;
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.classList.add('is-tilting');
        el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 7).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 9).toFixed(2) + 'deg)';
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('is-tilting'); el.style.transform = ''; });
    });
  }

  /* ---------- Holofote / luz de vela ---------- */
  var spots = $$('[data-spotlight]');
  spots.forEach(function (sec) {
    var spot = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4, active: false, user: false, t: 0 };
    sec._spot = spot;
    sec.addEventListener('pointermove', function (e) {
      var r = sec.getBoundingClientRect();
      spot.tx = (e.clientX - r.left) / r.width;
      spot.ty = (e.clientY - r.top) / r.height;
      spot.user = true;
    });
    new IntersectionObserver(function (en) {
      spot.active = en[0].isIntersecting;
      if (spot.active) requestAnimationFrame(function loop(t) {
        if (!spot.active || !anim()) return;
        if (!spot.user) {
          spot.t = t / 1000;
          // passeio suave quando não há mouse (celular)
          var r = sec.getBoundingClientRect();
          spot.tx = 0.5 + Math.sin(spot.t * 0.5) * 0.3;
          spot.ty = clamp((vh * 0.5 - r.top) / r.height, 0.05, 0.95) + Math.cos(spot.t * 0.7) * 0.05;
        }
        spot.x = lerp(spot.x, spot.tx, 0.08);
        spot.y = lerp(spot.y, spot.ty, 0.08);
        var sl = sec._sl || (sec._sl = $('.spotlight', sec));
        if (sl) { sl.style.setProperty('--sx', (spot.x * 100).toFixed(2) + '%'); sl.style.setProperty('--sy', (spot.y * 100).toFixed(2) + '%'); }
        requestAnimationFrame(loop);
      });
    }).observe(sec);
  });

  /* ---------- Partículas: poeira de luz e pombas ---------- */
  var canvas = $('#particles');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var motes = [], doves = [], nextDove = 0, particlesOn = false, mouse = { x: -999, y: -999 };
  function resizeCanvas() {
    if (!ctx) return;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var target = clamp(Math.round((vw * vh) / (finePointer ? 24000 : 40000)), 18, 70);
    while (motes.length < target) motes.push(newMote(true));
    motes.length = target;
  }
  function newMote(anywhere) {
    return {
      x: Math.random() * vw, y: anywhere ? Math.random() * vh : vh + 10,
      r: 0.5 + Math.random() * 1.7, vx: (Math.random() - 0.5) * 0.15, vy: -0.08 - Math.random() * 0.25,
      a: 0.15 + Math.random() * 0.45, tw: Math.random() * Math.PI * 2
    };
  }
  function newDove() {
    var dir = Math.random() < 0.5 ? 1 : -1;
    return {
      dir: dir, x: dir > 0 ? -60 : vw + 60, y: vh * (0.15 + Math.random() * 0.5),
      s: 9 + Math.random() * 9, v: 0.9 + Math.random() * 0.8, ph: Math.random() * 6, amp: 18 + Math.random() * 30, base: 0
    };
  }
  function drawDove(d, t) {
    // pomba estilizada vista de lado: corpo, cabeça, cauda em leque e duas asas batendo
    var flap = Math.sin(t * 0.011 + d.ph);
    var s = d.s;
    ctx.save();
    ctx.translate(d.x, d.y + Math.sin(t * 0.0015 + d.ph) * d.amp);
    ctx.scale(d.dir, 1);
    ctx.fillStyle = '#fbf3df';
    // asa de trás (mais apagada)
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.moveTo(s * 0.1, -s * 0.15);
    ctx.quadraticCurveTo(s * 0.5, -s * (0.6 + flap * 1.1), -s * 0.6, -s * (0.9 + flap * 1.5));
    ctx.quadraticCurveTo(-s * 0.2, -s * 0.3, -s * 0.5, -s * 0.05);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.55;
    // corpo
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.05, s * 0.34, -0.12, 0, Math.PI * 2);
    ctx.fill();
    // cabeça e bico
    ctx.beginPath();
    ctx.arc(s * 1.0, -s * 0.22, s * 0.27, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 1.24, -s * 0.24); ctx.lineTo(s * 1.5, -s * 0.16); ctx.lineTo(s * 1.24, -s * 0.1); ctx.closePath(); ctx.fill();
    // cauda em leque
    ctx.beginPath();
    ctx.moveTo(-s * 0.85, -s * 0.05); ctx.lineTo(-s * 1.75, -s * 0.35); ctx.lineTo(-s * 1.8, s * 0.2); ctx.closePath(); ctx.fill();
    // asa da frente
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.12);
    ctx.quadraticCurveTo(s * 0.2, -s * (0.9 + flap * 1.4), -s * 1.1, -s * (1.1 + flap * 1.9));
    ctx.quadraticCurveTo(-s * 0.55, -s * (0.45 + flap * 0.5), -s * 0.45, -s * 0.02);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function particleLoop(t) {
    if (!particlesOn) return;
    if (!document.hidden) {
      ctx.clearRect(0, 0, vw, vh);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        var dx = m.x - mouse.x, dy = m.y - mouse.y, dist = dx * dx + dy * dy;
        if (dist < 14400) { var f = (1 - dist / 14400) * 0.6; m.x += dx * f * 0.02; m.y += dy * f * 0.02; }
        m.x += m.vx; m.y += m.vy; m.tw += 0.02;
        if (m.y < -10 || m.x < -10 || m.x > vw + 10) motes[i] = newMote(false);
        var alpha = m.a * (0.6 + Math.sin(m.tw) * 0.4);
        ctx.beginPath();
        ctx.fillStyle = 'rgba(242,213,142,' + alpha.toFixed(3) + ')';
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        if (m.r > 1.6) {
          ctx.beginPath();
          ctx.fillStyle = 'rgba(242,213,142,' + (alpha * 0.15).toFixed(3) + ')';
          ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (t > nextDove && doves.length < 2) {
        doves.push(newDove());
        nextDove = t + 9000 + Math.random() * 9000;
      }
      for (var k = doves.length - 1; k >= 0; k--) {
        var dv = doves[k];
        dv.x += dv.v * dv.dir;
        drawDove(dv, t);
        if (dv.x < -100 || dv.x > vw + 100) doves.splice(k, 1);
      }
    }
    requestAnimationFrame(particleLoop);
  }
  function startParticles() {
    if (!ctx || particlesOn || !anim()) return;
    particlesOn = true;
    resizeCanvas();
    nextDove = performance.now() + 3500;
    requestAnimationFrame(particleLoop);
  }
  function stopParticles() {
    particlesOn = false;
    if (ctx) ctx.clearRect(0, 0, vw, vh);
    doves = [];
  }
  window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  /* ---------- Lightbox ---------- */
  var lb = $('#lightbox');
  var lbImg = lb && $('.lightbox__img', lb);
  var lbStage = lb && $('.lightbox__stage', lb);
  var lbCap = lb && $('.lightbox__cap', lb);
  var lbCredit = lb && $('.lightbox__credit', lb);
  var lbCount = lb && $('.lightbox__count', lb);
  var lbItems = [], lbIndex = 0, lbReturn = null;

  // fotos do conteúdo
  $$('.photo').forEach(function (ph) {
    var img = $('img', ph);
    var frame = $('.photo__frame', ph);
    var credit = $('.photo__credit', ph);
    var item = {
      full: img.dataset.full || img.src, orig: img.dataset.orig, fp: img.dataset.fp, alts: img.dataset.alts, alt: img.alt,
      cap: ($('.photo__cap', ph) || {}).textContent || img.alt,
      credit: credit ? credit.textContent : '', page: credit ? credit.href : ''
    };
    var idx = lbItems.push(item) - 1;
    frame.setAttribute('tabindex', '0');
    frame.setAttribute('role', 'button');
    frame.setAttribute('aria-label', 'Ampliar foto: ' + item.cap);
    frame.addEventListener('click', function () { openLb(idx, frame); });
    frame.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(idx, frame); } });
  });
  // galeria
  $$('.gallery__btn').forEach(function (btn) {
    var img = $('img', btn);
    var idx = lbItems.push({
      full: btn.dataset.full, orig: btn.dataset.orig, fp: btn.dataset.fp, alts: btn.dataset.alts, alt: img.alt, cap: btn.dataset.cap,
      credit: 'Foto: ' + btn.dataset.credit, page: btn.dataset.page
    }) - 1;
    btn.addEventListener('click', function () { openLb(idx, btn); });
  });

  function showLb(i) {
    lbIndex = (i + lbItems.length) % lbItems.length;
    var it = lbItems[lbIndex];
    lb.classList.add('is-changing');
    lbStage.classList.remove('is-failed');
    setTimeout(function () {
      lbImg.removeAttribute('data-tried-orig');
      delete lbImg.dataset.triedOrig;
      delete lbImg.dataset.triedFp;
      lbImg.setAttribute('data-fp', it.fp || '');
      lbImg.setAttribute('data-alts', it.alts || '');
      delete lbImg.dataset.altI;
      lbImg.classList.remove('is-failed');
      lbImg.setAttribute('data-orig', it.orig || '');
      lbImg.alt = it.alt;
      lbImg.src = it.full;
      lbCap.textContent = it.cap;
      lbCredit.textContent = it.credit;
      lbCredit.href = it.page || '#';
      lbCount.textContent = (lbIndex + 1) + ' / ' + lbItems.length;
    }, anim() ? 180 : 0);
  }
  if (lbImg) {
    lbImg.addEventListener('load', function () { lb.classList.remove('is-changing'); });
    lbImg.addEventListener('error', function () { setTimeout(function () { if (lbImg.classList.contains('is-failed')) lb.classList.remove('is-changing'); }, 50); });
  }
  function openLb(i, from) {
    if (!lb) return;
    lbReturn = from || document.activeElement;
    lb.hidden = false;
    root.classList.add('lb-open');
    showLb(i);
    requestAnimationFrame(function () { requestAnimationFrame(function () { lb.classList.add('is-open'); }); });
    $('.lightbox__btn--close', lb).focus();
  }
  function closeLb() {
    if (!lb || lb.hidden) return;
    lb.classList.remove('is-open');
    root.classList.remove('lb-open');
    setTimeout(function () { lb.hidden = true; lbImg.removeAttribute('src'); }, anim() ? 600 : 0);
    if (lbReturn && lbReturn.focus) lbReturn.focus();
  }
  if (lb) {
    lb.addEventListener('click', function (e) {
      var act = e.target.closest('[data-lb]');
      if (!act) return;
      var a = act.dataset.lb;
      if (a === 'close') closeLb(); else showLb(lbIndex + (a === 'next' ? 1 : -1));
    });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        var f = $$('button, a[href]', lb);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var sx = null;
    lb.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    lb.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 60) showLb(lbIndex + (dx < 0 ? 1 : -1));
    });
  }
  document.addEventListener('keydown', function (e) {
    if (lb && !lb.hidden) {
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowRight') showLb(lbIndex + 1);
      else if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    } else if (e.key === 'Escape' && root.classList.contains('menu-open')) {
      closeMenu(true);
    }
  });

  /* ---------- Menu de capítulos ---------- */
  var menu = $('#menu');
  var menuBtn = $('.menu-btn');
  function openMenu() {
    menu.hidden = false;
    root.classList.add('menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
    var cur = $('.menu__list a.is-current', menu) || $('.menu__list a', menu);
    setTimeout(function () { cur.focus({ preventScroll: true }); }, anim() ? 350 : 0);
  }
  function closeMenu(focusBtn) {
    menu.classList.remove('is-open');
    root.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, anim() ? 900 : 0);
    if (focusBtn) menuBtn.focus();
  }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', function () { if (menu.hidden) openMenu(); else closeMenu(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(false); });
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('a', menu).concat([menuBtn]);
      var idx = f.indexOf(document.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); menuBtn.focus(); }
      else if (!e.shiftKey && idx === f.length - 2) { e.preventDefault(); menuBtn.focus(); }
    });
    menuBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && !menu.hidden && !e.shiftKey) { e.preventDefault(); $('.menu__list a', menu).focus(); }
    });
  }

  /* ---------- Alternar movimento ---------- */
  var motionBtn = $('.motion-toggle');
  function applyMotion(full) {
    root.classList.toggle('anim', full);
    root.classList.toggle('reduce-motion', !full);
    if (motionBtn) {
      motionBtn.setAttribute('aria-pressed', full ? 'false' : 'true');
      motionBtn.title = full ? 'Reduzir animações' : 'Ativar animações';
    }
    if (full) { startParticles(); enableCursor(); }
    else {
      stopParticles();
      root.classList.remove('has-cursor');
      $$('[data-count]').forEach(function (el) { el.textContent = fmt(parseFloat(el.dataset.count), el); });
      $$('[data-tilt],[data-magnetic], .hero__layer, .chapter-num, .media-bg__img').forEach(function (el) { el.style.transform = ''; el.style.translate = ''; });
      if (tw && twText) { /* mostra a citação inteira */ twText.textContent = twText.textContent || ''; }
    }
    requestTick();
  }
  if (motionBtn) {
    motionBtn.setAttribute('aria-pressed', anim() ? 'false' : 'true');
    motionBtn.addEventListener('click', function () {
      var full = !anim();
      store('local', 'mlk-motion', full ? 'full' : 'reduce');
      applyMotion(full);
    });
  }
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqHandler = function (e) { if (!store('local', 'mlk-motion')) applyMotion(!e.matches); };
  if (mq.addEventListener) mq.addEventListener('change', mqHandler); else if (mq.addListener) mq.addListener(mqHandler);

  /* ---------- Início ---------- */
  playIntro();
  startParticles();
  requestTick();
  window.addEventListener('load', requestTick);
})();
