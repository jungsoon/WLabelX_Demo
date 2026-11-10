(function () {
  'use strict';
  // 온라인(정적) 버전: 집계 서버가 없어서 방문·다운로드 수는 표시하지 않고, 구역 등장 효과만 쓴다
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
