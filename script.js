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

  /* ---------- Galeria + lightbox ---------- */
  (function gallery() {
    var btns = $$('.g__btn');
    var lb = $('#lightbox');
    if (!btns.length || !lb) return;
    var img = $('.lightbox__img', lb);
    var frame = $('.lightbox__frame', lb);
    var capEl = $('.lightbox__cap', lb);
    var creditEl = $('.lightbox__credit', lb);
    var linkEl = $('.lightbox__link', lb);
    var countEl = $('.lightbox__count', lb);
    var fileEl = $('.lightbox__file', lb);
    var idx = 0;
    var opener = null;

    function show(i) {
      idx = (i + btns.length) % btns.length;
      var b = btns[idx];
      var file = b.getAttribute('data-file');
      frame.classList.remove('is-vazia');
      img.classList.remove('is-falhou', 'is-carregando');
      img.removeAttribute('data-remoto');
      img.setAttribute('data-commons', file);
      img.setAttribute('data-w', '1600');
      img.alt = b.getAttribute('data-cap');
      img.src = 'assets/' + file;
      fileEl.textContent = file;
      capEl.textContent = b.getAttribute('data-cap');
      creditEl.textContent = 'Foto: ' + b.getAttribute('data-autor') + ' · ' + b.getAttribute('data-licenca');
      linkEl.href = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file);
      countEl.textContent = 'Foto ' + (idx + 1) + ' de ' + btns.length;
      if (!reduced()) {
        lb.classList.remove('is-switching');
        void lb.offsetWidth;
        lb.classList.add('is-switching');
      }
    }
    function open(i, from) {
      opener = from;
      lb.hidden = false;
      document.body.classList.add('no-scroll');
      document.body.style.overflow = 'hidden';
      show(i);
      $('.lightbox__btn--close', lb).focus();
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = '';
      document.body.classList.remove('no-scroll');
      if (opener) opener.focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { open(i, b); });
    });
    lb.addEventListener('click', function (e) {
      var t = e.target.closest('[data-lb]');
      if (!t) return;
      var a = t.getAttribute('data-lb');
      if (a === 'close') close();
      else if (a === 'next') show(idx + 1);
      else if (a === 'prev') show(idx - 1);
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
      else if (e.key === 'Tab') {
        var f = $$('button, a[href]', lb).filter(function (el) { return el.offsetParent !== null; });
        var k = f.indexOf(document.activeElement);
        if (e.shiftKey && k <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && k === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    /* deslizar no celular */
    var x0 = null;
    lb.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    lb.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
  })();

  /* ---------- Legado: números que contam ao aparecer ---------- */
  (function counters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    function fmt(v, el) {
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var s = v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      return (el.getAttribute('data-prefix') || '') + s + (el.getAttribute('data-suffix') || '');
    }
    function run(el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var t0 = null;
      var dur = 1600;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(to * e, el);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    els.forEach(function (el) { el.textContent = fmt(parseFloat(el.getAttribute('data-count')), el); });
    if (reduced() || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Quiz ---------- */
  (function quiz() {
    var box = $('[data-quiz]');
    if (!box) return;
    var stage = $('.quiz__stage', box);
    var live = $('.quiz__live', box);
    var nEl = $('.quiz__n');
    var scoreEl = $('.quiz__score');
    var bar = $('.quiz__bar-fill');
    var Q = [
      { q: 'Em que cidade Martin Luther King Jr. nasceu?',
        o: ['Montgomery, Alabama', 'Atlanta, Geórgia', 'Memphis, Tennessee', 'Birmingham, Alabama'], a: 1,
        e: 'Ele nasceu em 15 de janeiro de 1929, na casa da Auburn Avenue, em Atlanta.' },
      { q: 'Quanto tempo durou o boicote aos ônibus de Montgomery?',
        o: ['38 dias', 'Três meses', '381 dias', 'Cinco anos'], a: 2,
        e: 'De 5 de dezembro de 1955 a 21 de dezembro de 1956: 381 dias.' },
      { q: 'Onde King escreveu, em abril de 1963, a carta que defende a desobediência pacífica a leis injustas?',
        o: ['Na prisão de Birmingham', 'Na Casa Branca', 'Em Oslo, na Noruega', 'Durante a viagem à Índia'], a: 0,
        e: 'A “Carta da Prisão de Birmingham” é datada de 16 de abril de 1963, quatro dias depois de sua prisão.' },
      { q: 'Na Marcha sobre Washington, quem pediu a King que falasse do sonho?',
        o: ['Rosa Parks', 'Coretta Scott King', 'Mahalia Jackson', 'Bayard Rustin'], a: 2,
        e: 'A cantora gospel Mahalia Jackson pediu, e King improvisou a parte mais lembrada do discurso.' },
      { q: 'Com quantos anos King recebeu o Nobel da Paz?',
        o: ['29 anos', '35 anos', '39 anos', '45 anos'], a: 1,
        e: 'Ele recebeu o prêmio em Oslo em 10 de dezembro de 1964, aos 35 anos, e doou o valor ao movimento.' },
      { q: 'Qual lei, assinada em 6 de agosto de 1965, derrubou os testes de alfabetização para votar?',
        o: ['Lei dos Direitos Civis', 'Lei da Moradia Justa', 'Lei do Direito ao Voto', 'Décima Quarta Emenda'], a: 2,
        e: 'A Lei do Direito ao Voto foi aprovada meses depois das marchas de Selma.' }
    ];
    var i = 0, score = 0;
    var letters = ['A', 'B', 'C', 'D'];

    function meter() {
      if (nEl) nEl.textContent = Math.min(i + 1, Q.length);
      if (scoreEl) scoreEl.textContent = score;
      if (bar) bar.style.setProperty('--p', (i / Q.length).toFixed(3));
    }

    function render(focus) {
      var item = Q[i];
      var html = '<div class="q">' +
        '<p class="q__num label">Pergunta ' + (i + 1) + ' de ' + Q.length + '</p>' +
        '<h3 class="q__title" tabindex="-1">' + item.q + '</h3>' +
        '<ul class="q__opts">';
      item.o.forEach(function (opt, k) {
        html += '<li><button type="button" class="q__opt" data-k="' + k + '">' +
          '<span class="q__letter" aria-hidden="true">' + letters[k] + '</span>' +
          '<span class="q__txt">' + opt + '</span><span class="q__mark"></span></button></li>';
      });
      html += '</ul><div class="q__after"></div></div>';
      stage.innerHTML = html;
      meter();
      if (focus) $('.q__title', stage).focus();
    }

    function answer(k) {
      var item = Q[i];
      var ok = k === item.a;
      if (ok) score++;
      $$('.q__opt', stage).forEach(function (b, j) {
        b.disabled = true;
        if (j === item.a) { b.classList.add('is-right'); $('.q__mark', b).textContent = 'Correta'; }
        if (j === k) b.classList.add('is-picked');
        if (j === k && !ok) { b.classList.add('is-wrong'); $('.q__mark', b).textContent = 'Sua resposta'; }
      });
      var last = i === Q.length - 1;
      var after = $('.q__after', stage);
      after.innerHTML = '<div class="q__feedback ' + (ok ? 'is-right' : 'is-wrong') + '">' +
        '<p class="q__verdict">' + (ok ? 'Acertou.' : 'Não foi dessa vez.') + '</p>' +
        '<p class="q__explain">' + (ok ? '' : 'A resposta certa é “' + item.o[item.a] + '”. ') + item.e + '</p>' +
        '<button type="button" class="btn btn--primary q__next">' + (last ? 'Ver o resultado' : 'Ir para a próxima pergunta') + '</button></div>';
      live.textContent = (ok ? 'Acertou. ' : 'Errou. A resposta certa é ' + item.o[item.a] + '. ') + item.e;
      if (scoreEl) scoreEl.textContent = score;
      if (bar) bar.style.setProperty('--p', ((i + 1) / Q.length).toFixed(3));
      $('.q__next', after).focus({ preventScroll: true });
    }

    function result() {
      var msg = score === 6 ? ['Gabaritou.', 'Você acertou todas. A linha do tempo e os momentos não guardam segredos para você.']
        : score >= 4 ? ['Muito bem.', 'Você conhece os marcos principais. Vale rever na linha do tempo as perguntas que escaparam.']
        : ['Bom começo.', 'Releia a linha do tempo e os momentos e tente de novo: todas as respostas estão nesta página.'];
      stage.innerHTML = '<div class="result">' +
        '<p class="q__num label">Resultado</p>' +
        '<p class="result__score">' + score + '<small> de ' + Q.length + '</small></p>' +
        '<h3 class="result__title" tabindex="-1">' + msg[0] + '</h3>' +
        '<p class="result__text">' + msg[1] + '</p>' +
        '<button type="button" class="btn btn--ghost q__restart">Refazer o quiz</button></div>';
      live.textContent = 'Resultado: ' + score + ' de ' + Q.length + ' acertos. ' + msg[0];
      if (nEl) nEl.textContent = Q.length;
      $('.result__title', stage).focus();
    }

    stage.addEventListener('click', function (e) {
      var opt = e.target.closest('.q__opt');
      if (opt && !opt.disabled) { answer(parseInt(opt.getAttribute('data-k'), 10)); return; }
      if (e.target.closest('.q__next')) {
        if (i === Q.length - 1) { result(); return; }
        i++; render(true); return;
      }
      if (e.target.closest('.q__restart')) { i = 0; score = 0; render(true); }
    });
    render(false);
  })();

  /* <!-- JS-SECOES --> */
})();
