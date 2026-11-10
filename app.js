(function () {
  'use strict';

  var API = window.WLX_API || '';       // 비어 있으면 집계 없이 숫자 카드를 숨김

  // 익명 방문 번호 (이 휴대폰에만 저장, 이름·연락처 아님)
  var vid = '';
  try { vid = localStorage.getItem('wlx_vid') || ''; } catch (e) {}
  if (!/^[a-z0-9]{6,40}$/.test(vid)) {
    vid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    try { localStorage.setItem('wlx_vid', vid); } catch (e) {}
  }

  // 전시장 PC 버전: 받기 링크에 번호를 붙여 같은 사람이 두 번 세어지지 않게 한다
  [].forEach.call(document.querySelectorAll('[data-dl]'), function (a) {
    var h = a.getAttribute('href') || '';
    if (h.indexOf('/download/') === 0) a.setAttribute('href', h + '?v=' + encodeURIComponent(vid));
  });

  function url(action) {
    return API + (API.indexOf('?') >= 0 ? '&' : '?') + 'action=' + action + '&vid=' + encodeURIComponent(vid) + '&t=' + Date.now();
  }
  function call(action) {
    return fetch(url(action), { cache: 'no-store' }).then(function (r) { return r.json(); });
  }

  // 숫자 올라가는 효과
  function countTo(el, to) {
    var from = parseInt(el.getAttribute('data-n') || '0', 10);
    el.setAttribute('data-n', to);
    if (from === to || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to; return; }
    var t0 = null, dur = 700;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    setTimeout(function () { el.textContent = to; }, dur + 150);   // 화면이 가려져 애니메이션이 멈춰도 최종 숫자는 맞게
  }

  function show(s) {
    if (!s || typeof s.visitors_today !== 'number') return;
    document.getElementById('live').hidden = false;
    countTo(document.getElementById('c-visit'), s.visitors_today);
    countTo(document.getElementById('c-dl'), s.downloads_today);
    var t = document.getElementById('c-total');
    t.hidden = false;
    t.textContent = '전시 기간 누적  방문 ' + s.visitors_total + '명 · 안내문 ' + s.downloads_total + '명';
    document.getElementById('c-note').hidden = false;
  }

  if (API) {
    var refresh = function () { call('stats').then(show).catch(function () {}); };
    call('visit').then(show).catch(refresh);
    setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });

    // 안내문 받기를 누르면 한 번 집계 (같은 사람이 여러 번 눌러도 1명). 전송이 끝나길 기다리지 않아서 받기가 늦어지지 않음
    [].forEach.call(document.querySelectorAll('[data-dl]'), function (a) {
      a.addEventListener('click', function () {
        try { fetch(url('download'), { keepalive: true, mode: 'no-cors' }); } catch (e) {}
        setTimeout(refresh, 1500);
      });
    });
  }

  // 구역 등장 효과
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    [].forEach.call(items, function (el) { io.observe(el); });
  } else {
    [].forEach.call(items, function (el) { el.classList.add('in'); });
  }
})();
