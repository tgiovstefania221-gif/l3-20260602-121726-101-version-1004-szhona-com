(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dotsWrap = document.querySelector('[data-hero-dots]');
  var activeSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeSlide);
    });
    if (dotsWrap) {
      Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, i) {
        dot.classList.toggle('active', i === activeSlide);
      });
    }
  }

  if (slides.length && dotsWrap) {
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', '切换推荐');
      dot.addEventListener('click', function () {
        showSlide(i);
        if (slideTimer) window.clearInterval(slideTimer);
        slideTimer = window.setInterval(function () {
          showSlide(activeSlide + 1);
        }, 5200);
      });
      dotsWrap.appendChild(dot);
    });
    showSlide(0);
    slideTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('.movie-filter-input');
  var yearSelect = document.querySelector('.movie-filter-select');
  var targets = Array.prototype.slice.call(document.querySelectorAll('.filter-targets .movie-card'));

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applyFilters() {
    var keyword = normalize(searchInput ? searchInput.value : '');
    var year = yearSelect ? yearSelect.value : '';
    targets.forEach(function (item) {
      var text = normalize(item.getAttribute('data-search'));
      var itemYear = item.getAttribute('data-year') || '';
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || itemYear === year;
      item.classList.toggle('hidden-by-filter', !(matchKeyword && matchYear));
    });
  }

  if (searchInput && targets.length) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (yearSelect && targets.length) {
    yearSelect.addEventListener('change', applyFilters);
  }

  document.querySelectorAll('.movie-player').forEach(function (player) {
    var video = player.querySelector('.video-el');
    var button = player.querySelector('.player-center');
    var message = player.querySelector('.player-message');
    var src = player.getAttribute('data-video-url');
    var hasLoaded = false;
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function loadVideo() {
      if (!video || !src || hasLoaded) return;
      hasLoaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setMessage('视频加载失败，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        setMessage('视频加载失败，请稍后重试');
      }
    }

    function togglePlay() {
      if (!video) return;
      loadVideo();
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setMessage('点击播放器即可继续观看');
          });
        }
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener('click', togglePlay);
    }

    if (video) {
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function () {
        player.classList.add('playing');
        setMessage('');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
