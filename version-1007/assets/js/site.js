(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (menuButton && nav) {
      menuButton.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
      var input = filterPanel.querySelector('[data-filter-input]');
      var year = filterPanel.querySelector('[data-filter-year]');
      var region = filterPanel.querySelector('[data-filter-region]');
      var type = filterPanel.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
      var empty = document.querySelector('[data-filter-empty]');
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
      }

      function normalize(value) {
        return String(value || '').toLowerCase();
      }

      function applyFilters() {
        var keyword = normalize(input && input.value).trim();
        var y = year && year.value ? year.value : '';
        var r = region && region.value ? region.value : '';
        var t = type && type.value ? type.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type')
          ].join(' '));
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (y && card.getAttribute('data-year') !== y) {
            ok = false;
          }
          if (r && card.getAttribute('data-region') !== r) {
            ok = false;
          }
          if (t && card.getAttribute('data-type') !== t) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      [input, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });
      applyFilters();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('[data-play-button]');
      var message = player.querySelector('[data-player-message]');
      var hlsInstance = null;

      function setMessage(value) {
        if (message) {
          message.textContent = value || '';
        }
      }

      function initVideo() {
        if (!video) {
          return;
        }
        var source = video.getAttribute('data-video-url');
        if (!source) {
          setMessage('播放暂不可用');
          return;
        }
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        video.controls = true;
        if (!video.getAttribute('data-ready')) {
          video.setAttribute('data-ready', '1');
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setMessage('播放暂不可用');
                if (hlsInstance) {
                  hlsInstance.destroy();
                  hlsInstance = null;
                }
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            setMessage('播放暂不可用');
            return;
          }
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            setMessage('点击视频继续播放');
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', initVideo);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!video.getAttribute('data-ready')) {
            initVideo();
          }
        });
        video.addEventListener('play', function () {
          setMessage('');
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
      }
    });
  });
}());
