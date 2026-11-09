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

  /* <!-- JS-SECOES --> */
})();
