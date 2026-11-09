/* ==========================================================================
   Martin Luther King Jr. · 1929–1968 — comportamento da página
   JavaScript puro, sem dependências. Cada bloco é independente:
   tema · menu · cabeçalho · entrada do hero · revelação · linha do tempo
   citações · galeria/lightbox · quiz
   ========================================================================== */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = function () { return reduceMQ.matches; };
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ---------- Tema claro / escuro ---------- */
  (function theme() {
    var btn = $('.theme-btn');
    if (!btn) return;
    var meta = $('meta[name="theme-color"]');
    function apply(t) {
      doc.setAttribute('data-theme', t);
      var claro = t === 'claro';
      btn.setAttribute('aria-pressed', claro ? 'true' : 'false');
      btn.setAttribute('aria-label', claro ? 'Ativar tema escuro' : 'Ativar tema claro');
      if (meta) meta.setAttribute('content', claro ? '#f2ebdf' : '#15110d');
    }
    apply(doc.getAttribute('data-theme') === 'claro' ? 'claro' : 'escuro');
    btn.addEventListener('click', function () {
      var next = doc.getAttribute('data-theme') === 'claro' ? 'escuro' : 'claro';
      apply(next);
      store('mlk-tema', next);
    });
  })();

  /* ---------- Menu (celular) ---------- */
  var header = $('.site-header');
  (function menu() {
    var btn = $('.menu-btn');
    var nav = $('#menu');
    if (!btn || !nav) return;
    var mq = window.matchMedia('(max-width: 900px)');
    function open() {
      btn.setAttribute('aria-expanded', 'true');
      btn.querySelector('.menu-btn__label').textContent = 'Fechar';
      nav.classList.add('is-open');
      header.classList.add('menu-open');
      document.body.classList.add('no-scroll');
      var first = nav.querySelector('a');
      if (first) setTimeout(function () { first.focus(); }, 50);
    }
    function close(focusBtn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.querySelector('.menu-btn__label').textContent = 'Menu';
      nav.classList.remove('is-open');
      header.classList.remove('menu-open');
      document.body.classList.remove('no-scroll');
      if (focusBtn) btn.focus();
    }
    btn.addEventListener('click', function () {
      btn.getAttribute('aria-expanded') === 'true' ? close(false) : open();
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && mq.matches) close(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') close(true);
      /* foco preso dentro do menu aberto */
      if (e.key === 'Tab' && nav.classList.contains('is-open')) {
        var items = [btn].concat($$('a', nav));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () {
      if (!mq.matches) close(false);
    });
  })();

  /* ---------- Cabeçalho sólido ao rolar + link ativo ---------- */
  (function headerState() {
    if (!header) return;
    var links = $$('.nav__list a');
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var ticking = false;
    function update() {
      ticking = false;
      header.classList.toggle('is-solid', window.scrollY > 40);
      var mid = window.innerHeight * 0.35;
      var current = -1;
      targets.forEach(function (t, i) {
        if (t && t.getBoundingClientRect().top <= mid) current = i;
      });
      links.forEach(function (a, i) {
        if (i === current) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- Entrada do hero ---------- */
  (function heroEnter() {
    var go = function () { doc.classList.add('is-ready'); };
    if (reduced()) { go(); return; }
    var done = false;
    var once = function () { if (!done) { done = true; requestAnimationFrame(go); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(once);
    setTimeout(once, 700); /* nunca espera mais que isso pelas fontes */
  })();

  /* ---------- Títulos palavra por palavra ---------- */
  function splitWords(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'w';
            var inner = document.createElement('span');
            inner.className = 'w__in';
            inner.style.setProperty('--i', i++);
            inner.textContent = p;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);
  }

  /* ---------- Revelação ao rolar ---------- */
  var revealIO = null;
  function watchReveal(els) {
    if (reduced() || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            revealIO.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    }
    els.forEach(function (el) { revealIO.observe(el); });
  }
  if (!reduced()) $$('[data-split]').forEach(splitWords);
  watchReveal($$('.reveal, [data-split]'));

  /* ---------- Linha do tempo: marcadores, foto, ano e progresso ---------- */
  (function timeline() {
    var root = $('.tl');
    if (!root) return;
    var items = $$('.tl__item', root);
    var shots = $$('.tl__shot', root);
    var links = $$('.tl__index a', root);
    var track = $('.tl__track', root);
    var rail = $('.tl__rail', root);
    var bar = $('.tl__progress', root);
    var yearNum = $('.tl__year-num', root);
    var countNum = $('.tl__count-num', root);
    var current = -1;
    var ticking = false;

    function setActive(i) {
      if (i === current) return;
      var prev = current;
      current = i;
      items.forEach(function (it, k) {
        it.classList.toggle('is-active', k === i);
        it.classList.toggle('is-past', k < i);
      });
      shots.forEach(function (s, k) { s.classList.toggle('is-active', k === Math.max(i, 0)); });
      links.forEach(function (a, k) {
        if (k === i) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      });
      var idx = Math.max(i, 0);
      if (countNum) countNum.textContent = String(idx + 1).padStart(2, '0');
      var y = items[idx].getAttribute('data-year');
      if (yearNum && yearNum.textContent !== y) {
        if (reduced() || prev === -1) { yearNum.textContent = y; }
        else {
          yearNum.classList.remove('is-rolling');
          void yearNum.offsetWidth; /* reinicia a animação */
          yearNum.classList.add('is-rolling');
          setTimeout(function () { yearNum.textContent = y; }, 300);
        }
      }
    }

    function update() {
      ticking = false;
      var line = window.innerHeight * 0.5;
      var active = -1;
      items.forEach(function (it, k) {
        if (it.getBoundingClientRect().top <= line) active = k;
      });
      setActive(active);
      var r = track.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (line - r.top) / Math.max(1, r.height - 40)));
      rail.style.setProperty('--p', p.toFixed(4));
      bar.style.setProperty('--p', p.toFixed(4));
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ---------- Momentos: 381 dias, frase do sonho e rota de Selma ---------- */
  (function moments() {
    /* 381 pontos que acendem em sequência quando o bloco aparece */
    var grid = $('.days__grid');
    if (grid) {
      var frag = document.createDocumentFragment();
      for (var i = 0; i < 381; i++) frag.appendChild(document.createElement('i'));
      grid.appendChild(frag);
      var dots = $$('i', grid);
      var count = $('.days__count');
      var fill = function () {
        if (reduced()) { dots.forEach(function (d) { d.classList.add('is-on'); }); return; }
        var n = 0;
        var step = function () {
          var to = Math.min(381, n + 9);
          for (; n < to; n++) dots[n].classList.add('is-on');
          if (count) count.textContent = n;
          if (n < 381) requestAnimationFrame(step);
        };
        if (count) count.textContent = '0';
        step();
      };
      if ('IntersectionObserver' in window && !reduced()) {
        var io = new IntersectionObserver(function (en) {
          if (en[0].isIntersecting) { fill(); io.disconnect(); }
        }, { threshold: 0.4 });
        io.observe(grid);
      } else fill();
    }

    /* Frase do sonho: as palavras se iluminam conforme a rolagem */
    var dream = $('[data-dream]');
    var words = [];
    if (dream && !reduced()) {
      (function wrap(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (p) {
              if (!p) return;
              if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
              var s = document.createElement('span');
              s.className = 'dw';
              s.setAttribute('aria-hidden', 'true');
              s.textContent = p;
              frag.appendChild(s);
              words.push(s);
            });
            c.parentNode.replaceChild(frag, c);
          } else if (c.nodeType === 1) wrap(c);
        });
      })(dream);
    }

    var route = $('.route');
    var ticking = false;
    function progress(el, start, end) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * start - r.top) / (vh * (start - end) + r.height);
      return Math.min(1, Math.max(0, p));
    }
    function update() {
      ticking = false;
      if (words.length) {
        var p = progress(dream, 0.85, 0.35);
        var lit = Math.round(p * words.length);
        words.forEach(function (w, k) { w.classList.toggle('is-lit', k < lit); });
      }
      if (route && !reduced()) route.style.setProperty('--route', progress(route, 0.9, 0.4).toFixed(3));
    }
    if (route && reduced()) route.style.setProperty('--route', '1');
    if (words.length || route) {
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      update();
    }
  })();

  /* ---------- Citações: carrossel acessível ---------- */
  (function carousel() {
    var root = $('[data-carousel]');
    if (!root) return;
    var slides = $$('.slide', root);
    var dots = $$('.carousel__dots button', root);
    var controls = $('.carousel__controls', root);
    var viewport = $('.carousel__viewport', root);
    var n = slides.length;
    var idx = 0;

    /* cada palavra da tradução entra com um pequeno atraso */
    slides.forEach(function (s) {
      var pt = $('.slide__pt', s);
      var words = pt.textContent.trim().split(/\s+/);
      pt.setAttribute('aria-label', pt.textContent.trim());
      pt.innerHTML = '';
      words.forEach(function (w, i) {
        var sp = document.createElement('span');
        sp.className = 'w2';
        sp.setAttribute('aria-hidden', 'true');
        sp.style.setProperty('--i', i);
        sp.textContent = w;
        pt.appendChild(sp);
        if (i < words.length - 1) pt.appendChild(document.createTextNode(' '));
      });
    });

    function go(i) {
      idx = (i + n) % n;
      slides.forEach(function (s, k) {
        var on = k === idx;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      dots.forEach(function (d, k) {
        if (k === idx) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      controls.setAttribute('data-count', String(idx + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'));
    }
    root.classList.add('is-live');
    go(0);

    $$('.carousel__btn', root).forEach(function (b) {
      b.addEventListener('click', function () { go(idx + parseInt(b.getAttribute('data-dir'), 10)); });
    });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
    });
    /* deslizar no celular */
    var x0 = null;
    viewport.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    viewport.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
    });
  })();

  /* <!-- JS-SECOES --> */
})();
