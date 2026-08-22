/* ==========================================================================
   Footer'daki piksel sahnesi: yuruyen ikili
   --------------------------------------------------------------------------
   Sprite sayfasi: 64x128 px, 4 sutun x 4 satir, her kare 16x32.
     Satir 0 = on yuz (asagi)    Satir 1 = sag profil (kaynaktan)
     Satir 2 = arka yuz (yukari) Satir 3 = sol profil (satir 1'in aynasi)

   Dik durus kareleri (kaynak sayfada 1 tabanli, satir x sutun):
     saga bakan 2x1, sola bakan 4x1, ekrana bakan 1x3.
   Yani profil beklemesi sutun indeksi 0, one bakan bekleme sutun indeksi 2.

   Yuruyus dongusu 0 -> 1 -> 2 -> 1:
     0 ve 2 = gecis (bacaklar bitisik, govde en yukarida)
     1     = temas (bacaklar acik, govde 1 px asagida)
   Govdenin 1 px inip cikmasi kaynakta zaten var (gecis kareleri 26, temas
   kareleri 25 px), o yuzden yapay zipzip eklenmiyor. Durunca kare STAND_COL'a
   oturur, ayaklar havada kalmaz. Her temas karesinde ayagin arkasindan kucuk
   bir toz bulutu cikar. Sutun 3 kullanilmiyor: kaynak sayfada figur sag kenara
   dayandigi icin o kare kesik (profilde tam sac onunu goturuyor).

   Kare degisimi zamana degil YURUNEN MESAFEYE bagli, boylece ayaklar kaymaz.
   Tum ic olculer oyun pikseli; ekrana cizerken CSS'teki --px ile carpilir.
   ========================================================================== */
