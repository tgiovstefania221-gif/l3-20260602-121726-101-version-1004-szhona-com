(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
      slide.hidden = slideIndex !== activeSlide;
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  if (slides.length) {
    showSlide(0);

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyMessage = document.querySelector('[data-empty-message]');

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : '');
    var year = yearFilter ? yearFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute('data-search'));
      var cardYear = card.getAttribute('data-year') || '';
      var matchedKeyword = !keyword || searchText.indexOf(keyword) !== -1;
      var matchedYear = !year || cardYear === year;
      var matched = matchedKeyword && matchedYear;

      card.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (emptyMessage) {
      emptyMessage.classList.toggle('show', visible === 0);
    }
  }

  if (filterInput) {
    var query = getQuery('q');

    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener('input', runFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', runFilter);
  }

  runFilter();

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var state = player.querySelector('[data-player-state]');
    var streamUrl = video ? video.getAttribute('data-stream') : '';
    var prepared = false;
    var hlsInstance = null;

    function setState(text) {
      if (state) {
        state.textContent = text;
      }
    }

    function prepareVideo() {
      if (!video || prepared || !streamUrl) {
        return;
      }

      prepared = true;
      setState('加载中');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState('');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setState('暂时无法加载，稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', function () {
          setState('');
        });
      } else {
        video.src = streamUrl;
      }
    }

    function toggleVideo() {
      if (!video) {
        return;
      }

      prepareVideo();

      if (video.paused) {
        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            setState('点击画面继续');
          });
        }
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        toggleVideo();
      });
    }

    if (video) {
      video.addEventListener('click', toggleVideo);
      video.addEventListener('play', function () {
        player.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
}());
