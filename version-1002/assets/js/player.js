(function () {
  var video = document.getElementById('movie-player');
  var button = document.getElementById('play-button');
  var config = document.getElementById('player-config');

  if (!video || !config) {
    return;
  }

  var stream = '';

  try {
    stream = JSON.parse(config.textContent || '{}').src || '';
  } catch (error) {
    stream = '';
  }

  if (!stream) {
    return;
  }

  var ready = false;
  var hls = null;

  function attachStream() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    ready = true;
  }

  function startPlayback() {
    attachStream();

    if (button) {
      button.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