(function () {
  'use strict';

  var FW = 16, FH = 32;
  var DOWN = 0, RIGHT = 1, UP = 2, LEFT = 3;
  var WALK = [0, 1, 2, 1];
  var STAND_COL = [2, 0, 0, 0];      // [ON, SAG, ARKA, SOL] -- ARKA kullanilmiyor
  var SPEED = 22;                    // oyun px / saniye
  var STEP_PX = 3;                   // kare basina yurunen mesafe -> ~136 ms/kare

  var calm = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function build(stage, cfg) {
    var him = { el: stage.querySelector('.pxs-him'), home: cfg.homeHim, meet: cfg.meetHim };
    var her = { el: stage.querySelector('.pxs-her'), home: cfg.homeHer, meet: cfg.meetHer };
    var hearts = stage.querySelector('.pxs-hearts');
    var dust = stage.querySelector('.pxs-dusts');
    if (!him.el || !her.el || !hearts || !dust) return;

    var px = parseFloat(getComputedStyle(stage).getPropertyValue('--px')) || 2;

    function stand(a) { a.col = STAND_COL[a.dir]; }

    function reset() {
      him.x = him.home; him.dir = RIGHT;
      her.x = her.home; her.dir = LEFT;
      [him, her].forEach(function (a) {
        a.dist = 0; a.step = -1; a.drawnX = null; a.drawnCell = null; stand(a);
      });
      hearts.textContent = '';
      dust.textContent = '';
    }

    function draw(a) {
      /* tam css pikseline yuvarla: yarim piksel kayma sprite'i bulaniklastirir */
      var sx = Math.round(a.x * px);
      if (sx !== a.drawnX) {
        a.el.style.transform = 'translateX(' + sx + 'px)';
        a.drawnX = sx;
      }
      var cell = a.dir * 4 + a.col;
      if (cell !== a.drawnCell) {
        a.el.style.backgroundPosition =
          -(a.col * FW * px) + 'px ' + -(a.dir * FH * px) + 'px';
        a.drawnCell = cell;
      }
    }

    /* Hedefe dogru yurut; varinca true doner. */
    function walkTo(a, target, dt) {
      var step = SPEED * dt;
      var left = target - a.x;
      if (Math.abs(left) <= step) {
        a.x = target; a.step = -1; stand(a);
        return true;
      }
      var sign = left > 0 ? 1 : -1;
      a.x += sign * step;
      a.dir = sign > 0 ? RIGHT : LEFT;
      a.dist += step;
      var i = Math.floor(a.dist / STEP_PX) % WALK.length;
      if (i !== a.step) {
        a.step = i;
        if (i % 2 === 1) puff(a, sign);        // temas karesi: ayak yere bastI
      }
      a.col = WALK[i];
      return false;
    }

    function puff(a, sign) {
      var d = document.createElement('span');
      d.className = 'pxs-dust';
      /* govde ~ kare icinde 2..14; toz yurume yonunun tersinde kalsin */
      d.style.left = Math.round((a.x + (sign > 0 ? 3 : 9)) * px) + 'px';
      d.style.setProperty('--dust-dx', (-sign * 3 * px) + 'px');
      dust.appendChild(d);
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 620);
    }

    function heart(x, delay, size) {
      var h = document.createElement('span');
      h.className = 'pxs-heart';
      h.style.left = Math.round(x * px) + 'px';
      h.style.animationDelay = delay + 'ms';
      h.style.setProperty('--heart-w', size);
      hearts.appendChild(h);
      setTimeout(function () { if (h.parentNode) h.parentNode.removeChild(h); }, delay + 2600);
    }

    function mid() { return (him.meet + her.meet + FW) / 2; }

    function loveBurst() {
      heart(mid() - 3.5, 0, 7);
      heart(mid() - 10, 380, 5);
      heart(mid() + 4, 700, 5);
    }

    /* --------------------------- durum makinesi --------------------------- */
    var state = 'wait', timer = 900, last = 0, raf = 0;

    function tick(now) {
      raf = requestAnimationFrame(tick);
      var dt = Math.min((now - last) / 1000, 0.05);   // sekme donusunde zipla
      last = now;
      if (!dt) return;

      switch (state) {
        case 'wait':                                  // gizlide bekleme
          timer -= dt * 1000;
          if (timer <= 0) state = 'enter';
          break;

        case 'enter': {                               // birbirine dogru yurume
          var a = walkTo(him, him.meet, dt);
          var b = walkTo(her, her.meet, dt);
          if (a && b) { state = 'meet'; timer = 750; loveBurst(); }
          break;
        }

        case 'meet':                                  // goz goze, kalp havada
          him.dir = RIGHT; her.dir = LEFT; stand(him); stand(her);
          timer -= dt * 1000;
          if (timer <= 0) { state = 'pose'; timer = 1900; }
          break;

        case 'pose':                                  // yan yana, one donuk
          him.dir = her.dir = DOWN; stand(him); stand(her);
          timer -= dt * 1000;
          if (timer <= 0) state = 'exit';
          break;

        case 'exit': {                                // herkes kendi dukkanina
          var p = walkTo(him, him.home, dt);
          var q = walkTo(her, her.home, dt);
          if (p && q) { reset(); state = 'wait'; timer = 1600; }
          break;
        }
      }

      draw(him);
      draw(her);
    }

    function start() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    /* --- hareket azaltma tercihi: tek bir durgun kare --- */
    function apply() {
      px = parseFloat(getComputedStyle(stage).getPropertyValue('--px')) || px;
      if (calm && calm.matches) {
        stop();
        stage.classList.add('is-static');
        reset();
        him.x = him.meet; her.x = her.meet;
        him.dir = her.dir = DOWN; stand(him); stand(her);
        heart(mid() - 3.5, 0, 7);
        draw(him); draw(her);
      } else {
        stage.classList.remove('is-static');
        reset();
        state = 'wait'; timer = 600;
        draw(him); draw(her);
        start();
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (!(calm && calm.matches)) start();
    });

    /* --px media query ile degisiyor; genislik degisince yeniden olcekle */
    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var now = parseFloat(getComputedStyle(stage).getPropertyValue('--px')) || px;
        if (now !== px) { px = now; him.drawnX = her.drawnX = null;
                          him.drawnCell = her.drawnCell = null; }
      }, 150);
    });

    /* tiklayinca / dokununca fazladan kalp */
    stage.addEventListener('click', function () {
      heart(mid() - 3.5 + (Math.random() * 14 - 7), 0, 5 + Math.round(Math.random() * 2));
    });

    if (calm) {
      if (calm.addEventListener) calm.addEventListener('change', apply);
      else if (calm.addListener) calm.addListener(apply);
    }
    apply();
  }

  /* -------------------------------- sahne -------------------------------- */
  /* Footer: ikisi kendi dukkaninin arkasindan cikar, yolda bulusur, geri doner.
     Gizlenme paylari dukkan genisligine gore: sol dukkan 0-60, sag 144-204. */
  var footer = document.getElementById('couple-scene');
  if (footer) {
    build(footer, { homeHim: 44, homeHer: 144, meetHim: 88, meetHer: 102 });
  }
})();
